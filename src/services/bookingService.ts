import { supabase } from '../lib/supabase';
import { isValidUuid } from '../lib/utils';

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
  problemImage?: string; // Base64 string from client
}

export const bookingService = {
  /**
   * Uploads a base64 image to Supabase Storage
   */
  async uploadBookingImage(base64Data: string, userId: string): Promise<string | null> {
    try {
      if (!base64Data || !base64Data.startsWith('data:image')) return null;

      // Extract base64 content
      const base64Content = base64Data.split(',')[1];
      const mimeType = base64Data.split(';')[0].split(':')[1];
      const extension = mimeType.split('/')[1];
      
      // Convert base64 to Blob
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      const fileName = `${userId}-${Date.now()}.${extension}`;
      const filePath = `booking-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('bookings')
        .upload(filePath, blob, {
          contentType: mimeType,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('bookings')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading booking image:', error);
      return null;
    }
  },

  /**
   * Ensures a user profile exists in the users_profile table
   */
  async ensureUserProfile(user: { id: string; email?: string; user_metadata?: any }) {
    try {
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
        }
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
    }
  },

  /**
   * Submits a new booking to the database
   */
  async createBooking(data: BookingData) {
    let actualServiceId = isValidUuid(data.serviceId) ? data.serviceId : null;
    let actualProviderId = isValidUuid(data.providerId) ? data.providerId : null;

    // Upload image if provided
    let imageUrl = null;
    if (data.problemImage) {
      try {
        imageUrl = await this.uploadBookingImage(data.problemImage, data.userId);
      } catch (uploadError) {
        console.warn('Image upload failed, proceeding without image:', uploadError);
        // We don't throw here, just proceed without the image
      }
    }

    // If we have a UUID, check if it actually exists in the database
    // to avoid foreign key constraint errors during demo/testing
    if (actualServiceId) {
      try {
        const { data: serviceExists } = await supabase
          .from('services')
          .select('id')
          .eq('id', actualServiceId)
          .single();
        
        if (!serviceExists) {
          console.warn(`Service ID ${actualServiceId} not found in database. Setting to null for demo booking.`);
          actualServiceId = null;
        }
      } catch (error) {
        console.warn('Error checking service existence:', error);
        actualServiceId = null;
      }
    }

    if (actualProviderId) {
      try {
        const { data: providerExists } = await supabase
          .from('service_providers')
          .select('id')
          .eq('id', actualProviderId)
          .single();
        
        if (!providerExists) {
          console.warn(`Provider ID ${actualProviderId} not found in database. Setting to null for demo booking.`);
          actualProviderId = null;
        }
      } catch (error) {
        console.warn('Error checking provider existence:', error);
        actualProviderId = null;
      }
    }

    const bookingPayload: any = {
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
    };

    // Only add image_url if we successfully got one
    if (imageUrl) {
      bookingPayload.image_url = imageUrl;
    }

    let { data: result, error } = await supabase.from('bookings').insert(bookingPayload).select().single();

    if (error) {
      console.error('Booking submission error:', error);
      
      // If the error is about the image_url column missing, try again without it
      if (error.message.includes('image_url') && bookingPayload.image_url) {
        console.warn('image_url column missing in bookings table. Retrying without image.');
        delete bookingPayload.image_url;
        const retry = await supabase.from('bookings').insert(bookingPayload).select().single();
        if (retry.error) throw retry.error;
        return retry.data;
      }

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
