import { supabase } from './supabase';
import { fallbackCategories, fallbackServices } from '../data/fallbackData';

export const seedDatabase = async () => {
  try {
    // 1. Seed Categories
    const categories = fallbackCategories.map(c => ({ name: c.name }));
    const { data: catData, error: catError } = await supabase.from('categories').insert(categories).select();
    if (catError) throw catError;

    // 2. Seed Services
    const services = fallbackServices.map(s => {
      const category = catData.find(c => c.name === s.categories.name);
      return {
        category_id: category?.id,
        title: s.title,
        description: s.description,
        image_url: s.image_url
      };
    });
    const { data: servData, error: servError } = await supabase.from('services').insert(services).select();
    if (servError) throw servError;

    // 3. Seed Providers
    const providers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        service_id: servData[0].id,
        experience: '5 years',
        address: '123 Main St, City'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '9876543211',
        service_id: servData[1].id,
        experience: '8 years',
        address: '456 Oak Ave, City'
      }
    ];
    const { data: provData, error: provError } = await supabase.from('service_providers').insert(providers).select();
    if (provError) throw provError;

    // 4. Seed Bookings
    const bookings = [
      {
        service_id: servData[0].id,
        provider_id: provData[0].id,
        status: 'pending',
        address: '101 Demo St',
        city: 'Demo City',
        pincode: '123456',
        booking_date: '2024-03-25',
        booking_time: '10:00 AM',
        problem_description: 'Leaking pipe in kitchen',
        total_price: 500
      }
    ];
    const { error: bookError } = await supabase.from('bookings').insert(bookings);
    if (bookError) throw bookError;

    // 5. Seed Messages
    const messages = [
      {
        full_name: 'Alice Johnson',
        phone_number: '1234567890',
        email: 'alice@example.com',
        service_type: 'plumbing',
        message: 'I have a leak in my bathroom. Can you help?',
        status: 'pending'
      }
    ];
    const { error: msgError } = await supabase.from('contact_messages').insert(messages);
    if (msgError) throw msgError;

    return { success: true };
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return { success: false, error: error.message };
  }
};

export const clearDatabase = async () => {
  try {
    const tables = ['contact_messages', 'bookings', 'service_providers', 'services', 'categories', 'users_profile'];
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().neq('id', 'non-existent-id');
      if (error) throw error;
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error clearing database:', error);
    return { success: false, error: error.message };
  }
};
