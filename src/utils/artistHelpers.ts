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
    const extension = file.name.split(".").pop()?.toLowerCase();
    const tempFileName = `temp_${Date.now()}.${extension}`;
    const finalFileName = `avatar.${extension}`;
    const artistPath = `artist/${normalizedNickname}`;

    // 1. Subir con nombre temporal
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(`${artistPath}/${tempFileName}`, file);

    if (uploadError) throw uploadError;

    // 2. Listar archivos para encontrar el avatar anterior
    const { data: files, error: listError } = await supabase.storage
      .from("media")
      .list(artistPath, {
        limit: 10,
        search: "avatar.",
      });

    if (listError) throw listError;

    // 3. Eliminar avatar anterior si existe
    if (files && files.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from("media")
        .remove([`${artistPath}/${files[0].name}`]);

      if (deleteError) throw deleteError;
    }

    // 4. Renombrar el archivo temporal al nombre final
    const { error: moveError } = await supabase.storage
      .from("media")
      .move(`${artistPath}/${tempFileName}`, `${artistPath}/${finalFileName}`);

    if (moveError) throw moveError;

    return finalFileName;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return null;
  }
}

export async function deleteArtistFiles(normalizedNickname: string) {
  try {
    const artistPath = `artist/${normalizedNickname}`;

    // 1. Listar todos los archivos en el directorio del artista
    const { data: files, error: listError } = await supabase.storage
      .from("media")
      .list(artistPath);

    if (listError) throw listError;

    if (files && files.length > 0) {
      // 2. Crear array con las rutas completas de los archivos
      const filePaths = files.map((file) => `${artistPath}/${file.name}`);

      // 3. Eliminar todos los archivos
      const { error: deleteError } = await supabase.storage
        .from("media")
        .remove(filePaths);

      if (deleteError) throw deleteError;
    }

    // 4. Eliminar la carpeta vacía
    const { error: emptyFolderError } = await supabase.storage
      .from("media")
      .remove([artistPath]);

    if (emptyFolderError) {
      console.error("Error deleting empty folder:", emptyFolderError);
      // No lanzamos el error ya que la eliminación de la carpeta vacía es secundaria
    }

    return true;
  } catch (error) {
    console.error("Error deleting artist files:", error);
    throw error;
  }
}

export async function checkArtistReferences(artistId: string) {
  try {
    // Verificar tracks asociados
    const { data: tracks, error: tracksError } = await supabase
      .from("tracks")
      .select("title")
      .eq("artist_id", artistId);

    if (tracksError) throw tracksError;

    // Verificar eventos asociados
    const { data: events, error: eventsError } = await supabase
      .from("event_artists")
      .select("events(title)")
      .eq("artist_id", artistId);

    if (eventsError) throw eventsError;

    const references = {
      tracks: tracks || [],
      events: events || [],
      canDelete: (tracks?.length || 0) === 0 && (events?.length || 0) === 0,
      message: "",
    };

    if (tracks?.length || events?.length) {
      let message = "No se puede eliminar el artista porque:";
      if (tracks?.length) {
        message += `\n- Tiene ${tracks.length} track(s) asociado(s)`;
      }
      if (events?.length) {
        message += `\n- Aparece en ${events.length} evento(s)`;
      }
      message += "\n\nPor favor, elimina primero estas referencias.";
      references.message = message;
    }

    return references;
  } catch (error) {
    console.error("Error checking artist references:", error);
    throw error;
  }
}
