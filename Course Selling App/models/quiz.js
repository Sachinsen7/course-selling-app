const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuizSchema = new Schema({
    lectureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture',
        required: true
    },
    courseId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    questions: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    passPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 70 
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const QuizModel = mongoose.model("Quiz", QuizSchema);

module.exports = QuizModel;
