import axios from "axios";

const API_URL = "http://localhost:5001/api/doctor"; // Backend URL

const login = async (formData) => {
  const response = await axios.post(`${API_URL}/login`, formData);
  return response.data;
};

const register = async (formData) => {
  const response = await axios.post(`${API_URL}/register`, formData);
  return response.data;
};

export default { login, register };
