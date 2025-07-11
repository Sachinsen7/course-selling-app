const {Router} = require('express')
const { ReviewModel, CourseModel } = require('../db/db')
const userMiddleware = require('../middleware/user')
const reviewRouter = Router()

reviewRouter.post("/add", userMiddleware, async (req, res) => {
    const userId = req.userId

    const {courseId, rating, comment} = req.body

    try {
        const course = await CourseModel.findById(courseId);
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }
    
        const review = await ReviewModel.create({
          userId,
          courseId,
          rating,
          comment,
        });

        res.json({ message: 'Review added successfully', reviewId: review._id });
      } catch (error) {
        res.status(500).json({ message: 'Error adding review', error: error.message });
      }
});

reviewRouter.get("/course/:courseId", async (req, res) => {
    const {courseId} = req.params

    try {
        const reviews = await ReviewModel.find({courseId})
        res.json({
            message: "Reviews fetched successfully",
            reviews
        })

    } catch (error) {
        res.status(500).json({
            message: "Error fetching reviews",
            error: error.message
        })
    }
})

module.exports = {reviewRouter}
