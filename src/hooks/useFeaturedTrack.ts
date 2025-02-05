import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Track } from "../types/track";

export function useFeaturedTrack() {
  const [track, setTrack] = useState<Track | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchFeaturedTrack() {
      try {
        const { data: trackData, error: trackError } = await supabase
          .from("tracks")
          .select(
            `
            *,
            artists (
              nickname
            )
          `
          )
          .eq("is_featured", true)
          .single();

        if (trackError) throw trackError;

        if (trackData) {
          const track = {
            id: trackData.id,
            title: trackData.title,
            artistId: trackData.artist_id,
            releaseDate: trackData.release_date,
            beatportUrl: trackData.beatport_url,
            filename: trackData.filename,
            isFeatured: trackData.is_featured,
            artist: trackData.artists,
            artworkUrl: trackData.filename_icon,
          };

          setTrack(track as Track);

          // Obtener URLs del audio y la carátula
          const basePath = `artist/${track.artist.nickname}`;
          const audioPath = `${basePath}/${track.filename}`;
          const artworkPath = `${basePath}/${track.artworkUrl}`;

          const { data: audioData } = supabase.storage
            .from("media")
            .getPublicUrl(audioPath);
          const { data: artworkData } = supabase.storage
            .from("media")
            .getPublicUrl(artworkPath);

          if (audioData) setAudioUrl(audioData.publicUrl);
          if (artworkData) setArtworkUrl(artworkData.publicUrl);
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Error desconocido"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeaturedTrack();
  }, []);

  return { track, audioUrl, artworkUrl, isLoading, error };
}
