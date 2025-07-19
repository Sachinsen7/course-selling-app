const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SectionSchema = new Schema({
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
    order: { 
        type: Number,
        required: true,
        min: 0
    },
    lectures: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture'
    }]
}, {
    timestamps: true
});

const SectionModel = mongoose.model("Section", SectionSchema);

module.exports = SectionModel;
