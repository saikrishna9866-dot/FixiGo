import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
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
      const q = query(collection(db, 'categories'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.warn('Using fallback categories due to empty data');
        setCategories(fallbackCategories as Category[]);
      } else {
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
        setCategories(data);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      if (err.message?.includes('Missing or insufficient permissions')) {
        toast.error('Database access denied. Please check security rules.');
      } else {
        toast.error('Database connection failed. Using offline data.');
      }
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
      let q = query(collection(db, 'services'));
      if (categoryId) {
        q = query(collection(db, 'services'), where('category_id', '==', categoryId));
      }
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
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
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[];
        setServices(data);
      }
    } catch (err: any) {
      console.error('Error fetching services:', err);
      if (err.message?.includes('Missing or insufficient permissions')) {
        toast.error('Database access denied. Please check security rules.');
      } else {
        toast.error('Database connection failed. Using offline data.');
      }
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
