const { Router } = require("express")
const { CourseModel} = require("../db/db")

const courseRouter = Router()

courseRouter.post("/purchase", (req, res) => {

})


courseRouter.get("/preview", (req, res) => {

})

module.exports = {
    courseRouter
}