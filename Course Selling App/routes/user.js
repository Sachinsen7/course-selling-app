const { Router } = require("express");
const { UserModel } = require("../db/db");
const authMiddleware = require("../middleware/auth"); 
const bcrypt = require('bcryptjs');
const z = require("zod");

const userRouter = Router();


const updateUserProfileSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters long").trim().optional(),
    lastName: z.string().min(2, "Last name must be at least 2 characters long").trim().optional(),
    profilePicture: z.string().url("Invalid profile picture URL format").optional().or(z.literal('')), // Allow empty string for clearing
    bio: z.string().max(500, "Bio cannot exceed 500 characters").trim().optional().or(z.literal('')), // Allow empty string for clearing
}).refine(data => {
   
    return Object.keys(data).some(key => data[key] !== undefined);
}, {
    message: "At least one field must be provided for profile update."
});


const changePasswordSchema = z.object({
    currentPassword: z.string().min(6, "Current password must be at least 6 characters long"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
    confirmNewPassword: z.string().min(6, "Confirm new password must be at least 6 characters long"),
}).refine(data => data.newPassword === data.confirmNewPassword, {
    message: "New password and confirmation do not match.",
    path: ["confirmNewPassword"], 
});


// Middleware to protect all user routes
userRouter.use(authMiddleware);

// Get user profile (authenticated user)
userRouter.get("/profile", async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json({ message: "User profile fetched successfully", user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "An error occurred while fetching profile.", error: error.message });
    }
});

// Update user profile (authenticated user)
userRouter.put("/profile", async (req, res) => {
    const validationResult = updateUserProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for profile update", errors: validationResult.error.errors });
    }

    const updateData = validationResult.data;

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            req.userId,
            { $set: updateData },
            { new: true, runValidators: true, select: '-password' } 
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "An error occurred while updating profile.", error: error.message });
    }
});

// Change user password (authenticated user)
userRouter.put("/change-password", async (req, res) => {
    const validationResult = changePasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data for password change", errors: validationResult.error.errors });
    }

    const { currentPassword, newPassword } = validationResult.data;

    try {
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Current password is incorrect." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully." });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "An error occurred while changing password.", error: error.message });
    }
});


module.exports = userRouter;
