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

export const getCourses = async (filters = {}) => {
    try {
        const response = await api.get('/courses', {params: filters})
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.message || "failed to fetch courses");
        
    }
}

export const getCourseById = async (id) => {
    try {
        const response = await api.get(`/courses/"${id}`)
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.message || "failed to fetch course");
        
    }

}

export const registerUser = async (userData) => {
    try {
        const response = await api.post("/user/signup", userData)
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.message || "failed to register user");
        
    }
}