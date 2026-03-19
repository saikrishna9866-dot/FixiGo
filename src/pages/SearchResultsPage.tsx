import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Search, Star, Clock, ArrowRight, Loader2, AlertCircle, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { user } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  useEffect(() => {
    if (query) fetchResults();
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*, categories(name)')
        .ilike('title', `%${query}%`);

      if (data && data.length > 0) {
        setResults(data);
      } else {
        const { fallbackServices } = await import('../data/fallbackData');
        const q = query?.toLowerCase() || '';
        setResults(fallbackServices.filter(s => 
          s.title.toLowerCase().includes(q) || 
          s.description.toLowerCase().includes(q) ||
          s.categories.name.toLowerCase().includes(q)
        ));
      }
    } catch (error) {
      const { fallbackServices } = await import('../data/fallbackData');
      const q = query?.toLowerCase() || '';
      setResults(fallbackServices.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        s.categories.name.toLowerCase().includes(q)
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (service: any) => {
    if (!user) {
      toast.error('Please login to book a service');
      return;
    }
    navigate(`/book/${service.id}`);
  };

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Results</h1>
          <p className="text-gray-500">Showing results for "{query}"</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-yellow-600" size={40} />
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-500" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-black mb-2">Service unavailable</h3>
            <p className="text-gray-500 mb-8">We couldn't find any services matching your search. Try another service.</p>
            <button
              onClick={() => navigate('/services')}
              className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
            >
              Browse All Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((service) => (
              <motion.div
                key={service.id}
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
                      {service.categories?.name}
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
                    {service.description || `Professional ${service.title.toLowerCase()} services with certified experts.`}
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
                      onClick={() => handleBook(service)}
                      disabled={bookingLoading === service.id}
                      className="text-yellow-600 text-xs font-bold hover:text-yellow-700 transition-colors uppercase tracking-widest flex items-center space-x-1"
                    >
                      {bookingLoading === service.id ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <>
                          <span>Reserve</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
