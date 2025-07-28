const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    min: 0,
    default: 0,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
    },
  ],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  learningObjectives: [String],
  requirements: [String],
  targetAudience: [String],
  duration: {
    type: Number,
    min: 0,
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'All Levels',
  },
  lastUpdated: String,
  imageUrl: String,
  videoPreviewUrl: String,
  averageRating: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Course', CourseSchema);