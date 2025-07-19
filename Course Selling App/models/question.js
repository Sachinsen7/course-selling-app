const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    quizId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    courseId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    text: { 
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer'],
        required: true
    },
    options: [{ 
        text: { type: String, trim: true },
        isCorrect: { type: Boolean, default: false }
    }],
    correctAnswer: { 
        type: String,
        trim: true,
        required: function() { return this.type === 'true-false' || this.type === 'short-answer'; }
    },
    order: { 
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

const QuestionModel = mongoose.model("Question", QuestionSchema);

module.exports = QuestionModel;
