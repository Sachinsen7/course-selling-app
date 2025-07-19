const { Router } = require("express");
const { CourseModel, PurchaseModel, UserModel } = require("../db/db"); 
const authMiddleware = require("../middleware/auth"); 
const z = require("zod");

const enrollmentRouter = Router();


const purchaseSchema = z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format") // 
});

const lectureProgressSchema = z.object({
    lectureId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid lecture ID format"),
    isCompleted: z.boolean().optional(),
    lastWatchedPosition: z.number().int().min(0, "Position must be non-negative").optional()
}).refine(data => data.isCompleted !== undefined || data.lastWatchedPosition !== undefined, {
    message: "Either isCompleted or lastWatchedPosition must be provided for update."
});



enrollmentRouter.post("/enroll", authMiddleware, async (req, res) => {
    if (req.userRole !== 'learner' && req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only learners or instructors can enroll in courses." });
    }

    const validationResult = purchaseSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for enrollment", errors: validationResult.error.errors });
    }

    const userId = req.userId;
    const { courseId } = validationResult.data;

    try {
        const course = await CourseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        if (course.status !== 'published') {
            return res.status(400).json({ message: "Course is not available for enrollment." });
        }
        if (course.creatorId.toString() === userId) {
            return res.status(400).json({ message: "You cannot enroll in your own course." });
        }

        const existingEnrollment = await PurchaseModel.findOne({ userId, courseId });
        if (existingEnrollment) {
            return res.status(400).json({ message: "You are already enrolled in this course." });
        }

        const purchasedPrice = course.price;

        const newPurchase = await PurchaseModel.create({
            userId,
            courseId,
            purchasedPrice
        });

        await UserModel.findByIdAndUpdate(userId, {
            $addToSet: { enrolledCourses: courseId }
        });

        res.status(201).json({ message: "Course enrolled successfully", enrollmentId: newPurchase._id });
    } catch (error) {
        console.error("Enrollment error:", error);
        res.status(500).json({ message: "An error occurred during enrollment", error: error.message });
    }
});


// Route to get all courses purchased/enrolled by a user
enrollmentRouter.get("/purchased-courses", authMiddleware, async (req, res) => {
    if (req.userRole !== 'learner' && req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied." });
    }

    const userId = req.userId;

    try {
        const purchases = await PurchaseModel.find({ userId });
        const courseIds = purchases.map((p) => p.courseId);

        const courses = await CourseModel.find({ _id: { $in: courseIds } })
            .populate('creatorId', 'firstName lastName profilePicture')
            .sort({ createdAt: -1 }); // Sort by enrollment date

        res.status(200).json({ message: "Purchased courses retrieved successfully", courses });
    } catch (error) {
        console.error("Error fetching purchased courses:", error);
        res.status(500).json({ message: "An error occurred while fetching purchased courses", error: error.message });
    }
});


enrollmentRouter.get("/purchased-courses/:courseId", authMiddleware, async (req, res) => {
    if (req.userRole !== 'learner' && req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied." });
    }

    const userId = req.userId;
    const courseId = req.params.courseId;

    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid course ID format." });
    }

    try {
        const purchase = await PurchaseModel.findOne({ userId, courseId });
        if (!purchase) {
            return res.status(404).json({ message: "Course not purchased by this user." });
        }

        // Fetch course with its sections and lectures
        const course = await CourseModel.findById(courseId)
            .populate('creatorId', 'firstName lastName profilePicture')
            .populate({
                path: 'sections',
                select: 'title order lectures', // Select specific fields for sections
                options: { sort: { order: 1 } }, // Sort sections
                populate: {
                    path: 'lectures',
                    select: 'title type contentUrl textContent duration order isPublished', // Select specific fields for lectures
                    options: { sort: { order: 1 } } // Sort lectures
                }
            });

        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        // Fetch user's progress for all lectures in this course
        const userProgress = await UserLectureProgressModel.find({ userId, courseId });
        const progressMap = new Map();
        userProgress.forEach(p => progressMap.set(p.lectureId.toString(), p));

        // Attach progress to each lecture
        const courseWithProgress = course.toObject(); // Convert to plain object to modify
        courseWithProgress.sections.forEach(section => {
            section.lectures.forEach(lecture => {
                const progress = progressMap.get(lecture._id.toString());
                lecture.isCompleted = progress ? progress.isCompleted : false;
                lecture.lastWatchedPosition = progress ? progress.lastWatchedPosition : 0;
            });
        });

        res.status(200).json({
            message: "Enrolled course details retrieved successfully",
            course: courseWithProgress,
            purchaseDetails: purchase
        });

    } catch (error) {
        console.error("Error fetching specific purchased course:", error);
        res.status(500).json({
            message: "An error occurred while fetching enrolled course details",
            error: error.message
        });
    }
});

// Route to mark a lecture as complete or update progress
enrollmentRouter.post("/lecture-progress", authMiddleware, async (req, res) => {
    if (req.userRole !== 'learner') { 
        return res.status(403).json({ message: "Access denied. Only learners can update lecture progress." });
    }

    const validationResult = lectureProgressSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for lecture progress", errors: validationResult.error.errors });
    }

    const userId = req.userId;
    const { lectureId, isCompleted, lastWatchedPosition } = validationResult.data;

    try {
        const lecture = await LectureModel.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ message: "Lecture not found." });
        }

        
        const hasPurchased = await PurchaseModel.findOne({ userId, courseId: lecture.courseId });
        if (!hasPurchased) {
            return res.status(403).json({ message: "You must be enrolled in this course to update lecture progress." });
        }

        const updateFields = {};
        if (isCompleted !== undefined) {
            updateFields.isCompleted = isCompleted;
            if (isCompleted) {
                updateFields.completedAt = new Date(); 
            } else {
                updateFields.completedAt = null; 
            }
        }
        if (lastWatchedPosition !== undefined) {
            updateFields.lastWatchedPosition = lastWatchedPosition;
        }

        const updatedProgress = await UserLectureProgressModel.findOneAndUpdate(
            { userId, lectureId },
            { $set: updateFields, $setOnInsert: { courseId: lecture.courseId } }, 
            { upsert: true, new: true, runValidators: true } 
           
        );

        res.status(200).json({
            message: "Lecture progress updated successfully",
            progress: updatedProgress
        });
    } catch (error) {
        console.error("Error updating lecture progress:", error);
        res.status(500).json({
            message: "An error occurred while updating lecture progress",
            error: error.message
        });
    }
});

// Route to get a user's progress for a specific course
enrollmentRouter.get("/course-progress/:courseId", authMiddleware, async (req, res) => {
    if (req.userRole !== 'learner') {
        return res.status(403).json({ message: "Access denied. Only learners can view course progress." });
    }

    const userId = req.userId;
    const courseId = req.params.courseId;

    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid course ID format." });
    }

    try {
        const course = await CourseModel.findById(courseId).populate({
            path: 'sections',
            populate: {
                path: 'lectures',
                select: '_id'
            }
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        
        const allLectureIds = course.sections.flatMap(section => section.lectures.map(lecture => lecture._id));
        const totalLectures = allLectureIds.length;

        if (totalLectures === 0) {
            return res.status(200).json({
                message: "Course has no lectures, progress is 0%",
                courseProgress: 0,
                completedLectures: 0,
                totalLectures: 0
            });
        }

      
        const completedProgress = await UserLectureProgressModel.countDocuments({
            userId,
            courseId,
            lectureId: { $in: allLectureIds },
            isCompleted: true
        });

        const courseProgress = (completedProgress / totalLectures) * 100;

        res.status(200).json({
            message: "Course progress retrieved successfully",
            courseProgress: parseFloat(courseProgress.toFixed(2)), 
            completedLectures: completedProgress,
            totalLectures: totalLectures
        });

    } catch (error) {
        console.error("Error fetching course progress:", error);
        res.status(500).json({
            message: "An error occurred while fetching course progress",
            error: error.message
        });
    }
});

module.exports = enrollmentRouter;
