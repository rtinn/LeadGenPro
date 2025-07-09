import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour TypeScript
export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          title: string | null;
          company: string | null;
          source: string;
          score: number;
          status: 'hot' | 'warm' | 'cold';
          phone: string | null;
          linkedin_url: string | null;
          website: string | null;
          industry: string | null;
          company_size: string | null;
          location: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          title?: string | null;
          company?: string | null;
          source?: string;
          score?: number;
          status?: 'hot' | 'warm' | 'cold';
          phone?: string | null;
          linkedin_url?: string | null;
          website?: string | null;
          industry?: string | null;
          company_size?: string | null;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          title?: string | null;
          company?: string | null;
          source?: string;
          score?: number;
          status?: 'hot' | 'warm' | 'cold';
          phone?: string | null;
          linkedin_url?: string | null;
          website?: string | null;
          industry?: string | null;
          company_size?: string | null;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_campaigns: {
        Row: {
          id: string;
          name: string;
          subject: string;
          content: string;
          status: 'draft' | 'active' | 'completed' | 'paused';
          sent_count: number;
          open_rate: number;
          click_rate: number;
          reply_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subject: string;
          content: string;
          status?: 'draft' | 'active' | 'completed' | 'paused';
          sent_count?: number;
          open_rate?: number;
          click_rate?: number;
          reply_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subject?: string;
          content?: string;
          status?: 'draft' | 'active' | 'completed' | 'paused';
          sent_count?: number;
          open_rate?: number;
          click_rate?: number;
          reply_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_logs: {
        Row: {
          id: string;
          campaign_id: string | null;
          lead_id: string | null;
          sent_at: string;
          opened_at: string | null;
          clicked_at: string | null;
          replied_at: string | null;
          status: 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced';
        };
        Insert: {
          id?: string;
          campaign_id?: string | null;
          lead_id?: string | null;
          sent_at?: string;
          opened_at?: string | null;
          clicked_at?: string | null;
          replied_at?: string | null;
          status?: 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced';
        };
        Update: {
          id?: string;
          campaign_id?: string | null;
          lead_id?: string | null;
          sent_at?: string;
          opened_at?: string | null;
          clicked_at?: string | null;
          replied_at?: string | null;
          status?: 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced';
        };
      };
      crawl_sessions: {
        Row: {
          id: string;
          source: string;
          search_query: string | null;
          total_found: number;
          total_processed: number;
          status: 'running' | 'completed' | 'failed';
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          source: string;
          search_query?: string | null;
          total_found?: number;
          total_processed?: number;
          status?: 'running' | 'completed' | 'failed';
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          source?: string;
          search_query?: string | null;
          total_found?: number;
          total_processed?: number;
          status?: 'running' | 'completed' | 'failed';
          started_at?: string;
          completed_at?: string | null;
        };
      };
    };
  };
};