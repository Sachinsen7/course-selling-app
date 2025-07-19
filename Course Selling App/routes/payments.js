const { Router } = require('express');
const { CourseModel, PurchaseModel, UserModel } = require('../db/db');
const authMiddleware = require('../middleware/auth');
const z = require("zod");

const paymentRouter = Router();

const processPaymentSchema = z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format"),
 // real payments logic...
    paymentDetails: z.object({
        amount: z.number().min(0.01, "Amount must be positive"),
        currency: z.string().length(3).default('USD'), 
        paymentMethodNonce: z.string().optional(),
       
    }).passthrough() 
});

// Route to process payment for a course
paymentRouter.post('/process', authMiddleware, async (req, res) => {
    // Only learners can make payments
    if (req.userRole !== 'learner') {
        return res.status(403).json({ message: "Access denied. Only learners can process payments." });
    }

    const validationResult = processPaymentSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({
            message: "Invalid input data for payment processing",
            errors: validationResult.error.errors
        });
    }

    const userId = req.userId;
    const { courseId, paymentDetails } = validationResult.data;

    try {
        const course = await CourseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if the course is free. If so, redirect to enrollment directly.
        if (course.price === 0) {
            // For free courses, directly enroll instead of processing payment
            const existingEnrollment = await PurchaseModel.findOne({ userId, courseId });
            if (existingEnrollment) {
                return res.status(400).json({ message: "You are already enrolled in this free course." });
            }

            const newPurchase = await PurchaseModel.create({
                userId,
                courseId,
                purchasedPrice: 0,
                transactionId: 'FREE_ENROLLMENT' // Special transaction ID for free courses
            });

            await UserModel.findByIdAndUpdate(userId, {
                $addToSet: { enrolledCourses: courseId }
            });

            return res.status(200).json({
                message: "Successfully enrolled in free course",
                enrollmentId: newPurchase._id
            });
        }

        // --- REAL PAYMENT GATEWAY INTEGRATION WOULD GO HERE ---
        // This is where you would interact with Stripe, PayPal, Razorpay, etc.
        // Example:
        // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        // const charge = await stripe.charges.create({
        //     amount: paymentDetails.amount * 100, 
        //     currency: paymentDetails.currency,
        //     source: paymentDetails.paymentMethodNonce, 
        //     description: `Course purchase: ${course.title}`
        // });
        // const paymentSuccess = charge.status === 'succeeded';
        // const transactionId = charge.id;

        // Mock payment processing for demonstration
        const paymentSuccess = true;
        const transactionId = `mock_txn_${Date.now()}`; 

        if (!paymentSuccess) {
            return res.status(400).json({ message: 'Payment failed. Please try again.' });
        }

        // After successful payment, create a purchase record (enrollment)
        const newPurchase = await PurchaseModel.create({
            userId,
            courseId,
            purchasedPrice: course.price,
            transactionId: transactionId
        });

       
        await UserModel.findByIdAndUpdate(userId, {
            $addToSet: { enrolledCourses: courseId }
        });

        res.status(200).json({
            message: 'Payment processed and course purchased successfully',
            purchaseId: newPurchase._id,
            transactionId: transactionId
        });
    } catch (error) {
        console.error("Error processing payment:", error);
        // Handle specific payment gateway errors if applicable
        res.status(500).json({
            message: 'An error occurred while processing payment',
            error: error.message
        });
    }
});

module.exports = paymentRouter;
