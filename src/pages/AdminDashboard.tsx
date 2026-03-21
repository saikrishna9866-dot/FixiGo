import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { supabaseAdmin, isSupabaseAdminConfigured } from '../lib/supabaseAdmin';
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
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, cn } from '../lib/utils';

import { seedDatabase, clearDatabase } from '../lib/seed';

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
    activeJobs: 0
  });

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

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin_session') === 'true';
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchAllData();

    // Set up real-time subscriptions
    const channels = [
      supabase.channel('categories').on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchAllData).subscribe(),
      supabase.channel('services').on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, fetchAllData).subscribe(),
      supabase.channel('users_profile').on('postgres_changes', { event: '*', schema: 'public', table: 'users_profile' }, fetchAllData).subscribe(),
      supabase.channel('service_providers').on('postgres_changes', { event: '*', schema: 'public', table: 'service_providers' }, fetchAllData).subscribe(),
      supabase.channel('bookings').on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchAllData).subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const client = isSupabaseAdminConfigured ? supabaseAdmin : supabase;
      const [catRes, serRes, userRes, provRes, bookRes] = await Promise.all([
        client.from('categories').select('*').order('created_at', { ascending: false }),
        client.from('services').select('*, categories(name)').order('created_at', { ascending: false }),
        client.from('users_profile').select('*').order('created_at', { ascending: false }),
        client.from('service_providers').select('*, services(title)').order('created_at', { ascending: false }),
        client.from('bookings').select('*, services(title), service_providers(name), users_profile(email)').order('created_at', { ascending: false })
      ]);

      setCategories(catRes.data || []);
      setServices(serRes.data || []);
      setUsers(userRes.data || []);
      setProviders(provRes.data || []);
      setBookings(bookRes.data || []);

      setStats({
        users: userRes.data?.length || 0,
        providers: provRes.data?.length || 0,
        bookings: bookRes.data?.length || 0,
        activeJobs: bookRes.data?.filter(b => b.status === 'accepted').length || 0
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
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

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabaseAdmin.storage.from('services').upload(fileName, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage.from('services').getPublicUrl(data.path);
      setFormData((prev: any) => ({ ...prev, image_url: urlData.publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let error;
      if (modalType === 'category') {
        if (editingItem) {
          const { error: err } = await supabaseAdmin.from('categories').update({ name: formData.name }).eq('id', editingItem.id);
          error = err;
        } else {
          const { error: err } = await supabaseAdmin.from('categories').insert({ name: formData.name });
          error = err;
        }
      } else if (modalType === 'service') {
        const payload = {
          title: formData.title,
          category_id: formData.category_id,
          description: formData.description,
          image_url: formData.image_url
        };
        if (editingItem) {
          const { error: err } = await supabaseAdmin.from('services').update(payload).eq('id', editingItem.id);
          error = err;
        } else {
          const { error: err } = await supabaseAdmin.from('services').insert(payload);
          error = err;
        }
      }

      if (error) throw error;
      toast.success('Saved successfully');
      setIsModalOpen(false);
      fetchAllData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, table: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      const { error } = await supabaseAdmin.from(table).delete().eq('id', id);
      if (error) throw error;
      toast.success('Deleted successfully');
      fetchAllData();
    } catch (error: any) {
      toast.error(error.message);
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
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-yellow-500">FixiGo Admin</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
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
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === item.id
                  ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold capitalize">{activeTab}</h1>
            <p className="text-gray-400">Manage your platform data and operations</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={async () => {
                if (!isSupabaseAdminConfigured) {
                  toast.error('Admin configuration missing. Please check VITE_SUPABASE_SERVICE_ROLE_KEY in Settings and restart the server.');
                  return;
                }
                const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
                const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
                if (anonKey === serviceKey || serviceKey === 'your-service-role-key') {
                  toast.error('Service Role Key is invalid! Please use the correct service_role key from Supabase settings.');
                  return;
                }
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
              className="bg-red-900/20 text-red-500 px-4 py-2 rounded-xl font-bold hover:bg-red-900/30 transition-all flex items-center space-x-2 border border-red-900/30"
            >
              {clearing ? <Loader2 className="animate-spin" size={16} /> : <span>Clear All Data</span>}
            </button>
            <button
              onClick={async () => {
                if (!isSupabaseAdminConfigured) {
                  toast.error('Admin configuration missing. Please check VITE_SUPABASE_SERVICE_ROLE_KEY in Settings and restart the server.');
                  return;
                }
                const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
                const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
                if (anonKey === serviceKey || serviceKey === 'your-service-role-key') {
                  toast.error('Service Role Key is invalid! Please use the correct service_role key from Supabase settings.');
                  return;
                }
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
              className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold hover:bg-yellow-400 transition-all flex items-center space-x-2"
            >
              {seeding ? <Loader2 className="animate-spin" size={16} /> : <span>Seed Demo Data</span>}
            </button>
            <div className="bg-gray-900 p-2 rounded-xl border border-gray-800">
              <span className="text-xs font-bold text-yellow-500 px-2 uppercase tracking-widest">Live System</span>
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
              {/* Debug Config Section */}
      <div className="mb-8 bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center text-yellow-500">
          <Loader2 className="mr-2" size={20} />
          Configuration Debugger
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-gray-400">Supabase URL:</p>
            <code className="bg-black/50 p-2 rounded block border border-gray-800">
              {import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL.substring(0, 20)}...` : '❌ MISSING'}
            </code>
          </div>
          <div className="space-y-2">
            <p className="text-gray-400">Service Role Key (Admin):</p>
            <code className="bg-black/50 p-2 rounded block border border-gray-800">
              {import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY && import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY !== 'your-service-role-key' 
                ? `${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY.substring(0, 8)}... (Length: ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY.length})` 
                : '❌ MISSING OR PLACEHOLDER'}
            </code>
          </div>
        </div>
        {!isSupabaseAdminConfigured && (
          <p className="mt-4 text-red-400 text-xs italic">
            * Note: If the key is missing above, ensure you added it to the Secrets panel with the "VITE_" prefix and restarted the server.
          </p>
        )}
      </div>

      {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', value: stats.users, icon: Users, color: 'text-white' },
                  { label: 'Service Providers', value: stats.providers, icon: HardHat, color: 'text-yellow-500' },
                  { label: 'Total Bookings', value: stats.bookings, icon: ShoppingBag, color: 'text-red-500' },
                  { label: 'Active Jobs', value: stats.activeJobs, icon: TrendingUp, color: 'text-yellow-400' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn("p-3 rounded-2xl bg-gray-800", stat.color)}>
                        <stat.icon size={24} />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                    <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                  </div>
                ))}
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
                      <button onClick={() => handleDelete(cat.id, 'categories')} className="p-2 bg-gray-800 rounded-lg text-red-400 hover:bg-gray-700"><Trash2 size={16} /></button>
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
                            <button onClick={() => handleDelete(ser.id, 'services')} className="p-2 bg-gray-800 rounded-lg text-red-400 hover:bg-gray-700"><Trash2 size={16} /></button>
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
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Password</th>
                      <th className="px-6 py-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{user.email}</td>
                        <td className="px-6 py-4 text-sm font-mono text-yellow-500">{user.password || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{formatDate(user.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'providers' && (
            <motion.div key="providers" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Assigned Service</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {providers.map((prov) => (
                      <tr key={prov.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold">{prov.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{prov.email}</td>
                        <td className="px-6 py-4"><span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs">{prov.services?.title}</span></td>
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
                          <td className="px-6 py-4 text-sm">{booking.users_profile?.email}</td>
                          <td className="px-6 py-4 text-sm font-bold">{booking.services?.title}</td>
                          <td className="px-6 py-4 text-sm">{booking.service_providers?.name}</td>
                          <td className="px-6 py-4">
                            <select
                              value={booking.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                const { error } = await supabaseAdmin.from('bookings').update({ status: newStatus }).eq('id', booking.id);
                                if (!error) {
                                  toast.success('Status updated');
                                  fetchAllData();
                                }
                              }}
                              className={cn(
                                "bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer",
                                booking.status === 'completed' ? "text-red-400" :
                                booking.status === 'accepted' ? "text-yellow-500" :
                                "text-gray-400"
                              )}
                            >
                              <option value="pending">Pending</option>
                              <option value="accepted">Accepted</option>
                              <option value="completed">Completed</option>
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

      {/* Modal */}
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
