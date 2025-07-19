const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LectureSchema = new Schema({
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
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
    type: {
        type: String,
        enum: ['video', 'text', 'quiz', 'assignment'],
        required: true
    },
    contentUrl: { 
        type: String,
        required: function() { return this.type === 'video' || this.type === 'assignment'; } // Required for video/assignment
    },
    textContent: {
        type: String,
        required: function() { return this.type === 'text'; } 
    },
    duration: { 
        type: Number,
        min: 0,
        required: function() { return this.type === 'video'; }
    },
    order: { 
        type: Number,
        required: true,
        min: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const LectureModel = mongoose.model("Lecture", LectureSchema);

module.exports = LectureModel;
