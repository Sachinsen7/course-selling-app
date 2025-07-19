const { Router } = require("express");
const { CourseModel, PurchaseModel, UserModel, SectionModel, LectureModel, UserLectureProgressModel, QuizModel, QuestionModel, UserQuizAttemptModel, AssignmentSubmissionModel } = require("../db/db");
const authMiddleware = require("../middleware/auth");
const z = require("zod");

const enrollmentRouter = Router();

// Zod schema for course purchase/enrollment
const purchaseSchema = z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format")
});

// Zod schema for marking lecture complete/updating progress
const lectureProgressSchema = z.object({
    lectureId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid lecture ID format"),
    isCompleted: z.boolean().optional(),
    lastWatchedPosition: z.number().int().min(0, "Position must be non-negative").optional()
}).refine(data => data.isCompleted !== undefined || data.lastWatchedPosition !== undefined, {
    message: "Either isCompleted or lastWatchedPosition must be provided for update."
});

// Zod schema for submitting quiz answers
const submitQuizSchema = z.object({
    quizId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid quiz ID format"),
    answers: z.array(z.object({
        questionId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid question ID format"),
        userAnswer: z.any() 
    }))
});

// Zod schema for submitting an assignment
const submitAssignmentSchema = z.object({
    lectureId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid lecture ID format"),
    submissionUrl: z.string().url("Invalid submission URL format").optional(),
    submissionText: z.string().min(10, "Submission text must be at least 10 characters long").optional()
}).refine(data => data.submissionUrl !== undefined || data.submissionText !== undefined, {
    message: "Either submissionUrl or submissionText must be provided."
});


// Route to purchase/enroll in a course
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
            .sort({ createdAt: -1 });

        res.status(200).json({ message: "Purchased courses retrieved successfully", courses });
    } catch (error) {
        console.error("Error fetching purchased courses:", error);
        res.status(500).json({ message: "An error occurred while fetching purchased courses", error: error.message });
    }
});

// Route to get details of a specific enrolled course
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

        const course = await CourseModel.findById(courseId)
            .populate('creatorId', 'firstName lastName profilePicture')
            .populate({
                path: 'sections',
                select: 'title order lectures',
                options: { sort: { order: 1 } },
                populate: {
                    path: 'lectures',
                    select: 'title type contentUrl textContent duration order isPublished quizId assignmentSubmissionId',
                    options: { sort: { order: 1 } }
                }
            });

        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        const userProgress = await UserLectureProgressModel.find({ userId, courseId });
        const progressMap = new Map();
        userProgress.forEach(p => progressMap.set(p.lectureId.toString(), p));

        const courseWithProgress = course.toObject();
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

// Learner Quiz Routes 

// Route to get a specific quiz for a learner 
enrollmentRouter.get("/quiz/:quizId", authMiddleware, async (req, res) => {
    if (req.userRole !== 'learner') {
        return res.status(403).json({ message: "Access denied. Only learners can view quizzes." });
    }

    const quizId = req.params.quizId;
    const userId = req.userId;

    if (!quizId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid quiz ID format." });
    }

    try {
        const quiz = await QuizModel.findById(quizId).populate({
            path: 'questions',
            select: '-correctAnswer -createdAt -updatedAt' 
        });

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }

        
        const hasPurchased = await PurchaseModel.findOne({ userId, courseId: quiz.courseId });
        if (!hasPurchased) {
            return res.status(403).json({ message: "You must be enrolled in this course to take this quiz." });
        }

        // Check if the quiz is published
        if (!quiz.isPublished) {
            return res.status(400).json({ message: "This quiz is not yet published." });
        }

        res.status(200).json({ message: "Quiz retrieved successfully", quiz });
    } catch (error) {
        console.error("Error fetching quiz for learner:", error);
        res.status(500).json({ message: "An error occurred while fetching the quiz", error: error.message });
    }
});

// Route for a learner to submit quiz answers
enrollmentRouter.post("/quiz/:quizId/submit", authMiddleware, async (req, res) => {
    if (req.userRole !== 'learner') {
        return res.status(403).json({ message: "Access denied. Only learners can submit quizzes." });
    }

    const quizId = req.params.quizId;
    const userId = req.userId;

    const validationResult = submitQuizSchema.safeParse({ ...req.body, quizId });
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for quiz submission", errors: validationResult.error.errors });
    }

    const { answers } = validationResult.data;

    try {
        const quiz = await QuizModel.findById(quizId).populate('questions');
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }

       
        if (!quiz.isPublished) {
            return res.status(400).json({ message: "This quiz is not yet published." });
        }

        // Check enrollment
        const hasPurchased = await PurchaseModel.findOne({ userId, courseId: quiz.courseId });
        if (!hasPurchased) {
            return res.status(403).json({ message: "You must be enrolled in this course to submit this quiz." });
        }

        let correctAnswersCount = 0;
        const results = [];

        
        const questionsMap = new Map(quiz.questions.map(q => [q._id.toString(), q]));

        for (const userAnswer of answers) {
            const question = questionsMap.get(userAnswer.questionId);
            if (!question) {
                results.push({
                    questionId: userAnswer.questionId,
                    userAnswer: userAnswer.userAnswer,
                    isCorrect: false,
                    message: "Question not found in quiz."
                });
                continue;
            }

            let isCorrect = false;
          
            if (question.type === 'multiple-choice') {
                
                const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.text.toLowerCase());
                const submittedAnswers = Array.isArray(userAnswer.userAnswer) ? userAnswer.userAnswer.map(ans => ans.toLowerCase()) : [userAnswer.userAnswer.toLowerCase()];
                isCorrect = submittedAnswers.every(ans => correctOptions.includes(ans)) && submittedAnswers.length === correctOptions.length;
            } else if (question.type === 'true-false' || question.type === 'short-answer') {
                isCorrect = userAnswer.userAnswer.toString().toLowerCase() === question.correctAnswer.toLowerCase();
            }

            if (isCorrect) {
                correctAnswersCount++;
            }

            results.push({
                questionId: question._id,
                userAnswer: userAnswer.userAnswer,
                isCorrect: isCorrect,
                correctAnswer: question.correctAnswer || question.options.filter(opt => opt.isCorrect).map(opt => opt.text) 
            });
        }

        const totalQuestions = quiz.questions.length;
        const score = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
        const passed = score >= quiz.passPercentage;

       
        let userAttempt = await UserQuizAttemptModel.findOne({ userId, quizId });
        let attemptNumber = 1;

        if (userAttempt) {
            attemptNumber = userAttempt.attemptNumber + 1;
           
            userAttempt.score = score;
            userAttempt.passed = passed;
            userAttempt.answers = results.map(r => ({
                questionId: r.questionId,
                userAnswer: r.userAnswer,
                isCorrect: r.isCorrect
            }));
            userAttempt.attemptNumber = attemptNumber;
            await userAttempt.save();
        } else {
            
            userAttempt = await UserQuizAttemptModel.create({
                userId,
                quizId,
                courseId: quiz.courseId,
                score,
                passed,
                answers: results.map(r => ({
                    questionId: r.questionId,
                    userAnswer: r.userAnswer,
                    isCorrect: r.isCorrect
                })),
                attemptNumber
            });
        }

       
        if (passed) {
            await UserLectureProgressModel.findOneAndUpdate(
                { userId, lectureId: quiz.lectureId },
                { $set: { isCompleted: true, completedAt: new Date() }, $setOnInsert: { courseId: quiz.courseId } },
                { upsert: true, new: true }
            );
        }

        res.status(200).json({
            message: "Quiz submitted successfully",
            score: parseFloat(score.toFixed(2)),
            passed,
            results,
            attemptNumber
        });

    } catch (error) {
        console.error("Error submitting quiz:", error);
        res.status(500).json({ message: "An error occurred while submitting the quiz", error: error.message });
    }
});

// Route for a learner to view their past quiz attempts
enrollmentRouter.get("/quiz/:quizId/attempts", authMiddleware, async (req, res) => {
    if (req.userRole !== 'learner') {
        return res.status(403).json({ message: "Access denied. Only learners can view quiz attempts." });
    }

    const quizId = req.params.quizId;
    const userId = req.userId;

    if (!quizId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid quiz ID format." });
    }

    try {
        const quiz = await QuizModel.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }

        const hasPurchased = await PurchaseModel.findOne({ userId, courseId: quiz.courseId });
        if (!hasPurchased) {
            return res.status(403).json({ message: "You must be enrolled in this course to view quiz attempts." });
        }

        const attempts = await UserQuizAttemptModel.find({ userId, quizId })
            .sort({ createdAt: -1 }) 
            .populate('answers.questionId', 'text type options correctAnswer');

        res.status(200).json({ message: "Quiz attempts retrieved successfully", attempts });
    } catch (error) {
        console.error("Error fetching quiz attempts:", error);
        res.status(500).json({ message: "An error occurred while fetching quiz attempts", error: error.message });
    }
});


// Learner Assignment Routes 

// Route for a learner to submit an assignment
enrollmentRouter.post("/assignment/:lectureId/submit", authMiddleware, async (req, res) => {
    if (req.userRole !== 'learner') {
        return res.status(403).json({ message: "Access denied. Only learners can submit assignments." });
    }

    const lectureId = req.params.lectureId;
    const userId = req.userId;

    const validationResult = submitAssignmentSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for assignment submission", errors: validationResult.error.errors });
    }

    const { submissionUrl, submissionText } = validationResult.data;

    try {
        const lecture = await LectureModel.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ message: "Assignment lecture not found." });
        }
        if (lecture.type !== 'assignment') {
            return res.status(400).json({ message: "This lecture is not an assignment." });
        }

        const hasPurchased = await PurchaseModel.findOne({ userId, courseId: lecture.courseId });
        if (!hasPurchased) {
            return res.status(403).json({ message: "You must be enrolled in this course to submit this assignment." });
        }

        
        const existingSubmission = await AssignmentSubmissionModel.findOne({ userId, lectureId });
        if (existingSubmission) {
           
            // return res.status(409).json({ message: "You have already submitted this assignment." });
           
            const updatedSubmission = await AssignmentSubmissionModel.findByIdAndUpdate(
                existingSubmission._id,
                { $set: { submissionUrl, submissionText, grade: null, feedback: null, gradedBy: null, gradedAt: null } },
                { new: true, runValidators: true }
            );
            return res.status(200).json({ message: "Assignment resubmitted successfully", submission: updatedSubmission });
        }


        const newSubmission = await AssignmentSubmissionModel.create({
            userId,
            lectureId,
            courseId: lecture.courseId,
            submissionUrl,
            submissionText
        });

        
        await UserLectureProgressModel.findOneAndUpdate(
            { userId, lectureId },
            { $set: { isCompleted: true, completedAt: new Date() }, $setOnInsert: { courseId: lecture.courseId } },
            { upsert: true, new: true }
        );

        res.status(201).json({ message: "Assignment submitted successfully", submission: newSubmission });
    } catch (error) {
        console.error("Error submitting assignment:", error);
        res.status(500).json({ message: "An error occurred while submitting the assignment", error: error.message });
    }
});

// Route for a learner to view their own assignment submissions
enrollmentRouter.get("/assignment/:lectureId/my-submission", authMiddleware, async (req, res) => {
    if (req.userRole !== 'learner') {
        return res.status(403).json({ message: "Access denied. Only learners can view their submissions." });
    }

    const lectureId = req.params.lectureId;
    const userId = req.userId;

    if (!lectureId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid lecture ID format." });
    }

    try {
        const lecture = await LectureModel.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ message: "Assignment lecture not found." });
        }
        if (lecture.type !== 'assignment') {
            return res.status(400).json({ message: "This lecture is not an assignment." });
        }

        const hasPurchased = await PurchaseModel.findOne({ userId, courseId: lecture.courseId });
        if (!hasPurchased) {
            return res.status(403).json({ message: "You must be enrolled in this course to view this assignment's submission." });
        }

        const submission = await AssignmentSubmissionModel.findOne({ userId, lectureId });

        if (!submission) {
            return res.status(404).json({ message: "No submission found for this assignment." });
        }

        res.status(200).json({ message: "Assignment submission retrieved successfully", submission });
    } catch (error) {
        console.error("Error fetching assignment submission:", error);
        res.status(500).json({ message: "An error occurred while fetching assignment submission", error: error.message });
    }
});


module.exports = enrollmentRouter;
