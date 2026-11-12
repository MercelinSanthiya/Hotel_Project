import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Header from "./component/header/Header";
import Home from "./component/home/Home";
import Footer from "./component/footer/Footer";
import RoomsSuites from "./component/rooms/RoomsSuites";
import RoomDetails from "./component/rooms/RoomDetails";
import Dining from "./component/dining/Dining";
import Experiences from "./component/experiences/Experiences";
import Offers from "./component/offers/Offers";

import Login from "./component/role/login/Login";
import Register from "./component/role/register/Register";
import Profile from "./component/role/profile/Profile";

import RequireAdmin from "./component/role/admin/RequireAdmin";
import RequireAuth from "./component/role/auth/RequireAuth";
import AdminLayout from "./component/role/admin/AdminLayout";
import AdminDashboard from "./component/role/admin/pages/AdminDashboard";
import AdminRooms from "./component/role/admin/pages/Rooms";
import AdminDining from "./component/role/admin/pages/Dining";
import AdminExperiences from "./component/role/admin/pages/Experiences";

import AdminBookings from "./component/role/admin/pages/Bookings";
import AdminUsers from "./component/role/admin/pages/Users";
import HotelBookingPage from "./component/booking/Hotelbookingpage";
import ScrollToTop from "./component/common/ScrollToTop";
import Enquiry from "./component/contactus/Enquiry";
import LegalPage from "./component/legal/LegalPage";

function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
    <ScrollToTop/>
      <Routes>
       
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/rooms-suites" element={<RoomsSuites />} />
          
          <Route path="/rooms-suites/:id" element={<RoomDetails />} />
          <Route path="/dining" element={<Dining />} />
          <Route path="/experiences" element={<Experiences />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/enquiry" element={<Enquiry/>} />
          <Route path="/legal/privacy-policy" element={<LegalPage slug="privacy-policy" />} />
          <Route path="/legal/terms-of-use" element={<LegalPage slug="terms-of-use" />} />
          <Route path="/legal/cookie-preferences" element={<LegalPage slug="cookie-preferences" />} />
          <Route path="/legal/accessibility" element={<LegalPage slug="accessibility" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
         
          <Route
            path="/booking"
            element={
              <RequireAuth>
                <HotelBookingPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
        </Route>

      
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="dining" element={<AdminDining />} />
          <Route path="experiences" element={<AdminExperiences />} />
      
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;