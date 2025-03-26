import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from "@mui/material";
import appointmentService from "../../services/appointmentService";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.getTodayAppointments();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Failed to load appointments. Please log in again.");
        navigate("/doctor/login");
      }
    };

    fetchAppointments();
  }, [navigate]);

  return (
    <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ p: 2, fontWeight: "bold", bgcolor: "#1976d2", color: "white", borderRadius: "8px 8px 0 0" }}>
        Today's Appointments
      </Typography>

      {error && <Typography color="error" sx={{ p: 2 }}>{error}</Typography>}

      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f1f1f1" }}>
            <TableCell><b>Time</b></TableCell>
            <TableCell><b>Pet Name</b></TableCell>
            <TableCell><b>Owner</b></TableCell>
            <TableCell><b>Actions</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <TableRow key={appointment._id}>
                <TableCell>{dayjs(appointment.appointmentDate).format("HH:mm")}</TableCell>
                <TableCell>{appointment.petName}</TableCell>
                <TableCell>{appointment.ownerName}</TableCell>
                <TableCell>
                  <Button variant="contained" size="small">View</Button>
                  <Button variant="outlined" color="success" size="small" sx={{ ml: 1 }}>Complete</Button>
                  <Button variant="outlined" color="error" size="small" sx={{ ml: 1 }}>Cancel</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">No appointments for today.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AppointmentList;
