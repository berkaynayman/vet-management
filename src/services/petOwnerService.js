import axios from "axios";

const API_URL = "http://localhost:5001/api/pet-owner";

const petOwnerService = {
  register: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, formData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed!";
    }
  },

  login: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/login`, formData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Login failed!";
    }
  },
};

export default petOwnerService;
