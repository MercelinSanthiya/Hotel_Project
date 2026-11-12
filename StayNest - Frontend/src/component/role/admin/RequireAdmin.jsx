
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../store/authSlice";


const RequireAdmin = ({ children }) => {
  const location = useLocation();
  const { token, role } = useSelector(selectCurrentUser);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (role?.toLowerCase() !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAdmin;
