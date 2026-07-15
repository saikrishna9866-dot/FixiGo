import { supabase } from '../lib/supabase';
import { isValidUuid } from '../lib/utils';

export interface BookingData {
  serviceId: string;
  serviceTitle?: string;
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
      const { data: profile, error } = await supabase
        .from('users_profile')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!profile) {
        // Generate a fallback email if it's missing (e.g. for guest)
        const fallbackEmail = user.email || `guest_${user.id.substring(0, 8)}@example.com`;
        
        // Handle uniqueness collision: try to find if email exists
        const { data: existingEmail } = await supabase
          .from('users_profile')
          .select('id')
          .eq('email', fallbackEmail)
          .maybeSingle();
          
        let finalEmail = fallbackEmail;
        if (existingEmail && existingEmail.id !== user.id) {
            finalEmail = `guest_${user.id.substring(0, 8)}_${Date.now()}@example.com`;
        }
        
        const { error: insertError } = await supabase.from('users_profile').insert({
          id: user.id,
          email: finalEmail,
          full_name: user.user_metadata?.name || 'User',
        });
        
        if (insertError) {
          console.error('Error creating user profile:', insertError);
          throw insertError;
        }
      }
    } catch (error: any) {
      console.error('Error in ensureUserProfile details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
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
    if (actualServiceId) {
      const { data: serviceExists, error: serviceError } = await supabase
        .from('services')
        .select('id, title')
        .eq('id', actualServiceId)
        .maybeSingle();

      if (serviceError) {
        throw new Error(`Database error when checking service: ${serviceError.message}`);
      }

      if (!serviceExists) {
        throw new Error(`Service ID ${actualServiceId} not found in database.`);
      }
    } else {
      throw new Error(`Invalid or missing Service ID.`);
    }

    if (actualProviderId) {
      const { data: providerExists, error: providerError } = await supabase
        .from('service_providers')
        .select('id')
        .eq('id', actualProviderId)
        .maybeSingle();

      if (providerError) {
        throw new Error(`Database error when checking provider: ${providerError.message}`);
      }

      if (!providerExists) {
        // Since providers are optional (unassigned booking), we don't block the booking but we unset the providerId.
        actualProviderId = null;
      }
    }

    // Generate a unique track order number
    const trackOrderNumber = `FXG-${Math.floor(1000 + Math.random() * 9000)}`;

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
      track_order_number: trackOrderNumber,
      status: 'pending'
    };

    // Only add image_url if we successfully got one
    if (imageUrl) {
      bookingPayload.image_url = imageUrl;
    }

    try {
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

        throw error;
      }

      return result;
    } catch (error: any) {
      console.error('Catch block in createBooking:', error);
      throw error;
    }
  }
};
