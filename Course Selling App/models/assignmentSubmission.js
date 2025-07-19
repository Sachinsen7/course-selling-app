const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AssignmentSubmissionSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lectureId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture',
        required: true,
        unique: true 
    },
    courseId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    submissionUrl: { 
        type: String,
        trim: true,
        required: function() { return this.submissionText === undefined; }
    },
    submissionText: {
        type: String,
        trim: true,
        required: function() { return this.submissionUrl === undefined; } 
    },
    grade: {
        type: Number,
        min: 0,
        max: 100,
        default: null 
    },
    feedback: {
        type: String,
        trim: true
    },
    gradedBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    gradedAt: {
        type: Date
    }
}, {
    timestamps: true 
});

const AssignmentSubmissionModel = mongoose.model("AssignmentSubmission", AssignmentSubmissionSchema);

module.exports = AssignmentSubmissionModel;
