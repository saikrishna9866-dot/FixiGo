import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Settings, Search, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminLoggedIn = localStorage.getItem('admin_session') === 'true';

  useEffect(() => {
    fetchServices();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase.from('services').select('*, categories(name)');
      if (!error && data) {
        setServices(data);
      } else {
        const { fallbackServices } = await import('../data/fallbackData');
        setServices(fallbackServices);
      }
    } catch (err) {
      const { fallbackServices } = await import('../data/fallbackData');
      setServices(fallbackServices);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchFocused(false);
    }
  };

  const filteredServices = services
    .filter(
      (service) =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
  ];

  if (user) {
    navLinks.push({ name: 'Dashboard', path: '/dashboard' });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-black tracking-tight">
              Fixi<span className="text-yellow-500">Go</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Global Search Bar */}
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-transparent transition-all w-64">
                <Search className="text-gray-400 mr-2" size={16} />
                <input
                  type="text"
                  placeholder="Search services..."
                  className="w-full bg-transparent text-sm focus:outline-none text-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                />
              </form>
              
              {/* Autocomplete Dropdown */}
              {isSearchFocused && searchQuery.trim() && filteredServices.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 text-left">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors"
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchFocused(false);
                        navigate(`/book/${service.id}`);
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-md overflow-hidden mr-3 flex-shrink-0">
                          <img
                            src={service.image_url || `https://picsum.photos/seed/${service.title}/100/100`}
                            alt={service.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="text-black font-bold text-sm">{service.title}</p>
                          <p className="text-gray-500 text-[10px] uppercase tracking-wider">{service.categories?.name || 'Service'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-yellow-500",
                  location.pathname === link.path ? "text-yellow-600" : "text-gray-600"
                )}
              >
                {link.name}
              </Link>
            ))}
            
            <Link
              to={isAdminLoggedIn ? "/admin/dashboard" : "/admin/login"}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm",
                location.pathname.startsWith('/admin') 
                  ? "bg-yellow-500 text-black shadow-yellow-500/20" 
                  : "bg-gray-100 text-gray-600 hover:bg-yellow-500 hover:text-black"
              )}
            >
              {isAdminLoggedIn ? "Admin Dashboard" : "Admin"}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-yellow-600 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    location.pathname === link.path
                      ? "bg-yellow-50 text-yellow-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-yellow-600"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to={isAdminLoggedIn ? "/admin/dashboard" : "/admin/login"}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-3 rounded-xl text-base font-bold mt-2 text-center transition-all",
                  location.pathname.startsWith('/admin')
                    ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                    : "bg-gray-100 text-gray-600 hover:bg-yellow-500 hover:text-black"
                )}
              >
                {isAdminLoggedIn ? "Admin Dashboard" : "Admin"}
              </Link>
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-black text-white px-6 py-3 rounded-xl text-base font-medium mt-4"
                >
                  Login
                </Link>
              )}
              {user && (
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md mt-4"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
