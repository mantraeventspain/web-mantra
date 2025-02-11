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
      // Validaciones básicas
      if (!formData.title || !formData.artistId) {
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
        .eq("id", formData.artistId)
        .single();

      if (artistError) throw artistError;

      const basePath = `artist/${artistData.nickname}`;
      let audioFilename = track?.filename;
      let artworkFilename = track?.artworkUrl;

      // Procesar archivos si se han seleccionado
      if (files.audio || files.artwork) {
        if (files.audio) {
          const audioExt = files.audio.name.split(".").pop();
          const audioBaseName = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");
          audioFilename = `${audioBaseName}.${audioExt}`;

          // Listar y eliminar archivos antiguos que coincidan con el nombre base
          const { data: existingFiles } = await supabase.storage
            .from("media")
            .list(basePath);

          if (existingFiles) {
            const oldAudioFiles = existingFiles
              .filter((file) => file.name.startsWith(audioBaseName + "."))
              .map((file) => `${basePath}/${file.name}`);

            if (oldAudioFiles.length > 0) {
              await supabase.storage.from("media").remove(oldAudioFiles);
            }
          }

          const { error: audioError } = await supabase.storage
            .from("media")
            .upload(`${basePath}/${audioFilename}`, files.audio);

          if (audioError) throw audioError;
        }

        if (files.artwork) {
          const artworkExt = files.artwork.name.split(".").pop();
          const artworkBaseName = `${formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-icon`;
          artworkFilename = `${artworkBaseName}.${artworkExt}`;

          // Listar y eliminar archivos antiguos que coincidan con el nombre base
          const { data: existingFiles } = await supabase.storage
            .from("media")
            .list(basePath);

          if (existingFiles) {
            const oldArtworkFiles = existingFiles
              .filter((file) => file.name.startsWith(artworkBaseName + "."))
              .map((file) => `${basePath}/${file.name}`);

            if (oldArtworkFiles.length > 0) {
              await supabase.storage.from("media").remove(oldArtworkFiles);
            }
          }

          const { error: artworkError } = await supabase.storage
            .from("media")
            .upload(`${basePath}/${artworkFilename}`, files.artwork);

          if (artworkError) throw artworkError;
        }

        filesSuccess = true;
      }

      // Si cambió el artista, necesitamos mover los archivos
      if (track && track.artistId !== formData.artistId) {
        // Obtener información de ambos artistas
        const { data: artists, error: artistsError } = await supabase
          .from("artists")
          .select("id, nickname")
          .in("id", [track.artistId, formData.artistId]);

        if (artistsError) throw artistsError;

        const oldArtist = artists.find((a) => a.id === track.artistId);
        const newArtist = artists.find((a) => a.id === formData.artistId);

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
        if (formData.isFeatured) {
          const { error: updateErrorFeatured } = await supabase
            .from("tracks")
            .update({ is_featured: false })
            .eq("is_featured", true);

          if (updateErrorFeatured) throw updateErrorFeatured;
        }

        const { error: updateError } = await supabase
          .from("tracks")
          .update({
            title: formData.title,
            artist_id: formData.artistId,
            release_date: formData.releaseDate,
            beatport_url: formData.beatportUrl,
            is_featured: formData.isFeatured,
            ...(audioFilename && { filename: audioFilename }),
            ...(artworkFilename && { filename_icon: artworkFilename }),
          })
          .eq("id", track.id);

        if (updateError) throw updateError;
      } else {
        if (formData.isFeatured) {
          const { error: updateError } = await supabase
            .from("tracks")
            .update({ is_featured: false })
            .eq("is_featured", true);

          if (updateError) throw updateError;
        }

        const { error: insertError } = await supabase.from("tracks").insert({
          title: formData.title,
          artist_id: formData.artistId,
          release_date: formData.releaseDate,
          beatport_url: formData.beatportUrl,
          is_featured: formData.isFeatured,
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
