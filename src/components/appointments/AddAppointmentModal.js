import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Alert } from "@mui/material";
import appointmentService from "../../services/appointmentService";
import dayjs from "dayjs";

const AddAppointmentModal = ({ open, onClose, onAppointmentAdded }) => {
  const [formData, setFormData] = useState({
    petName: "",
    ownerName: "",
    appointmentDate: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const formattedData = {
        ...formData,
        appointmentDate: dayjs(formData.appointmentDate).toISOString(),
      };

      const response = await appointmentService.addAppointment(formattedData);
      setSuccess("Appointment successfully added!");
      setFormData({ petName: "", ownerName: "", appointmentDate: "" }); // Formu temizle
      onAppointmentAdded(); // Dashboard'ta listeyi güncelle
      setTimeout(() => {
        onClose(); // Modal'ı kapat
      }, 1500);
    } catch (err) {
      setError("Failed to add appointment. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Appointment</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <TextField
          label="Pet Name"
          name="petName"
          fullWidth
          margin="normal"
          value={formData.petName}
          onChange={handleChange}
          required
        />
        <TextField
          label="Owner Name"
          name="ownerName"
          fullWidth
          margin="normal"
          value={formData.ownerName}
          onChange={handleChange}
          required
        />
        <TextField
          label="Appointment Date"
          name="appointmentDate"
          type="datetime-local"
          fullWidth
          margin="normal"
          value={formData.appointmentDate}
          onChange={handleChange}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add Appointment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAppointmentModal;
