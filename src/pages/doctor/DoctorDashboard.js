import React, { useState } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import Sidebar from "../../components/layout/Sidebar";
import AppointmentList from "../../components/appointments/AppointmentList";
import AddAppointmentModal from "../../components/appointments/AddAppointmentModal";

const DoctorDashboard = () => {
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshAppointments = () => {
    setRefresh((prev) => !prev); // Yeni randevu eklendiğinde listeyi yenile
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar Menü */}
      <Sidebar />

      {/* Dashboard İçeriği */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, bgcolor: "#f9f9f9", minHeight: "100vh" }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#333" }}>
              Doctor Dashboard
            </Typography>

            {/* Randevu Ekleme Butonu */}
            <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
              Add Appointment
            </Button>
          </Box>

          {/* Modal */}
          <AddAppointmentModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onAppointmentAdded={refreshAppointments} />

          {/* Günlük Randevular */}
          <AppointmentList key={refresh} />
        </Container>
      </Box>
    </Box>
  );
};

export default DoctorDashboard;
