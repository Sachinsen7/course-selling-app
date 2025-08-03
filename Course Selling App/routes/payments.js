const { Router } = require('express');
const { CourseModel, PurchaseModel, UserModel } = require('../db/db');
const authMiddleware = require('../middleware/auth');
const z = require("zod");
const phonePeService = require('../services/phonepe');

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

// PhonePe payment initiation
const phonePePaymentSchema = z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format"),
    userPhone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
});

paymentRouter.post('/phonepe/initiate', authMiddleware, async (req, res) => {
    if (req.userRole !== 'learner') {
        return res.status(403).json({ message: "Access denied. Only learners can make payments." });
    }

    const validationResult = phonePePaymentSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({
            message: "Invalid input data",
            errors: validationResult.error.errors
        });
    }

    const { courseId, userPhone } = validationResult.data;
    const userId = req.userId;

    try {
        const course = await CourseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already enrolled
        const existingPurchase = await PurchaseModel.findOne({ userId, courseId });
        if (existingPurchase) {
            return res.status(400).json({ message: "Already enrolled in this course" });
        }

        // Generate transaction ID
        const merchantTransactionId = phonePeService.generateTransactionId('COURSE');

        // Create payment request
        const paymentData = {
            merchantTransactionId,
            amount: Math.round(course.price * 100), // Convert to paise
            userId: userId,
            courseId: courseId,
            userPhone: userPhone,
            userEmail: user.email
        };

        const paymentResult = await phonePeService.createPayment(paymentData);

        if (!paymentResult.success) {
            return res.status(500).json({
                message: 'Failed to initiate payment',
                error: paymentResult.error
            });
        }

        // Store pending transaction
        await PurchaseModel.create({
            userId,
            courseId,
            purchasedPrice: course.price,
            transactionId: merchantTransactionId,
            paymentStatus: 'PENDING'
        });

        res.json({
            success: true,
            transactionId: merchantTransactionId,
            paymentUrl: paymentResult.paymentUrl,
            message: 'Payment initiated successfully'
        });

    } catch (error) {
        console.error('PhonePe payment initiation error:', error);
        res.status(500).json({
            message: 'Error initiating payment',
            error: error.message
        });
    }
});

// PhonePe payment callback
paymentRouter.post('/phonepe/callback', async (req, res) => {
    try {
        const { transactionId } = req.query;

        if (!transactionId) {
            return res.status(400).json({ message: 'Transaction ID required' });
        }

        // Check payment status with PhonePe
        const statusResult = await phonePeService.checkPaymentStatus(transactionId);

        if (!statusResult.success) {
            return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=status_check_failed`);
        }

        const paymentData = statusResult.data;
        const isSuccess = paymentData.success && paymentData.data?.state === 'COMPLETED';

        // Update purchase record
        const purchase = await PurchaseModel.findOne({ transactionId });
        if (purchase) {
            purchase.paymentStatus = isSuccess ? 'COMPLETED' : 'FAILED';
            purchase.paymentResponse = paymentData;
            await purchase.save();

            if (isSuccess) {
                // Add course to user's enrolled courses
                await UserModel.findByIdAndUpdate(purchase.userId, {
                    $addToSet: { enrolledCourses: purchase.courseId }
                });
            }
        }

        // Redirect to frontend
        const redirectUrl = isSuccess
            ? `${process.env.FRONTEND_URL}/payment/success?transactionId=${transactionId}`
            : `${process.env.FRONTEND_URL}/payment/failed?transactionId=${transactionId}`;

        res.redirect(redirectUrl);

    } catch (error) {
        console.error('PhonePe callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=callback_error`);
    }
});

// PhonePe webhook
paymentRouter.post('/phonepe/webhook', async (req, res) => {
    try {
        const payload = req.body.response;
        const checksum = req.headers['x-verify'];

        const webhookResult = phonePeService.processWebhook(payload, checksum);

        if (!webhookResult.success) {
            return res.status(400).json({ message: 'Invalid webhook' });
        }

        const paymentData = webhookResult.data;
        const transactionId = paymentData.data?.merchantTransactionId;
        const isSuccess = paymentData.success && paymentData.data?.state === 'COMPLETED';

        // Update purchase record
        const purchase = await PurchaseModel.findOne({ transactionId });
        if (purchase) {
            purchase.paymentStatus = isSuccess ? 'COMPLETED' : 'FAILED';
            purchase.paymentResponse = paymentData;
            await purchase.save();

            if (isSuccess && purchase.paymentStatus !== 'COMPLETED') {
                // Add course to user's enrolled courses
                await UserModel.findByIdAndUpdate(purchase.userId, {
                    $addToSet: { enrolledCourses: purchase.courseId }
                });
            }
        }

        res.json({ success: true });

    } catch (error) {
        console.error('PhonePe webhook error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
});

module.exports = paymentRouter;
