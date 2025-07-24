const { Router } = require("express");
const { CourseModel, UserModel } = require("../db/db");
const searchRouter = Router();
const z = require("zod");

const searchCourseSchema = z.object({
  q: z.string().min(1, "Search query 'q' cannot be empty").optional(),
  category: z.string().min(1, "Category cannot be empty").optional(),
  instructorName: z.string().min(1, "Instructor name cannot be empty").optional(),
  minPrice: z.coerce.number().min(0, "Minimum price cannot be negative").optional(),
  maxPrice: z.coerce.number().min(0, "Maximum price cannot be negative").optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
}).refine(
  (data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: "minPrice cannot be greater than maxPrice",
    path: ["minPrice", "maxPrice"],
  }
);

const courseIdParamSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format");

searchRouter.get("/courses", async (req, res) => {
  const validationResult = searchCourseSchema.safeParse(req.query);

  if (!validationResult.success) {
    return res.status(400).json({
      message: "Invalid search query parameters",
      errors: validationResult.error.errors,
    });
  }

  const { q, category, instructorName, minPrice, maxPrice, page, limit } = validationResult.data;

  try {
    let query = {};
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }
    if (category) {
      query.category = { $regex: category, $options: "i" };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }
    if (instructorName) {
      const instructors = await UserModel.find({
        role: "instructor",
        $or: [{ firstName: { $regex: instructorName, $options: "i" } }, { lastName: { $regex: instructorName, $options: "i" } }],
      }).select("_id");
      query.creatorId = { $in: instructors.map((inst) => inst._id) };
    }
    query.status = "published";

    const skip = (page - 1) * limit;
    const courses = await CourseModel.find(query)
      .skip(skip)
      .limit(limit)
      .populate("creatorId", "firstName lastName profilePicture");

    const totalCourses = await CourseModel.countDocuments(query);

    res.status(200).json({
      message: "Courses retrieved successfully",
      currentPage: page,
      totalPages: Math.ceil(totalCourses / limit),
      totalResults: totalCourses,
      courses,
    });
  } catch (error) {
    console.error("Error searching courses:", error);
    res.status(500).json({
      message: "An error occurred while searching for courses",
      error: error.message,
    });
  }
});

searchRouter.get("/courses/:courseId", async (req, res) => {
  const courseId = req.params.courseId;
  const validationResult = courseIdParamSchema.safeParse(courseId);

  if (!validationResult.success) {
    return res.status(400).json({ message: "Invalid course ID format.", errors: validationResult.error.errors });
  }

  try {
    const course = await CourseModel.findById(courseId)
      .populate("creatorId", "firstName lastName profilePicture")
      .populate({
        path: "sections",
        select: "title order lectures",
        options: { sort: { order: 1 } },
        populate: {
          path: "lectures",
          select: "title type contentUrl textContent duration order isPublished quizId assignmentSubmissionId",
        },
      });

    if (!course || course.status !== "published") {
      return res.status(404).json({ message: "Course not found or not available." });
    }

    // Manually sort lectures by order
    const sortedCourse = course.toObject();
    sortedCourse.sections.forEach((section) => {
      section.lectures.sort((a, b) => a.order - b.order);
    });

    res.status(200).json({
      message: "Course retrieved successfully",
      course: {
        _id: sortedCourse._id,
        title: sortedCourse.title,
        description: sortedCourse.description,
        category: sortedCourse.category,
        price: sortedCourse.price,
        creatorId: sortedCourse.creatorId,
        sections: sortedCourse.sections,
        learningObjectives: sortedCourse.learningObjectives || [],
        requirements: sortedCourse.requirements || [],
        targetAudience: sortedCourse.targetAudience || [],
        duration: sortedCourse.duration || sortedCourse.sections.reduce((sum, s) => sum + s.lectures.reduce((lSum, l) => lSum + (l.duration || 0), 0), 0) / 3600,
        level: sortedCourse.level || "All Levels",
        totalLectures: sortedCourse.sections.reduce((sum, s) => sum + s.lectures.length, 0),
        lastUpdated: sortedCourse.lastUpdated || new Date().toISOString().slice(0, 7), // e.g., "2025-07"
        imageUrl: sortedCourse.imageUrl || "https://via.placeholder.com/300x200/F8FAFC/1E293B?text=Course+Image",
        videoPreviewUrl: sortedCourse.videoPreviewUrl || "",
        averageRating: sortedCourse.averageRating || 0,
        numberOfReviews: sortedCourse.numberOfReviews || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching single course:", error);
    res.status(500).json({
      message: "An error occurred while fetching the course",
      error: error.message,
    });
  }
});

module.exports = searchRouter;