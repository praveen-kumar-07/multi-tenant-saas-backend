import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import ProtectedRoute from "./Routes/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute><Users /></ProtectedRoute>
        } />

        <Route path="/projects" element={
          <ProtectedRoute><Projects /></ProtectedRoute>
        } />

        <Route path="/tasks/:projectId" element={
          <ProtectedRoute><Tasks /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
