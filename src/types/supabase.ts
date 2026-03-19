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
          created_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
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
          category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          category_id?: string
          created_at?: string
        }
      }
      service_providers: {
        Row: {
          id: string
          name: string
          email: string
          service_id: string
          created_at: string
          rating?: number
          experience?: string
          phone?: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          service_id: string
          created_at?: string
          rating?: number
          experience?: string
          phone?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          service_id?: string
          created_at?: string
          rating?: number
          experience?: string
          phone?: string
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
