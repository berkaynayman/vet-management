import React, { useState } from "react";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";

const DoctorRegisterForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await onRegister(formData);
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
      <Typography variant="h5" textAlign="center" gutterBottom>
        Doctor Register
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField label="Full Name" name="name" fullWidth margin="normal" value={formData.name} onChange={handleChange} required />
      <TextField label="Email" name="email" fullWidth margin="normal" value={formData.email} onChange={handleChange} required />
      <TextField label="Password" name="password" type="password" fullWidth margin="normal" value={formData.password} onChange={handleChange} required />
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
        Register
      </Button>
    </Box>
  );
};

export default DoctorRegisterForm;
