import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorRegisterForm from "../../components/forms/DoctorRegisterForm";
import doctorAuthService from "../../services/doctorAuthService";

const DoctorRegister = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Eğer kullanıcı giriş yaptıysa register sayfasına erişemez
    const storedDoctor = localStorage.getItem("doctor");
    if (storedDoctor) {
      navigate("/doctor/dashboard");
    }
  }, [navigate]);

  const handleRegister = async (formData) => {
    try {
      await doctorAuthService.register(formData);
      navigate("/doctor/login");
    } catch (error) {
      alert("Registration failed. Please try again.");
    }
  };

  return <DoctorRegisterForm onRegister={handleRegister} />;
};

export default DoctorRegister;
