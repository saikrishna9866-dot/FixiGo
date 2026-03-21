import { supabase } from '../lib/supabase';

export interface ProfessionalData {
  userId: string;
  serviceId: string | null;
  name: string;
  email: string;
  phone: string;
  experience: string;
  address: string;
  city: string;
  pincode: string;
  availability: any;
}

export const professionalService = {
  /**
   * Validates if a string is a valid UUID
   */
  isUuid(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  },

  /**
   * Registers a new service provider
   */
  async registerProfessional(data: ProfessionalData) {
    // Sanitize serviceId - if it's not a valid UUID (mock data), set to null
    const sanitizedServiceId = data.serviceId && this.isUuid(data.serviceId) ? data.serviceId : null;

    const { data: result, error } = await supabase.from('service_providers').insert({
      user_id: data.userId, // Link to the authenticated user
      service_id: sanitizedServiceId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      experience: data.experience,
      address: `${data.address}, ${data.city} - ${data.pincode}`,
      availability: data.availability
    }).select().single();

    if (error) {
      console.error('Professional registration error:', error);
      
      // Removed the 23505 check as we now allow multiple registrations
      
      if (error.message.includes('uuid')) {
        throw new Error('Invalid ID format. Please ensure you are using real service data.');
      }

      throw error;
    }

    return result;
  }
};
