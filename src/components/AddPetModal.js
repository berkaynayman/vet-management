import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Backdrop,
  Fade,
  Alert,
} from "@mui/material";

const AddPetModal = ({ open, handleClose, token, onPetAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/pet-owner/pets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          species: formData.species,
          breed: formData.breed,
          age: Number(formData.age),
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to add pet.");

      setSuccess("Pet successfully added!");
      setFormData({ name: "", species: "", breed: "", age: "" });

      // Yeni eklenen hayvanı listeye eklemek için callback fonksiyonunu çağır
      onPetAdded(data.pet);

      setTimeout(() => {
        handleClose();
        setSuccess(null);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Add New Pet
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Pet Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Species"
              name="species"
              value={formData.species}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Breed"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? "Adding..." : "Add Pet"}
            </Button>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
};

export default AddPetModal;
