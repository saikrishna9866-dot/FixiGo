import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage').then(m => ({ default: m.SearchResultsPage })));
const BookingPage = lazy(() => import('./pages/BookingPage').then(m => ({ default: m.BookingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ProviderLoginPage = lazy(() => import('./pages/ProviderLoginPage').then(m => ({ default: m.ProviderLoginPage })));
const ProviderDashboard = lazy(() => import('./pages/ProviderDashboard').then(m => ({ default: m.ProviderDashboard })));
const ProfessionalRegistration = lazy(() => import('./pages/ProfessionalRegistration').then(m => ({ default: m.ProfessionalRegistration })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center">
      <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
      <p className="text-gray-500 font-black uppercase tracking-widest text-sm">Loading FixiGo...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <DataProvider>
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/book/:serviceId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/provider/login" element={<ProviderLoginPage />} />
                    <Route path="/provider/dashboard" element={<ProviderDashboard />} />
                    <Route path="/register-professional" element={<ProfessionalRegistration />} />
                    <Route path="/contact" element={<ContactPage />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <Toaster position="top-center" richColors />
            </div>
          </DataProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
