import React from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Star, MapPin, ArrowRight, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';
import { Service } from '../types';
import { BackButton } from '../components/BackButton';

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

export const ServicesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const navigate = useNavigate();

  const { categories, services, loadingServices } = useData();

  const filteredServices = categoryId 
    ? (services || []).filter(s => s.category_id === categoryId)
    : (services || []);

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton variant="ghost" className="px-0 hover:bg-transparent" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Professional Services</h1>
            <p className="text-gray-500">Choose from our curated list of expert services</p>
          </div>

          <div className="flex items-center space-x-4 overflow-x-auto pb-2 no-scrollbar">
            <Link
              to="/services"
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                !categoryId ? "bg-black text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200 hover:border-yellow-500"
              )}
            >
              All
            </Link>
            {(categories || []).map((cat) => (
              <Link
                key={cat.id}
                to={`/services?category=${cat.id}`}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                  categoryId === cat.id ? "bg-black text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200 hover:border-yellow-500"
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {loadingServices ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : !filteredServices || filteredServices.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Search className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-xl font-bold text-black">No services found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={(id) => navigate(`/book/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
