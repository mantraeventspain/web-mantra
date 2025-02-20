import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { getArtistAvatarUrl } from "../utils/artistHelpers";
import type { Artist } from "../types/artist";

export function useArtists({
  includeInactive = false,
  orderBy = "nickname",
}: {
  includeInactive?: boolean;
  orderBy?: "nickname" | "display_order";
} = {}) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchArtists = useCallback(
    async ({
      includeInactive = false,
      orderBy = "nickname",
    }: {
      includeInactive?: boolean;
      orderBy?: "nickname" | "display_order";
    } = {}) => {
      try {
        setIsLoading(true);
        let query = supabase.from("artists").select("*").order(orderBy);

        if (!includeInactive) {
          query = query.eq("is_active", true);
        }

        const { data, error } = await query;

        if (error) throw error;

        const artistsWithUrls = await Promise.all(
          data.map(async (artist) => ({
            id: artist.id,
            nickname: artist.nickname,
            firstName: artist.first_name,
            lastName1: artist.last_name1,
            lastName2: artist.last_name2,
            avatarUrl: await getArtistAvatarUrl({
              normalizedNickname: artist.normalized_nickname,
            }),
            description: artist.description,
            instagram_username: artist.instagram_username,
            soundcloud_url: artist.soundcloud_url,
            beatport_url: artist.beatport_url,
            role: artist.role,
            normalized_nickname: artist.normalized_nickname,
            is_active: artist.is_active,
            display_order: artist.display_order,
          }))
        );

        setArtists(artistsWithUrls);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Error desconocido"));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchArtists({ includeInactive, orderBy });
  }, [fetchArtists, includeInactive, orderBy]);

  return { artists, isLoading, error, refetch: fetchArtists };
}
