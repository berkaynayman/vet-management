import React, { useState } from "react";
import { Container, TextField, Button, Typography, Alert, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import petOwnerService from "../../services/petOwnerService";

const PetOwnerRegister = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await petOwnerService.register(formData);
      setSuccess(response.message);
      setTimeout(() => navigate("/pet-owner/login"), 2000); // Başarılı olursa login sayfasına yönlendir
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          Pet Owner Register
        </Typography>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField label="Full Name" name="name" fullWidth margin="normal" required onChange={handleChange} />
        <TextField label="Email" name="email" type="email" fullWidth margin="normal" required onChange={handleChange} />
        <TextField label="Password" name="password" type="password" fullWidth margin="normal" required onChange={handleChange} />
        <TextField label="Phone" name="phone" fullWidth margin="normal" required onChange={handleChange} />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Register
        </Button>
      </form>
    </Container>
  );
};

export default PetOwnerRegister;
