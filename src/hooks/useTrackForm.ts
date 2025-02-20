import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { Track } from "../types/track";
import type { TrackFile } from "../types/track";
import type { FormStatus } from "../types/form";

interface TrackFormData {
  title: string;
  artistId: string;
  releaseDate: string | null;
  beatportUrl: string | null;
  soundcloudUrl: string | null;
  isFeatured: boolean;
}

async function deleteTrackFiles(track: Track) {
  const { data: artistData } = await supabase
    .from("artists")
    .select("nickname")
    .eq("id", track.artistId)
    .single();

  if (!artistData) return;

  const basePath = `artist/${artistData.nickname}`;

  // Listar todos los archivos en el directorio del artista
  const { data: files } = await supabase.storage.from("media").list(basePath);

  if (!files) return;

  const filesToDelete = [];

  // Buscar archivos que coincidan con el nombre base del track (sin extensión)
  const trackBaseName = track.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const artworkBaseName = `${trackBaseName}-icon`;

  for (const file of files) {
    // Comprobar si el archivo coincide con el patrón del track o artwork
    if (
      file.name.startsWith(trackBaseName + ".") ||
      file.name.startsWith(artworkBaseName + ".")
    ) {
      filesToDelete.push(`${basePath}/${file.name}`);
    }
  }

  if (filesToDelete.length > 0) {
    await supabase.storage.from("media").remove(filesToDelete);
  }
}

async function deleteTrackFile(basePath: string, filename: string | null) {
  if (!filename) return;

  const { error } = await supabase.storage
    .from("media")
    .remove([`${basePath}/${filename}`]);

  if (error) throw error;
}

export async function deleteTrack(track: Track) {
  try {
    // Primero eliminamos los archivos
    await deleteTrackFiles(track);

    // Luego eliminamos el registro de la base de datos
    const { error } = await supabase.from("tracks").delete().eq("id", track.id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting track:", error);
    throw error;
  }
}

export function useTrackForm(track?: Track, onSuccess?: () => void) {
  const [formData, setFormData] = useState<TrackFormData>({
    title: track?.title || "",
    artistId: track?.artistId || "",
    releaseDate: track?.releaseDate || null,
    beatportUrl: track?.beatportUrl || null,
    soundcloudUrl: track?.soundcloudUrl || null,
    isFeatured: track?.isFeatured || false,
  });

  const [files, setFiles] = useState<TrackFile>({
    audio: null,
    artwork: null,
  });

  const [status, setStatus] = useState<FormStatus>({
    isLoading: false,
    success: {},
    error: null,
  });

  const handleSubmit = async () => {
    setStatus({ isLoading: true, success: {}, error: null });

    try {
      // Trim all string values in formData
      const trimmedFormData = {
        ...formData,
        title: formData.title.trim(),
        beatportUrl: formData.beatportUrl?.trim() || null,
        soundcloudUrl: formData.soundcloudUrl?.trim() || null,
      };

      // Validaciones básicas
      if (!trimmedFormData.title || !trimmedFormData.artistId) {
        throw new Error("Por favor completa todos los campos requeridos");
      }

      if (!track && !files.audio) {
        throw new Error("Debes seleccionar un archivo de audio");
      }

      let dataSuccess = false;
      let filesSuccess = false;

      const { data: artistData, error: artistError } = await supabase
        .from("artists")
        .select("nickname")
        .eq("id", trimmedFormData.artistId)
        .single();

      if (artistError) throw artistError;

      const basePath = `artist/${artistData.nickname}`;
      let audioFilename = track?.filename;
      let artworkFilename = track?.artworkUrl;

      if (track?.id) {
        const { data: currentTrack, error: trackError } = await supabase
          .from("tracks")
          .select("filename, filename_icon")
          .eq("id", track.id)
          .single();

        if (trackError) throw trackError;

        if (files.audio && currentTrack.filename) {
          await deleteTrackFile(basePath, currentTrack.filename);
        }

        if (files.artwork && currentTrack.filename_icon) {
          await deleteTrackFile(basePath, currentTrack.filename_icon);
        }

        audioFilename = files.audio ? audioFilename : currentTrack.filename;
        artworkFilename = files.artwork
          ? artworkFilename
          : currentTrack.filename_icon;
      }

      if (files.audio || files.artwork) {
        if (files.audio) {
          const audioExt = files.audio.name.split(".").pop();
          const audioBaseName = trimmedFormData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");
          audioFilename = `${audioBaseName}.${audioExt}`;

          const { error: audioError } = await supabase.storage
            .from("media")
            .upload(`${basePath}/${audioFilename}`, files.audio);

          if (audioError) throw audioError;
        }

        if (files.artwork) {
          const artworkExt = files.artwork.name.split(".").pop();
          const artworkBaseName = `${trimmedFormData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-icon`;
          artworkFilename = `${artworkBaseName}.${artworkExt}`;

          const { error: artworkError } = await supabase.storage
            .from("media")
            .upload(`${basePath}/${artworkFilename}`, files.artwork);

          if (artworkError) throw artworkError;
        }

        filesSuccess = true;
      }

      // Si cambió el artista, necesitamos mover los archivos
      if (track && track.artistId !== trimmedFormData.artistId) {
        // Obtener información de ambos artistas
        const { data: artists, error: artistsError } = await supabase
          .from("artists")
          .select("id, nickname")
          .in("id", [track.artistId, trimmedFormData.artistId]);

        if (artistsError) throw artistsError;

        const oldArtist = artists.find((a) => a.id === track.artistId);
        const newArtist = artists.find(
          (a) => a.id === trimmedFormData.artistId
        );

        if (oldArtist && newArtist) {
          const oldBasePath = `artist/${oldArtist.nickname}`;
          const newBasePath = `artist/${newArtist.nickname}`;

          // Mover archivos existentes al nuevo directorio
          if (track.filename) {
            await supabase.storage
              .from("media")
              .move(
                `${oldBasePath}/${track.filename}`,
                `${newBasePath}/${track.filename}`
              );
          }

          if (track.artworkUrl) {
            await supabase.storage
              .from("media")
              .move(
                `${oldBasePath}/${track.artworkUrl}`,
                `${newBasePath}/${track.artworkUrl}`
              );
          }
        }
      }

      // Actualizar o crear el track en la base de datos
      if (track?.id) {
        if (trimmedFormData.isFeatured) {
          const { error: updateErrorFeatured } = await supabase
            .from("tracks")
            .update({ is_featured: false })
            .eq("is_featured", true);

          if (updateErrorFeatured) throw updateErrorFeatured;
        }

        const { error: updateError } = await supabase
          .from("tracks")
          .update({
            title: trimmedFormData.title,
            artist_id: trimmedFormData.artistId,
            release_date: trimmedFormData.releaseDate,
            beatport_url: trimmedFormData.beatportUrl,
            is_featured: trimmedFormData.isFeatured,
            soundcloud_url: trimmedFormData.soundcloudUrl,
            filename: audioFilename,
            filename_icon: artworkFilename,
          })
          .eq("id", track.id);

        if (updateError) throw updateError;
      } else {
        if (trimmedFormData.isFeatured) {
          const { error: updateError } = await supabase
            .from("tracks")
            .update({ is_featured: false })
            .eq("is_featured", true);

          if (updateError) throw updateError;
        }

        const { error: insertError } = await supabase.from("tracks").insert({
          title: trimmedFormData.title,
          artist_id: trimmedFormData.artistId,
          release_date: trimmedFormData.releaseDate,
          beatport_url: trimmedFormData.beatportUrl,
          is_featured: trimmedFormData.isFeatured,
          soundcloud_url: trimmedFormData.soundcloudUrl,
          filename: audioFilename!,
          filename_icon: artworkFilename || null,
        });

        if (insertError) throw insertError;
      }

      dataSuccess = true;

      setStatus({
        isLoading: false,
        success: {
          data: dataSuccess,
          files: filesSuccess,
        },
        error: null,
      });

      if (onSuccess) onSuccess();
    } catch (e) {
      setStatus({
        isLoading: false,
        success: {},
        error: e instanceof Error ? e.message : "Error al guardar el track",
      });
    }
  };

  return {
    formData,
    setFormData,
    files,
    setFiles,
    status,
    handleSubmit,
  };
}
