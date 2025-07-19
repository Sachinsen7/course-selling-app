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
  },
  {
    timestamps: true,
  }
);

const PurchaseModel = mongoose.model("Purchase", PurchaseSchema);

module.exports = PurchaseModel;
