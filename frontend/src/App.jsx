import { useState } from "react";
import { Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home";
import Results from "./pages/Results";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Contact from "./pages/Contact";
import AdminContacts from "./pages/AdminContacts";
import AgentPortal from "./pages/AgentPortal";
import Login from "./pages/Login";
import About from "./pages/About";
import ManageBooking from "./pages/ManageBooking";
import DuffelBookingFlow from "./pages/DuffelBookingFlow";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import { useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

function App() {
  const { user, login, logout } = useAuth();

  return (
    <div className="bg-white dark:bg-gray-900 flex flex-col min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar user={user} logout={logout} />
      <WhatsAppButton />

      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/manage-booking" element={<ManageBooking />} />
          <Route
            path="/booking"
            element={
              <ProtectedRoute user={user}>
                <Booking user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-success"
            element={
              <ProtectedRoute user={user}>
                <BookingSuccess user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<DuffelBookingFlow user={user} />} />
          <Route path="/flights" element={<DuffelBookingFlow user={user} />} />
          <Route path="/checkout" element={<DuffelBookingFlow user={user} />} />
          <Route path="/order-confirmation" element={<DuffelBookingFlow user={user} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <UserDashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} requireAdmin={true}>
                <AdminDashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contacts"
            element={
              <ProtectedRoute user={user} requireAdmin={true}>
                <AdminContacts user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent"
            element={
              <ProtectedRoute user={user} requireAdmin={true}>
                <AgentPortal user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login onLogin={login} />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
