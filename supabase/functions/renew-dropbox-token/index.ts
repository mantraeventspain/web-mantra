import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting token renewal process');
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    // Obtener el token actual
    console.log('Fetching current token from database');
    const { data: tokenData, error: tokenError } = await supabase
      .from('dropbox_tokens')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (tokenError) {
      console.error('Error fetching token:', tokenError);
      throw tokenError;
    }

    // Verificar si el token necesita renovación
    const now = new Date();
    console.log('Token expires at:', tokenData?.expires_at);
    console.log('Current time:', now.toISOString());

    if (tokenData && new Date(tokenData.expires_at) > now) {
      console.log('Token still valid, returning existing token');
      return new Response(JSON.stringify({ access_token: tokenData.access_token }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Token expired, requesting new token from Dropbox');
    // Renovar el token
    const response = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenData.refresh_token,
        client_id: Deno.env.get('DROPBOX_APP_KEY') ?? '',
        client_secret: Deno.env.get('DROPBOX_APP_SECRET') ?? '',
      }),
    });

    if (!response.ok) {
      console.error('Dropbox API error:', await response.text());
      throw new Error('Failed to refresh token');
    }

    const newToken = await response.json();
    console.log('Successfully obtained new token');

    // Actualizar los tokens en la base de datos
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + newToken.expires_in);
    console.log('New token will expire at:', expiresAt.toISOString());

    const { error: updateError } = await supabase.from('dropbox_tokens').insert({
      access_token: newToken.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt.toISOString(),
    });

    if (updateError) {
      console.error('Error updating token in database:', updateError);
      throw updateError;
    }

    console.log('Successfully updated token in database');
    return new Response(JSON.stringify({ access_token: newToken.access_token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
