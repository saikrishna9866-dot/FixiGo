import { supabase } from '../lib/supabase';
import { isValidUuid } from '../lib/utils';

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
   * Registers a new service provider
   */
  async registerProfessional(data: ProfessionalData) {
    if (!data.serviceId || !isValidUuid(data.serviceId)) {
      throw new Error('Invalid or missing Service ID. Please select a valid service.');
    }

    try {
      const { data: result, error } = await supabase.from('service_providers').insert({
        user_id: data.userId, // Link to the authenticated user
        service_id: data.serviceId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        experience: data.experience,
        address: `${data.address}, ${data.city} - ${data.pincode}`,
        availability: data.availability
      }).select().single();

      if (error) {
        console.error('Professional registration error:', error);
        
        if (error.message.includes('uuid')) {
          throw new Error('Invalid ID format. Please ensure you are using real service data.');
        }

        throw error;
      }

      return result;
    } catch (error) {
      console.error('Error in registerProfessional:', error);
      throw error;
    }
  },

  /**
   * Checks if a user is already a professional
   */
  async isProfessional(userId: string) {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking professional status:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error in isProfessional:', error);
      return false;
    }
  }
};
