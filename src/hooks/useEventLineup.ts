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

export function useEventLineup() {
  const [eventData, setEventData] = useState<{
    event: Event | null;
    lineup: LineupArtist[];
  }>({ event: null, lineup: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchEventAndLineup();

    async function fetchEventAndLineup() {
      try {
        const today = new Date().toISOString();
        const { data: latestEvent, error: eventError } = await supabase
          .from("events")
          .select("*")
          .gte("date", today)
          .eq("is_active", true)
          .order("date")
          .limit(1)
          .single();

        if (eventError) throw eventError;

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

        if (isMounted) {
          setEventData({
            event: {
              id: latestEvent.id,
              title: latestEvent.title,
              description: latestEvent.description,
              date: latestEvent.date,
              location: latestEvent.location,
              imageUrl: latestEvent.image_url,
            },
            lineup: lineupWithUrls as LineupArtist[],
          });
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e : new Error("Error desconocido"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    event: eventData.event,
    lineup: eventData.lineup,
    isLoading,
    error,
  };
}
