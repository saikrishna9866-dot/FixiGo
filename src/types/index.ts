export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Service {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  categories?: {
    name: string;
  };
}

export interface ServiceProvider {
  id: string;
  service_id: string;
  name: string;
  email: string;
  phone: string | null;
  experience: string | null;
  address: string | null;
  availability: any; // JSONB
  created_at: string;
  services?: {
    title: string;
  };
}

export interface Booking {
  id: string;
  service_id: string;
  provider_id: string | null;
  user_id: string | null;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  address: string;
  city: string;
  pincode: string;
  landmark?: string;
  booking_date: string;
  booking_time: string;
  problem_description: string | null;
  total_price: number | null;
  created_at: string;
  services?: {
    title: string;
  };
  service_providers?: {
    name: string;
  };
  users_profile?: {
    email: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  service_type: string;
  message: string;
  reply: string | null;
  status: 'pending' | 'replied';
  created_at: string;
}
