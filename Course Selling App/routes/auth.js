const { Router } = require("express")
const { UserModel, AdminModel } = require("../db/db")
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const z = require("zod")
const authRouter = Router();



authRouter.post("/user/signup", async(req, res) => {
    const requireBody = z.object({
        email: z.string().email().min(5),
        password: z.string().min(5),
        firstName: z.string().min(3),
        secondName: z.string().min(3),
    })

    const partSuccess = requireBody.safeParse(req.body)

    if(!partSuccess.success){
        return res.status(400).json({
            message: "Incorrect format",
            error: partSuccess.error
        })
    }

    const { email, password, firstName, secondName } = req.body

    try {
        const hasPassword = await bcrypt.hash(password, 6)
        const user = await UserModel.create({
            email,
            password: hasPassword,
            firstName,
            secondName
        })

        res.json({
            message: "You are Signed Up!",
            userId: user._id
        })
    } catch (error) {
        res.status(400).json({
            message: "You are already signed up!"
        })
    }
})


authRouter.post("/user/signin", async(req, res) => {
    const requireBody = z.object({
        email: z.string().email(),
        password: z.string().min(5)
    })


    const parseSuccess = requireBody.safeParse(req.body)

    if(!parseSuccess.success){
        return res.status(400).json({
            message: "Incorrect data format",
            error: parseSuccess.error
        })
    }

    const {email, password} = req.body
    const user = await UserModel.findOne({email})

    if(!user){
        return res.status(403).json({
            message: "Invalid credientials"
        })
    }


    const passwordMatch = await bcrypt.compare(password, user.password)

    if(passwordMatch){
        const token = jwt.sign({id: user._id}, process.env.JWT_USER_SECRET)
        res.json({token})
    } else {
        res.status(403).json({
            message: "Invalid credientials"
        })
    }

})

// admin routes


authRouter.post('/admin/signup', async (req, res) => {
    const requiredBody = z.object({
      email: z.string().email().min(5),
      password: z.string().min(5),
      firstName: z.string().min(3),
      secondName: z.string().min(3),
    });
  
    const parseSuccess = requiredBody.safeParse(req.body);
    if (!parseSuccess.success) {
      return res.status(400).json({
        message: 'Incorrect format',
        error: parseSuccess.error,
      });
    }
  
    const { email, password, firstName, secondName } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 6);
      const admin = await AdminModel.create({
        email,
        password: hashedPassword,
        firstName,
        secondName,
      });
      res.json({
        message: 'You are signed up as admin!',
        adminId: admin._id,
      });
    } catch (error) {
      res.status(400).json({
        message: 'You are already signed up!',
      });
    }
  });
  
  authRouter.post('/admin/signin', async (req, res) => {
    const requiredBody = z.object({
      email: z.string().email(),
      password: z.string().min(5),
    });
  
    const parseSuccess = requiredBody.safeParse(req.body);
    if (!parseSuccess.success) {
      return res.status(400).json({
        message: 'Incorrect data format',
        error: parseSuccess.error,
      });
    }
  
    const { email, password } = req.body;
    const admin = await AdminModel.findOne({ email });
  
    if (!admin) {
      return res.status(403).json({
        message: 'Invalid credentials',
      });
    }
  
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (passwordMatch) {
      const token = jwt.sign({ id: admin._id }, process.env.JWT_ADMIN_SECRET);
      res.json({ token });
    } else {
      res.status(403).json({
        message: 'Invalid credentials',
      });
    }
  });
  
  module.exports = { authRouter };