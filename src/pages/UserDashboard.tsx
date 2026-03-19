import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { toast } from 'sonner';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (title),
          service_providers (name, email)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'accepted': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'completed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-yellow-600" size={40} />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Your Bookings</h1>
          <p className="text-gray-500">Track and manage your service requests</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="text-gray-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-8">You haven't booked any services yet. Explore our services to get started.</p>
            <button
              onClick={() => window.location.href = '/services'}
              className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
            >
              Browse Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="text-yellow-600" size={24} />
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider",
                    getStatusColor(booking.status)
                  )}>
                    {booking.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.services?.title}</h3>
                <p className="text-gray-500 text-sm mb-6">Provider: {booking.service_providers?.name}</p>

                <div className="space-y-3 pt-6 border-t border-gray-50">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock size={16} className="mr-2 text-gray-400" />
                    <span>Booked on {formatDate(booking.created_at)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin size={16} className="mr-2 text-gray-400" />
                    <span>Service Location: Home</span>
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
