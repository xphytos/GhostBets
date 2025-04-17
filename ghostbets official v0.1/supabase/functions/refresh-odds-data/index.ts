
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Odds API key
const ODDS_API_KEY = 'eaa3bf9e7cab8a70209fc9a8b5219253';

// Define regions and markets to fetch - US only as requested
const regions = ['us'];
const markets = 'h2h,spreads,totals';

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the current date for the cache key
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    // Log start of function
    console.log(`Starting odds refresh for ${month}/${year}`);

    // Process US region only
    const region = 'us';
    const cacheKey = `odds_api_${region}_${markets}_${year}_${month}`;

    // Check if we already have this month's data
    const { data: existingCache } = await supabase
      .from('api_cache')
      .select('key')
      .eq('key', cacheKey)
      .maybeSingle();

    // If we already have data for this month, skip
    if (existingCache) {
      console.log(`Cache already exists for ${region} region in ${month}/${year}, skipping`);
      return new Response(
        JSON.stringify({ success: true, message: 'Odds data already cached' }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Fetch the odds data
    const url = `https://api.the-odds-api.com/v4/sports/upcoming/odds/?regions=${region}&markets=${markets}&oddsFormat=american&apiKey=${ODDS_API_KEY}`;
    
    console.log(`Fetching odds data for ${region} region`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Odds API returned ${response.status}: ${await response.text()}`);
    }
    
    const oddsData = await response.json();
    
    // Log the number of events received
    console.log(`Received ${oddsData.length} events for ${region}`);
    
    // Save to cache
    const { error } = await supabase
      .from('api_cache')
      .insert({
        key: cacheKey,
        data: oddsData,
        cached_at: new Date().toISOString()
      });
    
    if (error) {
      throw new Error(`Failed to cache odds data: ${error.message}`);
    }
    
    console.log(`Successfully cached odds data for ${region} region`);

    return new Response(
      JSON.stringify({ success: true, message: 'Odds data refreshed successfully' }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error refreshing odds data:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})
