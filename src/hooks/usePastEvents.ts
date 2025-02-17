import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
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

              return {
                ...event,
                imageUrl,
                galleryImages: [], // Initialize as empty array
              } as Event;
            } catch (error) {
              console.error(
                `Error al obtener imagen para ${event.title}:`,
                error
              );
              return {
                ...event,
                imageUrl: null,
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
