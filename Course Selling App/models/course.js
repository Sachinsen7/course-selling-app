const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  price: Number,
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sections: [
    {
      title: String,
      order: Number,
      lectures: [
        {
          title: String,
          type: String,
          contentUrl: String,
          textContent: String,
          duration: Number, // In seconds
          order: Number,
          isPublished: Boolean,
          quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
          assignmentSubmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "AssignmentSubmission" },
        },
      ],
    },
  ],
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  learningObjectives: [String],
  requirements: [String],
  targetAudience: [String],
  duration: Number, // Total hours
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "All Levels"], default: "All Levels" },
  lastUpdated: String, // e.g., "2025-07"
  imageUrl: String,
  videoPreviewUrl: String,
  averageRating: { type: Number, default: 0 },
  numberOfReviews: { type: Number, default: 0 },
});

module.exports = mongoose.model("Course", courseSchema);