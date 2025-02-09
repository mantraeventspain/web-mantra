import { supabase } from "../lib/supabase";

export async function uploadEventImage(
  file: File,
  eventTitle: string,
  eventId: string
): Promise<string | null> {
  try {
    // Subir el nuevo imagen con nombre temporal
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const tempFileName = `image_new_${Date.now()}.${extension}`;
    const tempPath = `images/events/${eventId}/${tempFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(tempPath, file, {
        cacheControl: "3600",
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    // Buscar y eliminar la imagen anterior
    const { data: files, error: listError } = await supabase.storage
      .from("media")
      .list(`images/events/${eventId}`);

    if (listError) throw listError;

    const oldImage = files?.find((file) => file.name.startsWith("image."));
    if (oldImage) {
      const { error: deleteError } = await supabase.storage
        .from("media")
        .remove([`images/events/${eventId}/${oldImage.name}`]);

      if (deleteError) throw deleteError;
    }

    // Renombrar la nueva imagen
    const sanitizedTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const finalPath = `images/events/${sanitizedTitle}/image.${extension}`;
    const { error: moveError } = await supabase.storage
      .from("media")
      .move(tempPath, finalPath);

    if (moveError) throw moveError;

    return finalPath;
  } catch (error) {
    console.error("Error in uploadEventImage:", error);
    // Intentar limpiar el archivo temporal en caso de error
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const tempFileName = `image_new_${Date.now()}.${extension}`;
      const tempPath = `images/events/${eventId}/${tempFileName}`;

      await supabase.storage.from("media").remove([tempPath]);
    } catch (cleanupError) {
      console.error("Error cleaning up temporary file:", cleanupError);
    }
    return null;
  }
}
