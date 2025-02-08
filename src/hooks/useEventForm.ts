import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { Event } from "../types";
// import type { Database } from "../types/database.types";
import type { Artist } from "../types/artist";

interface LineupArtist extends Artist {
  isHeadliner: boolean;
  performanceOrder: number;
  startTime: string | null;
  endTime: string | null;
}

interface FormStatus {
  isLoading: boolean;
  success: {
    data?: boolean;
    image?: boolean;
  };
  error: string | null;
}

export function useEventForm(event?: Event, onSuccess?: () => void) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    date: event?.date || "",
    location: event?.location || "",
  });

  const [lineup, setLineup] = useState<LineupArtist[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<FormStatus>({
    isLoading: false,
    success: {},
    error: null,
  });

  const handleSubmit = async () => {
    setStatus({ isLoading: true, success: {}, error: null });

    try {
      // Validaciones básicas
      if (!formData.title || !formData.date || !formData.location) {
        throw new Error("Por favor completa todos los campos requeridos");
      }

      // Validar que solo haya un headliner
      const headliners = lineup.filter((artist) => artist.isHeadliner);
      if (headliners.length > 1) {
        throw new Error("Solo puede haber un artista principal por evento");
      }

      let dataSuccess = false;
      let eventId = event?.id;

      if (event?.id) {
        // Modo actualización
        const { error: dbError } = await supabase
          .from("events")
          .update({
            title: formData.title,
            description: formData.description,
            date: formData.date,
            location: formData.location,
          })
          .eq("id", event.id);

        if (dbError) throw dbError;
      } else {
        // Modo creación
        const { data: newEvent, error: dbError } = await supabase
          .from("events")
          .insert({
            title: formData.title,
            description: formData.description,
            date: formData.date,
            location: formData.location,
          })
          .select()
          .single();

        if (dbError) throw dbError;
        eventId = newEvent.id;
      }

      // Gestionar lineup
      if (eventId) {
        // Eliminar lineup existente
        await supabase.from("event_artists").delete().eq("event_id", eventId);

        // Insertar nuevo lineup
        const lineupData = lineup.map((artist, index) => ({
          event_id: eventId,
          artist_id: artist.id,
          is_headliner: artist.isHeadliner,
          performance_order: artist.performanceOrder || index + 1,
          start_time: artist.startTime,
          end_time: artist.endTime,
        }));

        const { error: lineupError } = await supabase
          .from("event_artists")
          .insert(lineupData);

        if (lineupError) throw lineupError;
      }

      dataSuccess = true;

      // Subir imagen si existe
      let imageSuccess = false;
      if (imageFile && eventId) {
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(`images/events/${eventId}`, imageFile);

        if (uploadError) throw uploadError;
        imageSuccess = true;
      }

      setStatus({
        isLoading: false,
        success: {
          data: dataSuccess,
          image: imageSuccess,
        },
        error: null,
      });

      if (onSuccess) onSuccess();
    } catch (e) {
      setStatus({
        isLoading: false,
        success: {},
        error: e instanceof Error ? e.message : "Error al guardar el evento",
      });
    }
  };

  return {
    formData,
    setFormData,
    lineup,
    setLineup,
    imageFile,
    setImageFile,
    status,
    handleSubmit,
  };
}
