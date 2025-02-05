import { Artist } from "./artist";

export interface Track {
  id: string;
  title: string;
  artistId: string;
  releaseDate: string | null;
  beatportUrl: string | null;
  filename: string;
  isFeatured: boolean;
  artist?: Artist;
  artworkUrl: string | null;
}
