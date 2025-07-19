const { Router } = require("express");
const { CourseModel, UserModel } = require("../db/db");
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


// Route to create a new course
instructorRouter.post("/course", authMiddleware, async (req, res) => {
    // Only instructors can create courses
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can create courses." });
    }

    const validationResult = createCourseSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({
            message: "Invalid input data for course creation",
            errors: validationResult.error.errors
        });
    }

    const creatorId = req.userId; 

    try {
        const newCourse = await CourseModel.create({
            ...validationResult.data,
            creatorId: creatorId
        });

       
        await UserModel.findByIdAndUpdate(creatorId, {
            $addToSet: { createdCourses: newCourse._id }
        });

        res.status(201).json({
            message: "Course created successfully",
            courseId: newCourse._id
        });
    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({
            message: "An error occurred while creating the course",
            error: error.message
        });
    }
});

// Route to update an existing course
instructorRouter.put("/course", authMiddleware, async (req, res) => {
    // Only instructors can update courses
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can update courses." });
    }

    const validationResult = updateCourseSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({
            message: "Invalid input data for course update",
            errors: validationResult.error.errors
        });
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
            return res.status(404).json({
                message: "Course not found or you don't have permission to update it."
            });
        }

        res.status(200).json({
            message: "Course updated successfully",
            course: updatedCourse
        });
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({
            message: "An error occurred while updating the course",
            error: error.message
        });
    }
});

// Route to get all courses created by the authenticated instructor
instructorRouter.get("/my-courses", authMiddleware, async (req, res) => {
    // Only instructors can view their created courses
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can view their courses." });
    }

    const creatorId = req.userId;

    try {
        const courses = await CourseModel.find({ creatorId: creatorId });
        res.status(200).json({
            message: "Courses fetched successfully",
            courses: courses
        });
    } catch (error) {
        console.error("Error fetching instructor's courses:", error);
        res.status(500).json({
            message: "An error occurred while fetching courses",
            error: error.message
        });
    }
});

// Route to delete a course
instructorRouter.delete("/course/:courseId", authMiddleware, async (req, res) => {
    // Only instructors can delete their courses
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can delete courses." });
    }

    const creatorId = req.userId;
    const courseId = req.params.courseId;

    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid course ID format." });
    }

    try {
        // Find and delete the course, ensuring it belongs to the instructor
        const deletedCourse = await CourseModel.findOneAndDelete({ _id: courseId, creatorId: creatorId });

        if (!deletedCourse) {
            return res.status(404).json({ message: "Course not found or you don't have permission to delete it." });
        }

        
        await UserModel.findByIdAndUpdate(creatorId, {
            $pull: { createdCourses: courseId }
        });

        res.status(200).json({
            message: "Course deleted successfully",
            courseId: deletedCourse._id
        });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({
            message: "An error occurred while deleting the course",
            error: error.message
        });
    }
});


module.exports = instructorRouter;
