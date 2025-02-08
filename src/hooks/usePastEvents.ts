import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getTemporaryLinks } from "../services/dropboxService";
import type { Database } from "../types/database.types";

type Event = Database["public"]["Tables"]["events"]["Row"] & {
  imageUrl: string | null | undefined;
  galleryImages: {
    thumbnail: string | null;
    originalPath: string;
  }[];
};

export function usePastEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPastEvents() {
      try {
        const today = new Date().toISOString();
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .lt("date", today)
          .order("date", { ascending: false });

        if (error) throw error;

        const eventsWithImages = await Promise.all(
          data.map(async (event) => {
            try {
              let imageUrl = null;
              if (event.image_url) {
                const { data: imageData } = supabase.storage
                  .from("media")
                  .getPublicUrl(event.image_url);
                imageUrl = imageData.publicUrl;
              }

              const path = `/MANTRA/${event.title}`;
              const galleryUrls = await getTemporaryLinks(path);

              return {
                ...event,
                imageUrl,
                galleryImages: galleryUrls,
              } as Event;
            } catch (dropboxError) {
              console.error(
                `Error al obtener imágenes para ${event.title}:`,
                dropboxError
              );
              return {
                ...event,
                imageUrl: event.image_url
                  ? supabase.storage.from("media").getPublicUrl(event.image_url)
                      .data.publicUrl
                  : null,
                galleryImages: [],
              } as Event;
            }
          })
        );

        setEvents(eventsWithImages);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Error desconocido"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchPastEvents();
  }, []);

  return { events, isLoading, error };
}
