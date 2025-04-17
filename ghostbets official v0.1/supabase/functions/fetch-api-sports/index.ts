
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
    const { sport, endpoint, params, useCache, cacheKey, options } = body
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // If using cache, try to get from cache first
    if (useCache && cacheKey) {
      // Default to 24-hour cache (1440 minutes) instead of 15 minutes
      // This respects the free tier API daily call limits
      const cacheTTL = options?.cacheTTL || 1440 // Default 24 hours if not specified
      
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
          console.log(`Using cached data for ${sport}/${endpoint}. Cache age: ${cacheAgeMinutes.toFixed(2)} minutes, TTL: ${cacheTTL} minutes`)
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
          console.log(`Cache expired for ${sport}/${endpoint}. Age: ${cacheAgeMinutes.toFixed(2)} minutes, TTL: ${cacheTTL} minutes`)
        }
      }
    }
    
    // Not in cache or cache expired, make API call
    // Get the sport-specific API key, falling back to the default key
    const defaultApiKey = Deno.env.get('API_SPORTS_KEY')
    const sportSpecificKey = Deno.env.get(`API_SPORTS_${sport.toUpperCase()}_KEY`)
    const apiKey = sportSpecificKey || defaultApiKey
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured for this sport' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    console.log(`Making API call to ${sport}/${endpoint} using ${sportSpecificKey ? 'sport-specific' : 'default'} API key`)
    
    // Construct API URL - use custom base URL if provided
    const baseUrl = options?.baseUrl || `https://v3.${sport}.api-sports.io`
    const url = new URL(`/${endpoint}`, baseUrl)
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle array parameters (some API-Sports endpoints support this)
          value.forEach(item => url.searchParams.append(key, String(item)))
        } else {
          url.searchParams.append(key, String(value))
        }
      }
    })
    
    // Make request to API-Sports
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': `v3.${sport}.api-sports.io`,
        ...(options?.extraHeaders || {}) // Allow custom headers
      }
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error(`API-Sports error: ${response.status} ${errorData}`)
      
      // Check for rate limit errors
      if (response.status === 429) {
        console.log('Rate limit exceeded. Checking if there is cached data we can use...')
        
        // Try to get any existing cache data regardless of age as fallback
        if (cacheKey) {
          const { data: fallbackCache } = await supabase
            .from('api_cache')
            .select('response, fetched_at')
            .eq('id', cacheKey)
            .single()
            
          if (fallbackCache) {
            console.log(`Using expired cache for ${sport}/${endpoint} due to rate limit`)
            return new Response(
              JSON.stringify({ 
                success: true, 
                data: fallbackCache.response,
                fromCache: true,
                cacheAge: null,
                rateLimited: true
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `API returned ${response.status}`, 
          details: errorData,
          url: url.toString() // Include the URL for debugging
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
        console.log(`Successfully cached data for ${sport}/${endpoint}`)
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
