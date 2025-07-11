import axios from "axios";
import { API_BASE_URL } from "../utils/constant";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if(token){
        config.headers.Authorization = `Bearer ${token}`

    }

    return config
})

export const registerUser = async (userData) => {
    try {
        const response = await api.post("/auth/user/signup", userData)
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.message || "failed to register user");
        
    }
}


export const loginUser = async (userData) => {
    try {
        const response = await api.post("/auth/user/signin", userData)
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.message || "Login failed");
        
    }
}

export const getCourses = async (filters = {}) => {
    try {
        const response = await api.get('/search/preview', {params: filters})
        return response.data   
    } catch (error) {
        throw new Error(error.response?.data?.message || "failed to fetch courses");
        
    }
}

export const getCourseById = async (id) => {
    try {
        const response = await api.get(`/search/courses/"${id}`)
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.message || "failed to fetch course");
        
    }

}


export const purchaseCourse = async (courseId) => {
    try {
      const response = await api.post('/enrollment/purchase', { courseId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Purchase failed');
    }
};


export const getPurchasedCourses = async () => {
    try {
      const response = await api.get('/enrollment/purchased');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch purchased courses');
    }
};
  

  export const addReview = async (courseId, reviewData) => {
    try {
      const response = await api.post('/review/add', { courseId, ...reviewData });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add review');
    }
};
  
export const getReviews = async (courseId) => {
    try {
      const response = await api.get(`/review/course/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reviews');
    }
};
  
export const processPayment = async (courseId, paymentDetails) => {
    try {
      const response = await api.post('/payment/process', { courseId, paymentDetails });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment failed');
    }
};
