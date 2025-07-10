const { Router } = require("express")
const {CourseModel} = require("../db/db")
const adminMiddleware = require("../middleware/admin")
const instructorRouter = Router()


instructorRouter.post("/course", async(req, res) => {
    const adminId = req.userId

    const {title, description, imageLink, price} = req.body

    try {
        const course = await CourseModel.create({
            title,
            description,
            imageLink,
            price,
            creatorId: adminId
        })

        res.json({
            message: "Course created successfully",
            courseId: course._id
        })
    } catch (error) {
        res.status(500).json({
            message: "Error creating course",
            error: error.message
        })
    }
})

instructorRouter.put("/course", adminMiddleware, async(req, res) => {
    const adminId = req.userId
    const {title, description, imageLink, price, courseId } = req.body

    try {
        const course = await CourseModel.updateOne(
            {_id: courseId, creatorId: adminId},
            {title, description, imageLink, price},
            {runValidators: true}
        )

        if(course.modifiedCount === 0){
            return res.status(404).json({
                message: "Course not found"
            })
        }

        res.json({message: "Course updated successfully", courseId})

    } catch (error) {
        res.status(500).json({
            message: "Error updating course",
            error: error.message
        })
    }
})

instructorRouter.get("/courses", adminMiddleware, async(req, res) => {
    const adminId = req.userId

    try {
        const course = await CourseModel.find({creatorId: adminId})
        res.json({
            message: "Courses fetched successfully",
            courses: course
        })
    } catch (error) {
        res.status(500).json({
            message: "Error fetching courses",
            error: error.message
        })
    }

})

module.exports = {instructorRouter}