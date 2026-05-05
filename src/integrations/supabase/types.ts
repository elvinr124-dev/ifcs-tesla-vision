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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_knowledge_entries: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          keywords: string[]
          nav_buttons: Json
          response: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          keywords?: string[]
          nav_buttons?: Json
          response?: string
          title?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          keywords?: string[]
          nav_buttons?: Json
          response?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          application_data: Json | null
          application_id: string
          attendance: string | null
          auth_option: string | null
          card_last_four: string | null
          cell_phone: string | null
          client_email: string
          country: string | null
          created_at: string
          degrees: string | null
          delivery_options: Json | null
          dob: string
          evaluator: string | null
          first_name: string
          gender: string | null
          home_phone: string | null
          id: string
          ifcs_id: string | null
          institution_name: string | null
          last_name: string
          middle_name: string | null
          note_send_to: string | null
          payment_method: string | null
          price: number | null
          processing_label: string | null
          processing_time: string | null
          purpose: string | null
          receipt_url: string | null
          service_title: string | null
          staff_notes: string | null
          status: string | null
          total_price: number | null
          translation_option: string | null
          verification_source: string | null
        }
        Insert: {
          application_data?: Json | null
          application_id: string
          attendance?: string | null
          auth_option?: string | null
          card_last_four?: string | null
          cell_phone?: string | null
          client_email: string
          country?: string | null
          created_at?: string
          degrees?: string | null
          delivery_options?: Json | null
          dob: string
          evaluator?: string | null
          first_name: string
          gender?: string | null
          home_phone?: string | null
          id?: string
          ifcs_id?: string | null
          institution_name?: string | null
          last_name: string
          middle_name?: string | null
          note_send_to?: string | null
          payment_method?: string | null
          price?: number | null
          processing_label?: string | null
          processing_time?: string | null
          purpose?: string | null
          receipt_url?: string | null
          service_title?: string | null
          staff_notes?: string | null
          status?: string | null
          total_price?: number | null
          translation_option?: string | null
          verification_source?: string | null
        }
        Update: {
          application_data?: Json | null
          application_id?: string
          attendance?: string | null
          auth_option?: string | null
          card_last_four?: string | null
          cell_phone?: string | null
          client_email?: string
          country?: string | null
          created_at?: string
          degrees?: string | null
          delivery_options?: Json | null
          dob?: string
          evaluator?: string | null
          first_name?: string
          gender?: string | null
          home_phone?: string | null
          id?: string
          ifcs_id?: string | null
          institution_name?: string | null
          last_name?: string
          middle_name?: string | null
          note_send_to?: string | null
          payment_method?: string | null
          price?: number | null
          processing_label?: string | null
          processing_time?: string | null
          purpose?: string | null
          receipt_url?: string | null
          service_title?: string | null
          staff_notes?: string | null
          status?: string | null
          total_price?: number | null
          translation_option?: string | null
          verification_source?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          client_display_name: string
          client_identifier: string
          created_at: string
          id: string
          staff_identifier: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_display_name?: string
          client_identifier: string
          created_at?: string
          id?: string
          staff_identifier?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_display_name?: string
          client_identifier?: string
          created_at?: string
          id?: string
          staff_identifier?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          sender_name: string
          sender_type: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          sender_name?: string
          sender_type: string
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          sender_name?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_accounts: {
        Row: {
          app_code: string | null
          created_at: string
          email: string
          first_name: string
          gender: string | null
          id: string
          last_name: string
          password_hash: string
        }
        Insert: {
          app_code?: string | null
          created_at?: string
          email: string
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          password_hash: string
        }
        Update: {
          app_code?: string | null
          created_at?: string
          email?: string
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          password_hash?: string
        }
        Relationships: []
      }
      client_orders: {
        Row: {
          application_id: string | null
          client_email: string
          created_at: string
          dob: string | null
          id: string
          ifcs_id: string | null
          reference_id: string
          requirements: Json | null
          service: string
          staff_note: string | null
          status: string
          submitted_at: string
          updated_at: string
          verification_source: string | null
        }
        Insert: {
          application_id?: string | null
          client_email: string
          created_at?: string
          dob?: string | null
          id?: string
          ifcs_id?: string | null
          reference_id: string
          requirements?: Json | null
          service?: string
          staff_note?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          verification_source?: string | null
        }
        Update: {
          application_id?: string | null
          client_email?: string
          created_at?: string
          dob?: string | null
          id?: string
          ifcs_id?: string | null
          reference_id?: string
          requirements?: Json | null
          service?: string
          staff_note?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          verification_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_orders_client_email_fkey"
            columns: ["client_email"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["email"]
          },
        ]
      }
      evaluation_reports: {
        Row: {
          access_token: string | null
          applicant_email: string
          applicant_name: string
          created_at: string | null
          evaluation_type: string
          expiry_date: string | null
          id: string
          reference_id: string
          report_file_url: string | null
          shared_to_edu: boolean | null
          shared_to_email: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          applicant_email: string
          applicant_name: string
          created_at?: string | null
          evaluation_type: string
          expiry_date?: string | null
          id?: string
          reference_id: string
          report_file_url?: string | null
          shared_to_edu?: boolean | null
          shared_to_email?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          applicant_email?: string
          applicant_name?: string
          created_at?: string | null
          evaluation_type?: string
          expiry_date?: string | null
          id?: string
          reference_id?: string
          report_file_url?: string | null
          shared_to_edu?: boolean | null
          shared_to_email?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          address: string
          applicant_email: string
          city: string
          country: string
          cover_letter_url: string | null
          created_at: string
          education: string
          first_name: string
          how_heard: string
          id: string
          job_id: string
          languages: string
          last_name: string
          phone: string
          referred_by_employee: boolean | null
          resume_url: string | null
          skills: string
          start_date: string
          status: string
          updated_at: string
          work_experience: string
          zip: string
        }
        Insert: {
          address?: string
          applicant_email: string
          city?: string
          country?: string
          cover_letter_url?: string | null
          created_at?: string
          education?: string
          first_name: string
          how_heard?: string
          id?: string
          job_id: string
          languages?: string
          last_name: string
          phone?: string
          referred_by_employee?: boolean | null
          resume_url?: string | null
          skills?: string
          start_date?: string
          status?: string
          updated_at?: string
          work_experience?: string
          zip?: string
        }
        Update: {
          address?: string
          applicant_email?: string
          city?: string
          country?: string
          cover_letter_url?: string | null
          created_at?: string
          education?: string
          first_name?: string
          how_heard?: string
          id?: string
          job_id?: string
          languages?: string
          last_name?: string
          phone?: string
          referred_by_employee?: boolean | null
          resume_url?: string | null
          skills?: string
          start_date?: string
          status?: string
          updated_at?: string
          work_experience?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          location: string
          requirements: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          location?: string
          requirements?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          location?: string
          requirements?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_codes: {
        Row: {
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          used?: boolean | null
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          amount: number
          application_ref: string
          card_last_four: string
          client_email: string
          created_at: string
          id: string
          label: string
          paid_at: string | null
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          amount?: number
          application_ref?: string
          card_last_four?: string
          client_email: string
          created_at?: string
          id?: string
          label?: string
          paid_at?: string | null
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          application_ref?: string
          card_last_four?: string
          client_email?: string
          created_at?: string
          id?: string
          label?: string
          paid_at?: string | null
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
