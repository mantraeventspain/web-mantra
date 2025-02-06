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
  "Cache-Control": "public, max-age=3600", // Cache por 1 hora
};

const BATCH_SIZE = 25; // Dropbox recomienda no más de 25 archivos por lote

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { path, size = "w256h256", original = false } = await req.json();

    const dbx = new Dropbox({
      accessToken: Deno.env.get("DROPBOX_ACCESS_TOKEN"),
    });

    // Si se solicita la imagen original
    if (original) {
      try {
        const response = await dbx.filesGetTemporaryLink({
          path,
        });

        return new Response(JSON.stringify({ url: response.result.link }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error al obtener enlace temporal:", error);
        throw new Error("No se pudo obtener el enlace temporal");
      }
    }

    // Inicializar cliente de Supabase
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: { persistSession: false },
      }
    );

    // Verificar caché
    const cacheKey = `${path}-${size}`;
    const { data: cachedData, error: cacheError } = await supabaseAdmin
      .from("dropbox_cache")
      .select("urls, updated_at")
      .eq("path", cacheKey)
      .single();

    if (!cacheError && cachedData) {
      const cacheAge = Date.now() - new Date(cachedData.updated_at).getTime();
      if (cacheAge < 24 * 60 * 60 * 1000) {
        return new Response(JSON.stringify(cachedData.urls), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Obtener lista de archivos
    const response = await dbx.filesListFolder({ path });

    if (!response?.result?.entries) {
      throw new Error("No se pudo obtener la lista de archivos de Dropbox");
    }

    const imageEntries = response.result.entries.filter((entry) =>
      entry.name.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)
    );

    // Procesar en lotes
    const allThumbnails = [];
    for (let i = 0; i < imageEntries.length; i += BATCH_SIZE) {
      const batch = imageEntries.slice(i, i + BATCH_SIZE);

      const thumbnailsResponse = await dbx.filesGetThumbnailBatch({
        entries: batch.map((entry) => ({
          path: entry.path_display || "",
          format: "jpeg",
          size,
          mode: "strict",
        })),
      });

      const batchThumbnails = thumbnailsResponse.result.entries.map(
        (entry) => ({
          thumbnail: entry.thumbnail
            ? `data:image/jpeg;base64,${entry.thumbnail}`
            : null,
          originalPath: entry.metadata.path_display,
        })
      );

      allThumbnails.push(...batchThumbnails);
    }

    // Actualizar caché
    await supabaseAdmin.from("dropbox_cache").upsert(
      {
        path: cacheKey,
        urls: allThumbnails,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "path" }
    );

    return new Response(JSON.stringify(allThumbnails), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
