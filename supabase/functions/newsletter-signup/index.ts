// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@4.1.2";
import { createClient } from "jsr:@supabase/supabase-js";

console.log("Hello from Functions!");

interface SiteConfig {
  tickets_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  soundcloud_url?: string;
  beatport_url?: string;
}

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

// Obtener las URLs públicas de las imágenes
const getPublicUrl = (filename: string) => {
  const { data } = supabase.storage.from("email-assets").getPublicUrl(filename);
  return data.publicUrl;
};

const logoUrl = getPublicUrl("logo.png");
const facebookUrl = getPublicUrl("facebook.png");
const instagramUrl = getPublicUrl("instagram.png");
const soundcloudUrl = getPublicUrl("soundcloud.png");
const beatportUrl = getPublicUrl("beatport.png");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    // Obtener configuración de redes sociales
    const { data: config, error } = await supabase
      .from("site_config")
      .select("*")
      .in("key", [
        "tickets_url",
        "facebook_url",
        "instagram_url",
        "soundcloud_url",
        "beatport_url",
      ]);

    if (error) throw error;

    const configObj = config.reduce(
      (acc, item) => ({
        ...acc,
        [item.key]: item.value,
      }),
      {} as SiteConfig
    );

    // Enviar email de bienvenida
    const { data, error: resendError } = await resend.emails.send({
      from: "Mantra Events <newsletter@mantraevent.es>",
      to: email,
      subject: "¡Bienvenido a la familia Mantra Events! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenido a Mantra Events</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #1E1410; color: #ffffff; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <!-- Header con logo -->
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="${logoUrl}" alt="Mantra Events Logo" style="max-width: 200px; height: auto;">
              </div>
              
              <!-- Contenido principal -->
              <div style="background-color: rgba(30, 20, 16, 0.8); border: 1px solid rgba(200, 86, 39, 0.2); border-radius: 12px; padding: 30px; margin-bottom: 30px;">
                <h1 style="color: #C85627; text-align: center; font-size: 24px; margin-bottom: 20px;">
                  ¡Bienvenido a la familia Mantra Events!
                </h1>
                
                <p style="color: #ffffff; line-height: 1.6; margin-bottom: 20px;">
                  Gracias por unirte a nuestra comunidad. A partir de ahora, recibirás información exclusiva sobre:
                </p>
                
                <ul style="color: #ffffff; line-height: 1.6; margin-bottom: 30px;">
                  <li style="margin-bottom: 10px;">📅 Próximos eventos</li>
                  <li style="margin-bottom: 10px;">🎵 Line-ups exclusivos</li>
                  <li style="margin-bottom: 10px;">🎫 Preventas especiales</li>
                  <li style="margin-bottom: 10px;">✨ Contenido exclusivo</li>
                </ul>
              </div>
              
              <!-- Social Media -->
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #C85627; margin-bottom: 15px;">Síguenos en redes sociales</p>
                <div>
                  <a href="${
                    configObj.facebook_url
                  }" style="margin: 0 10px; text-decoration: none;">
                    <img src="${facebookUrl}" alt="Facebook" style="width: 32px; height: 32px;">
                  </a>
                  <a href="${
                    configObj.instagram_url
                  }" style="margin: 0 10px; text-decoration: none;">
                    <img src="${instagramUrl}" alt="Instagram" style="width: 32px; height: 32px;">
                  </a>
                  <a href="${
                    configObj.soundcloud_url
                  }" style="margin: 0 10px; text-decoration: none;">
                    <img src="${soundcloudUrl}" alt="Soundcloud" style="width: 32px; height: 32px;">
                  </a>
                  <a href="${
                    configObj.beatport_url
                  }" style="margin: 0 10px; text-decoration: none;">
                    <img src="${beatportUrl}" alt="Beatport" style="width: 32px; height: 32px;">
                  </a>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(200, 86, 39, 0.2);">
                <p style="color: #F4A460; font-size: 12px;">
                  © ${new Date().getFullYear()} Mantra Events. Todos los derechos reservados.<br>
                  Si no deseas recibir más emails, puedes <a href="${Deno.env.get(
                    "SUPABASE_URL"
                  )}/functions/v1/newsletter-unsubscribe?email=${email}" style="color: #C85627;">darte de baja aquí</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (resendError) {
      throw resendError;
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Error al enviar el email",
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/newsletter-signup' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
