const {Router} = require("express")
const { PurchaseModel, CourseModel} = require("../db/db")
const userMiddleware = require("../middleware/user")
const enrollmentRouter = Router()


enrollmentRouter.post("/purchase", async(req, res) => {
    const userId = req.userId
    const {courseId} = req.body

    try {
        const course = await CourseModel.findById(courseId)

        if(!course){
            return res.status(404).json({
                message: "Course not found"
            })
        }

        const existingCourse = await PurchaseModel.findOne({userId, courseId})
        if(existingCourse){
            return res.status(400).json({
                message: "You have already enrolled in this course"
            })
        }

        await PurchaseModel.create({userId, courseId})
        res.json({
            message: "Course Purchased successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        })
    }
})

enrollmentRouter.get("/purchased", userMiddleware, async(req, res) => {
    const userId = req.userId

    try {
        const purchases = await PurchaseModel.find({userId})
        const courseIds = purchases.map((p) => p.courseId)

        const courses = await CourseModel.find({_id: {$in: courseIds}})
        res.json({
            message: "Purchased Courses",
            courses
        })
    } catch (error) {
        res.status(500).json({
            message: "Error fetching purchased courses", 
            error: error.message
        })
    }
})

module.exports = {enrollmentRouter}