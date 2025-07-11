const { Router } = require('express');
const { PurchaseModel, CourseModel } = require('../db/db');
const userMiddleware = require('../middleware/user');
const paymentRouter = Router();

paymentRouter.post('/process', userMiddleware, async (req, res) => {
  const userId = req.userId;
  const { courseId, paymentDetails } = req.body;

  try {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Mock payment processing logic
    const paymentSuccess = true; 
    if (!paymentSuccess) {
      return res.status(400).json({ message: 'Payment failed' });
    }

    await PurchaseModel.create({ userId, courseId });
    res.json({ message: 'Payment processed and course purchased successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
});

module.exports = { paymentRouter };