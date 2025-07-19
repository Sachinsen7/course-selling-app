const { Router } = require("express");
const { CourseModel, PurchaseModel, UserModel } = require("../db/db"); 
const authMiddleware = require("../middleware/auth"); 
const z = require("zod");

const enrollmentRouter = Router();


const purchaseSchema = z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format") // 
});


enrollmentRouter.post("/enroll", authMiddleware, async (req, res) => {
    if (req.userRole !== 'learner' && req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only learners or instructors can enroll in courses." });
    }

    const validationResult = purchaseSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({
            message: "Invalid input data for enrollment",
            errors: validationResult.error.errors
        });
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

        // For paid courses, this route should ideally be called AFTER a successful payment.
        // For now, we'll assume it handles both free and post-payment enrollments.
        // The `purchasedPrice` should come from the payment details if it's a paid course.
        const purchasedPrice = course.price;

        const newPurchase = await PurchaseModel.create({
            userId,
            courseId,
            purchasedPrice 
        });

        
        await UserModel.findByIdAndUpdate(userId, {
            $addToSet: { enrolledCourses: courseId } // duplicates
        });

        res.status(201).json({
            message: "Course enrolled successfully",
            enrollmentId: newPurchase._id
        });
    } catch (error) {
        console.error("Enrollment error:", error);
        res.status(500).json({
            message: "An error occurred during enrollment",
            error: error.message
        });
    }
});

// Route to get all courses purchased/enrolled by a user
enrollmentRouter.get("/purchased-courses", authMiddleware, async (req, res) => {
    if (req.userRole !== 'learner' && req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied." });
    }

    const userId = req.userId;

    try {
        // Find all purchase records for the user
        const purchases = await PurchaseModel.find({ userId });

        // Extract course IDs from purchases
        const courseIds = purchases.map((p) => p.courseId);

      
        const courses = await CourseModel.find({ _id: { $in: courseIds } })
            .populate('creatorId', 'firstName lastName profilePicture'); // Populate instructor details

        res.status(200).json({
            message: "Purchased courses retrieved successfully",
            courses
        });
    } catch (error) {
        console.error("Error fetching purchased courses:", error);
        res.status(500).json({
            message: "An error occurred while fetching purchased courses",
            error: error.message
        });
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

        // Fetch the course details, including creator info
        const course = await CourseModel.findById(courseId)
            .populate('creatorId', 'firstName lastName profilePicture'); 

        if (!course) {
            return res.status(404).json({ message: "Course not found." }); 
        }

        res.status(200).json({
            message: "Enrolled course details retrieved successfully",
            course,
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


module.exports = enrollmentRouter;
