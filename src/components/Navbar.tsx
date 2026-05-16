import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ArrowRight, Shield, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { services } = useData();
  
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/provider') || location.pathname === '/dashboard';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchFocused(false);
    }
  };

  const filteredServices = (services || [])
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

  if (isDashboard) return null;

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
      isScrolled 
        ? "bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] py-2 md:py-3" 
        : "bg-transparent py-4 md:py-6"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 md:space-x-12">
            <Link to="/" className="flex items-center group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-500 rounded-lg md:rounded-xl flex items-center justify-center mr-2 md:mr-3 group-hover:rotate-12 transition-transform shadow-lg shadow-yellow-500/20">
                <span className="text-black font-black text-lg md:text-xl">F</span>
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter text-black">
                Fixi<span className="text-yellow-500">Go</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-black uppercase tracking-widest transition-all hover:text-yellow-500",
                    location.pathname === link.path ? "text-yellow-600" : "text-gray-600"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {/* Global Search Bar */}
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="flex items-center bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-100 focus-within:ring-4 focus-within:ring-yellow-400/20 focus-within:border-yellow-400 transition-all w-64">
                <Search className="text-gray-400 mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Search services..."
                  className="w-full bg-transparent text-sm font-medium focus:outline-none text-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                />
              </form>
              
              <AnimatePresence>
                {isSearchFocused && searchQuery.trim() && filteredServices.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-left"
                  >
                    {filteredServices.map((service) => (
                      <div
                        key={service.id}
                        className="px-6 py-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors group"
                        onClick={() => {
                          setSearchQuery('');
                          setIsSearchFocused(false);
                          navigate(`/book/${service.id}`);
                        }}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden mr-4 flex-shrink-0 group-hover:scale-110 transition-transform">
                            <img
                              src={service.image_url || `https://picsum.photos/seed/${service.title}/100/100`}
                              alt={service.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="text-black font-black text-sm">{service.title}</p>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{service.categories?.name || 'Service'}</p>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-gray-300 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link 
              to="/admin/dashboard" 
              className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-black hover:text-white transition-all"
              title="Admin Dashboard"
            >
              <Shield size={20} />
            </Link>

            <Link 
              to="/provider/dashboard" 
              className="p-2.5 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-500 hover:text-black transition-all"
              title="Partner Dashboard"
            >
              <Briefcase size={20} />
            </Link>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 bg-gray-100 rounded-xl text-black hover:bg-yellow-500 transition-colors"
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
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden shadow-2xl"
          >
            <div className="px-4 pt-4 pb-8 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-4 py-4 rounded-2xl text-lg font-black transition-all",
                    location.pathname === link.path
                      ? "bg-yellow-50 text-yellow-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-yellow-600"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 space-y-4">
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-4 rounded-2xl text-center text-lg font-black bg-gray-100 text-gray-600"
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/provider/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-4 rounded-2xl text-center text-lg font-black bg-yellow-100 text-yellow-700"
                >
                  Partner Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
