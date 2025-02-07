import { useState } from "react";
import { supabase } from "../lib/supabase";

export function useVideoUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadVideo = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Primero subimos el nuevo video con un nombre temporal
      const tempFileName = `intro_new_${Date.now()}.mp4`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(`videos/${tempFileName}`, file);

      if (uploadError) throw uploadError;

      // Si la subida fue exitosa, intentamos eliminar el video anterior
      const { data: oldFiles } = await supabase.storage
        .from("media")
        .list("videos");

      const oldIntroVideo = oldFiles?.find((file) => file.name === "intro.mp4");

      if (oldIntroVideo) {
        await supabase.storage
          .from("media")
          .remove([`videos/${oldIntroVideo.name}`]);
      }

      // Renombramos el nuevo video a intro.mp4
      const { error: moveError } = await supabase.storage
        .from("media")
        .move(`videos/${tempFileName}`, "videos/intro.mp4");

      if (moveError) throw moveError;
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Error al subir el video"));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadVideo, isLoading, error };
}
