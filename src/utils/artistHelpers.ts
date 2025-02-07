import { supabase } from "../lib/supabase";

interface ArtistAvatarOptions {
  artistNickname: string;
}

export async function getArtistAvatarUrl({
  artistNickname,
}: ArtistAvatarOptions) {
  try {
    // Listar archivos en el directorio del artista
    const { data: files, error } = await supabase.storage
      .from("media")
      .list(`artist/${artistNickname}`, {
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
    const path = `artist/${artistNickname}/${avatarFile.name}`;
    const { data } = supabase.storage.from("media").getPublicUrl(path);

    return data?.publicUrl || null;
  } catch (error) {
    console.error("Error getting avatar URL:", error);
    return null;
  }
}

export async function uploadArtistAvatar(
  file: File,
  artistNickname: string
): Promise<string | null> {
  try {
    // Subir el nuevo avatar con nombre temporal
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const tempFileName = `avatar_new_${Date.now()}.${extension}`;
    const tempPath = `artist/${artistNickname}/${tempFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(tempPath, file, {
        cacheControl: "3600",
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    // Buscar y eliminar el avatar anterior
    const { data: files, error: listError } = await supabase.storage
      .from("media")
      .list(`artist/${artistNickname}`);

    if (listError) throw listError;

    const oldAvatar = files?.find((file) => file.name.startsWith("avatar."));
    if (oldAvatar) {
      const { error: deleteError } = await supabase.storage
        .from("media")
        .remove([`artist/${artistNickname}/${oldAvatar.name}`]);

      if (deleteError) throw deleteError;
    }

    // Renombrar el nuevo avatar
    const finalPath = `artist/${artistNickname}/avatar.${extension}`;
    const { error: moveError } = await supabase.storage
      .from("media")
      .move(tempPath, finalPath);

    if (moveError) throw moveError;

    return finalPath;
  } catch (error) {
    console.error("Error in uploadArtistAvatar:", error);
    // Intentar limpiar el archivo temporal en caso de error
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const tempFileName = `avatar_new_${Date.now()}.${extension}`;
      const tempPath = `artist/${artistNickname}/${tempFileName}`;

      await supabase.storage.from("media").remove([tempPath]);
    } catch (cleanupError) {
      console.error("Error cleaning up temporary file:", cleanupError);
    }
    return null;
  }
}
