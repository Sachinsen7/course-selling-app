const { Router } = require("express")
const adminMiddleware = require("../middleware/admin")
const { AdminModel} = require("../db/db")
const bcrypt = require("bcryptjs")
const z = require("zod")
const { JWT_SECRET } = require("../config")
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
        }, JWT_SECRET)

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "Invalid Credientials"
        })
    }

    res.json({
        message: "Signed in successfully"
    })
})

adminRouter.post("/", (req, res) => {

})

adminRouter.put("/", (req, res) => {

})

module.exports = {
    adminRouter
}