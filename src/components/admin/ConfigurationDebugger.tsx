import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Copy, Terminal, RefreshCw, Database } from 'lucide-react';
import { toast } from 'sonner';

interface ConfigurationDebuggerProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  testConnection: () => Promise<void>;
  isTesting: boolean;
  connectionStatus: 'idle' | 'success' | 'error';
}

export const ConfigurationDebugger: React.FC<ConfigurationDebuggerProps> = ({
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  testConnection,
  isTesting,
  connectionStatus
}) => {
  const [showSql, setShowSql] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const sqlScript = `-- 1. Create Tables
CREATE TABLE IF NOT EXISTS users_profile (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure columns exist for users_profile
ALTER TABLE users_profile ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users_profile ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users_profile ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users_profile ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure columns exist for services
ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE TABLE IF NOT EXISTS service_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  experience TEXT DEFAULT '3 years',
  address TEXT,
  rating NUMERIC DEFAULT 4.5,
  availability JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure columns exist for service_providers
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 4.5;
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT '3 years';
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES service_providers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  problem_description TEXT,
  service_type TEXT,
  item_count TEXT,
  problem_image TEXT,
  total_price NUMERIC,
  payment_method TEXT,
  is_urgent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure columns exist for bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS landmark TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_time TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS problem_description TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS item_count TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS problem_image TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_price NUMERIC;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false;

-- 2. Disable RLS for all tables (Development Mode)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;

-- 3. Setup Storage for Service Images
-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('services', 'services', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to the bucket (ANON and AUTHENTICATED)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'services');

DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'services');

DROP POLICY IF EXISTS "Public Update" ON storage.objects;
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'services');

DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'services');

-- 4. Grant Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;`;

  return (
    <div className="bg-gray-900 rounded-3xl shadow-xl border border-gray-800 overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row items-center justify-between bg-gray-900/50 gap-4">
        <div className="flex items-center">
          <Terminal className="text-yellow-500 mr-3" size={24} />
          <div>
            <h2 className="text-xl font-bold text-white">Configuration Debugger</h2>
            <p className="text-gray-400 text-sm">Verify your Supabase connection and environment variables</p>
          </div>
        </div>
        <button
          onClick={testConnection}
          disabled={isTesting}
          className={`flex items-center px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
            connectionStatus === 'success' 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : connectionStatus === 'error'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-yellow-500 text-black hover:bg-yellow-400'
          }`}
        >
          {isTesting ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Database className="mr-2" size={18} />}
          {isTesting ? 'Testing...' : connectionStatus === 'success' ? 'Connected' : connectionStatus === 'error' ? 'Retry Connection' : 'Test Connection'}
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Environment Variables</h3>
            
            <div className="space-y-4">
              {[
                { label: 'Supabase URL', value: supabaseUrl, isSecret: false },
                { label: 'Anon Key', value: supabaseAnonKey, isSecret: true },
                { label: 'Service Role Key', value: supabaseServiceRoleKey, isSecret: true }
              ].map((env, idx) => {
                const isPlaceholder = !env.value || env.value.startsWith('YOUR_') || env.value.length < 20;
                const isIdentical = env.label === 'Service Role Key' && env.value === supabaseAnonKey && env.value !== '';

                return (
                  <div key={idx} className="p-4 bg-gray-950 rounded-2xl border border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{env.label}</span>
                      {isPlaceholder ? (
                        <span className="flex items-center text-red-400 text-[10px] font-bold uppercase bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">
                          <AlertTriangle size={10} className="mr-1" /> Missing/Invalid
                        </span>
                      ) : (
                        <span className="flex items-center text-green-400 text-[10px] font-bold uppercase bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                          <CheckCircle size={10} className="mr-1" /> Configured
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-gray-800">
                      <code className="text-xs text-gray-300 truncate mr-2 font-mono">
                        {env.isSecret ? '••••••••••••••••' + env.value.slice(-6) : env.value || 'Not set'}
                      </code>
                      <button onClick={() => copyToClipboard(env.value)} className="text-gray-500 hover:text-yellow-500 transition-colors">
                        <Copy size={14} />
                      </button>
                    </div>
                    {isIdentical && (
                      <p className="text-[10px] text-red-400 mt-2 font-medium flex items-center bg-red-400/5 p-2 rounded-lg border border-red-400/10">
                        <AlertTriangle size={10} className="mr-1" /> Warning: Service Role Key is identical to Anon Key. Admin features will fail.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Database Setup</h3>
            <div className="bg-yellow-500/5 border border-yellow-500/20 p-6 rounded-3xl">
              <div className="flex items-start">
                <AlertTriangle className="text-yellow-500 mr-3 mt-0.5" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-yellow-500 mb-1">Action Required: Run SQL Script</h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    To use the admin dashboard, you must first create the necessary tables and permissions in your Supabase SQL Editor.
                  </p>
                  <button
                    onClick={() => setShowSql(!showSql)}
                    className="text-xs font-bold text-yellow-500 underline hover:text-yellow-400 transition-colors"
                  >
                    {showSql ? 'Hide SQL Script' : 'View SQL Script'}
                  </button>
                </div>
              </div>

              {showSql && (
                <div className="mt-4 relative">
                  <pre className="bg-black/60 text-indigo-300 p-4 rounded-2xl text-[10px] overflow-x-auto max-h-64 font-mono leading-relaxed border border-indigo-500/20">
                    {sqlScript}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(sqlScript)}
                    className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
