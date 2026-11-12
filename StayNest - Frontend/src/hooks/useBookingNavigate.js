
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/authSlice";

export default function useBookingNavigate() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return function goToBooking(category, itemId) {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/booking" } });
      return;
    }
    navigate("/booking", { state: { category, itemId } });
  };
}
