import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Event } from "../types/event";

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchEvents() {
    try {
      setIsLoading(true);
      const query = supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });

      const { data, error: dbError } = await query;

      if (dbError) throw dbError;

      const eventsWithUrls = await Promise.all(
        data.map(async (event) => {
          let imageUrl = null;
          if (event.image_url) {
            const { data: imageData } = supabase.storage
              .from("media")
              .getPublicUrl(event.image_url);
            imageUrl = imageData.publicUrl;
          }

          return {
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.date,
            location: event.location,
            imageUrl,
          };
        })
      );

      setEvents(eventsWithUrls);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Error desconocido"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
  };
}
