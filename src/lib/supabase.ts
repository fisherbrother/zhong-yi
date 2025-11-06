import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          username: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      formulas: {
        Row: {
          id: string
          name: string
          composition: string
          dosage: string | null
          decoction_method: string | null
          efficacy: string | null
          indications: string | null
          source: string | null
          category: string | null
          syndrome: string | null
          disease_type: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['formulas']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['formulas']['Insert']>
      }
      herbs: {
        Row: {
          id: string
          name: string
          nature_flavor: string | null
          meridian_tropism: string | null
          efficacy: string | null
          usage_dosage: string | null
          contraindications: string | null
          image_url: string | null
          category: string | null
          property: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['herbs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['herbs']['Insert']>
      }
      meridians: {
        Row: {
          id: string
          name: string
          type: 'regular' | 'extraordinary'
          pathway: string | null
          main_functions: string | null
          associated_organs: string | null
          flow_points: any | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['meridians']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['meridians']['Insert']>
      }
      acupoints: {
        Row: {
          id: string
          meridian_id: string
          name: string
          location: string
          location_method: string | null
          indications: string | null
          needle_depth: string | null
          manipulation: string | null
          coordinates_3d: any | null
          anatomical_landmarks: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['acupoints']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['acupoints']['Insert']>
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          item_type: 'formula' | 'herb' | 'acupoint'
          item_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['favorites']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['favorites']['Insert']>
      }
      notes: {
        Row: {
          id: string
          user_id: string
          item_type: string
          item_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['notes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['notes']['Insert']>
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Formula = Tables<'formulas'>
export type Herb = Tables<'herbs'>
export type Meridian = Tables<'meridians'>
export type Acupoint = Tables<'acupoints'>
export type Favorite = Tables<'favorites'>
export type Note = Tables<'notes'>