
// Follow Supabase Edge Function format
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the request body
    const body = await req.json()
    const { endpoint, params = {}, useCache, cacheKey } = body
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // If using cache, try to get from cache first
    if (useCache && cacheKey) {
      const cacheTTL = params.cacheTTL || 1440 // Default 24 hours if not specified
      
      const { data: cacheData, error: cacheError } = await supabase
        .from('api_cache')
        .select('response, fetched_at')
        .eq('id', cacheKey)
        .single()
      
      if (!cacheError && cacheData) {
        // Check if cache is still fresh (less than TTL minutes old)
        const cacheTime = new Date(cacheData.fetched_at)
        const currentTime = new Date()
        const cacheAgeMinutes = (currentTime.getTime() - cacheTime.getTime()) / 60000
        
        if (cacheAgeMinutes < cacheTTL) {
          console.log(`Using cached data for ${endpoint}. Cache age: ${cacheAgeMinutes.toFixed(2)} minutes, TTL: ${cacheTTL} minutes`)
          return new Response(
            JSON.stringify({ 
              success: true, 
              data: cacheData.response,
              fromCache: true,
              cacheAge: cacheAgeMinutes 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          console.log(`Cache expired for ${endpoint}. Age: ${cacheAgeMinutes.toFixed(2)} minutes, TTL: ${cacheTTL} minutes`)
        }
      }
    }
    
    // Construct the URL with query parameters
    const baseUrl = 'https://site.api.espn.com/apis/site/v2'
    let url = `${baseUrl}${endpoint}`
    
    if (Object.keys(params).length > 0) {
      url += '?'
      Object.entries(params).forEach(([key, value], index) => {
        if (index > 0) url += '&'
        url += `${key}=${encodeURIComponent(String(value))}`
      })
    }
    
    console.log(`Making ESPN API call to: ${url}`)
    
    // Make request to ESPN API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error(`ESPN API error: ${response.status} ${errorData}`)
      
      // Check for rate limit or service errors
      if (response.status === 429 || response.status >= 500) {
        console.log('Rate limit or service error. Checking if there is cached data we can use...')
        
        // Try to get any existing cache data regardless of age as fallback
        if (cacheKey) {
          const { data: fallbackCache } = await supabase
            .from('api_cache')
            .select('response, fetched_at')
            .eq('id', cacheKey)
            .single()
            
          if (fallbackCache) {
            console.log(`Using expired cache for ${endpoint} due to service issues`)
            return new Response(
              JSON.stringify({ 
                success: true, 
                data: fallbackCache.response,
                fromCache: true,
                cacheAge: null,
                serviceIssue: true
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
      }
      
      // For 404 errors, especially for league data, return an empty success response
      // This helps when ESPN doesn't have data for certain leagues but we want to continue
      if (response.status === 404) {
        console.log(`Resource not found at ${url}, returning empty data`)
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: { leagues: [] },
            notFound: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `API returned ${response.status}`, 
          details: errorData,
          url: url
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Parse response
    const data = await response.json()
    
    // Cache the response if we have a cache key
    if (cacheKey) {
      const { error: insertError } = await supabase
        .from('api_cache')
        .upsert({
          id: cacheKey,
          endpoint,
          params,
          response: data,
          fetched_at: new Date().toISOString()
        })
      
      if (insertError) {
        console.error('Error caching API response:', insertError)
      } else {
        console.log(`Successfully cached data for ${endpoint}`)
      }
    }
    
    // Return successful response
    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        fromCache: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in edge function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
