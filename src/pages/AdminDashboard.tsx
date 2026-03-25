import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Grid,
  Wrench,
  Users,
  HardHat,
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  TrendingUp,
  CheckCircle2,
  Clock,
  Search,
  ChevronRight,
  X,
  Loader2,
  Database,
  ArrowRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { toast } from 'sonner';
import { formatDate, cn } from '../lib/utils';
import { seedDatabase, clearDatabase } from '../lib/seed';
import { BackButton } from '../components/BackButton';

import { StatsGrid } from '../components/admin/StatsGrid';
import { ConfigurationDebugger } from '../components/admin/ConfigurationDebugger';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    providers: 0,
    bookings: 0,
    activeJobs: 0,
    revenue: 0
  });

  // Chart data
  const [chartData, setChartData] = useState<any[]>([]);

  // Data states
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'service' | 'provider'>('category');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string | string[], table: string, label: string } | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState<string | null>(null);

  const testConnection = async () => {
    setTestStatus('testing');
    setTestError(null);
    try {
      // Test Supabase connection
      const { error } = await supabaseAdmin.from('categories').select('id').limit(1);
      if (error) throw error;
      setTestStatus('success');
      toast.success('Successfully connected to Supabase!');
    } catch (err: any) {
      setTestStatus('error');
      setTestError(err.message || 'Unknown error');
      toast.error(`Connection error: ${err.message}`);
    }
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin_session') === 'true';
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchAllData();
    testConnection();

    // Set up real-time subscription for bookings
    const bookingsChannel = supabaseAdmin
      .channel('admin-bookings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          fetchAllData();
        }
      )
      .subscribe();

    return () => {
      supabaseAdmin.removeChannel(bookingsChannel);
    };
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch Categories
      const { data: categoriesData, error: catError } = await supabaseAdmin.from('categories').select('*');
      if (catError) throw catError;
      setCategories(categoriesData || []);

      // Fetch Services
      const { data: servicesData, error: serError } = await supabaseAdmin.from('services').select('*, categories(*)');
      if (serError) throw serError;
      setServices(servicesData || []);

      // Fetch Users
      const { data: usersData, error: usersError } = await supabaseAdmin.from('users_profile').select('*');
      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch Providers
      const { data: providersData, error: provError } = await supabaseAdmin.from('service_providers').select('*, services(*)');
      if (provError) throw provError;
      setProviders(providersData || []);

      // Fetch Bookings
      const { data: bookingsData, error: bookError } = await supabaseAdmin
        .from('bookings')
        .select('*, users_profile(*), services(*), service_providers(*)')
        .order('created_at', { ascending: false });
      if (bookError) throw bookError;
      
      const formattedBookings = (bookingsData || []).map(b => ({
        ...b,
        users: b.users_profile
      }));
      setBookings(formattedBookings);

      // Calculate Stats
      const totalRevenue = formattedBookings
        .filter((b: any) => b.status === 'completed')
        .reduce((sum: number, b: any) => sum + (Number(b.total_price) || 0), 0);

      setStats({
        users: (usersData || []).length,
        providers: (providersData || []).length,
        bookings: formattedBookings.length,
        activeJobs: formattedBookings.filter((b: any) => b.status === 'accepted').length,
        revenue: totalRevenue
      });

      // Generate Chart Data (Last 7 days)
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const chart = last7Days.map(date => {
        const dayBookings = formattedBookings.filter((b: any) => b.created_at?.startsWith(date)) || [];
        return {
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          bookings: dayBookings.length,
          revenue: dayBookings.reduce((acc: number, b: any) => acc + (Number(b.total_price) || 0), 0)
        };
      });
      setChartData(chart);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    toast.success('Logged out from admin panel');
    navigate('/admin/login');
  };

  // CRUD Handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `service-images/${fileName}`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from('services')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('services')
        .getPublicUrl(filePath);
      
      setFormData((prev: any) => ({ ...prev, image_url: publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Full upload error:', error);
      toast.error('Failed to upload image: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const table = modalType === 'category' ? 'categories' : 'services';
      const data = { ...formData };
      
      if (editingItem) {
        const { error } = await supabaseAdmin
          .from(table)
          .update(data)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success(`${modalType} updated`);
      } else {
        const { error } = await supabaseAdmin
          .from(table)
          .insert([data]);
        if (error) throw error;
        toast.success(`${modalType} added`);
      }
      setIsModalOpen(false);
      fetchAllData();
    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string | string[], table: string, label: string) => {
    setDeleteConfirm({ id, table, label });
  };

  const performDelete = async () => {
    if (!deleteConfirm) return;
    
    setLoading(true);
    try {
      const idsToDelete = Array.isArray(deleteConfirm.id) ? deleteConfirm.id : [deleteConfirm.id];
      
      for (const id of idsToDelete) {
        // If deleting a user, we should also delete their bookings first to avoid foreign key constraints
        if (deleteConfirm.table === 'users_profile') {
          const { error: bookingsError } = await supabaseAdmin
            .from('bookings')
            .delete()
            .eq('user_id', id);
            
          if (bookingsError) {
            console.warn(`Failed to delete bookings for user ${id}:`, bookingsError);
          }

          // Also delete from Auth
          const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
          if (authError) {
            console.warn(`Auth deletion failed for ${id}:`, authError);
          }
        }

        // If deleting a service provider, we should handle their bookings
        if (deleteConfirm.table === 'service_providers') {
          // We'll set provider_id to null for their bookings instead of deleting the bookings
          const { error: bookingsError } = await supabaseAdmin
            .from('bookings')
            .update({ provider_id: null })
            .eq('provider_id', id);
            
          if (bookingsError) {
            console.warn(`Failed to update bookings for provider ${id}:`, bookingsError);
          }
        }

        const { error } = await supabaseAdmin
          .from(deleteConfirm.table)
          .delete()
          .eq('id', id);
          
        if (error) throw error;
      }
      
      toast.success(`${deleteConfirm.label} deleted successfully`);
      setDeleteConfirm(null);
      setSelectedUsers([]);
      fetchAllData();
    } catch (error: any) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);
      if (error) throw error;
      toast.success('Status updated');
      fetchAllData();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status: ' + error.message);
    }
  };

  const openModal = (type: any, item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item || {});
    setIsModalOpen(true);
  };

  if (loading && activeTab === 'overview') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="animate-spin text-yellow-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full z-50">
        <div className="p-8 flex items-center justify-center border-b border-gray-800/50">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-yellow-500 text-black w-10 h-10 flex items-center justify-center rounded-xl font-black text-xl shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform">F</div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white leading-none">
                Fixi<span className="text-yellow-500">Go</span>
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Admin Panel</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-4 custom-scrollbar">
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Main Navigation</p>
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'categories', label: 'Categories', icon: Grid },
              { id: 'services', label: 'Services', icon: Wrench },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'providers', label: 'Providers', icon: HardHat },
              { id: 'bookings', label: 'Bookings', icon: ShoppingBag },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group",
                  activeTab === item.id
                    ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/10"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                )}
              >
                <item.icon size={18} className={cn(
                  "transition-transform duration-200",
                  activeTab === item.id ? "scale-110" : "group-hover:scale-110"
                )} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-10 space-y-1">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">External</p>
            <Link
              to="/"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all group"
            >
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              <span>Back to Site</span>
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10">
        <div className="mb-6">
          <BackButton variant="ghost" className="px-0 hover:bg-transparent text-gray-400 hover:text-white" />
        </div>
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-800/50">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold tracking-tight capitalize text-white">{activeTab}</h1>
              <div className="px-2.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-bold text-yellow-500 uppercase tracking-wider">
                Admin
              </div>
            </div>
            <p className="text-gray-400 text-sm font-medium">Manage your platform data, users, and system operations.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* System Status Group */}
            <div className="flex items-center gap-2 mr-2 pr-4 border-r border-gray-800/50">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all duration-300",
                testStatus === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                testStatus === 'error' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                'bg-gray-800/50 text-gray-400 border-gray-700/50'
              )}>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  testStatus === 'success' ? 'bg-emerald-500 animate-pulse' : 
                  testStatus === 'error' ? 'bg-rose-500' : 
                  'bg-gray-500'
                )} />
                <span className="uppercase tracking-widest">
                  {testStatus === 'success' ? 'Database Connected' : testStatus === 'error' ? 'Connection Failed' : 'Checking Connection...'}
                </span>
              </div>
              
              <div className="px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Live System
              </div>
            </div>

            {/* Actions Group */}
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  if (!confirm('Are you sure you want to clear ALL data? This cannot be undone.')) return;
                  setClearing(true);
                  const result = await clearDatabase();
                  setClearing(false);
                  if (result.success) {
                    toast.success('Database cleared successfully');
                    fetchAllData();
                  } else {
                    toast.error('Failed to clear: ' + result.error);
                  }
                }}
                disabled={clearing || seeding}
                className="group relative px-4 py-2 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all disabled:opacity-50 flex items-center gap-2 overflow-hidden"
              >
                {clearing ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} className="group-hover:scale-110 transition-transform" />}
                <span>Clear Data</span>
              </button>

              <button
                onClick={async () => {
                  setSeeding(true);
                  const result = await seedDatabase();
                  setSeeding(false);
                  if (result.success) {
                    toast.success('Database seeded successfully');
                    fetchAllData();
                  } else {
                    toast.error('Failed to seed: ' + result.error);
                  }
                }}
                disabled={seeding || clearing}
                className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-yellow-500 hover:bg-yellow-400 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-yellow-500/10"
              >
                {seeding ? <Loader2 className="animate-spin" size={14} /> : <Database size={14} />}
                <span>Seed Demo</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <ConfigurationDebugger
                supabaseUrl={import.meta.env.VITE_SUPABASE_URL || ''}
                supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY || ''}
                supabaseServiceRoleKey={import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''}
                testConnection={testConnection}
                isTesting={testStatus === 'testing'}
                connectionStatus={testStatus === 'success' ? 'success' : testStatus === 'error' ? 'error' : 'idle'}
              />

              <StatsGrid stats={{
                totalUsers: stats.users,
                totalProviders: stats.providers,
                totalBookings: stats.bookings,
                totalRevenue: stats.revenue
              }} />

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-xl">
                  <h3 className="text-lg font-bold mb-6">Booking Activity</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                          itemStyle={{ color: '#EAB308' }}
                        />
                        <Area type="monotone" dataKey="bookings" stroke="#EAB308" fillOpacity={1} fill="url(#colorBookings)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-xl">
                  <h3 className="text-lg font-bold mb-6">Revenue Growth</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                          itemStyle={{ color: '#A855F7' }}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#A855F7" strokeWidth={3} dot={{ r: 4, fill: '#A855F7' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Bookings Table */}
              <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                  <h3 className="text-xl font-bold">Recent Bookings</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-yellow-500 text-sm font-bold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-widest">
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Provider</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 text-sm">{booking.users_profile?.email}</td>
                          <td className="px-6 py-4 text-sm font-bold">{booking.services?.title}</td>
                          <td className="px-6 py-4 text-sm">{booking.service_providers?.name}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                              booking.status === 'completed' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                              booking.status === 'accepted' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                              "bg-gray-500/10 text-gray-400 border-gray-500/20"
                            )}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{formatDate(booking.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => openModal('category')}
                  className="bg-yellow-600 text-black px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-yellow-700 transition-all"
                >
                  <Plus size={18} />
                  <span>Add Category</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-gray-900 p-6 rounded-3xl border border-gray-800 flex justify-between items-center group">
                    <div>
                      <h3 className="text-lg font-bold">{cat.name}</h3>
                      <p className="text-gray-500 text-xs">Created {formatDate(cat.created_at)}</p>
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal('category', cat)} className="p-2 bg-gray-800 rounded-lg text-yellow-500 hover:bg-gray-700"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(cat.id, 'categories', cat.name)} className="p-2 bg-gray-800 rounded-lg text-red-400 hover:bg-gray-700"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => openModal('service')}
                  className="bg-yellow-600 text-black px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-yellow-700 transition-all"
                >
                  <Plus size={18} />
                  <span>Add Service</span>
                </button>
              </div>
              <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Created At</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {services.map((ser) => (
                      <tr key={ser.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {ser.image_url ? (
                              <img src={ser.image_url} alt={ser.title} className="w-10 h-10 rounded-md object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-gray-800 flex items-center justify-center text-gray-500">
                                <span className="text-[10px] uppercase">No img</span>
                              </div>
                            )}
                            <span className="font-bold">{ser.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="bg-gray-800 px-3 py-1 rounded-full text-xs">{ser.categories?.name}</span></td>
                        <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{ser.description || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{formatDate(ser.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => openModal('service', ser)} className="p-2 bg-gray-800 rounded-lg text-yellow-500 hover:bg-gray-700"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(ser.id, 'services', ser.title)} className="p-2 bg-gray-800 rounded-lg text-red-400 hover:bg-gray-700"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h3 className="text-xl font-bold">Manage Users</h3>
                  {selectedUsers.length > 0 && (
                    <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20">
                      {selectedUsers.length} selected
                    </span>
                  )}
                </div>
                {selectedUsers.length > 0 && (
                  <button
                    onClick={() => handleDelete(selectedUsers, 'users_profile', `${selectedUsers.length} users`)}
                    className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
                  >
                    <Trash2 size={18} />
                    <span>Delete Selected</span>
                  </button>
                )}
              </div>
              <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
                <table className="w-full text-left">
                  <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4 w-10">
                        <input
                          type="checkbox"
                          className="rounded border-gray-700 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(users.map(u => u.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Full Name</th>
                      <th className="px-6 py-4">Joined Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {users.map((user) => (
                      <tr key={user.id} className={cn(
                        "hover:bg-gray-800/30 transition-colors",
                        selectedUsers.includes(user.id) && "bg-yellow-500/5"
                      )}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="rounded border-gray-700 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(prev => [...prev, user.id]);
                              } else {
                                setSelectedUsers(prev => prev.filter(id => id !== user.id));
                              }
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                              {user.email?.[0].toUpperCase()}
                            </div>
                            <span className="font-medium">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{user.full_name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{formatDate(user.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete(user.id, 'users_profile', user.email)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'providers' && (
            <motion.div key="providers" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
                <table className="w-full text-left">
                  <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Provider</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Specialization</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {providers.map((prov) => (
                      <tr key={prov.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold">
                              {prov.name?.[0]}
                            </div>
                            <div>
                              <p className="font-bold">{prov.name}</p>
                              <p className="text-xs text-gray-500">{prov.experience} exp.</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-300">{prov.email}</p>
                          <p className="text-xs text-gray-500">{prov.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">
                            {prov.services?.title}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete(prov.id, 'service_providers', prov.name)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-widest">
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Provider</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 text-sm">{booking.users?.email}</td>
                          <td className="px-6 py-4 text-sm font-bold">{booking.services?.title}</td>
                          <td className="px-6 py-4 text-sm">{booking.service_providers?.name}</td>
                          <td className="px-6 py-4">
                            <select
                              value={booking.status}
                              onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                              className={cn(
                                "bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer",
                                booking.status === 'completed' ? "text-green-400" :
                                booking.status === 'pending' ? "text-purple-400" :
                                booking.status === 'accepted' ? "text-indigo-400" :
                                booking.status === 'on_the_way' ? "text-yellow-500" :
                                booking.status === 'in_progress' ? "text-orange-500" :
                                booking.status === 'cancelled' ? "text-red-400" :
                                "text-gray-400"
                              )}
                            >
                              <option value="pending">Pending</option>
                              <option value="assigned">Assigned</option>
                              <option value="accepted">Accepted</option>
                              <option value="on_the_way">On Way</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{formatDate(booking.created_at)}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="text-yellow-500 hover:text-yellow-400 text-xs font-bold uppercase tracking-widest"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-gray-900 rounded-[32px] border border-gray-800 shadow-2xl overflow-hidden p-10 text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">Confirm Delete</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Are you sure you want to delete <span className="text-white font-bold">"{deleteConfirm.label}"</span>? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-8 py-4 bg-gray-800 text-white rounded-2xl font-bold hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={performDelete}
                  disabled={loading}
                  className="flex-1 px-8 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : 'Delete Now'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking View Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-gray-900 rounded-[40px] border border-gray-800 shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border mb-4 inline-block",
                      selectedBooking.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                      selectedBooking.status === 'pending' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                      selectedBooking.status === 'accepted' ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" :
                      selectedBooking.status === 'on_the_way' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                      selectedBooking.status === 'in_progress' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                      selectedBooking.status === 'cancelled' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}>
                      {selectedBooking.status.replace('_', ' ')}
                    </span>
                    <h3 className="text-3xl font-black tracking-tight">Booking Details</h3>
                    <p className="text-gray-500 mt-1 font-medium">ID: {selectedBooking.id.substring(0, 8)}...</p>
                  </div>
                  <button onClick={() => setSelectedBooking(null)} className="p-3 bg-gray-800 rounded-2xl text-gray-400 hover:text-white transition-all">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Service</p>
                      <p className="text-xl font-bold text-yellow-500">{selectedBooking.services?.title}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Customer</p>
                      <p className="text-lg font-medium">{selectedBooking.users?.email}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Location</p>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {selectedBooking.address}<br />
                        {selectedBooking.city}, {selectedBooking.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Provider</p>
                      <p className="text-lg font-bold">{selectedBooking.service_providers?.name || 'Unassigned'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Schedule</p>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <Clock size={16} className="text-yellow-500" />
                        <span className="font-bold">{selectedBooking.booking_date}</span>
                        <span className="text-gray-600">|</span>
                        <span>{selectedBooking.booking_time}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Total Price</p>
                      <p className="text-3xl font-black text-white">₹{selectedBooking.total_price}</p>
                    </div>
                  </div>
                </div>

                {selectedBooking.problem_description && (
                  <div className="mt-10 p-6 bg-gray-800/50 rounded-3xl border border-gray-800">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Problem Description</p>
                    <p className="text-sm text-gray-300 italic leading-relaxed">"{selectedBooking.problem_description}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">
                  {editingItem ? 'Edit' : 'Add'} {modalType}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {modalType === 'category' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Category Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-white"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                )}

                {modalType === 'service' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Service Title</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-white"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                      <select
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-white"
                        value={formData.category_id || ''}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                      <textarea
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-white"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Service Image</label>
                      <div className="flex items-center space-x-4">
                        {formData.image_url ? (
                          <div className="relative">
                            <img src={formData.image_url} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-gray-700" />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, image_url: '' })}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-500">
                            <span className="text-xs">No img</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer bg-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors inline-block border border-gray-700"
                          >
                            {formData.image_url ? 'Replace Image' : 'Upload Image'}
                          </label>
                          <p className="text-xs text-gray-500 mt-2">Or provide an image URL below:</p>
                          <input
                            type="url"
                            className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-white text-sm"
                            value={formData.image_url || ''}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-600 text-black py-4 rounded-xl font-bold hover:bg-yellow-700 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Save Changes</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 rounded-3xl border border-gray-800 p-8 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold font-display tracking-tight">Booking Details</h2>
                <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Service</p>
                    <p className="font-bold text-lg">{selectedBooking.services?.title}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Status</p>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border inline-block",
                      selectedBooking.status === 'completed' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      selectedBooking.status === 'accepted' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                      "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    )}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">User Email</p>
                    <p className="text-sm">{selectedBooking.users_profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Provider</p>
                    <p className="text-sm">{selectedBooking.service_providers?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Date & Time</p>
                    <p className="text-sm">{selectedBooking.booking_date} at {selectedBooking.booking_time}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Total Price</p>
                    <p className="text-sm font-bold text-yellow-500">₹{selectedBooking.total_price}</p>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-6">
                  <h3 className="text-lg font-bold mb-4">Service Customization</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Service Type</p>
                      <p className="text-sm">{selectedBooking.service_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Item Count</p>
                      <p className="text-sm">{selectedBooking.item_count || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Problem Description</p>
                    <p className="text-sm bg-gray-800/50 p-4 rounded-xl">{selectedBooking.problem_description || 'No description provided.'}</p>
                  </div>
                  {selectedBooking.problem_image && (
                    <div className="mt-4">
                      <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Problem Image</p>
                      <img src={selectedBooking.problem_image} alt="Problem" className="w-full max-w-md rounded-xl border border-gray-800" />
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-800 pt-6">
                  <h3 className="text-lg font-bold mb-4">Location Details</h3>
                  <div className="bg-gray-800/50 p-4 rounded-xl space-y-2">
                    <p className="text-sm"><span className="text-gray-500 w-24 inline-block">Address:</span> {selectedBooking.address}</p>
                    <p className="text-sm"><span className="text-gray-500 w-24 inline-block">City:</span> {selectedBooking.city}</p>
                    <p className="text-sm"><span className="text-gray-500 w-24 inline-block">Pincode:</span> {selectedBooking.pincode}</p>
                    {selectedBooking.landmark && (
                      <p className="text-sm"><span className="text-gray-500 w-24 inline-block">Landmark:</span> {selectedBooking.landmark}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
