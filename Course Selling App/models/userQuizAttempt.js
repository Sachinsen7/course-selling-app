const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserQuizAttemptSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
    score: { 
        type: Number,
        min: 0,
        default: 0
    },
    passed: {
        type: Boolean,
        default: false
    },
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        userAnswer: { 
            type: Schema.Types.Mixed, 
            required: true
        },
        isCorrect: { 
            type: Boolean
        }
    }],
    attemptNumber: {
        type: Number,
        default: 1,
        min: 1
    }
}, {
    timestamps: true
});


// UserQuizAttemptSchema.index({ userId: 1, quizId: 1 }, { unique: true });

const UserQuizAttemptModel = mongoose.model("UserQuizAttempt", UserQuizAttemptSchema);

module.exports = UserQuizAttemptModel;
