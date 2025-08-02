const { Router } = require("express");
const { UserModel, CourseModel } = require("../db/db");
const authMiddleware = require("../middleware/auth");
const { uploadProfilePicture, handleUploadError, deleteOldProfilePicture } = require("../middleware/upload");
const bcrypt = require('bcryptjs');
const z = require("zod");
const path = require('path');

const userRouter = Router();


const updateUserProfileSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters long").trim().optional(),
    lastName: z.string().min(2, "Last name must be at least 2 characters long").trim().optional(),
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

// Wishlist validation schema
const wishlistSchema = z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format")
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
userRouter.put("/profile", uploadProfilePicture, async (req, res) => {
    try {
        // Validate text fields
        const validationResult = updateUserProfileSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Invalid input data for profile update",
                errors: validationResult.error.errors
            });
        }

        const updateData = validationResult.data;

        // Handle profile picture upload
        if (req.file) {
            // Get current user to delete old profile picture
            const currentUser = await UserModel.findById(req.userId);
            if (currentUser && currentUser.profilePicture) {
                deleteOldProfilePicture(currentUser.profilePicture);
            }

            // Set new profile picture URL
            updateData.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
        }

        // Check if there's any data to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "At least one field must be provided for profile update."
            });
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.userId,
            { $set: updateData },
            { new: true, runValidators: true, select: '-password' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({
            message: "An error occurred while updating profile.",
            error: error.message
        });
    }
}, handleUploadError);

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

// Get user's wishlist
userRouter.get("/wishlist", async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)
            .populate('wishlist', 'title description price imageUrl averageRating numberOfReviews level category creatorId')
            .select('wishlist');

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({
            message: "Wishlist fetched successfully",
            wishlist: user.wishlist
        });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ message: "An error occurred while fetching wishlist.", error: error.message });
    }
});

// Add course to wishlist
userRouter.post("/wishlist", async (req, res) => {
    const validationResult = wishlistSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid course ID", errors: validationResult.error.errors });
    }

    const { courseId } = validationResult.data;

    try {
        // Check if course exists
        const course = await CourseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        // Check if user exists
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if course is already in wishlist
        if (user.wishlist.includes(courseId)) {
            return res.status(409).json({ message: "Course is already in your wishlist." });
        }

        // Check if user is already enrolled in the course
        if (user.enrolledCourses.includes(courseId)) {
            return res.status(409).json({ message: "You are already enrolled in this course." });
        }

        // Add course to wishlist
        await UserModel.findByIdAndUpdate(
            req.userId,
            { $addToSet: { wishlist: courseId } },
            { new: true }
        );

        res.status(200).json({ message: "Course added to wishlist successfully." });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ message: "An error occurred while adding to wishlist.", error: error.message });
    }
});

// Remove course from wishlist
userRouter.delete("/wishlist/:courseId", async (req, res) => {
    const courseId = req.params.courseId;
    const validationResult = wishlistSchema.safeParse({ courseId });

    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid course ID format", errors: validationResult.error.errors });
    }

    try {
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if course is in wishlist
        if (!user.wishlist.includes(courseId)) {
            return res.status(404).json({ message: "Course not found in your wishlist." });
        }

        // Remove course from wishlist
        await UserModel.findByIdAndUpdate(
            req.userId,
            { $pull: { wishlist: courseId } },
            { new: true }
        );

        res.status(200).json({ message: "Course removed from wishlist successfully." });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({ message: "An error occurred while removing from wishlist.", error: error.message });
    }
});

// Check if course is in user's wishlist
userRouter.get("/wishlist/check/:courseId", async (req, res) => {
    const courseId = req.params.courseId;
    const validationResult = wishlistSchema.safeParse({ courseId });

    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid course ID format", errors: validationResult.error.errors });
    }

    try {
        const user = await UserModel.findById(req.userId).select('wishlist');
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isInWishlist = user.wishlist.includes(courseId);
        res.status(200).json({
            message: "Wishlist status checked successfully",
            isInWishlist
        });
    } catch (error) {
        console.error("Error checking wishlist status:", error);
        res.status(500).json({ message: "An error occurred while checking wishlist status.", error: error.message });
    }
});


module.exports = userRouter;
