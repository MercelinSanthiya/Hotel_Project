
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../store/authSlice";


const RequireAuth = ({ children }) => {
  const location = useLocation();
  const { token } = useSelector(selectCurrentUser);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return children;
};

export default RequireAuth;
