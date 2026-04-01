import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, safeGetSession, safeSignOut, safeSignInWithOAuth } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  pendingBookingId: string | null;
  setPendingBookingId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  // Sync user to the "users" table
  const syncUserToDatabase = async (user: User) => {
    const userData = {
      id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
      email: user.email,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    };

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingUser) {
        await supabase.from('users').insert(userData);
      } else {
        await supabase.from('users').update(userData).eq('id', user.id);
      }
    } catch (syncError) {
      console.error('Error syncing user to database:', syncError);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data } = await safeGetSession();
        if (mounted) {
          const currentSession = data?.session || null;
          setSession(currentSession);
          setUser(currentSession?.user || null);
          
          if (currentSession?.user) {
            await syncUserToDatabase(currentSession.user);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          await syncUserToDatabase(session.user);
        }
        
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await safeSignOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    try {
      await safeSignInWithOAuth('google', redirectTo);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, signInWithGoogle, pendingBookingId, setPendingBookingId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
