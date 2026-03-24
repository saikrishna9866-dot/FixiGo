import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load pages for better bundle optimization
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage').then(m => ({ default: m.SearchResultsPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const ProviderDashboard = lazy(() => import('./pages/ProviderDashboard').then(m => ({ default: m.ProviderDashboard })));
const ProviderLoginPage = lazy(() => import('./pages/ProviderLoginPage').then(m => ({ default: m.ProviderLoginPage })));
const ProfessionalRegistration = lazy(() => import('./pages/ProfessionalRegistration').then(m => ({ default: m.ProfessionalRegistration })));
const BookingPage = lazy(() => import('./pages/BookingPage').then(m => ({ default: m.BookingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <Loader2 className="animate-spin text-yellow-500" size={48} />
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <Router>
            <div className="min-h-screen flex flex-col font-sans selection:bg-yellow-100 selection:text-black">
              <Toaster position="top-center" richColors />
              <Navbar />
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
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
                </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
