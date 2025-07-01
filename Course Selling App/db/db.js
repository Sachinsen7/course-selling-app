const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = mongoose.ObjectId


const User = new Schema({
    email: {type: String, unique: true},
    password: String,
    firstName: String,
    secondName: String
})

const Admin = new Schema({
    email: {type: String, unique: true},
    password: String,
    firstName: String,
    secondName: String
})

const Course = new Schema({
    title: String,
    description: String,
    imageLink: String,
    price: Number,
    CreaterId: ObjectId
})

const Purchases = new Schema({
    courseId: ObjectId,
    userId: ObjectId
}) 

const UserModel = mongoose.model("User", User)
const AdminModel = mongoose.model("Admin", Admin)
const CourseModel = mongoose.model("Course", Course)
const PurchaseModel = mongoose.model("Purchase", Purchases)


module.exports = {
    UserModel,
    AdminModel,
    CourseModel,
    PurchaseModel
}