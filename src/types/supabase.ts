export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  freight: {
    Tables: {
      api_keys: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          key: string
          last_used_at: string | null
          name: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          key: string
          last_used_at?: string | null
          name?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          key?: string
          last_used_at?: string | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carrier_gamification: {
        Row: {
          badges: string[]
          carrier_id: string
          created_at: string
          id: string
          level: number
          updated_at: string
          xp: number
        }
        Insert: {
          badges?: string[]
          carrier_id: string
          created_at?: string
          id?: string
          level?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          badges?: string[]
          carrier_id?: string
          created_at?: string
          id?: string
          level?: number
          updated_at?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "carrier_gamification_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carrier_highlights: {
        Row: {
          auto_renew: boolean
          carrier_id: string
          created_at: string | null
          ends_at: string | null
          id: string
          payment_id: string | null
          plan_type: string
          started_at: string
        }
        Insert: {
          auto_renew?: boolean
          carrier_id: string
          created_at?: string | null
          ends_at?: string | null
          id?: string
          payment_id?: string | null
          plan_type: string
          started_at?: string
        }
        Update: {
          auto_renew?: boolean
          carrier_id?: string
          created_at?: string | null
          ends_at?: string | null
          id?: string
          payment_id?: string | null
          plan_type?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carrier_highlights_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carrier_ncm_certifications: {
        Row: {
          carrier_id: string
          certification_number: string | null
          certification_type: string
          created_at: string | null
          id: string
          ncm_classification_id: string
          valid_until: string | null
          verified: boolean | null
        }
        Insert: {
          carrier_id: string
          certification_number?: string | null
          certification_type: string
          created_at?: string | null
          id?: string
          ncm_classification_id: string
          valid_until?: string | null
          verified?: boolean | null
        }
        Update: {
          carrier_id?: string
          certification_number?: string | null
          certification_type?: string
          created_at?: string | null
          id?: string
          ncm_classification_id?: string
          valid_until?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "carrier_ncm_certifications_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrier_ncm_certifications_ncm_classification_id_fkey"
            columns: ["ncm_classification_id"]
            isOneToOne: false
            referencedRelation: "ncm_classifications"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          cargo_description: string | null
          cargo_type: string | null
          carrier_id: string
          created_at: string | null
          day_of_month: number | null
          day_of_week: number | null
          destination_city: string
          destination_state: string
          end_date: string | null
          frequency: string
          id: string
          notes: string | null
          origin_city: string
          origin_state: string
          price: number
          shipper_id: string
          start_date: string
          status: string
          updated_at: string | null
          volume_m3: number | null
          weight_kg: number | null
        }
        Insert: {
          cargo_description?: string | null
          cargo_type?: string | null
          carrier_id: string
          created_at?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          destination_city: string
          destination_state: string
          end_date?: string | null
          frequency: string
          id?: string
          notes?: string | null
          origin_city: string
          origin_state: string
          price?: number
          shipper_id: string
          start_date: string
          status?: string
          updated_at?: string | null
          volume_m3?: number | null
          weight_kg?: number | null
        }
        Update: {
          cargo_description?: string | null
          cargo_type?: string | null
          carrier_id?: string
          created_at?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          destination_city?: string
          destination_state?: string
          end_date?: string | null
          frequency?: string
          id?: string
          notes?: string | null
          origin_city?: string
          origin_state?: string
          price?: number
          shipper_id?: string
          start_date?: string
          status?: string
          updated_at?: string | null
          volume_m3?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_shipper_id_fkey"
            columns: ["shipper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          carrier_id: string
          created_at: string | null
          document_type: string
          expiry_date: string | null
          file_name: string | null
          file_url: string
          id: string
          order_id: string | null
          verified: boolean | null
        }
        Insert: {
          carrier_id: string
          created_at?: string | null
          document_type: string
          expiry_date?: string | null
          file_name?: string | null
          file_url: string
          id?: string
          order_id?: string | null
          verified?: boolean | null
        }
        Update: {
          carrier_id?: string
          created_at?: string | null
          document_type?: string
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string
          id?: string
          order_id?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          active: boolean | null
          carrier_id: string
          cnh_expiry: string | null
          cnh_number: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          carrier_id: string
          cnh_expiry?: string | null
          cnh_number?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          carrier_id?: string
          cnh_expiry?: string | null
          cnh_number?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet: {
        Row: {
          capacity_kg: number | null
          capacity_m3: number | null
          carrier_id: string
          created_at: string | null
          has_gps: boolean | null
          id: string
          model: string | null
          plate: string
          status: string | null
          updated_at: string | null
          vehicle_type: string | null
          year: number | null
        }
        Insert: {
          capacity_kg?: number | null
          capacity_m3?: number | null
          carrier_id: string
          created_at?: string | null
          has_gps?: boolean | null
          id?: string
          model?: string | null
          plate: string
          status?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
          year?: number | null
        }
        Update: {
          capacity_kg?: number | null
          capacity_m3?: number | null
          carrier_id?: string
          created_at?: string | null
          has_gps?: boolean | null
          id?: string
          model?: string | null
          plate?: string
          status?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fleet_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      freight_tables: {
        Row: {
          active: boolean | null
          cargo_type: string | null
          carrier_id: string
          created_at: string | null
          id: string
          max_weight_kg: number | null
          min_price: number | null
          name: string
          price_per_kg: number | null
          price_per_km: number | null
          price_per_m3: number | null
          route_id: string | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean | null
          cargo_type?: string | null
          carrier_id: string
          created_at?: string | null
          id?: string
          max_weight_kg?: number | null
          min_price?: number | null
          name: string
          price_per_kg?: number | null
          price_per_km?: number | null
          price_per_m3?: number | null
          route_id?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean | null
          cargo_type?: string | null
          carrier_id?: string
          created_at?: string | null
          id?: string
          max_weight_kg?: number | null
          min_price?: number | null
          name?: string
          price_per_kg?: number | null
          price_per_km?: number | null
          price_per_m3?: number | null
          route_id?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freight_tables_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freight_tables_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      freight_usage: {
        Row: {
          bids_submitted: number | null
          created_at: string | null
          documents_generated: number | null
          id: string
          month: string
          quotations_created: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bids_submitted?: number | null
          created_at?: string | null
          documents_generated?: number | null
          id?: string
          month: string
          quotations_created?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bids_submitted?: number | null
          created_at?: string | null
          documents_generated?: number | null
          id?: string
          month?: string
          quotations_created?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freight_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ncm_classifications: {
        Row: {
          created_at: string | null
          description: string
          id: string
          max_weight_kg: number | null
          ncm_code: string
          requires_antt: boolean | null
          requires_anvisa: boolean | null
          requires_escort: boolean | null
          requires_exercito: boolean | null
          requires_ibama: boolean | null
          requires_insurance: boolean | null
          requires_tracking: boolean | null
          risk_level: string
          updated_at: string | null
          value_density_factor: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          max_weight_kg?: number | null
          ncm_code: string
          requires_antt?: boolean | null
          requires_anvisa?: boolean | null
          requires_escort?: boolean | null
          requires_exercito?: boolean | null
          requires_ibama?: boolean | null
          requires_insurance?: boolean | null
          requires_tracking?: boolean | null
          risk_level?: string
          updated_at?: string | null
          value_density_factor?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          max_weight_kg?: number | null
          ncm_code?: string
          requires_antt?: boolean | null
          requires_anvisa?: boolean | null
          requires_escort?: boolean | null
          requires_exercito?: boolean | null
          requires_ibama?: boolean | null
          requires_insurance?: boolean | null
          requires_tracking?: boolean | null
          risk_level?: string
          updated_at?: string | null
          value_density_factor?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          read: boolean | null
          reference_id: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read?: boolean | null
          reference_id?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read?: boolean | null
          reference_id?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          bid_id: string | null
          carrier_id: string
          created_at: string | null
          delivery_date: string | null
          id: string
          notes: string | null
          pickup_date: string | null
          price: number
          quotation_id: string | null
          shipper_id: string
          status: string | null
          tracking_code: string | null
          updated_at: string | null
        }
        Insert: {
          bid_id?: string | null
          carrier_id: string
          created_at?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          pickup_date?: string | null
          price: number
          quotation_id?: string | null
          shipper_id: string
          status?: string | null
          tracking_code?: string | null
          updated_at?: string | null
        }
        Update: {
          bid_id?: string | null
          carrier_id?: string
          created_at?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          pickup_date?: string | null
          price?: number
          quotation_id?: string | null
          shipper_id?: string
          status?: string | null
          tracking_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "quotation_bids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipper_id_fkey"
            columns: ["shipper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          carrier_amount: number | null
          carrier_id: string
          created_at: string | null
          id: string
          order_id: string
          payment_method: string | null
          platform_fee: number | null
          shipper_id: string
          status: string | null
          stripe_payment_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          carrier_amount?: number | null
          carrier_id: string
          created_at?: string | null
          id?: string
          order_id: string
          payment_method?: string | null
          platform_fee?: number | null
          shipper_id: string
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          carrier_amount?: number | null
          carrier_id?: string
          created_at?: string | null
          id?: string
          order_id?: string
          payment_method?: string | null
          platform_fee?: number | null
          shipper_id?: string
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_shipper_id_fkey"
            columns: ["shipper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          featured_until: string | null
          id: string
          is_featured: boolean
          name: string | null
          phone: string | null
          role: Database["freight"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          featured_until?: string | null
          id: string
          is_featured?: boolean
          name?: string | null
          phone?: string | null
          role?: Database["freight"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          featured_until?: string | null
          id?: string
          is_featured?: boolean
          name?: string | null
          phone?: string | null
          role?: Database["freight"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      quotation_bids: {
        Row: {
          carrier_id: string
          created_at: string | null
          driver_id: string | null
          estimated_days: number | null
          id: string
          notes: string | null
          price: number
          quotation_id: string
          status: string | null
          vehicle_id: string | null
        }
        Insert: {
          carrier_id: string
          created_at?: string | null
          driver_id?: string | null
          estimated_days?: number | null
          id?: string
          notes?: string | null
          price: number
          quotation_id: string
          status?: string | null
          vehicle_id?: string | null
        }
        Update: {
          carrier_id?: string
          created_at?: string | null
          driver_id?: string | null
          estimated_days?: number | null
          id?: string
          notes?: string | null
          price?: number
          quotation_id?: string
          status?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_bids_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_bids_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_bids_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_bids_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          cargo_description: string | null
          cargo_type: string | null
          created_at: string | null
          delivery_date: string | null
          destination_city: string
          destination_state: string
          id: string
          ncm_classification_id: string | null
          origin_city: string
          origin_state: string
          pickup_date: string | null
          price_multiplier: number | null
          risk_level: string | null
          shipper_id: string
          status: string | null
          updated_at: string | null
          volume_m3: number | null
          weight_kg: number | null
        }
        Insert: {
          cargo_description?: string | null
          cargo_type?: string | null
          created_at?: string | null
          delivery_date?: string | null
          destination_city: string
          destination_state: string
          id?: string
          ncm_classification_id?: string | null
          origin_city: string
          origin_state: string
          pickup_date?: string | null
          price_multiplier?: number | null
          risk_level?: string | null
          shipper_id: string
          status?: string | null
          updated_at?: string | null
          volume_m3?: number | null
          weight_kg?: number | null
        }
        Update: {
          cargo_description?: string | null
          cargo_type?: string | null
          created_at?: string | null
          delivery_date?: string | null
          destination_city?: string
          destination_state?: string
          id?: string
          ncm_classification_id?: string | null
          origin_city?: string
          origin_state?: string
          pickup_date?: string | null
          price_multiplier?: number | null
          risk_level?: string | null
          shipper_id?: string
          status?: string | null
          updated_at?: string | null
          volume_m3?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_ncm_classification_id_fkey"
            columns: ["ncm_classification_id"]
            isOneToOne: false
            referencedRelation: "ncm_classifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_shipper_id_fkey"
            columns: ["shipper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          code_used: string
          converted_at: string | null
          created_at: string | null
          id: string
          referred_id: string
          referrer_id: string
          reward_referred: string | null
          reward_referrer: string | null
          rewarded_at: string | null
          status: string
        }
        Insert: {
          code_used: string
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
          reward_referred?: string | null
          reward_referrer?: string | null
          rewarded_at?: string | null
          status?: string
        }
        Update: {
          code_used?: string
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
          reward_referred?: string | null
          reward_referrer?: string | null
          rewarded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          order_id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          order_id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          order_id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          active: boolean | null
          carrier_id: string
          created_at: string | null
          destination_city: string
          destination_state: string
          distance_km: number | null
          id: string
          origin_city: string
          origin_state: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          carrier_id: string
          created_at?: string | null
          destination_city: string
          destination_state: string
          distance_km?: number | null
          id?: string
          origin_city: string
          origin_state: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          carrier_id?: string
          created_at?: string | null
          destination_city?: string
          destination_state?: string
          distance_km?: number | null
          id?: string
          origin_city?: string
          origin_state?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          push_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string
          id: string
          payment_gateway: string | null
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          payment_gateway?: string | null
          plan: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          payment_gateway?: string | null
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          description: string | null
          event_type: string
          id: string
          latitude: number | null
          longitude: number | null
          order_id: string
          photo_url: string | null
          recorded_at: string | null
        }
        Insert: {
          description?: string | null
          event_type: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          order_id: string
          photo_url?: string | null
          recorded_at?: string | null
        }
        Update: {
          description?: string | null
          event_type?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          order_id?: string
          photo_url?: string | null
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_xp: {
        Args: { p_amount: number; p_carrier_id: string }
        Returns: {
          leveled_up: boolean
          new_level: number
          new_xp: number
        }[]
      }
      award_badge: {
        Args: { p_badge: string; p_carrier_id: string }
        Returns: boolean
      }
      count_monthly_bids: { Args: never; Returns: number }
      count_monthly_quotations: { Args: never; Returns: number }
      generate_referral_code: { Args: { p_user_id: string }; Returns: string }
      get_carrier_gamification: {
        Args: { p_carrier_id: string }
        Returns: {
          badges: string[]
          carrier_id: string
          current_level_xp: number
          level: number
          next_level_xp: number
          xp: number
        }[]
      }
      get_level_from_xp: { Args: { p_xp: number }; Returns: number }
      get_referral_stats: {
        Args: { p_user_id: string }
        Returns: {
          converted_referrals: number
          reward_earned: string
          total_referrals: number
        }[]
      }
      get_user_plan: { Args: never; Returns: string }
      increment_usage: {
        Args: {
          p_bids?: number
          p_documents?: number
          p_month: string
          p_quotations?: number
          p_user_id: string
        }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      register_referral: {
        Args: { p_code: string; p_referred_id: string }
        Returns: boolean
      }
      toggle_carrier_featured: {
        Args: { p_carrier_id: string; p_days?: number; p_featured: boolean }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "carrier" | "shipper" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  freight: {
    Enums: {
      user_role: ["carrier", "shipper", "admin"],
    },
  },
} as const
