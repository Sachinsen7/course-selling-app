const { Router } = require("express");
const { CourseModel, UserModel, SectionModel, LectureModel } = require("../db/db");
const authMiddleware = require("../middleware/auth");
const z = require("zod");

const instructorRouter = Router();

// Zod schema for creating a course
const createCourseSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long").max(100, "Title cannot exceed 100 characters").trim(),
    description: z.string().min(20, "Description must be at least 20 characters long").trim(),
    imageUrl: z.string().url("Invalid image URL format").optional(),
    price: z.number().min(0, "Price cannot be negative").default(0),
    category: z.string().min(2, "Category must be at least 2 characters long").trim().optional(),
    status: z.enum(['draft', 'published', 'archived']).default('draft')
});

// Zod schema for updating a course
const updateCourseSchema = z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format"),
    title: z.string().min(5, "Title must be at least 5 characters long").max(100, "Title cannot exceed 100 characters").trim().optional(),
    description: z.string().min(20, "Description must be at least 20 characters long").trim().optional(),
    imageUrl: z.string().url("Invalid image URL format").optional(),
    price: z.number().min(0, "Price cannot be negative").optional(),
    category: z.string().min(2, "Category must be at least 2 characters long").trim().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional()
}).refine(data => Object.keys(data).length > 1, {
    message: "At least one field (title, description, imageUrl, price, category, status) must be provided for update."
});

// Zod schema for creating a section
const createSectionSchema = z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format"),
    title: z.string().min(3, "Section title must be at least 3 characters long").max(100, "Section title cannot exceed 100 characters").trim(),
    order: z.number().int().min(0, "Order must be a non-negative integer")
});

// Zod schema for updating a section
const updateSectionSchema = z.object({
    sectionId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid section ID format"),
    title: z.string().min(3, "Section title must be at least 3 characters long").max(100, "Section title cannot exceed 100 characters").trim().optional(),
    order: z.number().int().min(0, "Order must be a non-negative integer").optional()
}).refine(data => data.title !== undefined || data.order !== undefined, {
    message: "At least one field (title, order) must be provided for update."
});

// Zod schema for creating a lecture
const createLectureSchema = z.object({
    sectionId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid section ID format"),
    title: z.string().min(3, "Lecture title must be at least 3 characters long").max(150, "Lecture title cannot exceed 150 characters").trim(),
    type: z.enum(['video', 'text', 'quiz', 'assignment']),
    contentUrl: z.string().url("Invalid content URL format").optional(),
    textContent: z.string().min(10, "Text content must be at least 10 characters long").optional(),
    duration: z.number().int().min(0, "Duration must be a non-negative integer").optional(),
    order: z.number().int().min(0, "Order must be a non-negative integer"),
    isPublished: z.boolean().default(true).optional()
}).refine(data => {
    
    if (data.type === 'video') {
        return data.contentUrl !== undefined && data.duration !== undefined;
    }
    if (data.type === 'text') {
        return data.textContent !== undefined;
    }
    if (data.type === 'assignment') {
        return data.contentUrl !== undefined;
    }
   
    return true;
}, {
    message: "Missing required fields based on lecture type."
});

// Zod schema for updating a lecture
const updateLectureSchema = z.object({
    lectureId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid lecture ID format"),
    title: z.string().min(3, "Lecture title must be at least 3 characters long").max(150, "Lecture title cannot exceed 150 characters").trim().optional(),
    type: z.enum(['video', 'text', 'quiz', 'assignment']).optional(),
    contentUrl: z.string().url("Invalid content URL format").optional(),
    textContent: z.string().min(10, "Text content must be at least 10 characters long").optional(),
    duration: z.number().int().min(0, "Duration must be a non-negative integer").optional(),
    order: z.number().int().min(0, "Order must be a non-negative integer").optional(),
    isPublished: z.boolean().optional()
}).refine(data => Object.keys(data).length > 1, {
    message: "At least one field must be provided for update."
});


// helper function
const checkCourseOwnership = async (courseId, instructorId) => {
    const course = await CourseModel.findOne({ _id: courseId, creatorId: instructorId });
    return course;
};


// Route to create a new course
instructorRouter.post("/course", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can create courses." });
    }

    const validationResult = createCourseSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for course creation", errors: validationResult.error.errors });
    }

    const creatorId = req.userId;
    try {
        const newCourse = await CourseModel.create({ ...validationResult.data, creatorId: creatorId });
        await UserModel.findByIdAndUpdate(creatorId, { $addToSet: { createdCourses: newCourse._id } });
        res.status(201).json({ message: "Course created successfully", courseId: newCourse._id });
    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ message: "An error occurred while creating the course", error: error.message });
    }
});

// Route to update an existing course
instructorRouter.put("/course", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can update courses." });
    }

    const validationResult = updateCourseSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for course update", errors: validationResult.error.errors });
    }

    const creatorId = req.userId;
    const { courseId, ...updateData } = validationResult.data;

    try {
        const updatedCourse = await CourseModel.findOneAndUpdate(
            { _id: courseId, creatorId: creatorId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ message: "Course not found or you don't have permission to update it." });
        }
        res.status(200).json({ message: "Course updated successfully", course: updatedCourse });
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ message: "An error occurred while updating the course", error: error.message });
    }
});

// Route to get all courses created by the authenticated instructor
instructorRouter.get("/my-courses", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can view their courses." });
    }

    const creatorId = req.userId;
    try {
        const courses = await CourseModel.find({ creatorId: creatorId })
            .populate({
                path: 'sections',
                populate: {
                    path: 'lectures'
                }
            })
            .sort({ createdAt: -1 }); 
        res.status(200).json({ message: "Courses fetched successfully", courses: courses });
    } catch (error) {
        console.error("Error fetching instructor's courses:", error);
        res.status(500).json({ message: "An error occurred while fetching courses", error: error.message });
    }
});

// Route to delete a course
instructorRouter.delete("/course/:courseId", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can delete courses." });
    }

    const creatorId = req.userId;
    const courseId = req.params.courseId;

    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid course ID format." });
    }

    try {
        const deletedCourse = await CourseModel.findOneAndDelete({ _id: courseId, creatorId: creatorId });

        if (!deletedCourse) {
            return res.status(404).json({ message: "Course not found or you don't have permission to delete it." });
        }

        
        await UserModel.findByIdAndUpdate(creatorId, { $pull: { createdCourses: courseId } });

       
        const sections = await SectionModel.find({ courseId: courseId });
        const sectionIds = sections.map(s => s._id);

        if (sectionIds.length > 0) {
            await LectureModel.deleteMany({ sectionId: { $in: sectionIds } });
            await SectionModel.deleteMany({ courseId: courseId });
        }

    

        res.status(200).json({ message: "Course deleted successfully", courseId: deletedCourse._id });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: "An error occurred while deleting the course", error: error.message });
    }
});

// Section Routes

// Route to create a new section for a course
instructorRouter.post("/section", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can create sections." });
    }

    const validationResult = createSectionSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for section creation", errors: validationResult.error.errors });
    }

    const { courseId, title, order } = validationResult.data;
    const instructorId = req.userId;

    try {
        const course = await checkCourseOwnership(courseId, instructorId);
        if (!course) {
            return res.status(404).json({ message: "Course not found or you don't have permission to add sections to it." });
        }

        const newSection = await SectionModel.create({ courseId, title, order });

        // Add the new section to the course's sections array
        await CourseModel.findByIdAndUpdate(courseId, { $addToSet: { sections: newSection._id } });

        res.status(201).json({ message: "Section created successfully", section: newSection });
    } catch (error) {
        console.error("Error creating section:", error);
        res.status(500).json({ message: "An error occurred while creating the section", error: error.message });
    }
});

// Route to get all sections for a specific course
instructorRouter.get("/sections/:courseId", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can view sections." });
    }

    const courseId = req.params.courseId;
    const instructorId = req.userId;

    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid course ID format." });
    }

    try {
        const course = await checkCourseOwnership(courseId, instructorId);
        if (!course) {
            return res.status(404).json({ message: "Course not found or you don't have permission to view its sections." });
        }

        // Populate lectures within each section
        const sections = await SectionModel.find({ courseId: courseId })
            .populate('lectures')
            .sort({ order: 1 }); // Sort sections by their order

        res.status(200).json({ message: "Sections fetched successfully", sections });
    } catch (error) {
        console.error("Error fetching sections:", error);
        res.status(500).json({ message: "An error occurred while fetching sections", error: error.message });
    }
});

// Route to update a section
instructorRouter.put("/section/:sectionId", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can update sections." });
    }

    const sectionId = req.params.sectionId;
    const instructorId = req.userId;

    const validationResult = updateSectionSchema.safeParse({ ...req.body, sectionId });
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for section update", errors: validationResult.error.errors });
    }

    const updateData = validationResult.data;

    try {
        const section = await SectionModel.findById(sectionId);
        if (!section) {
            return res.status(404).json({ message: "Section not found." });
        }

      
        const course = await checkCourseOwnership(section.courseId, instructorId);
        if (!course) {
            return res.status(403).json({ message: "You don't have permission to update this section." });
        }

        const updatedSection = await SectionModel.findByIdAndUpdate(
            sectionId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "Section updated successfully", section: updatedSection });
    } catch (error) {
        console.error("Error updating section:", error);
        res.status(500).json({ message: "An error occurred while updating the section", error: error.message });
    }
});

// Route to delete a section
instructorRouter.delete("/section/:sectionId", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can delete sections." });
    }

    const sectionId = req.params.sectionId;
    const instructorId = req.userId;

    if (!sectionId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid section ID format." });
    }

    try {
        const section = await SectionModel.findById(sectionId);
        if (!section) {
            return res.status(404).json({ message: "Section not found." });
        }

        const course = await checkCourseOwnership(section.courseId, instructorId);
        if (!course) {
            return res.status(403).json({ message: "You don't have permission to delete this section." });
        }

       
        await CourseModel.findByIdAndUpdate(section.courseId, { $pull: { sections: sectionId } });

        
        await LectureModel.deleteMany({ sectionId: sectionId });

        
        await SectionModel.findByIdAndDelete(sectionId);

        res.status(200).json({ message: "Section deleted successfully", sectionId });
    } catch (error) {
        console.error("Error deleting section:", error);
        res.status(500).json({ message: "An error occurred while deleting the section", error: error.message });
    }
});


// Lecture Routes

// Route to create a new lecture for a section
instructorRouter.post("/lecture", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can create lectures." });
    }

    const validationResult = createLectureSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for lecture creation", errors: validationResult.error.errors });
    }

    const { sectionId, title, type, contentUrl, textContent, duration, order, isPublished } = validationResult.data;
    const instructorId = req.userId;

    try {
        const section = await SectionModel.findById(sectionId);
        if (!section) {
            return res.status(404).json({ message: "Section not found." });
        }

       
        const course = await checkCourseOwnership(section.courseId, instructorId);
        if (!course) {
            return res.status(403).json({ message: "You don't have permission to add lectures to this section." });
        }

        const newLecture = await LectureModel.create({
            sectionId,
            courseId: section.courseId, 
            title,
            type,
            contentUrl,
            textContent,
            duration,
            order,
            isPublished
        });

      
        await SectionModel.findByIdAndUpdate(sectionId, { $addToSet: { lectures: newLecture._id } });

        res.status(201).json({ message: "Lecture created successfully", lecture: newLecture });
    } catch (error) {
        console.error("Error creating lecture:", error);
        res.status(500).json({ message: "An error occurred while creating the lecture", error: error.message });
    }
});


instructorRouter.get("/lecture/:lectureId", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can view individual lectures." });
    }

    const lectureId = req.params.lectureId;
    const instructorId = req.userId;

    if (!lectureId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid lecture ID format." });
    }

    try {
        const lecture = await LectureModel.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ message: "Lecture not found." });
        }

       
        const course = await checkCourseOwnership(lecture.courseId, instructorId);
        if (!course) {
            return res.status(403).json({ message: "You don't have permission to view this lecture." });
        }

        res.status(200).json({ message: "Lecture fetched successfully", lecture });
    } catch (error) {
        console.error("Error fetching lecture:", error);
        res.status(500).json({ message: "An error occurred while fetching the lecture", error: error.message });
    }
});


// Route to update a lecture
instructorRouter.put("/lecture/:lectureId", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can update lectures." });
    }

    const lectureId = req.params.lectureId;
    const instructorId = req.userId;

    const validationResult = updateLectureSchema.safeParse({ ...req.body, lectureId });
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for lecture update", errors: validationResult.error.errors });
    }

    const updateData = validationResult.data;

    try {
        const lecture = await LectureModel.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ message: "Lecture not found." });
        }

      
        const course = await checkCourseOwnership(lecture.courseId, instructorId);
        if (!course) {
            return res.status(403).json({ message: "You don't have permission to update this lecture." });
        }

        const updatedLecture = await LectureModel.findByIdAndUpdate(
            lectureId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "Lecture updated successfully", lecture: updatedLecture });
    } catch (error) {
        console.error("Error updating lecture:", error);
        res.status(500).json({ message: "An error occurred while updating the lecture", error: error.message });
    }
});

// Route to delete a lecture
instructorRouter.delete("/lecture/:lectureId", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can delete lectures." });
    }

    const lectureId = req.params.lectureId;
    const instructorId = req.userId;

    if (!lectureId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid lecture ID format." });
    }

    try {
        const lecture = await LectureModel.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ message: "Lecture not found." });
        }

        const course = await checkCourseOwnership(lecture.courseId, instructorId);
        if (!course) {
            return res.status(403).json({ message: "You don't have permission to delete this lecture." });
        }

       
        await SectionModel.findByIdAndUpdate(lecture.sectionId, { $pull: { lectures: lectureId } });

       
        await LectureModel.findByIdAndDelete(lectureId);

        res.status(200).json({ message: "Lecture deleted successfully", lectureId });
    } catch (error) {
        console.error("Error deleting lecture:", error);
        res.status(500).json({ message: "An error occurred while deleting the lecture", error: error.message });
    }
});


module.exports = instructorRouter;
