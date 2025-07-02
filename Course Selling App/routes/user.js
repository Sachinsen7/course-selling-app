const jwt = require("jsonwebtoken")
const { Router } = require("express")
const { UserModel, PurchaseModel, CourseModel } = require("../db/db")
const bcrypt = require("bcryptjs")
const z = require("zod")
const userRouter = Router()
const usermiddleware = require("../middleware/user")



userRouter.post("/signup", async (req, res) => {
    const requiredBody = z.object({
        email: z.string().email().min(5), // Email must be a valid format and at least 5 characters
        password: z.string().min(5), // Password must be at least 5 characters
        firstName: z.string().min(3), // First name must be at least 3 characters
        secondName: z.string().min(3), // Last name must be at least 3 characters
    });

    const parsSuccess = requiredBody.safeParse(req.body)

    if(!parsSuccess.success){
        return res.json({
            message: "Incorrect Format",
            error: parsSuccess.error 
        })
    }

    const { email, password, firstName, secondName} = req.body

    const hashingPassword = await bcrypt.hash(password, 6)

    try {
        await UserModel.create({
            email,
            password: hashingPassword,
            firstName,
            secondName
        })
    } catch (error) {
        return res.json({
            message: "You are already Signed up!"
        })
    }

    res.json({
        message: "you are signed up!"
    })


})


userRouter.post("/signin", async (req, res) => {
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

    const user = await UserModel.findOne({
        email: email,
    })

    if(!user){
        return res.status(403).json({
            message: "Inavalid Credieantials"
        })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if(passwordMatch){
        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_USER_SECRET)

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "Invalid Credientials"
        })
    }
})

userRouter.post("/purchasedCourses", usermiddleware, async (req, res) => {
    const userId = req.userId

    const purchases = await PurchaseModel.find({
        userId
    })

    const coursesData = await CourseModel.find({
        _id: {
            $in: purchases.map((p) => p.courseId)
        }
    })

    res.json({
        message: "Purchased Courses",
        coursesData
    })
})

module.exports = {
    userRouter
}



