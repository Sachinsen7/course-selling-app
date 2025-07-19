const { Router } = require("express");
const { CourseModel } = require("../db/db");
const searchRouter = Router();

searchRouter.get("/course", async (req, res) => {
  const { q } = req.query;

  try {
    const query = q
      ? {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const courses = await CourseModel.find(query);
    res.json({ message: "Courses retrived successfully", courses });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error Searching Courses", error: error.message });
  }
});

module.exports = { searchRouter };
