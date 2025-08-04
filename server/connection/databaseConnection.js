import { createClient } from '@supabase/supabase-js';

// Get credentials from environment variables (NO HARDCODED VALUES!)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file'
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

