import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          microsoft_id: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: string;
          microsoft_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          name?: string;
          role?: string;
          microsoft_id?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: string;
          manager_id: string | null;
          sharepoint_site_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: string;
          manager_id?: string | null;
          sharepoint_site_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          status?: string;
          manager_id?: string | null;
          sharepoint_site_url?: string | null;
          updated_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          assignee_id: string | null;
          project_id: string | null;
          status: string;
          priority: string;
          due_date: string | null;
          sharepoint_url: string | null;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          assignee_id?: string | null;
          project_id?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          sharepoint_url?: string | null;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          assignee_id?: string | null;
          project_id?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          sharepoint_url?: string | null;
          progress?: number;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          title: string;
          content: string | null;
          file_path: string | null;
          file_type: string | null;
          file_size: number | null;
          sharepoint_url: string | null;
          project_id: string | null;
          uploaded_by: string | null;
          embedding: number[] | null;
          metadata: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: string | null;
          file_path?: string | null;
          file_type?: string | null;
          file_size?: number | null;
          sharepoint_url?: string | null;
          project_id?: string | null;
          uploaded_by?: string | null;
          embedding?: number[] | null;
          metadata?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string | null;
          file_path?: string | null;
          file_type?: string | null;
          file_size?: number | null;
          sharepoint_url?: string | null;
          project_id?: string | null;
          uploaded_by?: string | null;
          embedding?: number[] | null;
          metadata?: any | null;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string | null;
          message: string;
          response: string;
          sources: any | null;
          session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          message: string;
          response: string;
          sources?: any | null;
          session_id?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          message?: string;
          response?: string;
          sources?: any | null;
          session_id?: string | null;
        };
      };
    };
  };
};