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
      users: {
        Row: {
          id: string
          email: string
          username: string
          avatar_color: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          avatar_color?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_color?: string
          created_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          completed_at: string
          points_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          completed_at?: string
          points_earned?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          completed_at?: string
          points_earned?: number
          created_at?: string
        }
      }
      streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          last_workout_date: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_workout_date?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_workout_date?: string | null
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          week_start_date: string
          target_workouts: number
          completed_workouts: number
          achieved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start_date: string
          target_workouts?: number
          completed_workouts?: number
          achieved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start_date?: string
          target_workouts?: number
          completed_workouts?: number
          achieved?: boolean
          created_at?: string
        }
      }
      milestones: {
        Row: {
          id: string
          user_id: string
          milestone_type: string
          milestone_value: number
          achieved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          milestone_type: string
          milestone_value: number
          achieved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          milestone_type?: string
          milestone_value?: number
          achieved_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          notification_type: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notification_type: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notification_type?: string
          message?: string
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}
