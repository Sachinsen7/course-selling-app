import axios from "axios"
import { API_BASE_URL } from "../utils/constant"

const AUTH_BASE_URL = `${API_BASE_URL}/auth`


export const signup = async (email, password, firstName, lastName, role = 'learner') => {
    try {
        const response = await axios.post(`${AUTH_BASE_URL}/signup`, {
            email,
            password,
            firstName,
            lastName,
            role
        })
        return response.data
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Signup failed');
        } else if (error.request) {
            throw new Error('No response from server. Please check your network.');
        } else {
            throw new Error(error.message || 'An unexpected error occurred during signup.');
        }
    }
}

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${AUTH_BASE_URL}/signin`, {
            email,
            password
        })
        return response.data
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Login failed');
        } else if (error.request) {
            throw new Error('No response from server. Please check your network.');
        } else {
            throw new Error(error.message || 'An unexpected error occurred during login.');
        }
    }
}