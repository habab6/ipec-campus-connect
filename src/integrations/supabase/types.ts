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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_current: boolean | null
          start_date: string
          year: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_current?: boolean | null
          start_date: string
          year: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_current?: boolean | null
          start_date?: string
          year?: string
        }
        Relationships: []
      }
      credit_notes: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          number: string
          original_invoice_id: string
          reason: string
          student_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          id?: string
          number: string
          original_invoice_id: string
          reason: string
          student_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          number?: string
          original_invoice_id?: string
          reason?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_original_invoice_id_fkey"
            columns: ["original_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          academic_year: string | null
          amount: number
          created_at: string
          generate_date: string
          id: string
          number: string
          payment_id: string
          student_id: string
          study_year: number | null
          type: string
        }
        Insert: {
          academic_year?: string | null
          amount: number
          created_at?: string
          generate_date?: string
          id?: string
          number: string
          payment_id: string
          student_id: string
          study_year?: number | null
          type: string
        }
        Update: {
          academic_year?: string | null
          amount?: number
          created_at?: string
          generate_date?: string
          id?: string
          number?: string
          payment_id?: string
          student_id?: string
          study_year?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_installments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          paid_date: string
          payment_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: string
          paid_date: string
          payment_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          paid_date?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_installments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          academic_year: string | null
          amount: number
          created_at: string
          description: string
          due_date: string
          id: string
          invoice_date: string | null
          invoice_number: string | null
          method: string | null
          paid_date: string | null
          refund_date: string | null
          refund_method: string | null
          refund_reason: string | null
          status: string
          student_id: string
          study_year: number | null
          type: string
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          amount: number
          created_at?: string
          description: string
          due_date: string
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          method?: string | null
          paid_date?: string | null
          refund_date?: string | null
          refund_method?: string | null
          refund_reason?: string | null
          status?: string
          student_id: string
          study_year?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          amount?: number
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          method?: string | null
          paid_date?: string | null
          refund_date?: string | null
          refund_method?: string | null
          refund_reason?: string | null
          status?: string
          student_id?: string
          study_year?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          role: string | null
          student_id: string | null
          student_reference: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          role?: string | null
          student_id?: string | null
          student_reference?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string | null
          student_id?: string | null
          student_reference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_attestations: {
        Row: {
          academic_year: string
          created_at: string
          generate_date: string
          generated_at: string | null
          id: string
          is_duplicate: boolean | null
          is_generated: boolean | null
          notes: string | null
          number: string
          original_attestation_id: string | null
          program: string
          registration_date: string | null
          specialty: string
          student_birth_city: string | null
          student_birth_country: string | null
          student_birth_date: string | null
          student_full_name: string | null
          student_id: string
          student_nationality: string | null
          student_reference: string | null
          study_year: number
        }
        Insert: {
          academic_year: string
          created_at?: string
          generate_date?: string
          generated_at?: string | null
          id?: string
          is_duplicate?: boolean | null
          is_generated?: boolean | null
          notes?: string | null
          number: string
          original_attestation_id?: string | null
          program: string
          registration_date?: string | null
          specialty: string
          student_birth_city?: string | null
          student_birth_country?: string | null
          student_birth_date?: string | null
          student_full_name?: string | null
          student_id: string
          student_nationality?: string | null
          student_reference?: string | null
          study_year: number
        }
        Update: {
          academic_year?: string
          created_at?: string
          generate_date?: string
          generated_at?: string | null
          id?: string
          is_duplicate?: boolean | null
          is_generated?: boolean | null
          notes?: string | null
          number?: string
          original_attestation_id?: string | null
          program?: string
          registration_date?: string | null
          specialty?: string
          student_birth_city?: string | null
          student_birth_country?: string | null
          student_birth_date?: string | null
          student_full_name?: string | null
          student_id?: string
          student_nationality?: string | null
          student_reference?: string | null
          study_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "registration_attestations_original_attestation_id_fkey"
            columns: ["original_attestation_id"]
            isOneToOne: false
            referencedRelation: "registration_attestations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_attestations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_academic_history: {
        Row: {
          academic_year: string
          created_at: string
          id: string
          passed_to_next_year: boolean | null
          program: string
          specialty: string
          status: string
          student_id: string
          study_year: number
          updated_at: string
        }
        Insert: {
          academic_year: string
          created_at?: string
          id?: string
          passed_to_next_year?: boolean | null
          program: string
          specialty: string
          status: string
          student_id: string
          study_year: number
          updated_at?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          id?: string
          passed_to_next_year?: boolean | null
          program?: string
          specialty?: string
          status?: string
          student_id?: string
          study_year?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_academic_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academic_year: string
          address: string
          city_of_birth: string
          civilite: string
          country_of_birth: string
          created_at: string
          date_of_birth: string
          email: string
          first_name: string
          has_mba2_diploma: boolean | null
          id: string
          identity_number: string
          last_name: string
          nationality: string
          notes: string | null
          phone: string
          program: string
          reference: string
          registration_date: string
          registration_year: number
          specialty: string
          status: string
          study_year: number
          updated_at: string
        }
        Insert: {
          academic_year: string
          address: string
          city_of_birth: string
          civilite: string
          country_of_birth: string
          created_at?: string
          date_of_birth: string
          email: string
          first_name: string
          has_mba2_diploma?: boolean | null
          id?: string
          identity_number: string
          last_name: string
          nationality: string
          notes?: string | null
          phone: string
          program: string
          reference: string
          registration_date?: string
          registration_year: number
          specialty: string
          status?: string
          study_year: number
          updated_at?: string
        }
        Update: {
          academic_year?: string
          address?: string
          city_of_birth?: string
          civilite?: string
          country_of_birth?: string
          created_at?: string
          date_of_birth?: string
          email?: string
          first_name?: string
          has_mba2_diploma?: boolean | null
          id?: string
          identity_number?: string
          last_name?: string
          nationality?: string
          notes?: string | null
          phone?: string
          program?: string
          reference?: string
          registration_date?: string
          registration_year?: number
          specialty?: string
          status?: string
          study_year?: number
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
