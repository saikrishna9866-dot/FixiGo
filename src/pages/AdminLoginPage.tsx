import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulated Admin Login as requested
    setTimeout(() => {
      if (username === 'Saikrishna' && password === 'Saikrishnatadi@3813') {
        localStorage.setItem('admin_session', 'true');
        toast.success('Admin access granted!');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid admin credentials');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700"
      >
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
              <Lock className="text-yellow-500" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Admin Panel</h2>
            <p className="text-gray-400">Enter your credentials to access the control center</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none text-white"
                  placeholder="Admin Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none text-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-bold hover:bg-yellow-600 transition-all shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Access Dashboard</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
