// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js";
import { Resend } from "npm:resend@4.1.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

console.log("Hello from Functions!");

const getPublicUrl = (filename: string) => {
  const { data } = supabase.storage.from("email-assets").getPublicUrl(filename);
  return data.publicUrl;
};

const logoUrl = getPublicUrl("logo.png");

// Función para obtener la URL del avatar del artista
async function getArtistAvatarUrl(normalizedNickname: string) {
  try {
    const { data: files, error } = await supabase.storage
      .from("media")
      .list(`artist/${normalizedNickname}`, {
        limit: 10,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      console.error("Error listing files:", error);
      return null;
    }

    const avatarFile = files?.find((file) => file.name.startsWith("avatar."));
    if (!avatarFile) return null;

    const path = `artist/${normalizedNickname}/${avatarFile.name}`;
    const { data } = supabase.storage.from("media").getPublicUrl(path);

    return data?.publicUrl || null;
  } catch (error) {
    console.error("Error getting avatar URL:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { subscribers } = await req.json();

    // Obtener el próximo evento
    const today = new Date().toISOString();
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .gte("date", today)
      .order("date")
      .limit(1)
      .single();

    if (eventError) throw eventError;

    // Obtener el lineup del evento
    const { data: lineupData, error: lineupError } = await supabase
      .from("event_artists")
      .select(
        `
        is_headliner,
        performance_order,
        start_time,
        end_time,
        artists(*)
      `
      )
      .eq("event_id", event.id)
      .order("performance_order");

    if (lineupError) throw lineupError;

    // Obtener las URLs de los avatares
    const lineupWithAvatars = await Promise.all(
      lineupData.map(async (item) => ({
        ...item,
        avatarUrl: await getArtistAvatarUrl(
          item.artists?.normalized_nickname || ""
        ),
      }))
    );

    // Separar headliners y artistas de soporte
    const headliners = lineupWithAvatars.filter(
      (artist) => artist.is_headliner
    );
    const supportArtists = lineupWithAvatars.filter(
      (artist) => !artist.is_headliner
    );

    // Construir el HTML del lineup
    const headlinersHtml = headliners
      .map(
        (artist) => `
      <div style="margin-bottom: 40px; text-align: center;">
        <div style="background: linear-gradient(to bottom, rgba(200, 86, 39, 0.1), rgba(30, 20, 16, 0.9)); border-radius: 16px; padding: 30px; border: 1px solid rgba(200, 86, 39, 0.2);">
          ${
            artist.avatarUrl
              ? `
            <div style="margin-bottom: 20px;">
              <img src="${artist.avatarUrl}" 
                   alt="${artist.artists.nickname}" 
                   style="width: 200px; height: 200px; border-radius: 50%; border: 3px solid #C85627; object-fit: cover;">
            </div>
          `
              : ""
          }
          <h3 style="color: #C85627; font-size: 28px; margin: 0 0 10px 0;">
            ${artist.artists.nickname}
          </h3>
          <span style="display: inline-block; background-color: rgba(200, 86, 39, 0.2); color: #C85627; padding: 8px 20px; border-radius: 20px; font-size: 16px;">
            Headliner
          </span>
          ${
            artist.start_time
              ? `
            <p style="color: #ffffff; margin: 15px 0; font-size: 18px;">
              ${new Date(artist.start_time).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          `
              : ""
          }
        </div>
      </div>
    `
      )
      .join("");

    const supportArtistsHtml = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; margin-top: 40px;">
        ${supportArtists
          .map(
            (artist) => `
          <div style="background: rgba(30, 20, 16, 0.8); border-radius: 12px; padding: 20px; border: 1px solid rgba(200, 86, 39, 0.1); text-align: center; margin-top: 10px;">
            ${
              artist.avatarUrl
                ? `
              <img src="${artist.avatarUrl}" 
                   alt="${artist.artists.nickname}" 
                   style="width: 120px; height: 120px; border-radius: 50%; border: 2px solid rgba(200, 86, 39, 0.5); object-fit: cover; margin-bottom: 15px;">
            `
                : ""
            }
            <h4 style="color: #ffffff; font-size: 20px; margin: 0 0 10px 0;">
              ${artist.artists.nickname}
            </h4>
            ${
              artist.start_time
                ? `
              <p style="color: #C85627; margin: 5px 0; font-size: 16px;">
                ${new Date(artist.start_time).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            `
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>
    `;

    // Enviar emails
    const emailPromises = subscribers.map((email: string) =>
      resend.emails.send({
        from: "Mantra Events <newsletter@mantraevent.es>",
        to: email,
        subject: `¡No te pierdas nuestro próximo evento: ${event.title}!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${event.title}</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #1E1410; color: #ffffff; font-family: Arial, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <!-- Logo Header -->
                <div style="text-align: center; margin-bottom: 40px;">
                  <img src="${logoUrl}" 
                       alt="Mantra Events Logo" 
                       style="width: 150px; height: auto; margin: 0 auto;">
                </div>

                <!-- Header con imagen del evento -->
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(30, 20, 16, 1), transparent); padding: 40px 20px 20px;">
                  <h1 style="color: #C85627; font-size: 32px; margin: 0 0 10px 0; text-align: center;">
                    ${event.title}
                  </h1>
                </div>

                <!-- Información del evento -->
                <div style="max-width: 500px; margin: 0 auto;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 60px;">
                    <div style="flex: 1; background: rgba(200, 86, 39, 0.1); padding: 15px 30px; border-radius: 12px; text-align: center; margin-right: 20px;">
                      <span style="display: block; color: #C85627; margin-bottom: 5px;">Fecha</span>
                      <time style="color: #ffffff; font-size: 18px;">
                        ${new Date(event.date).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                    <div style="flex: 1; background: rgba(200, 86, 39, 0.1); padding: 15px 30px; border-radius: 12px; text-align: center;">
                      <span style="display: block; color: #C85627; margin-bottom: 5px;">Ubicación</span>
                      <address style="color: #ffffff; font-size: 18px; font-style: normal;">
                        ${event.location}
                      </address>
                    </div>
                  </div>
                </div>

                <!-- Line-up -->
                <div style="margin-bottom: 40px;">
                  <h2 style="color: #C85627; text-align: center; font-size: 24px; margin-bottom: 30px;">
                    Line-up
                  </h2>
                  ${headlinersHtml}
                  ${supportArtistsHtml}
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(200, 86, 39, 0.2);">
                  <p style="color: #666666; font-size: 12px;">
                    © ${new Date().getFullYear()} Mantra Events. Todos los derechos reservados.<br>
                    Si no deseas recibir más emails, puedes 
                    <a href="${Deno.env.get(
                      "SUPABASE_URL"
                    )}/functions/v1/newsletter-unsubscribe?email=${email}" 
                       style="color: #C85627;">
                      darte de baja aquí
                    </a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      })
    );

    await Promise.all(emailPromises);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Error al enviar la newsletter",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-newsletter' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

// Como desplegar la funcion en supabase, mediante la terminal:
// 1. Copiar el codigo de la funcion
// 2. Ir a la terminal y ejecutar el comando:
// supabase functions deploy send-newsletter
