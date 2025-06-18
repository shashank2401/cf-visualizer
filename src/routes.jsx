// src/routes.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SingleProfile from "./pages/SingleProfile";
import CompareProfiles from "./pages/CompareProfiles";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SingleProfile />} />
      <Route path="/compare" element={<CompareProfiles />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}