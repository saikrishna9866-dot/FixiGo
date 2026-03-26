import React, { useState } from 'react';
import { Search, MapPin, Star, ShieldCheck, Clock, ArrowRight, Loader2, CheckCircle, Users, Award, Quote, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Category, Service } from '../types';

const HeroSection: React.FC<{
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (f: boolean) => void;
  filteredServices: Service[];
  navigate: (path: string) => void;
}> = ({ searchQuery, setSearchQuery, handleSearch, isSearchFocused, setIsSearchFocused, filteredServices, navigate }) => {
  return (
  <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white pt-20">
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-sm font-bold uppercase tracking-widest mb-6 border border-yellow-100">
          #1 Home Services Platform
        </span>
        <h1 className="text-5xl md:text-8xl font-black text-black mb-8 tracking-tight leading-tight">
          Expert Help at <br />
          <span className="text-yellow-500">Your Fingertips</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
          From plumbing to personal care — FixiGo connects you with top-rated, verified professionals in minutes.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-4xl mx-auto relative"
      >
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-3 border border-gray-100 focus-within:ring-4 focus-within:ring-yellow-400/20 transition-all relative z-20">
          <div className="flex-1 flex items-center px-6 py-4 md:py-0 w-full">
            <Search className="text-gray-400 mr-4" size={24} />
            <input
              type="text"
              placeholder="What service do you need today?"
              className="w-full text-lg text-gray-800 focus:outline-none bg-transparent font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
          </div>
          
          <button
            type="submit"
            className="w-full md:w-auto bg-black text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-black/20 active:scale-95 mt-4 md:mt-0 md:ml-2"
          >
            Search
          </button>
          <Link
            to="/admin/login"
            className="hidden md:flex items-center justify-center w-14 h-14 ml-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-yellow-500 hover:border-yellow-200 hover:shadow-lg transition-all group"
            title="Admin Dashboard"
          >
            <ShieldCheck size={24} className="group-hover:scale-110 transition-transform" />
          </Link>
        </form>

        {isSearchFocused && searchQuery.trim() && filteredServices.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-2">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="px-8 py-5 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors group"
                onClick={() => {
                  setSearchQuery('');
                  navigate(`/book/${service.id}`);
                }}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden mr-5 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <img
                      src={service.image_url || `https://picsum.photos/seed/${service.title}/100/100`}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <p className="text-black font-black text-lg">{service.title}</p>
                    <p className="text-gray-500 text-sm font-medium">{service.categories?.name || 'Service'}</p>
                  </div>
                </div>
                <ArrowRight size={20} className="text-gray-300 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="mt-16 flex flex-wrap justify-center gap-10 text-gray-500 relative z-10">
        <div className="flex items-center bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100">
          <ShieldCheck className="text-emerald-500 mr-2" size={20} />
          <span className="font-bold text-gray-700">Verified Professionals</span>
        </div>
        <div className="flex items-center bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100">
          <Star className="text-yellow-400 mr-2" size={20} />
          <span className="font-bold text-gray-700">4.9/5 User Rating</span>
        </div>
        <div className="flex items-center bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100">
          <Users className="text-blue-500 mr-2" size={20} />
          <span className="font-bold text-gray-700">10k+ Happy Customers</span>
        </div>
      </div>
    </div>
  </section>
  );
};

const CategoryCard: React.FC<{ category: Category; idx: number; onClick: () => void }> = ({ category, idx, onClick }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="group cursor-pointer"
    onClick={onClick}
  >
    <div className="bg-white rounded-[2.5rem] p-8 text-center transition-all border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-yellow-100/50 hover:border-yellow-200">
      <div className="w-20 h-20 bg-gray-50 rounded-3xl shadow-inner flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-500 group-hover:rotate-6 transition-all duration-500">
        <span className="text-4xl group-hover:scale-125 transition-transform duration-500">
          {['🧹', '🔌', '🚰', '🔨', '🦟', '🎨', '🚗', '✂️'][idx % 8]}
        </span>
      </div>
      <h3 className="text-lg font-black text-black group-hover:text-yellow-600 transition-colors">
        {category.name}
      </h3>
      <p className="text-gray-400 text-xs mt-2 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Explore
      </p>
    </div>
  </motion.div>
);

const ServiceCard: React.FC<{ service: Service; onBook: (id: string) => void }> = ({ service, onBook }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col border border-gray-100"
  >
    <div className="h-64 bg-gray-100 relative overflow-hidden">
      <img
        src={service.image_url || `https://picsum.photos/seed/${service.title}/800/600`}
        alt={service.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        referrerPolicy="no-referrer"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-6 left-6">
        <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-black shadow-lg">
          {service.categories?.name || 'Service'}
        </span>
      </div>
      <div className="absolute bottom-6 left-6 right-6 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
        <button
          onClick={() => onBook(service.id)}
          className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-yellow-400 transition-all"
        >
          Book Now
        </button>
      </div>
    </div>
    <div className="p-8 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-yellow-600 transition-colors">{service.title}</h3>
        <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full text-yellow-600 text-sm font-black">
          <Star size={14} fill="currentColor" className="mr-1" />
          <span>4.9</span>
        </div>
      </div>
      <p className="text-gray-500 text-sm mb-8 flex-1 font-medium leading-relaxed">
        {service.description || `Professional ${service.title.toLowerCase()} services with certified experts and guaranteed satisfaction.`}
      </p>
      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center text-gray-400 text-xs font-black tracking-wider uppercase">
            <Clock size={16} className="mr-2 text-yellow-500" />
            <span>45-60M</span>
          </div>
          <div className="flex items-center text-gray-400 text-xs font-black tracking-wider uppercase">
            <ShieldCheck size={16} className="mr-2 text-emerald-500" />
            <span>Verified</span>
          </div>
        </div>
        <div className="text-xl font-black text-black">
          ₹499<span className="text-xs text-gray-400 font-bold ml-1">onwards</span>
        </div>
      </div>
    </div>
  </motion.div>
);

export const LandingPage: React.FC = () => {
  const { categories, services, loadingServices } = useData();
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
    <div className="bg-white">
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        isSearchFocused={isSearchFocused}
        setIsSearchFocused={setIsSearchFocused}
        filteredServices={filteredServices}
        navigate={navigate}
      />


      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="text-yellow-600 font-black uppercase tracking-[0.3em] text-sm mb-4 block">Categories</span>
              <h2 className="text-5xl md:text-6xl font-black text-black mb-6 leading-tight">What can we help you <br /> with today?</h2>
              <p className="text-gray-500 text-xl font-medium">Choose from our wide range of professional home services.</p>
            </div>
            <Link to="/services" className="group bg-black text-white px-10 py-5 rounded-2xl font-black flex items-center hover:bg-yellow-500 hover:text-black transition-all shadow-xl active:scale-95">
              View All Services <ArrowRight size={24} className="ml-3 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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

      {/* How it Works */}
      <section className="py-32 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <span className="text-yellow-600 font-black uppercase tracking-[0.3em] text-sm mb-4 block">Process</span>
            <h2 className="text-5xl md:text-6xl font-black text-black mb-6 leading-tight">Simple, Fast & <br /> Reliable</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto font-medium">Booking a professional service has never been this easy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-px border-t-4 border-dashed border-gray-200 -z-0"></div>
            {[
              { step: '01', title: 'Select Service', desc: 'Choose the service you need from our wide range of categories.', icon: <Search size={36} /> },
              { step: '02', title: 'Choose Expert', desc: 'Pick a verified professional based on ratings and experience.', icon: <Users size={36} /> },
              { step: '03', title: 'Get it Done', desc: 'Sit back and relax while our expert takes care of everything.', icon: <CheckCircle size={36} /> },
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative z-10 text-center group"
              >
                <div className="w-28 h-28 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center mx-auto mb-10 group-hover:bg-yellow-500 group-hover:text-black transition-all duration-500 border border-gray-100 group-hover:-translate-y-2">
                  <span className="text-yellow-600 group-hover:text-black transition-colors">{item.icon}</span>
                </div>
                <span className="text-8xl font-black text-gray-100 absolute -top-14 left-1/2 -translate-x-1/2 -z-10 group-hover:text-yellow-50 transition-colors duration-500">{item.step}</span>
                <h3 className="text-2xl font-black text-black mb-4 group-hover:text-yellow-600 transition-colors">{item.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed px-4">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div>
              <span className="text-yellow-600 font-black uppercase tracking-[0.3em] text-sm mb-4 block">Featured</span>
              <h2 className="text-5xl font-black text-black mb-6">Popular Services</h2>
              <p className="text-gray-500 text-xl font-medium">Most booked services by our happy customers.</p>
            </div>
            <Link to="/services" className="text-yellow-600 font-black flex items-center hover:translate-x-2 transition-transform text-lg">
              Explore All <ArrowRight size={24} className="ml-3" />
            </Link>
          </div>

          {loadingServices ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-[2.5rem] h-[500px] animate-pulse"></div>
              ))}
            </div>
          ) : !services || services.length === 0 ? (
            <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
              <Search className="mx-auto text-gray-300 mb-6" size={64} />
              <h3 className="text-2xl font-black text-black mb-2">No services found</h3>
              <p className="text-gray-500 font-medium">Check back later for new services</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {services.slice(0, 6).map((service) => (
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

      {/* Stats Section */}
      <section className="py-32 bg-black text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-yellow-500/10 skew-x-12 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Happy Customers', value: '10,000+', icon: <Users size={24} /> },
              { label: 'Verified Experts', value: '500+', icon: <ShieldCheck size={24} /> },
              { label: 'Services Completed', value: '25,000+', icon: <CheckCircle size={24} /> },
              { label: 'Cities Covered', value: '20+', icon: <MapPin size={24} /> },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="text-yellow-500 mb-4 flex justify-center">{stat.icon}</div>
                <div className="text-5xl font-black mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-yellow-600 font-black uppercase tracking-[0.3em] text-sm mb-4 block">Reviews</span>
            <h2 className="text-5xl font-black text-black mb-6">What Our Customers Say</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto font-medium">Real experiences from real people who trust FixiGo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { name: 'Rahul Sharma', role: 'Homeowner', text: 'The electrician arrived within 30 minutes and fixed the issue perfectly. Very professional and transparent pricing.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' },
              { name: 'Priya Patel', role: 'Business Owner', text: 'Used their cleaning service for my office. The team was thorough and efficient. Highly recommended for anyone looking for quality.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
              { name: 'Amit Verma', role: 'Software Engineer', text: 'FixiGo is my go-to app for any home repairs. The booking process is seamless and the professionals are always top-notch.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit' },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-gray-50 p-10 rounded-[3rem] relative group hover:bg-black hover:text-white transition-all duration-500">
                <Quote className="text-yellow-500/20 absolute top-10 right-10 group-hover:text-yellow-500/40 transition-colors" size={64} />
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden mr-4 border-2 border-white shadow-lg">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm font-bold">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-lg font-medium leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex text-yellow-500 mt-8">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Become a Pro CTA */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-500 rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl shadow-yellow-200/50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="text-center lg:text-left max-w-2xl">
                <span className="text-black font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Partner with us</span>
                <h2 className="text-3xl md:text-5xl font-black text-black mb-4 leading-tight">Grow Your Business <br className="hidden md:block" /> with FixiGo</h2>
                <p className="text-black/70 text-base md:text-lg font-medium leading-relaxed">
                  Join 500+ experts and start getting bookings in your area today.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <Link
                  to="/register-professional"
                  className="bg-black text-white px-8 py-4 rounded-2xl font-black text-base hover:bg-gray-800 transition-all shadow-xl active:scale-95 flex items-center justify-center whitespace-nowrap"
                >
                  Become a Pro <ArrowRight size={18} className="ml-2" />
                </Link>
                <Link
                  to="/contact"
                  className="bg-white/50 backdrop-blur-md text-black px-8 py-4 rounded-2xl font-black text-base hover:bg-white transition-all shadow-lg active:scale-95 flex items-center justify-center whitespace-nowrap"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trust & Security */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12">
            <span className="text-yellow-600 font-black uppercase tracking-[0.3em] text-xs mb-4 block">Security</span>
            <h2 className="text-4xl font-black text-black leading-tight">Your Trust is Our Top Priority</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Verified Professionals', desc: 'Every expert undergoes a rigorous background check and skill verification.', icon: <ShieldCheck className="text-emerald-500" /> },
              { title: 'Secure Payments', desc: 'Your transactions are protected with industry-standard encryption.', icon: <Lock className="text-blue-500" /> },
              { title: 'Data Privacy', desc: 'Your personal data is secure and never shared with third parties.', icon: <ShieldCheck className="text-yellow-500" /> },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                  {React.cloneElement(item.icon as any, { size: 24 })}
                </div>
                <h4 className="text-lg font-black text-black mb-2">{item.title}</h4>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

