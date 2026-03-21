export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users_profile: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          address: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string | null
          category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url?: string | null
          category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          category_id?: string
          created_at?: string
        }
      }
      service_providers: {
        Row: {
          id: string
          user_id: string | null
          service_id: string | null
          name: string
          email: string
          phone: string | null
          experience: string | null
          address: string | null
          rating: number | null
          availability: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          service_id?: string | null
          name: string
          email: string
          phone?: string | null
          experience?: string | null
          address?: string | null
          rating?: number | null
          availability?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          service_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          experience?: string | null
          address?: string | null
          rating?: number | null
          availability?: Json | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          service_id: string
          provider_id: string
          status: 'pending' | 'accepted' | 'completed'
          created_at: string
          address?: string
          city?: string
          pincode?: string
          landmark?: string
          booking_date?: string
          booking_time?: string
          problem_description?: string
          total_price?: number
          payment_method?: string
          is_urgent?: boolean
        }
        Insert: {
          id?: string
          user_id: string
          service_id: string
          provider_id: string
          status?: 'pending' | 'accepted' | 'completed'
          created_at?: string
          address?: string
          city?: string
          pincode?: string
          landmark?: string
          booking_date?: string
          booking_time?: string
          problem_description?: string
          total_price?: number
          payment_method?: string
          is_urgent?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string
          provider_id?: string
          status?: 'pending' | 'accepted' | 'completed'
          created_at?: string
          address?: string
          city?: string
          pincode?: string
          landmark?: string
          booking_date?: string
          booking_time?: string
          problem_description?: string
          total_price?: number
          payment_method?: string
          is_urgent?: boolean
        }
      }
    }
  }
}
