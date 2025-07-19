const mongoose = require("mongoose");

const UserModel = require("../models/user");
const CourseModel = require("../models/course");
const PurchaseModel = require("../models/purchase");
const ReviewModel = require("../models/review");
const SectionModel = require("../models/section")
const LectureModel = require("../models/lectures")
const UserLectureProgressModel = require("../models/userLectureProgress")
const QuizModel = require("../models/quiz");
const QuestionModel = require("../models/question");
const UserQuizAttemptModel = require("../models/userQuizAttempt");
const AssignmentSubmissionModel = require("../models/assignmentSubmission");
const CategoryModel = require("../models/category");





const connectDB = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri);
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
  LectureModel,
  SectionModel,
  UserLectureProgressModel,
  QuizModel,
  QuestionModel,
  UserQuizAttemptModel,
  AssignmentSubmissionModel,
  CategoryModel
};
