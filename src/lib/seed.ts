import { supabaseAdmin } from './supabaseAdmin';
import { fallbackCategories, fallbackServices } from '../data/fallbackData';

export const seedDatabase = async () => {
  try {
    // 1. Upsert categories (avoid duplicates based on name)
    const categoriesToInsert = fallbackCategories.map(c => ({ name: c.name }));
    let { data: insertedCategories, error: catError } = await supabaseAdmin
      .from('categories')
      .upsert(categoriesToInsert, { onConflict: 'name' })
      .select();

    if (catError) {
      console.error('Detailed Category Seed Error:', catError);
      throw new Error(`Failed to seed categories: ${catError.message} (${catError.code})`);
    }

    if (!insertedCategories || insertedCategories.length === 0) {
      // If upsert didn't return data (sometimes happens if nothing changed), fetch them
      const { data: existingCats } = await supabaseAdmin.from('categories').select('*');
      insertedCategories = existingCats || [];
    }

    // Create a map of category name to new ID
    const categoryMap = new Map(insertedCategories.map(c => [c.name, c.id]));

    // 2. Insert services (avoid duplicates based on title)
    const { data: existingServices } = await supabaseAdmin.from('services').select('title');
    const existingTitles = new Set(existingServices?.map(s => s.title) || []);
    
    const servicesToInsert = fallbackServices
      .filter(s => !existingTitles.has(s.title))
      .map(s => ({
        category_id: categoryMap.get(s.categories.name),
        title: s.title,
        description: s.description,
        image_url: s.image_url
      }));

    if (servicesToInsert.length > 0) {
      const { error: serError } = await supabaseAdmin
        .from('services')
        .insert(servicesToInsert)
        .select();

      if (serError) {
        console.error('Error inserting services:', serError);
        throw new Error(`Failed to seed services: ${serError.message}`);
      }
    }
    
    // Fetch all services to build the map for providers
    const { data: allServices } = await supabaseAdmin.from('services').select('*');
    const serviceMap = new Map(allServices?.map(s => [s.title, s.id]) || []);

    // 3. Insert mock providers (avoid duplicates based on email)
    const { data: existingProviders } = await supabaseAdmin.from('service_providers').select('email');
    const existingEmails = new Set(existingProviders?.map(p => p.email) || []);

    const providersToInsert = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        service_id: serviceMap.get(fallbackServices[0].title),
        experience: '5 years',
        address: '123 Main St, City',
        availability: { days: ['Mon', 'Tue', 'Wed'], slots: ['09:00 AM - 12:00 PM'] }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '9876543211',
        service_id: serviceMap.get(fallbackServices[1].title),
        experience: '8 years',
        address: '456 Oak Ave, City',
        availability: { days: ['Wed', 'Thu', 'Fri'], slots: ['02:00 PM - 05:00 PM'] }
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '9876543212',
        service_id: serviceMap.get(fallbackServices[2].title),
        experience: '3 years',
        address: '789 Pine Rd, City',
        availability: { days: ['Sat', 'Sun'], slots: ['10:00 AM - 04:00 PM'] }
      }
    ].filter(p => !existingEmails.has(p.email));

    if (providersToInsert.length > 0) {
      const { error: provError } = await supabaseAdmin
        .from('service_providers')
        .insert(providersToInsert);

      if (provError) {
        console.error('Error inserting providers:', provError);
      }
    }

    // 4. Insert mock bookings (if we have providers)
    const { data: allProviders } = await supabaseAdmin.from('service_providers').select('*');
    
    if (allProviders && allProviders.length >= 2) {
      // Create a dummy user profile for mock bookings if it doesn't exist
      const dummyUserId = '00000000-0000-0000-0000-000000000000';
      const { data: existingDummy } = await supabaseAdmin
        .from('users_profile')
        .select('id')
        .eq('id', dummyUserId)
        .single();

      if (!existingDummy) {
        await supabaseAdmin.from('users_profile').insert({
          id: dummyUserId,
          email: 'demo@example.com',
          full_name: 'Demo User'
        });
      }

      // Check if we already have bookings to avoid duplicates
      const { data: existingBookings } = await supabaseAdmin.from('bookings').select('id').limit(1);
      
      if (!existingBookings || existingBookings.length === 0) {
        const bookingsToInsert = [
          {
            service_id: serviceMap.get(fallbackServices[0].title),
            provider_id: allProviders[0].id,
            user_id: dummyUserId,
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
            service_id: serviceMap.get(fallbackServices[1].title),
            provider_id: allProviders[1].id,
            user_id: dummyUserId,
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
    }

    // 5. Insert mock contact messages
    const { data: existingMessages } = await supabaseAdmin.from('contact_messages').select('id').limit(1);
    if (!existingMessages || existingMessages.length === 0) {
      const messagesToInsert = [
        {
          full_name: 'Alice Johnson',
          phone_number: '1234567890',
          email: 'alice@example.com',
          service_type: 'plumbing',
          message: 'I have a leak in my bathroom. Can you help?',
          status: 'pending'
        },
        {
          full_name: 'Bob Smith',
          phone_number: '0987654321',
          email: 'bob@example.com',
          service_type: 'electrician',
          message: 'My lights are flickering. Is it dangerous?',
          status: 'replied',
          reply: 'Yes, it could be. We recommend scheduling an inspection immediately.'
        }
      ];
      const { error: msgError } = await supabaseAdmin.from('contact_messages').insert(messagesToInsert);
      if (msgError) {
        console.warn('Failed to seed contact messages (table might not exist):', msgError.message);
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
    await supabaseAdmin.from('contact_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
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
