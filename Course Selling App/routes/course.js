const { Router } = require("express")
const { CourseModel, PurchaseModel} = require("../db/db")
const userMiddleware = require("../middleware/user")

const courseRouter = Router()

courseRouter.post("/purchase", userMiddleware, async (req, res) => {
    const userId = req.userId
    const courseId = req.body.courseId
    
    await PurchaseModel.create({
        userId,
        courseId
    })

    res.json({
        message: "Course Purchased successfully"
    })
})


courseRouter.get("/preview", async (req, res) => {
    const courses = await CourseModel.find({})

    res.json({
        courses
    })
})

module.exports = {
    courseRouter
}