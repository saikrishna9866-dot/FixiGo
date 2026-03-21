import { supabase } from '../lib/supabase';

export interface BookingData {
  serviceId: string;
  providerId: string;
  userId: string;
  address: string;
  city: string;
  pincode: string;
  bookingDate: string;
  bookingTime: string;
  problemDescription: string;
  totalPrice: number;
}

export const bookingService = {
  /**
   * Validates if a string is a valid UUID
   */
  isUuid(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  },

  /**
   * Ensures a user profile exists in the users_profile table
   */
  async ensureUserProfile(user: { id: string; email?: string; user_metadata?: any }) {
    const { data: profile } = await supabase
      .from('users_profile')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      const { error: insertError } = await supabase.from('users_profile').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.name || 'User',
      });
      
      if (insertError) {
        console.error('Error creating user profile:', insertError);
        // We don't throw here as the profile might have been created by another process in the meantime
      }
    }
  },

  /**
   * Submits a new booking to the database
   */
  async createBooking(data: BookingData) {
    const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let actualServiceId = isUuid(data.serviceId) ? data.serviceId : null;
    let actualProviderId = isUuid(data.providerId) ? data.providerId : null;

    // If we have a UUID, check if it actually exists in the database
    // to avoid foreign key constraint errors during demo/testing
    if (actualServiceId) {
      const { data: serviceExists } = await supabase
        .from('services')
        .select('id')
        .eq('id', actualServiceId)
        .single();
      
      if (!serviceExists) {
        console.warn(`Service ID ${actualServiceId} not found in database. Setting to null for demo booking.`);
        actualServiceId = null;
      }
    }

    if (actualProviderId) {
      const { data: providerExists } = await supabase
        .from('service_providers')
        .select('id')
        .eq('id', actualProviderId)
        .single();
      
      if (!providerExists) {
        console.warn(`Provider ID ${actualProviderId} not found in database. Setting to null for demo booking.`);
        actualProviderId = null;
      }
    }

    const { data: result, error } = await supabase.from('bookings').insert({
      user_id: data.userId,
      service_id: actualServiceId,
      provider_id: actualProviderId,
      address: data.address,
      city: data.city,
      pincode: data.pincode,
      booking_date: data.bookingDate,
      booking_time: data.bookingTime,
      problem_description: data.problemDescription,
      total_price: data.totalPrice,
      status: 'pending'
    }).select().single();

    if (error) {
      console.error('Booking submission error:', error);
      
      // Handle specific database errors with user-friendly messages
      if (error.message.includes('uuid')) {
        throw new Error('Invalid ID format. Please ensure you are using real service and provider data.');
      }
      if (error.message.includes('foreign key')) {
        throw new Error('Database constraint error. This usually happens when using demo data that hasn\'t been seeded to your database. Please visit the Admin Dashboard to seed demo data.');
      }
      throw error;
    }

    return result;
  }
};
