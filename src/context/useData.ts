import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Category, Service } from '../types';
import { fallbackCategories, fallbackServices } from '../data/fallbackData';
import { toast } from 'sonner';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        console.warn('Using fallback categories due to empty data');
        setCategories(fallbackCategories as Category[]);
      } else {
        setCategories(data as Category[]);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      toast.error('Database connection failed. Using offline data.');
      setCategories(fallbackCategories as Category[]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, refetch: fetchCategories };
};

export const useServices = (categoryId?: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      let query = supabase.from('services').select('*, categories(*)');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        console.warn('Using fallback services due to empty data');
        let filtered = fallbackServices;
        if (categoryId) {
          const cat = fallbackCategories.find(c => c.id === categoryId);
          if (cat) {
            filtered = fallbackServices.filter(s => s.categories.name === cat.name);
          }
        }
        setServices(filtered as Service[]);
      } else {
        setServices(data as Service[]);
      }
    } catch (err: any) {
      console.error('Error fetching services:', err);
      toast.error('Database connection failed. Using offline data.');
      setServices(fallbackServices as Service[]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [categoryId]);

  return { services, loading, error, refetch: fetchServices };
};
