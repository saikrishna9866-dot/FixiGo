import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, Calendar, User, Wrench, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { BackButton } from '../components/BackButton';

export const DashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    let bookingsChannel: any;

    const fetchBookings = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            services(title),
            service_providers(name),
            users_profile(full_name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (mounted) setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        if (mounted) toast.error('Failed to load bookings');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (user) {
      fetchBookings();

      // Set up real-time subscription for this user's bookings
      bookingsChannel = supabase
        .channel(`user-bookings-${user.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'bookings',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            if (mounted) fetchBookings();
          }
        )
        .subscribe();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
      if (bookingsChannel) supabase.removeChannel(bookingsChannel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-yellow-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton variant="ghost" className="px-0 hover:bg-transparent" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
        
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500">No bookings found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-900">Service</th>
                  <th className="px-6 py-4 font-bold text-gray-900">User</th>
                  <th className="px-6 py-4 font-bold text-gray-900">Provider</th>
                  <th className="px-6 py-4 font-bold text-gray-900">Date & Time</th>
                  <th className="px-6 py-4 font-bold text-gray-900">Status</th>
                  <th className="px-6 py-4 font-bold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Wrench size={16} className="text-yellow-500 mr-2" />
                        <span className="font-bold">{booking.services?.title || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User size={16} className="text-gray-400 mr-2" />
                        {booking.users_profile?.full_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User size={16} className="text-gray-400 mr-2" />
                        {booking.service_providers?.name || 'Not Assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-1" /> {booking.booking_date}
                        <Clock size={14} className="ml-3 mr-1" /> {booking.booking_time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        booking.status === 'pending' ? "bg-purple-100 text-purple-800" :
                        booking.status === 'assigned' ? "bg-blue-100 text-blue-800" :
                        booking.status === 'accepted' ? "bg-indigo-100 text-indigo-800" :
                        booking.status === 'on_the_way' ? "bg-yellow-100 text-yellow-800" :
                        booking.status === 'in_progress' ? "bg-orange-100 text-orange-800" :
                        booking.status === 'completed' ? "bg-green-100 text-green-800" :
                        booking.status === 'cancelled' ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      )}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm font-bold text-yellow-600 hover:text-yellow-700">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
