import { useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Track } from "../types/track";

export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTracks = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("tracks")
        .select(
          `
          *,
          artists (
            nickname
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const tracksWithUrls = await Promise.all(
        data.map(async (track) => {
          const basePath = `artist/${track.artists.nickname}`;
          const artworkPath = `${basePath}/${track.filename_icon}`;

          // Only get audio URL for featured tracks
          let audioUrl = null;
          if (track.is_featured) {
            const audioPath = `${basePath}/${track.filename}`;
            const { data: audioData } = supabase.storage
              .from("media")
              .getPublicUrl(audioPath);
            audioUrl = audioData?.publicUrl || null;
          }

          const { data: artworkData } = supabase.storage
            .from("media")
            .getPublicUrl(artworkPath);

          return {
            id: track.id,
            title: track.title,
            artistId: track.artist_id,
            releaseDate: track.release_date,
            beatportUrl: track.beatport_url,
            filename: track.filename,
            isFeatured: track.is_featured,
            artist: track.artists,
            artworkUrl: artworkData?.publicUrl || null,
            audioUrl: audioUrl,
            soundcloudUrl: track.soundcloud_url,
          };
        })
      );

      setTracks(tracksWithUrls as Track[]);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Error desconocido"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const refetch = useCallback(() => {
    return fetchTracks();
  }, [fetchTracks]);

  return { tracks, isLoading, error, refetch };
}
