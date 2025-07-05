const { Router } = require("express")
const adminMiddleware = require("../middleware/admin")
const { AdminModel, CourseModel} = require("../db/db")
const bcrypt = require("bcryptjs")
const z = require("zod")
const jwt = require("jsonwebtoken")
const adminRouter = Router()


adminRouter.post("/signup", async (req, res) => {
    const requiredBody = z.object({
        email: z.string().email().min(5), // Email must be a valid format and at least 5 characters
        password: z.string().min(5), // Password must be at least 5 characters
        firstName: z.string().min(3), // First name must be at least 3 characters
        secondName: z.string().min(3), // Last name must be at least 3 characters
    });

    const parsSuccess = requiredBody.safeParse(req.body)

    if(!parsSuccess.success){
        res.json({
            message: "Incorrect Format",
            error: parsSuccess.error 
        })
    }

    const { email, password, firstName, secondName} = req.body

    const hashingPassword = await bcrypt.hash(password, 6)

    try {
        await AdminModel.create({
            email,
            password: hashingPassword,
            firstName,
            secondName
        })
    } catch (error) {
        res.json({
            message: "You are already Signed up!"
        })
    }

    res.json({
        message: "you are signed up!"
    })
})


adminRouter.post("/signin", async (req, res) => {
    const requireBody = z.object({
        email: z.string().email(),
        password: z.string().min(6),
    });

    const parseDataWithSuccess = requireBody.safeParse(req.body);
    if(!parseDataWithSuccess.success){
        return res.json({
            message: "Incorrect data format",
            error: parseDataWithSuccess.error,
        });
    }
    const {email, password} = req.body

    const admin = await AdminModel.findOne({
        email: email,
    })

    if(!admin){
        return res.status(403).json({
            message: "Inavalid Credieantials"
        })
    }

    const passwordMatch = await bcrypt.compare(password, admin.password)

    if(passwordMatch){
        const token = jwt.sign({
            id: admin._id
        }, process.env.JWT_ADMIN_SECRET)

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "Invalid Credientials"
        })
    }
})

adminRouter.post("/course", adminMiddleware, async (req, res) => {
    const adminId = req.userId

    const {title, description, imageLink, price, } = req.body

    const user = await CourseModel.create({
        title,
        description,    
        imageLink,
        price,
        CreaterId: adminId  
    })
    res.json({
        message: "Course created successfully",
        courseId: user._id
    })
})

adminRouter.put("/course", adminMiddleware, async(req, res) => {
    const adminId = req.userId

    const {title, description, imageLink, price, courseId } = req.body

    const course = await CourseModel.updateOne(
        {
            _id: courseId,
            CreaterId: adminId

        },
        {
            title,
            description,
            imageLink,
            price, 
        })
        res.json({
            message: "Course Updated successfully",
            courseId: courseId
        })
})

adminRouter.get("/course/bulk", adminMiddleware, async(req, res) => {
    const adminId = req.userId

    const course = await CourseModel.find(
        {CreaterId: adminId})
        
        res.json({
        message: "Course Found successfully",
        course
    })
})

module.exports = {
    adminRouter
}