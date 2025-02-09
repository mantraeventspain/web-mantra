import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Event } from "../types";
// import type { Database } from "../types/database.types";
import type { Artist } from "../types/artist";
import { uploadEventImage } from "../utils/eventHelpers";

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
    lineup?: boolean;
  };
  error: string | null;
}

export function useEventForm(event?: Event, onSuccess?: () => void) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    date: event?.date ? formatDateForInput(event.date) : "",
    location: event?.location || "",
  });

  const [lineup, setLineup] = useState<LineupArtist[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<FormStatus>({
    isLoading: false,
    success: {},
    error: null,
  });

  function formatDateForInput(isoString: string): string {
    const date = new Date(isoString);
    return date.toISOString().slice(0, 16); // Obtiene YYYY-MM-DDThh:mm
  }

  useEffect(() => {
    async function fetchLineup() {
      if (!event?.id) return;

      try {
        const { data: lineupData, error: lineupError } = await supabase
          .from("event_artists")
          .select(
            `
            is_headliner,
            performance_order,
            start_time,
            end_time,
            artists(*)
          `
          )
          .eq("event_id", event.id)
          .order("performance_order");

        if (lineupError) throw lineupError;

        const formattedLineup = lineupData.map((item) => ({
          ...item.artists,
          id: item.artists?.id || "",
          nickname: item.artists?.nickname || "",
          firstName: item.artists?.first_name || "",
          lastName1: item.artists?.last_name1 || "",
          lastName2: item.artists?.last_name2 || "",
          description: item.artists?.description || "",
          instagram_username: item.artists?.instagram_username || "",
          soundcloud_url: item.artists?.soundcloud_url || "",
          beatport_url: item.artists?.beatport_url || "",
          role: item.artists?.role || "",
          is_active: item.artists?.is_active || false,
          isHeadliner: item.is_headliner || false,
          performanceOrder: item.performance_order,
          startTime: item.start_time,
          endTime: item.end_time,
          avatarUrl: null, // Se puede agregar la lógica para obtener la URL del avatar si es necesario
        })) as LineupArtist[];

        setLineup(formattedLineup);
      } catch (e) {
        console.error("Error al cargar el lineup:", e);
      }
    }

    fetchLineup();
  }, [event?.id]);

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
        try {
          const imagePath = await uploadEventImage(
            imageFile,
            formData.title,
            eventId
          );

          if (imagePath) {
            // Actualizar la ruta de la imagen en la base de datos
            const { error: updateError } = await supabase
              .from("events")
              .update({ image_url: imagePath })
              .eq("id", eventId);

            if (updateError) throw updateError;
            imageSuccess = true;
          }
        } catch (error) {
          console.error("Error uploading event image:", error);
          throw new Error("Error al subir la imagen del evento");
        }
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
