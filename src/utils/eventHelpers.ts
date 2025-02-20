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

async function deleteEventFiles(eventId: string) {
  try {
    // List all files in the event directory
    const { data: files, error: listError } = await supabase.storage
      .from("media")
      .list(`images/events/${eventId}`);

    if (listError) throw listError;

    if (files && files.length > 0) {
      // Create array with complete file paths
      const filePaths = files.map(
        (file) => `images/events/${eventId}/${file.name}`
      );

      // Delete all files
      const { error: deleteError } = await supabase.storage
        .from("media")
        .remove(filePaths);

      if (deleteError) throw deleteError;
    }

    return true;
  } catch (error) {
    console.error("Error deleting event files:", error);
    throw error;
  }
}

export async function deleteEvent(eventId: string) {
  try {
    // Delete lineup first (foreign key constraint)
    const { error: lineupError } = await supabase
      .from("event_artists")
      .delete()
      .eq("event_id", eventId);

    if (lineupError) throw lineupError;

    // Delete event files
    await deleteEventFiles(eventId);

    // Delete event record
    const { error: eventError } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (eventError) throw eventError;

    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}
