import { supabase } from "../lib/supabase";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTemporaryLinks(path: string): Promise<string[]> {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl("");
      const supabaseUrl = new URL(publicUrl).origin;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/get-dropbox-images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ path }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener las imágenes");
      }

      return await response.json();
    } catch (error) {
      retries++;
      if (retries === MAX_RETRIES) {
        console.error("Error al obtener enlaces temporales:", error);
        return [];
      }
      await wait(RETRY_DELAY * retries);
    }
  }

  return [];
}
