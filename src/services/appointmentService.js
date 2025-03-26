import axios from "axios";

const API_URL = "http://localhost:5001/api/doctor"; // Backend URL

// Günlük randevuları çek
const getTodayAppointments = async () => {
  const token = localStorage.getItem("token"); // JWT Token'ı al

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await axios.get(`${API_URL}/appointments/today`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Yeni randevu ekle
const addAppointment = async (appointmentData) => {
  const token = localStorage.getItem("token"); // JWT Token'ı al

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await axios.post(`${API_URL}/appointments`, appointmentData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

export default { getTodayAppointments, addAppointment };
