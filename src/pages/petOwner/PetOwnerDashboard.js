import React, { useState } from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import PetList from "../../components/PetList";
import AddPetModal from "../../components/AddPetModal";

const PetOwnerDashboard = () => {
  const token = localStorage.getItem("petOwnerToken"); // Kullanıcı giriş yaptıysa token'ı al

  const [openModal, setOpenModal] = useState(false);
  const [pets, setPets] = useState([]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Yeni eklenen peti listeye eklemek için callback
  const handlePetAdded = (newPet) => {
    setPets((prevPets) => [...prevPets, newPet]);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Pet Owner Dashboard
        </Typography>
        <Typography variant="body1">
          Here you can view and manage your pet's appointments.
        </Typography>
      </Box>

      <Button variant="contained" color="primary" onClick={handleOpenModal} sx={{ mt: 3 }}>
        Add New Pet
      </Button>
      <AddPetModal open={openModal} handleClose={handleCloseModal} token={token} onPetAdded={handlePetAdded} />

      {/* Pet List Component */}
      <Box sx={{ mt: 4 }}>
        <PetList token={token} pets={pets} setPets={setPets} />
      </Box>
    </Container>
  );
};

export default PetOwnerDashboard;
