import React, { useState } from "react";
import { Container, TextField, Button, Typography, Alert, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import petOwnerService from "../../services/petOwnerService";

const PetOwnerLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await petOwnerService.login(formData);
      localStorage.setItem("petOwnerToken", response.token);
      localStorage.setItem("petOwner", JSON.stringify(response.petOwner));
      navigate("/pet-owner/dashboard"); // Başarılı giriş sonrası dashboard'a yönlendir
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          Pet Owner Login
        </Typography>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField label="Email" name="email" type="email" fullWidth margin="normal" required onChange={handleChange} />
        <TextField label="Password" name="password" type="password" fullWidth margin="normal" required onChange={handleChange} />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </form>
    </Container>
  );
};

export default PetOwnerLogin;
