import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getArtistAvatarUrl } from "../utils/artistHelpers";
import type { Artist } from "../types/artist";
import type { Event } from "../types";

interface LineupArtist extends Artist {
  isHeadliner: boolean;
  performanceOrder: number;
  startTime: string | null;
  endTime: string | null;
}

interface EventWithLineup {
  event: Event | null;
  lineup: LineupArtist[];
}

export function useEventLineupById(eventId: string | null) {
  const [eventData, setEventData] = useState<EventWithLineup>({
    event: null,
    lineup: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEventAndLineup() {
      try {
        let event;

        if (eventId) {
          // Si hay eventId, obtener ese evento específico
          const { data: eventData, error: eventError } = await supabase
            .from("events")
            .select("*")
            .eq("id", eventId)
            .single();

          if (eventError) throw eventError;
          event = eventData;
        } else {
          // Si no hay eventId, intentar obtener el próximo evento
          const today = new Date().toISOString();
          const { data: futureEvents, error: futureError } = await supabase
            .from("events")
            .select("*")
            .gte("date", today)
            .order("date", { ascending: true })
            .limit(1);

          if (futureError) throw futureError;

          if (!futureEvents?.length) {
            // Si no hay eventos futuros, obtener el último evento pasado
            const { data: pastEvents, error: pastError } = await supabase
              .from("events")
              .select("*")
              .lt("date", today)
              .order("date", { ascending: false })
              .limit(1);

            if (pastError) throw pastError;
            event = pastEvents?.[0] || null;
          } else {
            event = futureEvents[0];
          }
        }

        if (!event) {
          setEventData({ event: null, lineup: [] });
          return;
        }

        // Obtener el lineup para el evento encontrado
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

        const lineupWithUrls = await Promise.all(
          lineupData.map(async (item) => ({
            ...item.artists,
            isHeadliner: item.is_headliner,
            performanceOrder: item.performance_order,
            startTime: item.start_time,
            endTime: item.end_time,
            avatarUrl: await getArtistAvatarUrl({
              normalizedNickname: item.artists?.normalized_nickname || "",
            }),
          }))
        );

        setEventData({
          event: event
            ? {
                id: event.id,
                title: event.title,
                description: event.description || "",
                date: event.date,
                location: event.location,
                imageUrl: event.image_url || "",
              }
            : null,
          lineup: lineupWithUrls as LineupArtist[],
        });
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Error desconocido"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchEventAndLineup();
  }, [eventId]);

  return { ...eventData, isLoading, error };
}
