import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Calendar, User, Wrench, Clock, X, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { BackButton } from '../components/BackButton';

export const DashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    let bookingsChannel: any;

    const fetchBookings = async () => {
      setLoading(true);
      
      let dbBookings: any[] = [];
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            services(title),
            service_providers(name),
            users_profile(full_name)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Database fetch failed:', error.message);
        } else if (data) {
          dbBookings = data;
        }
      } catch (error) {
        console.error('Network error fetching bookings:', error);
      } 

      // Clean up legacy local storage data if it exists
      try {
        localStorage.removeItem('fixigo_demo_bookings');
      } catch (e) {
        // ignore
      }

      // Merge and sort
      if (mounted) {
        const allBookings = [...dbBookings].sort((a, b) => {
          return new Date(b.created_at || b.booking_date).getTime() - new Date(a.created_at || a.booking_date).getTime();
        });
        
        setBookings(allBookings);
        
        setLoading(false);
      }
    };

    fetchBookings();

    const setupSubscription = async () => {
      bookingsChannel = supabase
        .channel(`all-bookings`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'bookings'
          },
          () => {
            if (mounted) fetchBookings();
          }
        )
        .subscribe();
    };
    
    setupSubscription();

    return () => {
      mounted = false;
      if (bookingsChannel) supabase.removeChannel(bookingsChannel);
    };
  }, []);

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
                      <button 
                        onClick={() => setSelectedBooking(booking)}
                        className="text-sm font-bold text-yellow-600 hover:text-yellow-700"
                      >
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

      {/* View Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Booking Details</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Wrench className="text-yellow-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">
                      {selectedBooking.services?.title || 'Unknown Service'}
                    </h3>
                    <p className="text-gray-500 font-medium tracking-wide">Ref: #{selectedBooking.id.substring(0, 8)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span className={cn(
                        "px-3 py-1 inline-block rounded-full text-xs font-bold uppercase tracking-wider",
                        selectedBooking.status === 'pending' ? "bg-purple-100 text-purple-800" :
                        selectedBooking.status === 'assigned' ? "bg-blue-100 text-blue-800" :
                        selectedBooking.status === 'accepted' ? "bg-indigo-100 text-indigo-800" :
                        selectedBooking.status === 'on_the_way' ? "bg-yellow-100 text-yellow-800" :
                        selectedBooking.status === 'in_progress' ? "bg-orange-100 text-orange-800" :
                        selectedBooking.status === 'completed' ? "bg-green-100 text-green-800" :
                        selectedBooking.status === 'cancelled' ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      )}>
                        {selectedBooking.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                    <p className="font-bold text-gray-900">
                      {selectedBooking.booking_date} at {selectedBooking.booking_time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <User size={18} /> Provider Details
                </h4>
                {selectedBooking.service_providers ? (
                    <div>
                      <p className="font-bold text-gray-900">{selectedBooking.service_providers.name}</p>
                      {selectedBooking.service_providers.phone && <p className="text-gray-600">{selectedBooking.service_providers.phone}</p>}
                    </div>
                ) : (
                  <p className="text-blue-800/80 italic">No provider assigned yet.</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin size={18} /> Location Details
                </h4>
                <div className="space-y-2">
                   {selectedBooking.address ? (
                     <p className="font-medium text-gray-700">{selectedBooking.address}</p>
                   ) : <p className="text-gray-500 italic">No address provided.</p>}
                   
                   {selectedBooking.landmark && (
                     <p className="text-sm text-gray-600 border-l-2 pl-3 border-gray-300">
                       Landmark: {selectedBooking.landmark}
                     </p>
                   )}
                   
                   {(selectedBooking.city || selectedBooking.pincode) && (
                     <p className="text-sm font-bold bg-white inline-block px-3 py-1 rounded-lg shadow-sm border border-gray-200">
                       {selectedBooking.city || ''} {selectedBooking.pincode ? `- ${selectedBooking.pincode}` : ''}
                     </p>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
