import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("petOwnerToken"); // Kullanıcı giriş yaptı mı?

  return token ? <Outlet /> : <Navigate to="/pet-owner/login" replace />;
};

export default ProtectedRoute;
