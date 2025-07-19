const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true, 
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    imageUrl: {
        type: String,
        default: 'https://placehold.co/100x100/cccccc/333333?text=Category',
        trim: true
    }
}, {
    timestamps: true
});

const CategoryModel = mongoose.model("Category", CategorySchema);

module.exports = CategoryModel;
