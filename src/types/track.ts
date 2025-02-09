import type { Artist } from "./artist";

export interface Track {
  id: string;
  title: string;
  artistId: string;
  releaseDate: string | null;
  beatportUrl: string | null;
  filename: string;
  isFeatured: boolean;
  artist: Pick<Artist, "nickname">;
  artworkUrl: string | null;
  audioUrl: string | null;
}

export interface TrackFormData {
  title: string;
  artistId: string;
  releaseDate: string | null;
  beatportUrl: string | null;
  isFeatured: boolean;
}

export interface TrackFile {
  audio: File | null;
  artwork: File | null;
}
