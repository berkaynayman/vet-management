import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    try {
      const storedDoctor = localStorage.getItem("doctor");

      if (!storedDoctor) {
        navigate("/doctor/login");
        return;
      }

      const doctorData = JSON.parse(storedDoctor);
      setDoctor(doctorData);
    } catch (error) {
      console.error("Error reading doctor data:", error);
      localStorage.removeItem("doctor");
      navigate("/doctor/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("doctor");
    localStorage.removeItem("token");
    navigate("/doctor/login");
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 5, textAlign: "center" }}>
      {doctor ? (
        <>
          <Typography variant="h4">Welcome, Dr. {doctor.name} 👨‍⚕️</Typography>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Email: {doctor.email}
          </Typography>
          <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ mt: 3 }}>
            Logout
          </Button>
        </>
      ) : (
        <Typography variant="h5">Loading...</Typography>
      )}
    </Box>
  );
};

export default DoctorDashboard;
