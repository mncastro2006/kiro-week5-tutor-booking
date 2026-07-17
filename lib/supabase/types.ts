// Hand-written types mirroring supabase/migrations/20260717000001_initial_schema.sql.
// If the schema changes, regenerate with:
//   npx supabase gen types typescript --local > lib/supabase/types.ts
// (then re-add this header comment).

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
export type UserRole = 'student' | 'tutor' | 'admin';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          email: string;
          subjects: string[];
          bio: string;
          created_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name?: string;
          email?: string;
          subjects?: string[];
          bio?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          email?: string;
          subjects?: string[];
          bio?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      availability: {
        Row: {
          id: string;
          tutor_id: string;
          day_of_week: number | null;
          specific_date: string | null;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          day_of_week?: number | null;
          specific_date?: string | null;
          start_time: string;
          end_time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          day_of_week?: number | null;
          specific_date?: string | null;
          start_time?: string;
          end_time?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'availability_tutor_id_fkey';
            columns: ['tutor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      bookings: {
        Row: {
          id: string;
          student_id: string;
          tutor_id: string;
          subject: string;
          start_at: string;
          end_at: string;
          status: BookingStatus;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          tutor_id: string;
          subject: string;
          start_at: string;
          end_at: string;
          status?: BookingStatus;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          tutor_id?: string;
          subject?: string;
          start_at?: string;
          end_at?: string;
          status?: BookingStatus;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_tutor_id_fkey';
            columns: ['tutor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Availability = Database['public']['Tables']['availability']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
