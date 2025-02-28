import axios from 'axios';
import CONFIG from '../config';

// Register User
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${CONFIG.BASE_BACK_URL}/api/auth/register`, userData);
    return response.data; // Token or success message
  } catch (error) {
    if (error.response) {
      // Backend returned an error
      throw new Error(error.response.data.msg || "Registration failed");
    }
    throw new Error("Network error");
  }
};

// Login User
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${CONFIG.BASE_BACK_URL}/api/auth/login`, credentials);
    return response.data; // Token or success message
  } catch (error) {
    if (error.response) {
      // Backend returned an error
      throw new Error(error.response.data.msg || "Login failed");
    }
    throw new Error("Network error");
  }
};
