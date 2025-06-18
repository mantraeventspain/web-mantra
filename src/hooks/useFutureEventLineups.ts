import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { getArtistAvatarUrl } from "../utils/artistHelpers";
import type { LineupArtist, EventLineup } from "../types";

export function useFutureEventLineups() {
  const [eventLineups, setEventLineups] = useState<EventLineup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFutureEventLineups = useCallback(async () => {
    try {
      setIsLoading(true);

      // Obtener fecha actual para filtrar eventos futuros
      const today = new Date().toISOString();

      // Obtener todos los eventos futuros
      const { data: futureEvents, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .gte("date", today)
        .order("date", { ascending: true });

      if (eventsError) throw eventsError;

      if (!futureEvents?.length) {
        setEventLineups([]);
        return;
      }

      // Para cada evento, obtener su lineup y verificar que tenga al menos un artista
      const eventLineupsPromises = futureEvents.map(async (event) => {
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

        // Solo incluir eventos que tienen al menos un artista asignado
        if (!lineupData?.length) {
          return null;
        }

        // Obtener URLs de avatar para los artistas
        const lineupWithUrls = await Promise.all(
          lineupData.map(async (item) => ({
            ...item.artists,
            isHeadliner: item.is_headliner || false,
            performanceOrder: item.performance_order,
            startTime: item.start_time,
            endTime: item.end_time,
            avatarUrl: await getArtistAvatarUrl({
              normalizedNickname: item.artists?.normalized_nickname || "",
            }),
          }))
        );

        return {
          event: {
            id: event.id,
            title: event.title,
            description: event.description || "",
            date: event.date,
            location: event.location,
            imageUrl: event.image_url || "",
            is_featured: event.is_featured || false,
          },
          lineup: lineupWithUrls as LineupArtist[],
        };
      });

      // Resolver todas las promesas y filtrar eventos nulos (sin artistas)
      const resolvedEventLineups = await Promise.all(eventLineupsPromises);
      const validEventLineups = resolvedEventLineups.filter(
        Boolean
      ) as EventLineup[];

      // Ordenar según las reglas:
      // 1. Si hay eventos destacados, van primero
      // 2. El resto en orden cronológico
      const sortedEventLineups = validEventLineups.sort((a, b) => {
        // Si uno es destacado y el otro no, el destacado va primero
        if (a.event.is_featured && !b.event.is_featured) return -1;
        if (!a.event.is_featured && b.event.is_featured) return 1;

        // Si ambos son destacados o ninguno es destacado, ordenar por fecha
        return (
          new Date(a.event.date).getTime() - new Date(b.event.date).getTime()
        );
      });

      setEventLineups(sortedEventLineups);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Error desconocido"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFutureEventLineups();
  }, [fetchFutureEventLineups]);

  return {
    eventLineups,
    isLoading,
    error,
    refetch: fetchFutureEventLineups,
  };
}
