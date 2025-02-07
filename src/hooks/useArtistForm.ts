import { useState } from "react";
import { supabase } from "../lib/supabase";
import { uploadArtistAvatar } from "../utils/artistHelpers";
import type { Artist } from "../types/artist";

interface FormStatus {
  isLoading: boolean;
  success: {
    data?: boolean;
    avatar?: boolean;
  };
  error: string | null;
}

// Definimos un tipo para los valores que puede tener un artista
type ArtistValue = string | null | undefined | boolean;

export function useArtistForm(artist?: Artist, onSuccess?: () => void) {
  const [formData, setFormData] = useState({
    nickname: artist?.nickname || "",
    firstName: artist?.firstName || "",
    lastName1: artist?.lastName1 || "",
    lastName2: artist?.lastName2 || "",
    description: artist?.description || "",
    instagram_username: artist?.instagram_username || "",
    soundcloud_url: artist?.soundcloud_url || "",
    beatport_url: artist?.beatport_url || "",
    role: artist?.role || "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [status, setStatus] = useState<FormStatus>({
    isLoading: false,
    success: {},
    error: null,
  });

  const normalizeValue = (value: ArtistValue): string | null | boolean => {
    // Convierte cadenas vacías a null para la comparación
    if (value === "" || value === undefined) return null;
    return value;
  };

  const handleSubmit = async () => {
    setStatus({ isLoading: true, success: {}, error: null });

    try {
      // Validaciones
      if (!formData.nickname.match(/^[a-zA-Z0-9_\s-]+$/)) {
        throw new Error(
          "El nickname solo puede contener letras, números, guiones, guiones bajos y espacios"
        );
      }

      if (
        formData.soundcloud_url &&
        !formData.soundcloud_url.match(/^https:\/\/soundcloud\.com\/.+$/)
      ) {
        throw new Error("URL de SoundCloud inválida");
      }

      if (
        formData.beatport_url &&
        !formData.beatport_url.match(/^https:\/\/www\.beatport\.com\/.+$/)
      ) {
        throw new Error("URL de Beatport inválida");
      }

      // Detectar cambios en los datos con manejo mejorado de nulos y cadenas vacías
      const hasDataChanges = Object.entries(formData).some(([key, value]) => {
        const currentValue = normalizeValue(value);
        const originalValue = normalizeValue(
          artist?.[key as keyof typeof artist]
        );
        return currentValue !== originalValue;
      });

      let dataSuccess = false;
      if (hasDataChanges && artist?.id) {
        // Preparar datos para la actualización, convirtiendo cadenas vacías a null
        const dataToUpdate = Object.entries(formData).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: normalizeValue(value),
          }),
          {}
        );

        const { error: dbError } = await supabase
          .from("artists")
          .update(dataToUpdate)
          .eq("id", artist.id);

        if (dbError) throw dbError;
        dataSuccess = true;
      }

      // Subir avatar si existe
      let avatarSuccess = false;
      if (avatarFile) {
        await uploadArtistAvatar(avatarFile, formData.nickname);
        avatarSuccess = true;
      }

      setStatus({
        isLoading: false,
        success: {
          data: dataSuccess,
          avatar: avatarSuccess,
        },
        error: null,
      });

      if (onSuccess) onSuccess();
    } catch (e) {
      setStatus({
        isLoading: false,
        success: {},
        error: e instanceof Error ? e.message : "Error al guardar el artista",
      });
    }
  };

  return {
    formData,
    setFormData,
    avatarFile,
    setAvatarFile,
    status,
    handleSubmit,
  };
}
