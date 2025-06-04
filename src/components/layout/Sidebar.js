import React, { useState } from "react";
import { Drawer, List, ListItem, ListItemText, IconButton, Box, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";

const Sidebar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("doctor"); // Doktor bilgisini sil
    localStorage.removeItem("token"); // Tokeni sil
    navigate("/doctor/login"); // Login sayfasına yönlendir
  };

  return (
    <>
      {/* Mobil için menü butonu */}
      <IconButton
        onClick={() => setOpen(true)}
        sx={{ position: "absolute", top: 20, left: 20, zIndex: 999, display: { xs: "block", md: "none" } }}
      >
        <MenuIcon />
      </IconButton>

      {/* Masaüstü için kalıcı Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" }, // Mobilde gizle, masaüstünde göster
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
      >
        <SidebarContent handleLogout={handleLogout} />
      </Drawer>

      {/* Mobil için açılır kapanır Sidebar */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: { xs: "block", md: "none" }, // Sadece mobilde göster
          "& .MuiDrawer-paper": { width: "80%" },
        }}
      >
        <SidebarContent closeMenu={() => setOpen(false)} handleLogout={handleLogout} />
      </Drawer>
    </>
  );
};

// Sidebar içeriğini ayrı bir bileşen olarak tanımlayalım
const SidebarContent = ({ closeMenu, handleLogout }) => (
  <Box sx={{ width: 240 }}>
    <List>
      <ListItem button component={Link} to="/doctor/dashboard" onClick={closeMenu}>
        <ListItemText primary="Dashboard" />
      </ListItem>
      <ListItem button component={Link} to="/doctor/appointments" onClick={closeMenu}>
        <ListItemText primary="Appointments" />
      </ListItem>
      <ListItem button component={Link} to="/doctor/patients" onClick={closeMenu}>
        <ListItemText primary="Patients" />
      </ListItem>
    </List>

    {/* Logout Butonu */}
    <Box sx={{ textAlign: "center", mt: 2 }}>
      <Button variant="contained" color="error" onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  </Box>
);

export default Sidebar;
