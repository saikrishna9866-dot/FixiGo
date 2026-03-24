import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('DEBUG: VITE_SUPABASE_URL =', supabaseUrl);
console.log('DEBUG: VITE_SUPABASE_ANON_KEY =', supabaseAnonKey ? '***PRESENT***' : '***MISSING***');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please set them in your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // In iframe environments, we sometimes want to be more careful with storage
    storageKey: 'fixigo-auth-token',
  }
});

/**
 * Safely fetches the Supabase session with a retry mechanism for the "steal" lock error.
 * This error is common in iframe environments when multiple components access storage simultaneously.
 */
export const safeGetSession = async (retryCount = 0): Promise<any> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      if (error.message?.includes('steal') && retryCount < 5) {
        console.warn(`Auth lock conflict (steal), retrying... (${retryCount + 1}/5)`);
        // Exponential backoff with a bit of randomness to avoid synchronized retries
        const delay = Math.pow(2, retryCount) * 100 + Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        return safeGetSession(retryCount + 1);
      }
      throw error;
    }
    
    return { data, error: null };
  } catch (error: any) {
    if (error.message?.includes('steal') && retryCount < 5) {
      const delay = Math.pow(2, retryCount) * 100 + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      return safeGetSession(retryCount + 1);
    }
    return { data: { session: null }, error };
  }
};

/**
 * Safely signs in with password with a retry mechanism for the "steal" lock error.
 */
export const safeSignInWithPassword = async (credentials: any, retryCount = 0): Promise<any> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    
    if (error) {
      if (error.message?.includes('steal') && retryCount < 5) {
        console.warn(`Auth lock conflict (steal) during login, retrying... (${retryCount + 1}/5)`);
        const delay = Math.pow(2, retryCount) * 100 + Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        return safeSignInWithPassword(credentials, retryCount + 1);
      }
      throw error;
    }
    
    return { data, error: null };
  } catch (error: any) {
    if (error.message?.includes('steal') && retryCount < 5) {
      const delay = Math.pow(2, retryCount) * 100 + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      return safeSignInWithPassword(credentials, retryCount + 1);
    }
    return { data: null, error };
  }
};

/**
 * Safely signs up with a retry mechanism for the "steal" lock error.
 */
export const safeSignUp = async (params: any, retryCount = 0): Promise<any> => {
  try {
    const { data, error } = await supabase.auth.signUp(params);
    
    if (error) {
      if (error.message?.includes('steal') && retryCount < 5) {
        console.warn(`Auth lock conflict (steal) during signup, retrying... (${retryCount + 1}/5)`);
        const delay = Math.pow(2, retryCount) * 100 + Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        return safeSignUp(params, retryCount + 1);
      }
      throw error;
    }
    
    return { data, error: null };
  } catch (error: any) {
    if (error.message?.includes('steal') && retryCount < 5) {
      const delay = Math.pow(2, retryCount) * 100 + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      return safeSignUp(params, retryCount + 1);
    }
    return { data: null, error };
  }
};

/**
 * Safely signs out with a retry mechanism for the "steal" lock error.
 */
export const safeSignOut = async (retryCount = 0): Promise<any> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      if (error.message?.includes('steal') && retryCount < 5) {
        console.warn(`Auth lock conflict (steal) during signout, retrying... (${retryCount + 1}/5)`);
        const delay = Math.pow(2, retryCount) * 100 + Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        return safeSignOut(retryCount + 1);
      }
      throw error;
    }
    
    return { error: null };
  } catch (error: any) {
    if (error.message?.includes('steal') && retryCount < 5) {
      const delay = Math.pow(2, retryCount) * 100 + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      return safeSignOut(retryCount + 1);
    }
    return { error };
  }
};

/**
 * Safely fetches the current user with a retry mechanism for the "steal" lock error.
 */
export const safeGetUser = async (retryCount = 0): Promise<any> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      if (error.message?.includes('steal') && retryCount < 5) {
        console.warn(`Auth lock conflict (steal) during getUser, retrying... (${retryCount + 1}/5)`);
        const delay = Math.pow(2, retryCount) * 100 + Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        return safeGetUser(retryCount + 1);
      }
      throw error;
    }
    
    return { data, error: null };
  } catch (error: any) {
    if (error.message?.includes('steal') && retryCount < 5) {
      const delay = Math.pow(2, retryCount) * 100 + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      return safeGetUser(retryCount + 1);
    }
    return { data: { user: null }, error };
  }
};
