import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../auth/auth";

export default function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}
