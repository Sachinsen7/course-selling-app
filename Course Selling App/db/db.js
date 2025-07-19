const mongoose = require("mongoose");

const UserModel = require("../models/user");
const CourseModel = require("../models/course");
const PurchaseModel = require("../models/purchase");
const ReviewModel = require("../models/review");

const connectDB = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri, {
      // useNewUrlParser: true, // These options are deprecated in Mongoose 6+
      // useUnifiedTopology: true,
      // useCreateIndex: true, // This option is deprecated in Mongoose 6+
      // useFindAndModify: false // This option is deprecated in Mongoose 6+
    });
    console.log("MongoDB Connected Successfully!");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  UserModel,
  CourseModel,
  PurchaseModel,
  ReviewModel,
};
