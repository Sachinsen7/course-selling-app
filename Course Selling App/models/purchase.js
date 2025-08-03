const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PurchaseSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    purchasedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    transactionId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'COMPLETED'
    },
    paymentMethod: {
      type: String,
      enum: ['PHONEPE', 'MOCK', 'FREE'],
      default: 'MOCK'
    },
    paymentResponse: {
      type: mongoose.Schema.Types.Mixed, // Store payment gateway response
    },
  },
  {
    timestamps: true,
  }
);

const PurchaseModel = mongoose.model("Purchase", PurchaseSchema);

module.exports = PurchaseModel;
