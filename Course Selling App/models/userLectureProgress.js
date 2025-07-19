const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserLectureProgressSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    lectureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture',
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
 
    lastWatchedPosition: {
        type: Number,
        default: 0, // In seconds
        min: 0
    },
    completedAt: {
        type: Date 
    }
}, {
    timestamps: true 
});


UserLectureProgressSchema.index({ userId: 1, lectureId: 1 }, { unique: true });

const UserLectureProgressModel = mongoose.model("UserLectureProgress", UserLectureProgressSchema);

module.exports = UserLectureProgressModel;
