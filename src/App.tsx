import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { ServicesPage } from './pages/ServicesPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { ProviderLoginPage } from './pages/ProviderLoginPage';
import { ProfessionalRegistration } from './pages/ProfessionalRegistration';
import { BookingPage } from './pages/BookingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ContactPage } from './pages/ContactPage';
import { DashboardPage } from './pages/DashboardPage';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen flex flex-col font-sans selection:bg-yellow-100 selection:text-black">
            <Toaster position="top-center" richColors />
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/book/:serviceId" element={<BookingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/provider/dashboard" element={<ProviderDashboard />} />
                <Route path="/provider/login" element={<ProviderLoginPage />} />
                <Route path="/register-professional" element={<ProfessionalRegistration />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}
