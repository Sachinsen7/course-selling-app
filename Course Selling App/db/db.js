const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = mongoose.ObjectId


const User = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    secondName: { type: String, required: true },
})

const Admin = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    secondName: { type: String, required: true },
})

const Course = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageLink: { type: String, required: true },
    price: { type: Number, required: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
})

const Purchases = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
}) 

const Review = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
})

const UserModel = mongoose.model("User", User)
const AdminModel = mongoose.model("Admin", Admin)
const CourseModel = mongoose.model("Course", Course)
const PurchaseModel = mongoose.model("Purchase", Purchases)
const ReviewModel = mongoose.model("Review", Review)


module.exports = {
    UserModel,
    AdminModel,
    CourseModel,
    PurchaseModel,
    ReviewModel
}