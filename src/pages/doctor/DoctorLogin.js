import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorLoginForm from "../../components/forms/DoctorLoginForm";
import doctorAuthService from "../../services/doctorAuthService";

const DoctorLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Eğer kullanıcı giriş yaptıysa login sayfasına erişemez
    const storedDoctor = localStorage.getItem("doctor");
    if (storedDoctor) {
      navigate("/doctor/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (formData) => {
    try {
      const response = await doctorAuthService.login(formData);
      if (response && response.user) {
        localStorage.setItem("doctor", JSON.stringify(response.user));
        localStorage.setItem("token", response.token);
        navigate("/doctor/dashboard");
      } else {
        alert("Login failed. Please try again.");
      }
    } catch (error) {
      alert("Invalid email or password.");
    }
  };

  return <DoctorLoginForm onLogin={handleLogin} />;
};

export default DoctorLogin;
