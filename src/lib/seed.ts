import { fallbackCategories, fallbackServices } from '../data/fallbackData';

export const seedDatabase = async () => {
  try {
    const categories = fallbackCategories.map(c => ({ name: c.name }));
    const services = fallbackServices.map(s => ({
      category_name: s.categories.name, // Temporary for mapping on server
      title: s.title,
      description: s.description,
      image_url: s.image_url
    }));

    const providers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        service_title: fallbackServices[0].title,
        experience: '5 years',
        address: '123 Main St, City',
        availability: { days: ['Mon', 'Tue', 'Wed'], slots: ['09:00 AM - 12:00 PM'] }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '9876543211',
        service_title: fallbackServices[1].title,
        experience: '8 years',
        address: '456 Oak Ave, City',
        availability: { days: ['Wed', 'Thu', 'Fri'], slots: ['02:00 PM - 05:00 PM'] }
      }
    ];

    const bookings = [
      {
        service_title: fallbackServices[0].title,
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

    const response = await fetch('/api/admin/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories, services, providers, bookings, messages })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Seed failed');

    return { success: true };
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return { success: false, error: error.message };
  }
};

export const clearDatabase = async () => {
  try {
    const response = await fetch('/api/admin/clear', { method: 'POST' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Clear failed');
    return { success: true };
  } catch (error: any) {
    console.error('Error clearing database:', error);
    return { success: false, error: error.message };
  }
};
