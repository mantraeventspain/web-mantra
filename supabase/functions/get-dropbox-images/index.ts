// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Dropbox } from "npm:dropbox";
import { createClient } from "@supabase/supabase-js";

console.log("Hello from Functions!");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
};

const BATCH_SIZE = 25; // Dropbox recomienda no más de 25 archivos por lote

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      path,
      size = "w256h256",
      page = 1,
      perPage = 10,
    } = await req.json();

    // Obtener token actualizado
    const tokenResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/renew-dropbox-token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to get Dropbox token");
    }

    const { access_token } = await tokenResponse.json();

    const dbx = new Dropbox({
      accessToken: access_token,
    });

    // Obtener lista de archivos
    const response = await dbx.filesListFolder({ path });

    if (!response?.result?.entries) {
      throw new Error("No se pudo obtener la lista de archivos de Dropbox");
    }

    const imageEntries = response.result.entries.filter((entry) =>
      entry.name.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)
    );

    // Calcular el índice inicial y final para la paginación
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedEntries = imageEntries.slice(startIndex, endIndex);

    // Procesar el lote actual
    const thumbnailsResponse = await dbx.filesGetThumbnailBatch({
      entries: paginatedEntries.map((entry) => ({
        path: entry.path_display || "",
        format: "jpeg",
        size,
        mode: "strict",
      })),
    });

    const thumbnails = thumbnailsResponse.result.entries.map((entry) => ({
      thumbnail: entry.thumbnail
        ? `data:image/jpeg;base64,${entry.thumbnail}`
        : null,
      originalPath: entry.metadata.path_display,
    }));

    return new Response(
      JSON.stringify({
        images: thumbnails,
        total: imageEntries.length,
        hasMore: endIndex < imageEntries.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error en la Edge Function:", error);
    return new Response(
      JSON.stringify({
        error: "Error al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-dropbox-images' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
