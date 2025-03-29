import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DoctorLogin from "./pages/doctor/DoctorLogin";
import DoctorRegister from "./pages/doctor/DoctorRegister";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

import PetOwnerRegister from "./pages/petOwner/PetOwnerRegister";
import PetOwnerLogin from "./pages/petOwner/PetOwnerLogin";
import PetOwnerDashboard from "./pages/petOwner/PetOwnerDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login & Register Rotaları */}
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />
        
        {/* Dashboard Rotası */}
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

        {/* Eğer bilinmeyen bir rota girilirse, login sayfasına yönlendir */}
        <Route path="*" element={<DoctorLogin />} />


        <Route path="/pet-owner/register" element={<PetOwnerRegister />} />
        <Route path="/pet-owner/login" element={<PetOwnerLogin />} />
        <Route path="/pet-owner/dashboard" element={<PetOwnerDashboard />} />
        
      </Routes>
    </Router>
  );
}

export default App;
