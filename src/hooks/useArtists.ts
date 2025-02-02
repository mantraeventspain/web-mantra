import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getArtistAvatarUrl } from "../utils/artistHelpers";
import type { Artist } from "../types/artist";

export function useArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchArtists() {
      try {
        const { data, error } = await supabase
          .from("artists")
          .select("*")
          .order("nickname");

        if (error) throw error;

        const artistsWithUrls = data.map((artist) => ({
          id: artist.id,
          nickname: artist.nickname,
          firstName: artist.first_name,
          lastName1: artist.last_name1,
          lastName2: artist.last_name2,
          avatarUrl: getArtistAvatarUrl({
            artistNickname: artist.nickname,
          }),
          description: artist.description,
          instagramUsername: artist.instagram_username,
          soundcloudUrl: artist.soundcloud_url,
          beatportUrl: artist.beatport_url,
          role: artist.role,
        }));

        setArtists(artistsWithUrls);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Error desconocido"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchArtists();
  }, []);

  return { artists, isLoading, error };
}
