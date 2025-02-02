import { supabase } from "../lib/supabase";

interface ArtistAvatarOptions {
  artistNickname: string;
}

export function getArtistAvatarUrl({ artistNickname }: ArtistAvatarOptions) {
  const path = `artist/${artistNickname}/avatar.jpg`;
  const { data } = supabase.storage.from("media").getPublicUrl(path);

  return data?.publicUrl || null;
}

export async function uploadArtistAvatar(
  file: File,
  artistNickname: string
): Promise<string | null> {
  const path = `artist/${artistNickname}/avatar.jpg`;

  const { error } = await supabase.storage.from("media").upload(path, file, {
    upsert: true,
    cacheControl: "3600",
    contentType: file.type,
  });

  if (error) {
    console.error("Error uploading avatar:", error);
    return null;
  }

  return path;
}
