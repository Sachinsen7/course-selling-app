const {Router} = require("express")
const {UserModel, CourseModel, CategoryModel, PurchaseModel, ReviewModel, SectionModel, LectureModel, QuizModel, QuestionModel, UserLectureProgressModel, UserQuizAttemptModel, AssignmentSubmissionModel} = require("../db/db")
const authMiddleware = require("../middleware/auth")
const adminMiddleware = require("../middleware/admin")
const z = require("zod")
const adminRouter = Router()

const userIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format");
const courseIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format");
const categoryIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID format");
const sectionIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid section ID format");
const lectureIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid lecture ID format");
const quizIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid quiz ID format");
const questionIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid question ID format");
const submissionIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid submission ID format");


const updateUserRoleSchema = z.object({
    userId: userIdSchema,
    role: z.enum(['learner', 'instructor', 'admin'])
})

const upadateUserStatusSchema = z.object({
    userId: userIdSchema,
    isActive: z.boolean()
})


const updateCourseStatusSchema = z.object({
    courseId: courseIdSchema,
    status: z.enum(['draft', 'published', 'archived'])
});

const createCategorySchema = z.object({
    name: z.string().min(2, "Category name must be at least 2 characters long").trim(),
    description: z.string().trim().optional(),
    imageUrl: z.string().url("Invalid image URL format").optional()
});

const updateCategorySchema = z.object({
    categoryId: categoryIdSchema,
    name: z.string().min(2, "Category name must be at least 2 characters long").trim().optional(),
    description: z.string().trim().optional(),
    imageUrl: z.string().url("Invalid image URL format").optional()
}).refine(data => data.name !== undefined || data.description !== undefined || data.imageUrl !== undefined, {
    message: "At least one field (name, description, imageUrl) must be provided for update."
});

adminRouter.use(authMiddleware)
adminRouter.use(adminMiddleware)


// Get all users
adminRouter.get("/users", async (req, res) => {
    try {
        const users = await UserModel.find({});
        res.status(200).json({ message: "Users fetched successfully", users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "An error occurred while fetching users", error: error.message });
    }
});


// Get a specific user by ID
adminRouter.get("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    const validationResult = userIdSchema.safeParse(userId);

    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid user ID format.", errors: validationResult.error.errors });
    }

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json({ message: "User fetched successfully", user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "An error occurred while fetching the user", error: error.message });
    }
});


// Update user role
adminRouter.put("/user/role", async (req, res) => {
    const validationResult = updateUserRoleSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for user role update", errors: validationResult.error.errors });
    }

    const { userId, role } = validationResult.data;

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: { role: role } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json({ message: "User role updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "An error occurred while updating user role", error: error.message });
    }
});



// Update user active status 
adminRouter.put("/user/status", async (req, res) => {
    const validationResult = updateUserStatusSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for user status update", errors: validationResult.error.errors });
    }

    const { userId, isActive } = validationResult.data;

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: { isActive: isActive } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json({ message: "User status updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ message: "An error occurred while updating user status", error: error.message });
    }
});


// Delete a user
adminRouter.delete("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    const validationResult = userIdSchema.safeParse(userId);

    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid user ID format.", errors: validationResult.error.errors });
    }

    try {
        const deletedUser = await UserModel.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found." });
        }

       
        await PurchaseModel.deleteMany({ userId: userId });
        await ReviewModel.deleteMany({ userId: userId });
        await UserLectureProgressModel.deleteMany({ userId: userId });
        await UserQuizAttemptModel.deleteMany({ userId: userId });
        await AssignmentSubmissionModel.deleteMany({ userId: userId });

        
        if (deletedUser.role === 'instructor') {
            // delete all courses created by this instructor
            const coursesToDelete = await CourseModel.find({ creatorId: userId });
            for (const course of coursesToDelete) {
                const sections = await SectionModel.find({ courseId: course._id });
                const sectionIds = sections.map(s => s._id);

                if (sectionIds.length > 0) {
                    const lectures = await LectureModel.find({ sectionId: { $in: sectionIds } });
                    const lectureIds = lectures.map(l => l._id);

                    if (lectureIds.length > 0) {
                        await QuizModel.deleteMany({ lectureId: { $in: lectureIds } });
                        await QuestionModel.deleteMany({ quizId: { $in: lectures.filter(l => l.type === 'quiz').map(l => l.quizId) } });
                        await AssignmentSubmissionModel.deleteMany({ lectureId: { $in: lectureIds } });
                        await UserLectureProgressModel.deleteMany({ lectureId: { $in: lectureIds } });
                    }
                    await LectureModel.deleteMany({ sectionId: { $in: sectionIds } });
                    await SectionModel.deleteMany({ courseId: course._id });
                }
                await CourseModel.findByIdAndDelete(course._id);
            }
        }

        res.status(200).json({ message: "User and all associated data deleted successfully", userId });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "An error occurred while deleting the user", error: error.message });
    }
});



// Course Management Routes

// Get all courses
adminRouter.get("/courses", async (req, res) => {
    try {
        const courses = await CourseModel.find({})
            .populate('creatorId', 'firstName lastName email')
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ message: "All courses fetched successfully", courses });
    } catch (error) {
        console.error("Error fetching all courses:", error);
        res.status(500).json({ message: "An error occurred while fetching courses", error: error.message });
    }
});


// Update course status
adminRouter.put("/course/status", async (req, res) => {
    const validationResult = updateCourseStatusSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for course status update", errors: validationResult.error.errors });
    }

    const { courseId, status } = validationResult.data;

    try {
        const updatedCourse = await CourseModel.findByIdAndUpdate(
            courseId,
            { $set: { status: status } },
            { new: true, runValidators: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ message: "Course not found." });
        }
        res.status(200).json({ message: "Course status updated successfully", course: updatedCourse });
    } catch (error) {
        console.error("Error updating course status:", error);
        res.status(500).json({ message: "An error occurred while updating course status", error: error.message });
    }
});

// Delete any course 
adminRouter.delete("/course/:courseId", async (req, res) => {
    const courseId = req.params.courseId;
    const validationResult = courseIdSchema.safeParse(courseId);

    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid course ID format.", errors: validationResult.error.errors });
    }

    try {
        const deletedCourse = await CourseModel.findByIdAndDelete(courseId);
        if (!deletedCourse) {
            return res.status(404).json({ message: "Course not found." });
        }

        const sections = await SectionModel.find({ courseId: courseId });
        const sectionIds = sections.map(s => s._id);

        if (sectionIds.length > 0) {
            const lectures = await LectureModel.find({ sectionId: { $in: sectionIds } });
            const lectureIds = lectures.map(l => l._id);

            if (lectureIds.length > 0) {
                await QuizModel.deleteMany({ lectureId: { $in: lectureIds } });
                await QuestionModel.deleteMany({ quizId: { $in: lectures.filter(l => l.type === 'quiz').map(l => l.quizId) } });
                await AssignmentSubmissionModel.deleteMany({ lectureId: { $in: lectureIds } });
                await UserLectureProgressModel.deleteMany({ lectureId: { $in: lectureIds } });
            }
            await LectureModel.deleteMany({ sectionId: { $in: sectionIds } });
            await SectionModel.deleteMany({ courseId: courseId });
        }

        // Also delete associated reviews and purchases for this course
        await ReviewModel.deleteMany({ courseId: courseId });
        await PurchaseModel.deleteMany({ courseId: courseId });

        await UserModel.updateMany(
            { $or: [{ enrolledCourses: courseId }, { createdCourses: courseId }] },
            { $pull: { enrolledCourses: courseId, createdCourses: courseId } }
        );


        res.status(200).json({ message: "Course and all associated data deleted successfully by admin", courseId });
    } catch (error) {
        console.error("Error deleting course by admin:", error);
        res.status(500).json({ message: "An error occurred while deleting the course", error: error.message });
    }
});



// Category Management Routes

// Create a new category
adminRouter.post("/category", async (req, res) => {
    const validationResult = createCategorySchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for category creation", errors: validationResult.error.errors });
    }

    const { name, description, imageUrl } = validationResult.data;

    try {
        const existingCategory = await CategoryModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }); 
        if (existingCategory) {
            return res.status(409).json({ message: "Category with this name already exists." });
        }

        const newCategory = await CategoryModel.create({ name, description, imageUrl });
        res.status(201).json({ message: "Category created successfully", category: newCategory });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "An error occurred while creating the category", error: error.message });
    }
});

// Get all categories
adminRouter.get("/categories", async (req, res) => {
    try {
        const categories = await CategoryModel.find({});
        res.status(200).json({ message: "Categories fetched successfully", categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "An error occurred while fetching categories", error: error.message });
    }
});


// Get a specific category by ID
adminRouter.get("/category/:categoryId", async (req, res) => {
    const categoryId = req.params.categoryId;
    const validationResult = categoryIdSchema.safeParse(categoryId);

    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid category ID format.", errors: validationResult.error.errors });
    }

    try {
        const category = await CategoryModel.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found." });
        }
        res.status(200).json({ message: "Category fetched successfully", category });
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ message: "An error occurred while fetching the category", error: error.message });
    }
});


// Update a category
adminRouter.put("/category/:categoryId", async (req, res) => {
    const categoryId = req.params.categoryId;
    const validationResult = updateCategorySchema.safeParse({ ...req.body, categoryId });
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for category update", errors: validationResult.error.errors });
    }

    const updateData = validationResult.data;

    try {
        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            categoryId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found." });
        }
        res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "An error occurred while updating the category", error: error.message });
    }
});


// Delete a category
adminRouter.delete("/category/:categoryId", async (req, res) => {
    const categoryId = req.params.categoryId;
    const validationResult = categoryIdSchema.safeParse(categoryId);

    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid category ID format.", errors: validationResult.error.errors });
    }

    try {
        const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found." });
        }

        // IMPORTANT: When deleting a category, you must handle courses that belong to it.
        // Option 1: Set category to null for courses that had this category
        // await CourseModel.updateMany({ category: categoryId }, { $set: { category: null } });
        // Option 2: Reassign courses to a default/uncategorized category
        // Option 3: Prevent deletion if courses are linked (more strict)
        // Option 4 (Implemented here): Delete courses associated with this category (most aggressive)
        const coursesToUpdate = await CourseModel.find({ category: categoryId });
        for (const course of coursesToUpdate) {
            // Re-use the cascade deletion logic for courses
            const sections = await SectionModel.find({ courseId: course._id });
            const sectionIds = sections.map(s => s._id);

            if (sectionIds.length > 0) {
                const lectures = await LectureModel.find({ sectionId: { $in: sectionIds } });
                const lectureIds = lectures.map(l => l._id);

                if (lectureIds.length > 0) {
                    await QuizModel.deleteMany({ lectureId: { $in: lectureIds } });
                    await QuestionModel.deleteMany({ quizId: { $in: lectures.filter(l => l.type === 'quiz').map(l => l.quizId) } });
                    await AssignmentSubmissionModel.deleteMany({ lectureId: { $in: lectureIds } });
                    await UserLectureProgressModel.deleteMany({ lectureId: { $in: lectureIds } });
                }
                await LectureModel.deleteMany({ sectionId: { $in: sectionIds } });
                await SectionModel.deleteMany({ courseId: course._id });
            }
            await CourseModel.findByIdAndDelete(course._id);
            await ReviewModel.deleteMany({ courseId: course._id });
            await PurchaseModel.deleteMany({ courseId: course._id });
            await UserModel.updateMany(
                { $or: [{ enrolledCourses: course._id }, { createdCourses: course._id }] },
                { $pull: { enrolledCourses: course._id, createdCourses: course._id } }
            );
        }

        res.status(200).json({ message: "Category and all associated courses deleted successfully", categoryId });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "An error occurred while deleting the category", error: error.message });
    }
});


module.exports = adminRouter
