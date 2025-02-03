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

export function useEventLineup() {
  const [eventData, setEventData] = useState<EventWithLineup>({
    event: null,
    lineup: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEventAndLineup() {
      try {
        // Primero obtenemos el evento más reciente
        const { data: latestEvent, error: eventError } = await supabase
          .from("events")
          .select("*")
          .order("date")
          .limit(1)
          .single();

        if (eventError) throw eventError;

        // Luego obtenemos el line-up de ese evento
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
          .eq("event_id", latestEvent.id)
          .order("performance_order");

        if (lineupError) throw lineupError;

        const lineupWithUrls = lineupData.map((item) => ({
          ...item.artists,
          isHeadliner: item.is_headliner,
          performanceOrder: item.performance_order,
          startTime: item.start_time,
          endTime: item.end_time,
          avatarUrl: getArtistAvatarUrl({
            artistNickname: item.artists?.nickname || "",
          }),
        }));

        setEventData({
          event: {
            id: latestEvent.id,
            title: latestEvent.title,
            description: latestEvent.description || "",
            date: latestEvent.date,
            location: latestEvent.location,
            imageUrl: latestEvent.image_url || "",
            price: latestEvent.price,
            ticketsAvailable: latestEvent.tickets_available,
          },
          lineup: lineupWithUrls as LineupArtist[],
        });
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Error desconocido"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchEventAndLineup();
  }, []);

  return { ...eventData, isLoading, error };
}
