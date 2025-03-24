import React, { useState } from "react";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";

const DoctorLoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      await onLogin(formData);
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
      <Typography variant="h5" textAlign="center" gutterBottom>
        Doctor Login
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField 
        label="Email" 
        name="email" 
        fullWidth 
        margin="normal" 
        value={formData.email} 
        onChange={handleChange} 
        required
      />
      <TextField 
        label="Password" 
        name="password" 
        type="password" 
        fullWidth 
        margin="normal" 
        value={formData.password} 
        onChange={handleChange} 
        required
      />
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
        Login
      </Button>
    </Box>
  );
};

export default DoctorLoginForm;
