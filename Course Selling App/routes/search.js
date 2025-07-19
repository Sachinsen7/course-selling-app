const { Router } = require("express");
const { CourseModel, UserModel } = require("../db/db"); 
const z = require("zod");

const searchRouter = Router();


const searchCourseSchema = z.object({
    q: z.string().min(1, "Search query 'q' cannot be empty").optional(),
    category: z.string().min(1, "Category cannot be empty").optional(),
    instructorName: z.string().min(1, "Instructor name cannot be empty").optional(),
    minPrice: z.coerce.number().min(0, "Minimum price cannot be negative").optional(), 
    maxPrice: z.coerce.number().min(0, "Maximum price cannot be negative").optional(),
    //pagination
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
}).refine(data => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
    }
    return true;
}, {
    message: "minPrice cannot be greater than maxPrice",
    path: ["minPrice", "maxPrice"]
});


// Route to search for courses
searchRouter.get("/courses", async (req, res) => {
    const validationResult = searchCourseSchema.safeParse(req.query);

    if (!validationResult.success) {
        return res.status(400).json({
            message: "Invalid search query parameters",
            errors: validationResult.error.errors
        });
    }

    const { q, category, instructorName, minPrice, maxPrice, page, limit } = validationResult.data;

    try {
        let query = {};

        // text search 
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
            ];
        }

        // Filter by category
        if (category) {
            query.category = { $regex: category, $options: "i" };
        }

        // Filter by price range
        if (minPrice !== undefined || maxPrice !== undefined) {
            query.price = {};
            if (minPrice !== undefined) {
                query.price.$gte = minPrice;
            }
            if (maxPrice !== undefined) {
                query.price.$lte = maxPrice;
            }
        }

        // Filter by instructor name 
        if (instructorName) {
            const instructors = await UserModel.find({
                role: 'instructor',
                $or: [
                    { firstName: { $regex: instructorName, $options: "i" } },
                    { lastName: { $regex: instructorName, $options: "i" } }
                ]
            }).select('_id'); 

            const instructorIds = instructors.map(inst => inst._id);

            if (instructorIds.length > 0) {
                query.creatorId = { $in: instructorIds };
            } else {
              query.creatorId = null; 
            }
        }

        query.status = 'published';

        // Pagination
        const skip = (page - 1) * limit;

        const courses = await CourseModel.find(query)
            .skip(skip)
            .limit(limit)
            .populate('creatorId', 'firstName lastName profilePicture'); 

        const totalCourses = await CourseModel.countDocuments(query);

        res.status(200).json({
            message: "Courses retrieved successfully",
            currentPage: page,
            totalPages: Math.ceil(totalCourses / limit),
            totalResults: totalCourses,
            courses
        });
    } catch (error) {
        console.error("Error searching courses:", error);
        res.status(500).json({
            message: "An error occurred while searching for courses",
            error: error.message
        });
    }
});

module.exports = searchRouter;
