import React, { useState } from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Yönlendirme için
import PetList from "../../components/PetList";
import AddPetModal from "../../components/AddPetModal";

const PetOwnerDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("petOwnerToken");

  const [openModal, setOpenModal] = useState(false);
  const [pets, setPets] = useState([]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Yeni eklenen peti listeye eklemek için callback
  const handlePetAdded = (newPet) => {
    setPets((prevPets) => [...prevPets, newPet]);
  };

  // Logout işlemi
  const handleLogout = () => {
    localStorage.removeItem("petOwnerToken");
    localStorage.removeItem("petOwner");
    navigate("/pet-owner/login"); // Login sayfasına yönlendir
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
        <Typography variant="h4">Welcome to Pet Owner Dashboard</Typography>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Typography variant="body1" sx={{ textAlign: "center", mt: 2 }}>
        Here you can view and manage your pet's appointments.
      </Typography>

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
