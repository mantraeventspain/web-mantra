import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Obtener el token actual
    const { data: tokenData, error: tokenError } = await supabase
      .from("dropbox_tokens")
      .select("*")
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (tokenError) throw tokenError;

    // Verificar si el token necesita renovación
    const now = new Date();
    if (tokenData && new Date(tokenData.expires_at) > now) {
      return new Response(
        JSON.stringify({ access_token: tokenData.access_token }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Renovar el token
    const response = await fetch("https://api.dropbox.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokenData.refresh_token,
        client_id: Deno.env.get("DROPBOX_APP_KEY") ?? "",
        client_secret: Deno.env.get("DROPBOX_APP_SECRET") ?? "",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const newToken = await response.json();

    // Actualizar los tokens en la base de datos
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + newToken.expires_in);

    const { error: updateError } = await supabase
      .from("dropbox_tokens")
      .insert({
        access_token: newToken.access_token,
        refresh_token: tokenData.refresh_token, // Mantener el mismo refresh_token
        expires_at: expiresAt.toISOString(),
      });

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ access_token: newToken.access_token }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
