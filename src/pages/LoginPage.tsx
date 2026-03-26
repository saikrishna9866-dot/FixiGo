import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { safeSignInWithPassword, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { BackButton } from '../components/BackButton';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect');
  const from = location.state?.from?.pathname || redirect || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error('Supabase is not configured. Please check your environment variables.');
      return;
    }
    setLoading(true);
    
    // Allow dummy emails by appending a domain if missing
    const finalEmail = email.includes('@') ? email : `${email}@dummy.com`;
    
    const { error } = await safeSignInWithPassword({ email: finalEmail, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged in successfully');
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20 px-4">
      <div className="w-full max-w-md mb-6">
        <BackButton to="/" label="Back to Home" variant="ghost" className="px-0 hover:bg-transparent" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        {!isSupabaseConfigured && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex items-center gap-2 text-sm">
            <AlertCircle size={20} />
            <span>Supabase is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.</span>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="text" placeholder="Email (or dummy name)" className="w-full pl-10 pr-4 py-2 border rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="password" placeholder="Password" className="w-full pl-10 pr-4 py-2 border rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="w-full bg-yellow-500 text-white py-2 rounded-lg font-bold hover:bg-yellow-600 transition-colors" disabled={loading || !isSupabaseConfigured}>
            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link to={`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="text-yellow-600 font-bold">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
};
