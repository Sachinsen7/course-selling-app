const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true,
        default: 'https://placehold.co/400x250/cccccc/333333?text=Course+Image'
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numberOfReviews: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    }]
}, {
    timestamps: true
});

const CourseModel = mongoose.model("Course", CourseSchema);

module.exports = CourseModel; 
