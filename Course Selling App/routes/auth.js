const { Router } = require("express");
const { UserModel } = require("../db/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const z = require("zod");
const authRouter = Router();

const userSignupSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .min(5, "Email must be at least 5 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters long")
    .trim(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters long")
    .trim(),
  role: z.enum(["learner", "instructor", 'admin']).default("learner"),
});

// Zod schema for user signin
const userSigninSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password cannot be empty"),
});

// User signup route
authRouter.post("/signup", async (req, res) => {
  const validationResult = userSignupSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      message: "Invalid input data",
      errors: validationResult.error.errors,
    });
  }

  const { email, password, firstName, lastName, role } = validationResult.data;

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.status(201).json({
      message: "User signed up successfully",
      userId: newUser._id,
      role: newUser.role,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "An error occurred during signup",
    });
  }
});

// User signin route
authRouter.post("/signin", async (req, res) => {
  const validationResult = userSigninSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      message: "Invalid input data",
      errors: validationResult.error.errors,
    });
  }

  const { email, password } = validationResult.data;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate token with user ID and role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Signed in successfully",
      userId: user._id,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      message: "An error occurred during signin",
    });
  }
});

module.exports = authRouter;
