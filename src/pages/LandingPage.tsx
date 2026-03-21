import React, { useState } from 'react';
import { Search, MapPin, Star, ShieldCheck, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useCategories, useServices } from '../context/useData';
import { Category, Service } from '../types';

const HeroSection: React.FC<{
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (f: boolean) => void;
  filteredServices: Service[];
  navigate: (path: string) => void;
}> = ({ searchQuery, setSearchQuery, handleSearch, isSearchFocused, setIsSearchFocused, filteredServices, navigate }) => (
  <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-white">
    <div className="absolute inset-0 z-0">
      <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-7xl font-bold text-black mb-6 tracking-tight"
      >
        Find Trusted Services <br />
        <span className="text-yellow-500">Near You Instantly</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
      >
        From home repairs to emergency services — FixiGo connects you instantly with the best professionals in your area.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-3xl mx-auto relative group"
      >
        <form onSubmit={handleSearch} className="flex items-center bg-white rounded-2xl shadow-2xl p-2 border border-gray-100 focus-within:ring-2 focus-within:ring-yellow-400 transition-all relative z-20">
          <div className="flex-1 flex items-center px-4">
            <Search className="text-gray-400 mr-3" size={20} />
            <input
              type="text"
              placeholder="Search for 'Plumbing', 'Cleaning', 'Electrician'..."
              className="w-full py-4 text-gray-700 focus:outline-none bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
          </div>
          <button
            type="submit"
            className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
          >
            Search
          </button>
        </form>

        {isSearchFocused && searchQuery.trim() && filteredServices.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-left">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors"
                onClick={() => {
                  setSearchQuery('');
                  navigate(`/book/${service.id}`);
                }}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                    <img
                      src={service.image_url || `https://picsum.photos/seed/${service.title}/100/100`}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <p className="text-black font-bold">{service.title}</p>
                    <p className="text-gray-500 text-xs">{service.categories?.name || 'Service'}</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-300" />
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500 relative z-10">
        <div className="flex items-center">
          <ShieldCheck className="text-yellow-500 mr-2" size={18} />
          <span>Verified Professionals</span>
        </div>
        <div className="flex items-center">
          <Star className="text-yellow-400 mr-2" size={18} />
          <span>4.8/5 Average Rating</span>
        </div>
        <div className="flex items-center">
          <Clock className="text-red-500 mr-2" size={18} />
          <span>Quick Response Time</span>
        </div>
      </div>
    </div>
  </section>
);

const CategoryCard: React.FC<{ category: Category; idx: number; onClick: () => void }> = ({ category, idx, onClick }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="group cursor-pointer"
    onClick={onClick}
  >
    <div className="bg-gray-50 rounded-2xl p-6 text-center transition-all group-hover:bg-yellow-50 group-hover:shadow-xl group-hover:shadow-yellow-100/50">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
        <span className="text-2xl">
          {['🧹', '🔌', '🚰', '🔨', '🦟', '🎨', '🚗', '✂️'][idx % 8]}
        </span>
      </div>
      <h3 className="font-semibold text-black group-hover:text-yellow-600 transition-colors">
        {category.name}
      </h3>
    </div>
  </motion.div>
);

const ServiceCard: React.FC<{ service: Service; onBook: (id: string) => void }> = ({ service, onBook }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-md overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all group flex flex-col"
  >
    <div className="h-56 bg-gray-100 relative overflow-hidden">
      <img
        src={service.image_url || `https://picsum.photos/seed/${service.title}/800/600`}
        alt={service.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-4 left-4">
        <span className="bg-white px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest text-black shadow-sm">
          {service.categories?.name || 'Service'}
        </span>
      </div>
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-2xl font-serif font-bold text-gray-900">{service.title}</h3>
        <div className="flex items-center text-yellow-600 text-sm font-bold mt-1">
          <Star size={14} fill="currentColor" className="mr-1" />
          <span>4.9</span>
        </div>
      </div>
      <p className="text-gray-500 text-sm mb-6 flex-1 font-medium">
        {service.description || `Professional ${service.title.toLowerCase()} services with certified experts and guaranteed satisfaction.`}
      </p>
      <div className="flex items-center justify-between pt-5 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-400 text-xs font-bold tracking-wider uppercase">
            <Clock size={14} className="mr-1.5" />
            <span>30-60M</span>
          </div>
          <div className="flex items-center text-gray-400 text-xs font-bold tracking-wider uppercase">
            <MapPin size={14} className="mr-1.5" />
            <span>Local</span>
          </div>
        </div>
        <button
          onClick={() => onBook(service.id)}
          className="text-yellow-600 text-xs font-bold hover:text-yellow-700 transition-colors uppercase tracking-widest flex items-center space-x-1"
        >
          <span>Reserve</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  </motion.div>
);

export const LandingPage: React.FC = () => {
  const { categories } = useCategories();
  const { services, loading: loadingServices } = useServices();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const filteredServices = (services || [])
    .filter(
      (service) =>
        service?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service?.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  return (
    <div className="pt-16">
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        isSearchFocused={isSearchFocused}
        setIsSearchFocused={setIsSearchFocused}
        filteredServices={filteredServices}
        navigate={navigate}
      />

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-black mb-2">Popular Categories</h2>
              <p className="text-gray-500">Explore our wide range of professional services</p>
            </div>
            <Link to="/services" className="text-yellow-600 font-semibold flex items-center hover:underline">
              View All <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {(categories || []).map((category, idx) => (
              <CategoryCard
                key={category.id}
                category={category}
                idx={idx}
                onClick={() => navigate(`/services?category=${category.id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-black mb-2">All Services</h2>
              <p className="text-gray-500">Find exactly what you need from our comprehensive list</p>
            </div>
            <Link to="/services" className="text-yellow-600 font-semibold flex items-center hover:underline">
              View All <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>

          {loadingServices ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-gray-100"></div>
              ))}
            </div>
          ) : !services || services.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Search className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-xl font-bold text-black">No services found</h3>
              <p className="text-gray-500">Check back later for new services</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onBook={(id) => navigate(`/book/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">For Professionals</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Join our network of trusted professionals and grow your business with FixiGo.
          </p>
          <Link
            to="/register-professional"
            className="inline-block bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-600 transition-all shadow-lg text-lg"
          >
            Register as a Professional
          </Link>
        </div>
      </section>
      
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black mb-4">Why FixiGo?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We provide a seamless experience for both customers and service providers, ensuring quality and trust at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'Quality Guaranteed',
                desc: 'Every professional is background-checked and verified by our team.',
                icon: <ShieldCheck className="text-yellow-600" size={32} />,
              },
              {
                title: 'Transparent Pricing',
                desc: 'No hidden costs. See the price before you book the service.',
                icon: <Star className="text-yellow-600" size={32} />,
              },
              {
                title: 'Instant Booking',
                desc: 'Book a service in seconds and get a professional at your doorstep.',
                icon: <Clock className="text-yellow-600" size={32} />,
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100">
                <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
