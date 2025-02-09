import { supabase } from "../lib/supabase";

interface ArtistAvatarOptions {
  normalizedNickname: string;
}

export async function getArtistAvatarUrl({
  normalizedNickname,
}: ArtistAvatarOptions) {
  try {
    // Usar normalizedNickname para la ruta de archivos
    const { data: files, error } = await supabase.storage
      .from("media")
      .list(`artist/${normalizedNickname}`, {
        limit: 10,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      console.error("Error listing files:", error);
      return null;
    }

    // Buscar el archivo que comience con 'avatar.'
    const avatarFile = files?.find((file) => file.name.startsWith("avatar."));

    if (!avatarFile) {
      return null;
    }

    // Construir el path completo con la extensión correcta
    const path = `artist/${normalizedNickname}/${avatarFile.name}`;
    const { data } = supabase.storage.from("media").getPublicUrl(path);

    return data?.publicUrl || null;
  } catch (error) {
    console.error("Error getting avatar URL:", error);
    return null;
  }
}

export async function uploadArtistAvatar(
  file: File,
  normalizedNickname: string
): Promise<string | null> {
  try {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `avatar.${extension}`;
    const path = `artist/${normalizedNickname}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    return fileName;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return null;
  }
}
