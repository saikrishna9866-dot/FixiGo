import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  CreditCard, 
  Star, 
  User, 
  LogOut, 
  Bell, 
  Settings,
  Menu,
  X,
  Loader2,
  Power,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Navigation,
  ExternalLink,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  ShieldCheck,
  Zap,
  Timer
} from 'lucide-react';
import { supabase, safeGetSession, safeSignOut } from '../lib/supabase';
import { toast } from 'sonner';
import { cn, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ProviderLogo } from '../components/ProviderLogo';
import { useAuth } from '../context/AuthContext';

// --- Types & Constants ---

type JobStatus = 'pending' | 'assigned' | 'accepted' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled';

interface Job {
  id: string;
  service_name: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  booking_date: string;
  booking_time: string;
  status: JobStatus;
  price: number;
  commission: number;
  net_earnings: number;
  description: string;
  distance: string;
  expires_at: number; // timestamp
  is_open_pool?: boolean;
}

const STATUS_FLOW: Record<JobStatus, { next?: JobStatus; label: string; color: string; action?: string }> = {
  pending: { next: 'accepted', label: 'Open Job', color: 'bg-purple-50 text-purple-600 border-purple-100', action: 'Claim Job' },
  assigned: { next: 'accepted', label: 'Assigned', color: 'bg-blue-50 text-blue-600 border-blue-100', action: 'Accept Job' },
  accepted: { next: 'on_the_way', label: 'Accepted', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', action: 'Start Journey' },
  on_the_way: { next: 'in_progress', label: 'On the Way', color: 'bg-yellow-50 text-yellow-600 border-yellow-100', action: 'Arrived & Start' },
  in_progress: { next: 'completed', label: 'In Progress', color: 'bg-orange-50 text-orange-600 border-orange-100', action: 'Complete Job' },
  completed: { label: 'Completed', color: 'bg-green-50 text-green-600 border-green-100' },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-100' }
};

// --- Mock Data ---

const MOCK_JOBS: Job[] = [
  {
    id: 'job-101',
    service_name: 'Deep Kitchen Cleaning',
    customer_name: 'Rahul Sharma',
    customer_phone: '+91 98765 43210',
    address: 'Flat 402, Sunrise Apartments, Sector 45, Gurgaon',
    booking_date: new Date().toISOString(),
    booking_time: '10:00 AM',
    status: 'assigned',
    price: 1200,
    commission: 240,
    net_earnings: 960,
    description: 'Full kitchen deep cleaning including chimney and cabinets. Customer requested eco-friendly chemicals.',
    distance: '2.4 km',
    expires_at: Date.now() + 1000 * 60 * 15 // 15 mins from now
  },
  {
    id: 'job-102',
    service_name: 'AC Service (Split)',
    customer_name: 'Priya Verma',
    customer_phone: '+91 88776 55443',
    address: 'House No. 12, Lane 4, DLF Phase 3, Gurgaon',
    booking_date: new Date().toISOString(),
    booking_time: '02:30 PM',
    status: 'accepted',
    price: 800,
    commission: 160,
    net_earnings: 640,
    description: 'Regular AC service and filter cleaning. Cooling is low.',
    distance: '4.8 km',
    expires_at: Date.now() - 1000 * 60 * 5
  },
  {
    id: 'job-103',
    service_name: 'Bathroom Sanitization',
    customer_name: 'Amit Gupta',
    customer_phone: '+91 77665 44332',
    address: 'Tower C, M3M Golf Estate, Sector 65, Gurgaon',
    booking_date: new Date(Date.now() - 86400000).toISOString(),
    booking_time: '11:00 AM',
    status: 'completed',
    price: 600,
    commission: 120,
    net_earnings: 480,
    description: 'Standard bathroom cleaning and sanitization.',
    distance: '7.2 km',
    expires_at: Date.now() - 86400000
  }
];

// --- Components ---

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 group hover:scale-[1.02] transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-4 rounded-2xl bg-opacity-10", color)}>
        <Icon className={cn("w-6 h-6", color.replace('bg-', 'text-'))} />
      </div>
      {trend && (
        <span className={cn("text-xs font-bold px-2 py-1 rounded-full", trend > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    {subtitle && <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-wider">{subtitle}</p>}
  </div>
);

const JobTimer = ({ expiresAt }: { expiresAt: number }) => {
  const [timeLeft, setTimeLeft] = useState<number>(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (timeLeft <= 0) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-100 animate-pulse">
      <Timer size={12} />
      Expires in {mins}:{secs < 10 ? `0${secs}` : secs}
    </div>
  );
};

const JobCard = ({ job, onUpdateStatus, onViewDetails }: any) => {
  const config = STATUS_FLOW[job.status];

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-yellow-500/30 transition-all group relative overflow-hidden"
    >
      {job.status === 'assigned' && <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />}
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-yellow-50 transition-colors">
            <Briefcase className="text-slate-400 group-hover:text-yellow-600" size={28} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-lg tracking-tight leading-tight">{job.service_name}</h4>
            <div className="flex items-center text-slate-500 text-xs font-medium mt-1 gap-3">
              <span className="flex items-center"><Clock size={14} className="mr-1" /> {job.booking_time}</span>
              <span className="flex items-center"><MapPin size={14} className="mr-1" /> {job.distance}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={cn("text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border", config.color)}>
            {config.label}
          </span>
          {job.status === 'assigned' && <JobTimer expiresAt={job.expires_at} />}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
            {job.customer_name.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Customer</p>
            <p className="text-sm font-bold text-slate-900">{job.customer_name}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Navigation className="text-slate-400 mt-0.5" size={16} />
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Address</p>
            <p className="text-sm font-medium text-slate-600 leading-relaxed line-clamp-2">{job.address}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {config.next && (
          <button 
            onClick={() => onUpdateStatus(job.id, config.next)}
            className="flex-1 bg-black text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            {config.action}
          </button>
        )}
        <button 
          onClick={() => onViewDetails(job)}
          className="px-5 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center"
          title="View Details"
        >
          <ArrowUpRight size={20} />
        </button>
      </div>
    </motion.div>
  );
};

const JobDetailsModal = ({ job, onClose, onUpdateStatus }: any) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 sm:p-12">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-yellow-50 flex items-center justify-center">
                <Briefcase className="text-yellow-600" size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{job.service_name}</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Job ID: {job.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <div className="space-y-8">
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Customer Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{job.customer_name}</p>
                      <p className="text-xs text-slate-500">Verified Customer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Phone size={20} />
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${job.customer_phone}`} className="text-sm font-bold text-blue-600 hover:underline">Call</a>
                      <span className="text-slate-300">|</span>
                      <a href={`https://wa.me/${job.customer_phone.replace(/\s+/g, '')}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-green-600 hover:underline">WhatsApp</a>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Location</h3>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed mb-3">{job.address}</p>
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`, '_blank')}
                      className="flex items-center gap-2 text-xs font-bold text-yellow-600 bg-yellow-50 px-4 py-2 rounded-xl hover:bg-yellow-100 transition-all"
                    >
                      <Navigation size={14} />
                      Open in Google Maps
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Earnings Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Price</span>
                    <span className="font-bold text-slate-900">₹{job.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">FixiGo Commission (20%)</span>
                    <span className="font-bold text-red-500">-₹{job.commission}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex justify-between">
                    <span className="text-sm font-bold text-slate-900">Net Earnings</span>
                    <span className="text-lg font-black text-green-600">₹{job.net_earnings}</span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Job Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed italic">"{job.description}"</p>
              </section>
            </div>
          </div>

          <div className="flex gap-4">
            {STATUS_FLOW[job.status].next && (
              <button 
                onClick={() => {
                  onUpdateStatus(job.id, STATUS_FLOW[job.status].next);
                  onClose();
                }}
                className="flex-1 bg-black text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200"
              >
                {STATUS_FLOW[job.status].action}
              </button>
            )}
            <button 
              onClick={() => {
                onUpdateStatus(job.id, 'cancelled');
                onClose();
              }}
              className="px-8 py-5 border-2 border-slate-100 rounded-2xl font-bold text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
            >
              Cancel Job
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Dashboard Page ---

export const ProviderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [provider, setProvider] = useState<any>(null);
  const [bookings, setBookings] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: 'New Job Assigned', message: 'Deep Kitchen Cleaning at sector 45', time: '2 mins ago', unread: true },
    { id: 2, title: 'Payment Received', message: '₹480 credited for job #103', time: '1 hour ago', unread: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [filter, setFilter] = useState('all');

  const stats = useMemo(() => {
    const completed = bookings.filter(b => b.status === 'completed');
    const earnings = completed.reduce((acc, b) => acc + b.net_earnings, 0);
    const completionRate = bookings.length > 0 ? Math.round((completed.length / bookings.length) * 100) : 0;
    
    return {
      total: bookings.length,
      completed: completed.length,
      earnings: earnings,
      rating: 4.9,
      completionRate
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (filter === 'all') return bookings;
    return bookings.filter(b => b.status === filter);
  }, [bookings, filter]);

  const isFetching = useRef(false);

  const fetchBookings = async (providerId: string) => {
    try {
      // Fetch both:
      // 1. Bookings already assigned to this provider
      // 2. All pending bookings (the "Open Pool")
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (title, description),
          user_profiles:user_id (full_name, phone)
        `)
        .or(`provider_id.eq.${providerId},status.eq.pending`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedBookings: Job[] = data.map((b: any) => ({
          id: b.id,
          service_name: b.services?.title || 'Unknown Service',
          customer_name: b.user_profiles?.full_name || 'Customer',
          customer_phone: b.user_profiles?.phone || 'N/A',
          address: b.address || 'No address provided',
          booking_date: b.booking_date,
          booking_time: b.booking_time,
          status: b.status as JobStatus,
          price: b.total_price || 0,
          commission: (b.total_price || 0) * 0.2,
          net_earnings: (b.total_price || 0) * 0.8,
          description: b.notes || b.services?.description || '',
          distance: 'N/A',
          expires_at: Date.now() + 1000 * 60 * 60,
          is_open_pool: !b.provider_id || b.provider_id !== providerId
        }));
        setBookings(mappedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchProviderData = async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      if (!user) {
        navigate('/provider/login');
        return;
      }

      // Try to fetch real provider data
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select(`*, services (title)`)
        .eq('user_id', user.id)
        .maybeSingle();

      if (providerData) {
        setProvider(providerData);
        setIsOnline(providerData.availability?.is_online ?? true);
        await fetchBookings(providerData.id);
        
        // Set up real-time subscription for all bookings to see new open jobs
        const bookingsChannel = supabase
          .channel(`provider-dashboard-updates`)
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'bookings'
            },
            () => {
              console.log('Real-time update: Bookings changed, refreshing data...');
              fetchBookings(providerData.id);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(bookingsChannel);
        };
      } else {
        // Mock provider for demo if not found
        setProvider({
          id: 'mock-id',
          name: user.email?.split('@')[0] || 'Partner',
          services: { title: 'Multi-Service Expert' },
          experience: '5+ Years',
          phone: '+91 99887 76655',
          email: user.email
        });
        setBookings(MOCK_JOBS);
      }

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data. Please refresh.');
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (user) {
      fetchProviderData().then(unsub => {
        if (typeof unsub === 'function') {
          cleanup = unsub;
        }
      });
    } else {
      setLoading(false);
    }
    
    return () => {
      isFetching.current = false;
      if (cleanup) cleanup();
    };
  }, [user]);

  const handleStatusUpdate = async (jobId: string, newStatus: JobStatus) => {
    try {
      const updateData: any = { status: newStatus };
      
      // If claiming an open job, assign this provider
      const job = bookings.find(b => b.id === jobId);
      if (job?.is_open_pool && newStatus === 'accepted') {
        updateData.provider_id = provider.id;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', jobId);

      if (error) throw error;

      setBookings(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: newStatus, is_open_pool: false } : job
      ));
      
      toast.success(`Job status updated to ${STATUS_FLOW[newStatus].label}`);
      
      // Add notification
      setNotifications(prev => [
        { id: Date.now(), title: 'Status Updated', message: `Job #${jobId} is now ${STATUS_FLOW[newStatus].label}`, time: 'Just now', unread: true },
        ...prev
      ]);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/provider/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-yellow-500 mx-auto mb-4" size={48} />
          <p className="text-slate-500 font-bold tracking-tight">Loading FixiGo Partner...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'jobs', label: 'My Jobs', icon: Briefcase },
    { id: 'payments', label: 'Earnings', icon: CreditCard },
    { id: 'reviews', label: 'Performance', icon: Star },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <AnimatePresence>
        {selectedJob && (
          <JobDetailsModal 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)} 
            onUpdateStatus={handleStatusUpdate}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-full lg:w-80 bg-white border-r border-slate-100 flex flex-col lg:h-screen lg:sticky lg:top-0 z-50">
        <div className="p-8 border-b border-slate-50">
          <ProviderLogo />
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-8">
            <div className={cn(
              "p-5 rounded-[2rem] flex items-center justify-between transition-all shadow-lg",
              isOnline ? "bg-green-500 text-white shadow-green-200" : "bg-slate-100 text-slate-500 shadow-slate-100"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full", isOnline ? "bg-white animate-pulse" : "bg-slate-300")} />
                <span className="text-sm font-black uppercase tracking-widest">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <button 
                onClick={() => setIsOnline(!isOnline)}
                className={cn(
                  "p-2.5 rounded-xl transition-all",
                  isOnline ? "bg-white/20 hover:bg-white/30" : "bg-slate-200 hover:bg-slate-300"
                )}
              >
                <Power size={20} />
              </button>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mt-3">
              {isOnline ? 'Ready to receive new jobs' : 'Not accepting jobs right now'}
            </p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all group",
                  activeTab === item.id 
                    ? "bg-black text-white shadow-2xl shadow-slate-300" 
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} className={cn("transition-colors", activeTab === item.id ? "text-yellow-500" : "group-hover:text-yellow-500")} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-10 p-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-[2rem] text-black relative overflow-hidden group">
            <Award className="absolute -right-4 -bottom-4 w-24 h-24 text-black/10 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1">Current Status</p>
              <h4 className="text-xl font-black tracking-tight mb-4">Top Performer</h4>
              <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
                <Zap size={12} />
                Elite Partner
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <ShieldCheck className="text-green-500" size={18} />
              Verified Partner: {provider?.name}
            </p>
          </div>
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-4 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 text-slate-400 hover:text-yellow-600 transition-all relative"
            >
              <Bell size={24} />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-4 border-white" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[100] overflow-hidden"
                >
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-slate-900 tracking-tight">Notifications</h3>
                    <button className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">Mark all read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={cn("p-6 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer", n.unread && "bg-blue-50/30")}>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{n.title}</h4>
                        <p className="text-xs text-slate-500 mb-2">{n.message}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-4 p-2 pl-4 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none mb-1">{provider?.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{provider?.services?.title || 'Partner'}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-50">
                <User className="text-slate-300" size={24} />
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                  <StatCard title="Today's Earnings" value={`₹${stats.earnings}`} icon={TrendingUp} color="bg-green-500" trend={15} subtitle="Net after commission" />
                  <StatCard title="Completion Rate" value={`${stats.completionRate}%`} icon={CheckCircle2} color="bg-blue-500" subtitle="Target: 95%" />
                  <StatCard title="Avg Rating" value={stats.rating} icon={Star} color="bg-yellow-500" subtitle="Last 30 days" />
                  <StatCard title="Total Jobs" value={stats.total} icon={Briefcase} color="bg-purple-500" subtitle="Lifetime" />
                </div>

                {/* Active Jobs Section */}
                <section>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Assignments</h2>
                    <div className="flex gap-2">
                      <button onClick={() => setFilter('all')} className={cn("px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", filter === 'all' ? "bg-black text-white" : "bg-white text-slate-400")}>All</button>
                      <button onClick={() => setFilter('assigned')} className={cn("px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", filter === 'assigned' ? "bg-blue-500 text-white" : "bg-white text-slate-400")}>New</button>
                      <button onClick={() => setFilter('accepted')} className={cn("px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", filter === 'accepted' ? "bg-indigo-500 text-white" : "bg-white text-slate-400")}>Ongoing</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').map(job => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        onUpdateStatus={handleStatusUpdate}
                        onViewDetails={setSelectedJob}
                      />
                    ))}
                    {filteredBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length === 0 && (
                      <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Zap className="text-slate-200" size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No active jobs</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">Stay online to receive high-paying assignments in your area.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                  <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-[1.5rem] shadow-lg shadow-slate-200/50 border border-slate-100">
                    {['all', 'assigned', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled'].map(s => (
                      <button 
                        key={s}
                        onClick={() => setFilter(s)}
                        className={cn(
                          "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                          filter === s ? "bg-black text-white shadow-lg shadow-slate-300" : "text-slate-400 hover:bg-slate-50"
                        )}
                      >
                        {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Search jobs..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredBookings.map(job => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onUpdateStatus={handleStatusUpdate}
                      onViewDetails={setSelectedJob}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl shadow-slate-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-yellow-500/20 transition-all duration-700" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-12">
                        <div>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Available Balance</p>
                          <h2 className="text-7xl font-black tracking-tight mb-2">₹{stats.earnings}</h2>
                          <p className="text-green-400 text-xs font-bold flex items-center gap-1">
                            <ArrowUpRight size={14} /> +₹1,240 this week
                          </p>
                        </div>
                        <CreditCard className="text-yellow-500" size={48} />
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <button className="bg-yellow-500 text-black px-10 py-5 rounded-2xl font-black hover:bg-yellow-400 transition-all shadow-2xl shadow-yellow-500/20 active:scale-95">
                          Instant Payout
                        </button>
                        <button className="bg-white/10 text-white px-10 py-5 rounded-2xl font-black hover:bg-white/20 transition-all backdrop-blur-md">
                          View Statements
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-10 rounded-[3.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-center">
                    <div className="space-y-8">
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Next Payout</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">28 Mar, 2026</h3>
                      </div>
                      <div className="pt-8 border-t border-slate-50">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Pending Verification</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">₹0</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <section>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Transactions</h2>
                    <button className="text-sm font-bold text-yellow-600 flex items-center gap-1 hover:underline">
                      Download CSV <ArrowDownRight size={16} />
                    </button>
                  </div>
                  <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-10 py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Job Details</th>
                            <th className="px-10 py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                            <th className="px-10 py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Total</th>
                            <th className="px-10 py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Commission</th>
                            <th className="px-10 py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Net Payout</th>
                            <th className="px-10 py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {bookings.filter(b => b.status === 'completed').map(b => (
                            <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-10 py-8">
                                <p className="font-bold text-slate-900 mb-1">{b.service_name}</p>
                                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">ID: {b.id}</p>
                              </td>
                              <td className="px-10 py-8 text-slate-500 text-sm font-medium">{formatDate(b.booking_date)}</td>
                              <td className="px-10 py-8 font-bold text-slate-900">₹{b.price}</td>
                              <td className="px-10 py-8 font-bold text-red-500">-₹{b.commission}</td>
                              <td className="px-10 py-8 font-black text-green-600 text-lg">₹{b.net_earnings}</td>
                              <td className="px-10 py-8">
                                <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                                  Paid
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-12 rounded-[3.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Overall Rating</p>
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <h2 className="text-8xl font-black text-slate-900 tracking-tight">{stats.rating}</h2>
                      <Star className="text-yellow-500 fill-yellow-500" size={56} />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-sm">
                      <TrendingUp size={18} />
                      <span>Top 1% in Gurgaon</span>
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-white p-12 rounded-[3.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-10">Performance Metrics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Job Completion</span>
                            <span className="text-xs font-black text-slate-900">{stats.completionRate}%</span>
                          </div>
                          <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.completionRate}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Response Time</span>
                            <span className="text-xs font-black text-slate-900">4.2 mins</span>
                          </div>
                          <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '92%' }} />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer Satisfaction</span>
                            <span className="text-xs font-black text-slate-900">98%</span>
                          </div>
                          <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: '98%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Repeat Customers</span>
                            <span className="text-xs font-black text-slate-900">45%</span>
                          </div>
                          <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: '45%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <section>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Feedback</h2>
                    <div className="flex gap-2">
                      {[5, 4, 3].map(s => (
                        <button key={s} className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-slate-500 border border-slate-100 flex items-center gap-1">
                          {s} <Star size={12} className="fill-yellow-500 text-yellow-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 group hover:border-yellow-500/30 transition-all">
                        <div className="flex justify-between items-start mb-8">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xl border border-slate-100">
                              {['JD', 'AS', 'MK', 'RV'][i-1]}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 text-lg tracking-tight">{['John Doe', 'Anjali Singh', 'Manoj Kumar', 'Rohan Verma'][i-1]}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verified Booking • {i} day{i > 1 ? 's' : ''} ago</p>
                            </div>
                          </div>
                          <div className="flex gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className="text-yellow-500 fill-yellow-500" size={12} />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed italic font-medium">
                          "{[
                            "Excellent service! The professional arrived on time and fixed the issue quickly. Highly recommended for any plumbing work.",
                            "Very professional behavior and thorough cleaning. My kitchen looks brand new. Thank you FixiGo!",
                            "Great experience. The technician was knowledgeable and explained the problem clearly. Fair pricing too.",
                            "Quick response and efficient work. I'm very satisfied with the sanitization service provided."
                          ][i-1]}"
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                  <div className="h-64 bg-gradient-to-br from-slate-900 to-slate-800 relative">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-500 rounded-full blur-[80px]" />
                      <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-500 rounded-full blur-[100px]" />
                    </div>
                    <div className="absolute -bottom-20 left-16 w-44 h-44 rounded-[3.5rem] bg-white p-3 shadow-2xl">
                      <div className="w-full h-full rounded-[3rem] bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-slate-50">
                        <User className="text-slate-300" size={80} />
                      </div>
                    </div>
                  </div>
                  <div className="pt-28 p-16">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-16">
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <h2 className="text-5xl font-black text-slate-900 tracking-tight">{provider?.name}</h2>
                          <div className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1.5">
                            <ShieldCheck size={14} /> Verified
                          </div>
                        </div>
                        <p className="text-slate-500 font-black uppercase tracking-widest text-sm">{provider?.services?.title || 'Multi-Service Expert'}</p>
                      </div>
                      <div className="flex gap-4">
                        <button className="bg-black text-white px-10 py-5 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-2xl shadow-slate-300 active:scale-95">
                          Edit Profile
                        </button>
                        <button className="p-5 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all">
                          <Settings size={24} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                      <div className="lg:col-span-2 space-y-12">
                        <section>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <div className="w-6 h-1 bg-yellow-500 rounded-full" />
                            Professional Summary
                          </h3>
                          <p className="text-slate-600 leading-relaxed font-medium">
                            Dedicated service professional with over {provider?.experience} of experience in home maintenance and specialized cleaning. 
                            Committed to delivering high-quality results and ensuring 100% customer satisfaction. Expert in modern tools and eco-friendly techniques.
                          </p>
                        </section>

                        <section>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <div className="w-6 h-1 bg-yellow-500 rounded-full" />
                            Expertise & Skills
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            {['Kitchen Deep Cleaning', 'AC Repair', 'Sanitization', 'Plumbing', 'Electrical', 'Home Painting'].map(skill => (
                              <span key={skill} className="px-6 py-3 bg-slate-50 text-slate-700 rounded-2xl text-sm font-bold border border-slate-100">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </section>

                        <section>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <div className="w-6 h-1 bg-yellow-500 rounded-full" />
                            Working Hours
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                              <div key={day} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{day}</p>
                                <p className="text-xs font-bold text-slate-900">09:00 - 18:00</p>
                              </div>
                            ))}
                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-center">
                              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Sun</p>
                              <p className="text-xs font-bold text-red-600">Holiday</p>
                            </div>
                          </div>
                        </section>
                      </div>

                      <div className="space-y-12">
                        <section>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Contact Information</h3>
                          <div className="space-y-4">
                            <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                <Phone size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                                <p className="text-sm font-black text-slate-900">{provider?.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                <Mail size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                <p className="text-sm font-black text-slate-900">{provider?.email}</p>
                              </div>
                            </div>
                          </div>
                        </section>

                        <section className="bg-yellow-50 p-8 rounded-[3rem] border border-yellow-100">
                          <h3 className="text-sm font-black text-yellow-900 mb-4">Partner Support</h3>
                          <p className="text-xs text-yellow-800 leading-relaxed mb-6">Need help with an assignment or payment? Our support team is available 24/7.</p>
                          <button className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black text-sm hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-200">
                            Contact Support
                          </button>
                        </section>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
