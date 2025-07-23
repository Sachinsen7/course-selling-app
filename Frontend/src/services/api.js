import axios from "axios";
import { API_BASE_URL } from "../utils/constant";


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


const handleApiError = (error, defaultMessage = "An unexpected error occurred.") => {
  if (error.response) {
    return new Error(error.response.data.message || defaultMessage);
  } else if (error.request) {
    return new Error("No response from server. Please check your network connection.");
  } else {
    return new Error(error.message || defaultMessage);
  }
};

// --- AUTHENTICATION API CALLS ---

// Function to register a new user
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to register user.");
  }
};

// Function to log in a user
export const loginUser = async (userData) => {
  try {
    const response = await api.post("/auth/signin", userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Login failed.");
  }
};


// --- USER API CALLS --- 

export const getUserProfile = async () => {
  try {
    const response = await api.get("/user/profile");
    return response.data; 
  } catch (error) {
    throw handleApiError(error, "Failed to fetch user profile.");
  }
};

export const updateUserProfile = async (userId, updateData) => {
  try {
    const response = await api.put("/user/profile", updateData);
    return response.data; 
  } catch (error) {
    throw handleApiError(error, "Failed to update user profile.");
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put("/user/change-password", { currentPassword, newPassword });
    return response.data; 
  } catch (error) {
    throw handleApiError(error, "Failed to change password.");
  }
};

// --- COURSE DISCOVERY & DETAILS API CALLS ---

// Function to get courses 
export const getCourses = async (filters = {}) => {
  try {
    const response = await api.get("/search/courses", { params: filters });
    return response.data; // Expects { message, courses, currentPage, totalPages, totalResults }
  } catch (error) {
    throw handleApiError(error, "Failed to fetch courses.");
  }
};

// Function to get details of a specific course (public view)
export const getCourseById = async (id) => {
  try {
    const response = await api.get(`/search/courses/${id}`);
    return response.data; 
  } catch (error) {
    throw handleApiError(error, "Failed to fetch course details.");
  }
};

// --- ENROLLMENT & LEARNING API CALLS ---


export const enrollInCourse = async (courseId) => {
  try {
    const response = await api.post("/enrollment/enroll", { courseId });
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Enrollment failed.");
  }
};

// Function to get all courses purchased/enrolled by the authenticated user
export const getPurchasedCourses = async () => {
  try {
    const response = await api.get("/enrollment/purchased-courses");
    return response.data; // Expects { message, courses }
  } catch (error) {
    throw handleApiError(error, "Failed to fetch purchased courses.");
  }
};

// Function to get details of a specific enrolled course, including curriculum and user progress
export const getEnrolledCourseDetails = async (courseId) => {
  try {
    const response = await api.get(`/enrollment/purchased-courses/${courseId}`);
    return response.data; // Expects { message, course, purchaseDetails }
  } catch (error) {
    throw handleApiError(error, "Failed to fetch enrolled course details.");
  }
};

// Function to update a learner's progress on a lecture
export const updateLectureProgress = async (lectureId, isCompleted, lastWatchedPosition) => {
  try {
    const response = await api.post("/enrollment/lecture-progress", { lectureId, isCompleted, lastWatchedPosition });
    return response.data; 
  } catch (error) {
    throw handleApiError(error, "Failed to update lecture progress.");
  }
};

// Function to get a learner's overall progress for a course
export const getCourseProgress = async (courseId) => {
  try {
    const response = await api.get(`/enrollment/course-progress/${courseId}`);
    return response.data; // Expects { message, courseProgress, completedLectures, totalLectures }
  } catch (error) {
    throw handleApiError(error, "Failed to fetch course progress.");
  }
};

// Function for learner to get a quiz (without correct answers)
export const getQuizForLearner = async (quizId) => {
  try {
    const response = await api.get(`/enrollment/quiz/${quizId}`);
    return response.data; // Expects { message, quiz }
  } catch (error) {
    throw handleApiError(error, "Failed to fetch quiz.");
  }
};

// Function for learner to submit quiz answers
export const submitQuizAnswers = async (quizId, answers) => {
  try {
    const response = await api.post(`/enrollment/quiz/${quizId}/submit`, { answers });
    return response.data; // Expects { message, score, passed, results, attemptNumber }
  } catch (error) {
    throw handleApiError(error, "Failed to submit quiz.");
  }
};

// Function for learner to view their past quiz attempts
export const getQuizAttempts = async (quizId) => {
  try {
    const response = await api.get(`/enrollment/quiz/${quizId}/attempts`);
    return response.data; // Expects { message, attempts }
  } catch (error) {
    throw handleApiError(error, "Failed to fetch quiz attempts.");
  }
};

// Function for learner to submit an assignment
export const submitAssignment = async (lectureId, submissionData) => {
  try {
    const response = await api.post(`/enrollment/assignment/${lectureId}/submit`, submissionData);
    return response.data; // Expects { message, submission }
  } catch (error) {
    throw handleApiError(error, "Failed to submit assignment.");
  }
};

// Function for learner to view their own assignment submission
export const getAssignmentSubmission = async (lectureId) => {
  try {
    const response = await api.get(`/enrollment/assignment/${lectureId}/my-submission`);
    return response.data; // Expects { message, submission }
  } catch (error) {
    throw handleApiError(error, "Failed to fetch assignment submission.");
  }
};

// --- REVIEWS API CALLS ---

export const addReview = async (courseId, reviewData) => {
  try {

    const response = await api.post("/review/add", { courseId, ...reviewData });
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to add review.");
  }
};

export const getReviews = async (courseId) => {
  try {
    const response = await api.get(`/review/course/${courseId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to fetch reviews.");
  }
};

// --- PAYMENT API CALLS ---

export const processPayment = async (courseId, paymentDetails) => {
  try {
    const response = await api.post("/payment/process", { courseId, paymentDetails });
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Payment failed.");
  }
};

// --- INSTRUCTOR API CALLS ---

// Function to create a new course
export const createCourse = async (courseData) => {
  try {
    const response = await api.post("/instructor/course", courseData);
    return response.data; // Expects { message, courseId }
  } catch (error) {
    throw handleApiError(error, "Failed to create course.");
  }
};

// Function to get all courses created by the instructor
export const getInstructorCourses = async () => {
  try {
    const response = await api.get("/instructor/my-courses");
    return response.data; // Expects { message, courses }
  } catch (error) {
    throw handleApiError(error, "Failed to fetch instructor's courses.");
  }
};

// Function to update a course by instructor
export const updateInstructorCourse = async (courseId, updateData) => {
  try {
    const response = await api.put("/instructor/course", { courseId, ...updateData });
    return response.data; // Expects { message, course }
  } catch (error) {
    throw handleApiError(error, "Failed to update course.");
  }
};

// Function to delete a course by instructor
export const deleteInstructorCourse = async (courseId) => {
  try {
    const response = await api.delete(`/instructor/course/${courseId}`);
    return response.data; // Expects { message, courseId }
  } catch (error) {
    throw handleApiError(error, "Failed to delete course.");
  }
};

// --- ADMIN API CALLS ---

// Function to get all users (admin only)
export const getAllUsers = async () => {
  try {
    const response = await api.get("/admin/users");
    return response.data; // Expects { message, users }
  } catch (error) {
    throw handleApiError(error, "Failed to fetch all users.");
  }
};

// Function to update a user's role (admin only)
export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put("/admin/user/role", { userId, role });
    return response.data; // Expects { message, user }
  } catch (error) {
    throw handleApiError(error, "Failed to update user role.");
  }
};

// Function to create a new category (admin only)
export const createCategory = async (categoryData) => {
  try {
    const response = await api.post("/admin/category", categoryData);
    return response.data; // Expects { message, category }
  } catch (error) {
    throw handleApiError(error, "Failed to create category.");
  }
};


export const getAllCategories = async () => {
  try {
    const response = await api.get("/admin/categories"); 
    return response.data; 
  } catch (error) {
    throw handleApiError(error, "Failed to fetch categories.");
  }
};
