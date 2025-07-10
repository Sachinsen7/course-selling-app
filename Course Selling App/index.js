const express = require("express");
const app = express();
const {authRouter} =  require("./routes/auth")
const {enrollmentRouter} =  require("./routes/enrollments")
const {instructorRouter} =  require("./routes/instructor")
app.use(express.json())
const dotenv = require("dotenv")
const mongoose = require("mongoose")

dotenv.config()

app.use("/api/auth", authRouter)
app.use("/api/enrollment", enrollmentRouter)
app.use("/api/instructor", instructorRouter)


async function connectDB(){
    await mongoose.connect(process.env.MONGO_URI)
    app.listen(3000)
    console.log("Listening on port 3000")
}

connectDB()


