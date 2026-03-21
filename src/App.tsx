import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { ServicesPage } from './pages/ServicesPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ProfessionalRegistration } from './pages/ProfessionalRegistration';
import { BookingPage } from './pages/BookingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { Toaster } from 'sonner';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
      <Router>
        <div className="min-h-screen flex flex-col font-sans selection:bg-yellow-100 selection:text-black">
          <Toaster position="top-center" richColors />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route 
                path="/book/:serviceId" 
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route 
                path="/register-professional" 
                element={
                  <ProtectedRoute>
                    <ProfessionalRegistration />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
  );
}
