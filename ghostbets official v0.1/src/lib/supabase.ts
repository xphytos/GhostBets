
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Use the direct values instead of environment variables
const supabaseUrl = "https://cesltdnpizhouatyezok.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlc2x0ZG5waXpob3VhdHllem9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4Mjk1NTcsImV4cCI6MjA2MDQwNTU1N30.DjOCADrR_JQ0cGoE69CJxBY69dIZdRX1PdL7vEJktNs";

// Create and export the Supabase client with proper configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
    flowType: 'pkce',
    detectSessionInUrl: true
  }
});

// Removed automatic GitHub OAuth initialization
