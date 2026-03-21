import { supabaseAdmin } from './supabaseAdmin';
import { fallbackCategories, fallbackServices } from '../data/fallbackData';

export const seedDatabase = async () => {
  try {
    // 1. Insert categories
    const categoriesToInsert = fallbackCategories.map(c => ({ name: c.name }));
    const { data: insertedCategories, error: catError } = await supabaseAdmin
      .from('categories')
      .insert(categoriesToInsert)
      .select();

    if (catError) {
      console.error('Error inserting categories:', catError);
      throw new Error(`Failed to seed categories: ${catError.message}`);
    }

    // Create a map of category name to new ID
    const categoryMap = new Map(insertedCategories.map(c => [c.name, c.id]));

    // 2. Insert services
    const servicesToInsert = fallbackServices.map(s => ({
      category_id: categoryMap.get(s.categories.name),
      title: s.title,
      description: s.description,
      image_url: s.image_url
    }));

    const { data: insertedServices, error: serError } = await supabaseAdmin
      .from('services')
      .insert(servicesToInsert)
      .select();

    if (serError) {
      console.error('Error inserting services:', serError);
      throw new Error(`Failed to seed services: ${serError.message}`);
    }

    // 3. Insert mock providers
    const providersToInsert = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        service_id: insertedServices[0].id,
        experience: '5 years',
        address: '123 Main St, City',
        availability: { days: ['Mon', 'Tue', 'Wed'], slots: ['09:00 AM - 12:00 PM'] }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '9876543211',
        service_id: insertedServices[1].id,
        experience: '8 years',
        address: '456 Oak Ave, City',
        availability: { days: ['Wed', 'Thu', 'Fri'], slots: ['02:00 PM - 05:00 PM'] }
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '9876543212',
        service_id: insertedServices[2].id,
        experience: '3 years',
        address: '789 Pine Rd, City',
        availability: { days: ['Sat', 'Sun'], slots: ['10:00 AM - 04:00 PM'] }
      }
    ];

    const { data: insertedProviders, error: provError } = await supabaseAdmin
      .from('service_providers')
      .insert(providersToInsert)
      .select();

    if (provError) {
      console.error('Error inserting providers:', provError);
      // Don't throw here, just log it. Maybe the table structure is slightly different.
    }

    // 4. Insert mock bookings (if we have providers)
    if (insertedProviders && insertedProviders.length > 0) {
      const bookingsToInsert = [
        {
          service_id: insertedServices[0].id,
          provider_id: insertedProviders[0].id,
          status: 'pending',
          address: '101 Demo St',
          city: 'Demo City',
          pincode: '123456',
          booking_date: '2024-03-25',
          booking_time: '10:00 AM',
          problem_description: 'Leaking pipe in kitchen',
          total_price: 500
        },
        {
          service_id: insertedServices[1].id,
          provider_id: insertedProviders[1].id,
          status: 'accepted',
          address: '202 Sample Ave',
          city: 'Sample City',
          pincode: '654321',
          booking_date: '2024-03-26',
          booking_time: '02:00 PM',
          problem_description: 'Short circuit in living room',
          total_price: 800
        }
      ];

      const { error: bookError } = await supabaseAdmin
        .from('bookings')
        .insert(bookingsToInsert);

      if (bookError) {
        console.error('Error inserting bookings:', bookError);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return { success: false, error: error.message };
  }
};

export const clearDatabase = async () => {
  try {
    // Order matters because of foreign keys
    await supabaseAdmin.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('service_providers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // Note: users_profile might be linked to auth.users, so be careful
    // await supabaseAdmin.from('users_profile').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    return { success: true };
  } catch (error: any) {
    console.error('Error clearing database:', error);
    return { success: false, error: error.message };
  }
};
