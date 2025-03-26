import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DoctorLogin from "./pages/doctor/DoctorLogin";
import DoctorRegister from "./pages/doctor/DoctorRegister";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

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
      </Routes>
    </Router>
  );
}

export default App;
