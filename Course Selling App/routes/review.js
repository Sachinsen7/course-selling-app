const { Router } = require('express');
const { ReviewModel, CourseModel, PurchaseModel } = require('../db/db'); 
const authMiddleware = require('../middleware/auth'); 
const z = require("zod");

const reviewRouter = Router();


const addReviewSchema = z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format"),
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
    comment: z.string().min(10, "Comment must be at least 10 characters long").max(1000, "Comment cannot exceed 1000 characters").trim()
});


const updateReviewSchema = z.object({
    reviewId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid review ID format"),
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5").optional(),
    comment: z.string().min(10, "Comment must be at least 10 characters long").max(1000, "Comment cannot exceed 1000 characters").trim().optional()
}).refine(data => data.rating !== undefined || data.comment !== undefined, {
    message: "Either rating or comment must be provided for update."
});


//helper function
async function updateCourseAverageRating(courseId) {
    const reviews = await ReviewModel.find({ courseId });
    const numberOfReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = numberOfReviews > 0 ? (totalRating / numberOfReviews).toFixed(1) : 0;

    await CourseModel.findByIdAndUpdate(courseId, {
        averageRating: parseFloat(averageRating),
        numberOfReviews: numberOfReviews
    });
}

// Route to add a new review
reviewRouter.post("/add", authMiddleware, async (req, res) => {
    // Only learners can add reviews
    if (req.userRole !== 'learner') {
        return res.status(403).json({ message: "Access denied. Only learners can add reviews." });
    }

    const validationResult = addReviewSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({
            message: "Invalid input data for review",
            errors: validationResult.error.errors
        });
    }

    const userId = req.userId;
    const { courseId, rating, comment } = validationResult.data;

    try {
        const course = await CourseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // check first
        const hasPurchased = await PurchaseModel.findOne({ userId, courseId });
        if (!hasPurchased) {
            return res.status(403).json({ message: "You must purchase/enroll in the course to leave a review." });
        }

        // check if the user has already reviewed this course
        const existingReview = await ReviewModel.findOne({ userId, courseId });
        if (existingReview) {
            return res.status(409).json({ message: "You have already submitted a review for this course. Please update your existing review." });
        }

        const newReview = await ReviewModel.create({
            userId,
            courseId,
            rating,
            comment,
        });

       
        await updateCourseAverageRating(courseId);

        res.status(201).json({ message: 'Review added successfully', reviewId: newReview._id });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: 'An error occurred while adding the review', error: error.message });
    }
});

// Route to get all reviews for a specific course
reviewRouter.get("/course/:courseId", async (req, res) => {
    const { courseId } = req.params;

    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid course ID format." });
    }

    try {
        // Find reviews and populate user details (who wrote the review)
        const reviews = await ReviewModel.find({ courseId })
            .populate('userId', 'firstName lastName profilePicture'); // Populate user who wrote the review

        res.status(200).json({
            message: "Reviews fetched successfully",
            reviews
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({
            message: "An error occurred while fetching reviews",
            error: error.message
        });
    }
});

// Route to update a user's own review
reviewRouter.put("/update/:reviewId", authMiddleware, async (req, res) => {
    // Only learners can update their own reviews
    if (req.userRole !== 'learner') {
        return res.status(403).json({ message: "Access denied. Only learners can update reviews." });
    }

    const reviewId = req.params.reviewId;
    const userId = req.userId;

    const validationResult = updateReviewSchema.safeParse({ ...req.body, reviewId });

    if (!validationResult.success) {
        return res.status(400).json({
            message: "Invalid input data for review update",
            errors: validationResult.error.errors
        });
    }

    const { rating, comment } = validationResult.data;

    try {
        const updatedReview = await ReviewModel.findOneAndUpdate(
            { _id: reviewId, userId: userId }, 
            { $set: { rating, comment } },
            { new: true, runValidators: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ message: "Review not found or you don't have permission to update it." });
        }

      
        await updateCourseAverageRating(updatedReview.courseId);

        res.status(200).json({
            message: "Review updated successfully",
            review: updatedReview
        });
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ message: 'An error occurred while updating the review', error: error.message });
    }
});

// Route to delete a user's own review
reviewRouter.delete("/delete/:reviewId", authMiddleware, async (req, res) => {
    // Only learners can delete their own reviews
    if (req.userRole !== 'learner') {
        return res.status(403).json({ message: "Access denied. Only learners can delete reviews." });
    }

    const reviewId = req.params.reviewId;
    const userId = req.userId;

    if (!reviewId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid review ID format." });
    }

    try {
        const deletedReview = await ReviewModel.findOneAndDelete({ _id: reviewId, userId: userId });

        if (!deletedReview) {
            return res.status(404).json({ message: "Review not found or you don't have permission to delete it." });
        }

    
        await updateCourseAverageRating(deletedReview.courseId);

        res.status(200).json({ message: "Review deleted successfully", reviewId: deletedReview._id });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ message: 'An error occurred while deleting the review', error: error.message });
    }
});

module.exports = reviewRouter;
