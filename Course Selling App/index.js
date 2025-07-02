const express = require("express");
const app = express();
const { userRouter } = require("./routes/user")
const { courseRouter } = require("./routes/course")
const { adminRouter } = require("./routes/admin")
app.use(express.json())
const dotenv = require("dotenv")
const mongoose = require("mongoose")

dotenv.config()

app.use("/api/v1/user", userRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v2/course", courseRouter)

async function connectDB(){
    await mongoose.connect(process.env.MONGO_URI)
    app.listen(3000)
    console.log("Listening on port 3000")
}

connectDB()


