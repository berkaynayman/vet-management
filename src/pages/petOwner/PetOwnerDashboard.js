import React from "react";
import { Container, Typography, Box } from "@mui/material";
import PetList from "../../components/PetList";

const PetOwnerDashboard = () => {
  const token = localStorage.getItem("petOwnerToken"); // Kullanıcı giriş yaptıysa token'ı al

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

      {/* Pet List Component */}
      <Box sx={{ mt: 4 }}>
        <PetList token={token} />
      </Box>
    </Container>
  );
};

export default PetOwnerDashboard;
