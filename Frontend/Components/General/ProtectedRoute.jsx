import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function ProtectedRoutes({ children }) {
  const isAuthenticated = useSelector((state) => state.authentication.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default ProtectedRoutes;