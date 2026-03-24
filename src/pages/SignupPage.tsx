import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase, safeSignUp } from '../lib/supabase';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Mail, Lock, User, Loader2 } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/login';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Allow dummy emails by appending a domain if missing
    const finalEmail = email.includes('@') ? email : `${email}@dummy.com`;
    
    const { error } = await safeSignUp({ 
      email: finalEmail, 
      password, 
      options: { data: { name } } 
    });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        toast.error('Email rate limit exceeded. Please wait a few minutes or disable "Confirm Email" in your Supabase Auth settings to bypass this during testing.');
      } else if (error.message.toLowerCase().includes('signups not allowed')) {
        toast.error('Signups are currently disabled in your Supabase project. Please enable "Allow new users to sign up" in your Supabase Auth settings.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Account created successfully!');
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="text" placeholder="Full Name" className="w-full pl-10 pr-4 py-2 border rounded-lg" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="text" placeholder="Email (or dummy name)" className="w-full pl-10 pr-4 py-2 border rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="password" placeholder="Password" className="w-full pl-10 pr-4 py-2 border rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="w-full bg-yellow-500 text-white py-2 rounded-lg font-bold hover:bg-yellow-600 transition-colors" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-yellow-600 font-bold">Login</Link>
        </p>
        <p className="mt-6 text-[10px] text-gray-400 text-center uppercase tracking-widest leading-relaxed">
          Tip: If you hit email rate limits during testing, disable "Confirm Email" in your Supabase Auth settings.
        </p>
      </motion.div>
    </div>
  );
};
