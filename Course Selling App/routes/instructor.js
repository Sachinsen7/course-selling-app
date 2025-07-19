const { Router } = require("express");
const { CourseModel, UserModel, SectionModel, LectureModel, QuizModel, QuestionModel, AssignmentSubmissionModel } = require("../db/db");
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

// Zod schema for creating a quiz
const createQuizSchema = z.object({
    lectureId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid lecture ID format"),
    title: z.string().min(3, "Quiz title must be at least 3 characters long").max(100, "Quiz title cannot exceed 100 characters").trim(),
    description: z.string().trim().optional(),
    passPercentage: z.number().int().min(0).max(100).default(70).optional(),
    isPublished: z.boolean().default(false).optional()
});

// Zod schema for updating a quiz
const updateQuizSchema = z.object({
    quizId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid quiz ID format"),
    title: z.string().min(3, "Quiz title must be at least 3 characters long").max(100, "Quiz title cannot exceed 100 characters").trim().optional(),
    description: z.string().trim().optional(),
    passPercentage: z.number().int().min(0).max(100).optional(),
    isPublished: z.boolean().optional()
}).refine(data => Object.keys(data).length > 1, {
    message: "At least one field must be provided for update."
});

// Zod schema for creating a question
const createQuestionSchema = z.object({
    quizId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid quiz ID format"),
    text: z.string().min(5, "Question text must be at least 5 characters long").trim(),
    type: z.enum(['multiple-choice', 'true-false', 'short-answer']),
    options: z.array(z.object({
        text: z.string().min(1).trim(),
        isCorrect: z.boolean().default(false)
    })).optional(),
    correctAnswer: z.string().trim().optional(),
    order: z.number().int().min(0, "Order must be a non-negative integer")
}).refine(data => {
    if (data.type === 'multiple-choice') {
        return data.options !== undefined && data.options.length > 1;
    }
    if (data.type === 'true-false' || data.type === 'short-answer') {
        return data.correctAnswer !== undefined && data.correctAnswer.length > 0;
    }
    return true;
}, {
    message: "Missing required fields based on question type."
});


const updateQuestionSchema = z.object({
    questionId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid question ID format"),
    text: z.string().min(5, "Question text must be at least 5 characters long").trim().optional(),
    type: z.enum(['multiple-choice', 'true-false', 'short-answer']).optional(),
    options: z.array(z.object({
        text: z.string().min(1).trim(),
        isCorrect: z.boolean().default(false)
    })).optional(),
    correctAnswer: z.string().trim().optional(),
    order: z.number().int().min(0, "Order must be a non-negative integer").optional()
}).refine(data => Object.keys(data).length > 1, {
    message: "At least one field must be provided for update."
});


const gradeAssignmentSchema = z.object({
    submissionId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid submission ID format"),
    grade: z.number().int().min(0).max(100, "Grade must be between 0 and 100"),
    feedback: z.string().trim().optional()
});


// Helper function to check if instructor owns the course
const checkCourseOwnership = async (courseId, instructorId) => {
    const course = await CourseModel.findOne({ _id: courseId, creatorId: instructorId });
    return course;
};


const checkLectureOwnership = async (lectureId, instructorId) => {
    const lecture = await LectureModel.findById(lectureId);
    if (!lecture) return null;
    return checkCourseOwnership(lecture.courseId, instructorId);
};


const checkQuizOwnership = async (quizId, instructorId) => {
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) return null;
    return checkLectureOwnership(quiz.lectureId, instructorId);
};


const checkQuestionOwnership = async (questionId, instructorId) => {
    const question = await QuestionModel.findById(questionId);
    if (!question) return null;
    return checkQuizOwnership(question.quizId, instructorId);
};


// Course Routes

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
            
            const lectures = await LectureModel.find({ sectionId: { $in: sectionIds } });
            const lectureIds = lectures.map(l => l._id);

            if (lectureIds.length > 0) {
                await QuizModel.deleteMany({ lectureId: { $in: lectureIds } });
                await QuestionModel.deleteMany({ quizId: { $in: lectures.filter(l => l.type === 'quiz').map(l => l.quizId) } }); // Delete questions related to deleted quizzes
                await AssignmentSubmissionModel.deleteMany({ lectureId: { $in: lectureIds } }); // Delete submissions for these assignments
                await UserLectureProgressModel.deleteMany({ lectureId: { $in: lectureIds } }); // Delete user progress for these lectures
            }
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

        const sections = await SectionModel.find({ courseId: courseId })
            .populate('lectures')
            .sort({ order: 1 });

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

        // Delete all lectures, quizzes, questions, and assignment submissions within this section
        const lectures = await LectureModel.find({ sectionId: sectionId });
        const lectureIds = lectures.map(l => l._id);

        if (lectureIds.length > 0) {
            await QuizModel.deleteMany({ lectureId: { $in: lectureIds } });
            await QuestionModel.deleteMany({ quizId: { $in: lectures.filter(l => l.type === 'quiz').map(l => l.quizId) } });
            await AssignmentSubmissionModel.deleteMany({ lectureId: { $in: lectureIds } });
            await UserLectureProgressModel.deleteMany({ lectureId: { $in: lectureIds } });
        }
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

// Route to get a specific lecture by ID
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

        // Delete associated quiz/questions or assignment submission if lecture type matches
        if (lecture.type === 'quiz' && lecture.quizId) {
            await QuizModel.findByIdAndDelete(lecture.quizId);
            await QuestionModel.deleteMany({ quizId: lecture.quizId });
            await UserQuizAttemptModel.deleteMany({ quizId: lecture.quizId }); // 
        }
        if (lecture.type === 'assignment' && lecture.assignmentSubmissionId) {
           
            await AssignmentSubmissionModel.deleteMany({ lectureId: lectureId });
        }
        await UserLectureProgressModel.deleteMany({ lectureId: lectureId }); // 

        await LectureModel.findByIdAndDelete(lectureId);

        res.status(200).json({ message: "Lecture deleted successfully", lectureId });
    } catch (error) {
        console.error("Error deleting lecture:", error);
        res.status(500).json({ message: "An error occurred while deleting the lecture", error: error.message });
    }
});


// Quiz Routes (New)

// Route to create a quiz for a specific lecture 
instructorRouter.post("/quiz", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can create quizzes." });
    }

    const validationResult = createQuizSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for quiz creation", errors: validationResult.error.errors });
    }

    const { lectureId, title, description, passPercentage, isPublished } = validationResult.data;
    const instructorId = req.userId;

    try {
        const lecture = await LectureModel.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ message: "Lecture not found." });
        }
        if (lecture.type !== 'quiz') {
            return res.status(400).json({ message: "Quiz can only be created for a lecture of type 'quiz'." });
        }
        if (lecture.quizId) {
            return res.status(409).json({ message: "This lecture already has a quiz associated with it." });
        }

        const course = await checkCourseOwnership(lecture.courseId, instructorId);
        if (!course) {
            return res.status(403).json({ message: "You don't have permission to create a quiz for this lecture." });
        }

        const newQuiz = await QuizModel.create({
            lectureId,
            courseId: lecture.courseId,
            title,
            description,
            passPercentage,
            isPublished
        });

       
        await LectureModel.findByIdAndUpdate(lectureId, { quizId: newQuiz._id });

        res.status(201).json({ message: "Quiz created successfully", quiz: newQuiz });
    } catch (error) {
        console.error("Error creating quiz:", error);
        res.status(500).json({ message: "An error occurred while creating the quiz", error: error.message });
    }
});

// Route to get a specific quiz by ID
instructorRouter.get("/quiz/:quizId", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can view quizzes." });
    }

    const quizId = req.params.quizId;
    const instructorId = req.userId;

    if (!quizId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid quiz ID format." });
    }

    try {
        const quiz = await QuizModel.findById(quizId).populate('questions').populate('lectureId', 'title courseId');
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }

        const course = await checkCourseOwnership(quiz.courseId, instructorId);
        if (!course) {
            return res.status(403).json({ message: "You don't have permission to view this quiz." });
        }

        res.status(200).json({ message: "Quiz fetched successfully", quiz });
    } catch (error) {
        console.error("Error fetching quiz:", error);
        res.status(500).json({ message: "An error occurred while fetching the quiz", error: error.message });
    }
});

// Route to update a quiz
instructorRouter.put("/quiz/:quizId", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can update quizzes." });
    }

    const quizId = req.params.quizId;
    const instructorId = req.userId;

    const validationResult = updateQuizSchema.safeParse({ ...req.body, quizId });
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for quiz update", errors: validationResult.error.errors });
    }

    const updateData = validationResult.data;

    try {
        const quiz = await QuizModel.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }

        const course = await checkCourseOwnership(quiz.courseId, instructorId);
        if (!course) {
            return res.status(403).json({ message: "You don't have permission to update this quiz." });
        }

        const updatedQuiz = await QuizModel.findByIdAndUpdate(
            quizId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "Quiz updated successfully", quiz: updatedQuiz });
    } catch (error) {
        console.error("Error updating quiz:", error);
        res.status(500).json({ message: "An error occurred while updating the quiz", error: error.message });
    }
});

// Route to delete a quiz
instructorRouter.delete("/quiz/:quizId", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can delete quizzes." });
    }

    const quizId = req.params.quizId;
    const instructorId = req.userId;

    if (!quizId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid quiz ID format." });
    }

    try {
        const quiz = await QuizModel.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }

        const course = await checkCourseOwnership(quiz.courseId, instructorId);
        if (!course) {
            return res.status(403).json({ message: "You don't have permission to delete this quiz." });
        }

        
        await LectureModel.findByIdAndUpdate(quiz.lectureId, { $unset: { quizId: 1 } });

       
        await QuestionModel.deleteMany({ quizId: quizId });
        await UserQuizAttemptModel.deleteMany({ quizId: quizId });

        await QuizModel.findByIdAndDelete(quizId);

        res.status(200).json({ message: "Quiz deleted successfully", quizId });
    } catch (error) {
        console.error("Error deleting quiz:", error);
        res.status(500).json({ message: "An error occurred while deleting the quiz", error: error.message });
    }
});


// Question Routes 

// Route to add a new question to a quiz
instructorRouter.post("/question", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can add questions." });
    }

    const validationResult = createQuestionSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for question creation", errors: validationResult.error.errors });
    }

    const { quizId, text, type, options, correctAnswer, order } = validationResult.data;
    const instructorId = req.userId;

    try {
        const quiz = await QuizModel.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }

        const course = await checkQuizOwnership(quizId, instructorId);
        if (!course) {
            return res.status(403).json({ message: "You don't have permission to add questions to this quiz." });
        }

        const newQuestion = await QuestionModel.create({
            quizId,
            courseId: quiz.courseId, 
            text,
            type,
            options,
            correctAnswer,
            order
        });

       
        await QuizModel.findByIdAndUpdate(quizId, { $addToSet: { questions: newQuestion._id } });

        res.status(201).json({ message: "Question added successfully", question: newQuestion });
    } catch (error) {
        console.error("Error adding question:", error);
        res.status(500).json({ message: "An error occurred while adding the question", error: error.message });
    }
});

// Route to update a question
instructorRouter.put("/question/:questionId", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can update questions." });
    }

    const questionId = req.params.questionId;
    const instructorId = req.userId;

    const validationResult = updateQuestionSchema.safeParse({ ...req.body, questionId });
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for question update", errors: validationResult.error.errors });
    }

    const updateData = validationResult.data;

    try {
        const question = await QuestionModel.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found." });
        }

        const course = await checkQuestionOwnership(questionId, instructorId);
        if (!course) {
            return res.status(403).json({ message: "You don't have permission to update this question." });
        }

        const updatedQuestion = await QuestionModel.findByIdAndUpdate(
            questionId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "Question updated successfully", question: updatedQuestion });
    } catch (error) {
        console.error("Error updating question:", error);
        res.status(500).json({ message: "An error occurred while updating the question", error: error.message });
    }
});

// Route to delete a question
instructorRouter.delete("/question/:questionId", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can delete questions." });
    }

    const questionId = req.params.questionId;
    const instructorId = req.userId;

    if (!questionId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid question ID format." });
    }

    try {
        const question = await QuestionModel.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found." });
        }

        const course = await checkQuestionOwnership(questionId, instructorId);
        if (!course) {
            return res.status(403).json({ message: "You don't have permission to delete this question." });
        }

      
        await QuizModel.findByIdAndUpdate(question.quizId, { $pull: { questions: questionId } });

        await QuestionModel.findByIdAndDelete(questionId);

        res.status(200).json({ message: "Question deleted successfully", questionId });
    } catch (error) {
        console.error("Error deleting question:", error);
        res.status(500).json({ message: "An error occurred while deleting the question", error: error.message });
    }
});

// Assignment Submission Routes 


instructorRouter.get("/assignment/:lectureId/submissions", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can view submissions." });
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
        if (lecture.type !== 'assignment') {
            return res.status(400).json({ message: "This lecture is not an assignment." });
        }

        const course = await checkLectureOwnership(lectureId, instructorId);
        if (!course) {
            return res.status(403).json({ message: "You don't have permission to view submissions for this assignment." });
        }

        const submissions = await AssignmentSubmissionModel.find({ lectureId: lectureId })
            .populate('userId', 'firstName lastName email profilePicture') 
            .sort({ createdAt: -1 }); 

        res.status(200).json({ message: "Assignment submissions fetched successfully", submissions });
    } catch (error) {
        console.error("Error fetching assignment submissions:", error);
        res.status(500).json({ message: "An error occurred while fetching assignment submissions", error: error.message });
    }
});

// Route to grade an assignment submission
instructorRouter.put("/submission/:submissionId/grade", authMiddleware, async (req, res) => {
    if (req.userRole !== 'instructor') {
        return res.status(403).json({ message: "Access denied. Only instructors can grade submissions." });
    }

    const submissionId = req.params.submissionId;
    const instructorId = req.userId;

    const validationResult = gradeAssignmentSchema.safeParse({ ...req.body, submissionId });
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for grading", errors: validationResult.error.errors });
    }

    const { grade, feedback } = validationResult.data;

    try {
        const submission = await AssignmentSubmissionModel.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ message: "Submission not found." });
        }

        // Verify instructor 
        const course = await checkLectureOwnership(submission.lectureId, instructorId);
        if (!course) {
            return res.status(403).json({ message: "You don't have permission to grade this submission." });
        }

        const updatedSubmission = await AssignmentSubmissionModel.findByIdAndUpdate(
            submissionId,
            {
                $set: {
                    grade,
                    feedback,
                    gradedBy: instructorId,
                    gradedAt: new Date()
                }
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "Submission graded successfully", submission: updatedSubmission });
    } catch (error) {
        console.error("Error grading submission:", error);
        res.status(500).json({ message: "An error occurred while grading the submission", error: error.message });
    }
});


module.exports = instructorRouter;
