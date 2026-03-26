import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Category, Service } from '../types';
import { fallbackCategories, fallbackServices } from '../data/fallbackData';

interface DataContextType {
  categories: Category[];
  services: Service[];
  loadingCategories: boolean;
  loadingServices: boolean;
  error: string | null;
  refetchCategories: () => Promise<void>;
  refetchServices: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setCategories(fallbackCategories as Category[]);
      } else {
        setCategories(data as Category[]);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setCategories(fallbackCategories as Category[]);
      setError(err.message);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*, categories(*)');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setServices(fallbackServices as Service[]);
      } else {
        setServices(data as Service[]);
      }
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setServices(fallbackServices as Service[]);
      setError(err.message);
    } finally {
      setLoadingServices(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, [fetchCategories, fetchServices]);

  return (
    <DataContext.Provider value={{
      categories,
      services,
      loadingCategories,
      loadingServices,
      error,
      refetchCategories: fetchCategories,
      refetchServices: fetchServices
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
