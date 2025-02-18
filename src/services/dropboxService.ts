import { supabase } from "../lib/supabase";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

export interface ImageUrl {
  thumbnail: string | null;
  originalPath: string;
}

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTemporaryLinks(
  path: string,
  size: string = "w256h256",
  page: number = 1,
  perPage: number = 10
): Promise<{ images: ImageUrl[]; hasMore: boolean; total: number }> {
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
          body: JSON.stringify({ path, size, page, perPage }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener las imágenes");
      }

      const data = await response.json();
      return {
        images: data.images || [],
        hasMore: data.hasMore || false,
        total: data.total || 0,
      };
    } catch (error) {
      retries++;
      if (retries === MAX_RETRIES) {
        console.error("Error al obtener enlaces temporales:", error);
        return { images: [], hasMore: false, total: 0 };
      }
      await wait(RETRY_DELAY * retries);
    }
  }

  return { images: [], hasMore: false, total: 0 };
}

export async function getOriginalImage(path: string): Promise<string | null> {
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
        body: JSON.stringify({ path, original: true }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener la imagen original");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error al obtener la imagen original:", error);
    return null;
  }
}
