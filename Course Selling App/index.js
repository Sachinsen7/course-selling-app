const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");


dotenv.config();


const { connectDB } = require("./db/db");


const authRouter = require("./routes/auth");
const enrollmentRouter = require("./routes/enrollments");
const instructorRouter = require("./routes/instructor");
const searchRouter = require("./routes/search");
const paymentRouter = require("./routes/payments");
const reviewRouter = require("./routes/review");
const adminRouter = require("./routes/admin")
const userRouter = require("./routes/user")

const app = express();


app.use(express.json());
app.use(cors());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get("/", (req, res) => {
    res.send("LMS Backend API is running!");
});

app.use("/api/auth", authRouter);
app.use("/api/enrollment", enrollmentRouter);
app.use("/api/instructor", instructorRouter);
app.use("/api/search", searchRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/review", reviewRouter);
app.use("/api/admin", adminRouter)
app.use("/api/user", userRouter)


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong on the server!" });
});


const PORT = process.env.PORT || 3000;

connectDB(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to database and start server:", error);
        process.exit(1);
    });
