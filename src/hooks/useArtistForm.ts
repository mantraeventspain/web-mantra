import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { uploadArtistAvatar } from "../utils/artistHelpers";
import { normalizeNickname } from "../utils/stringUtils";
import type { Artist } from "../types/artist";
import type { Database } from "../types/database.types";

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
    normalized_nickname: artist?.normalized_nickname || "",
    firstName: artist?.firstName || "",
    lastName1: artist?.lastName1 || "",
    lastName2: artist?.lastName2 || "",
    description: artist?.description || "",
    instagram_username: artist?.instagram_username || "",
    soundcloud_url: artist?.soundcloud_url || "",
    beatport_url: artist?.beatport_url || "",
    role: artist?.role || "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      normalized_nickname: normalizeNickname(prev.nickname),
    }));
  }, [formData.nickname]);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [status, setStatus] = useState<FormStatus>({
    isLoading: false,
    success: {},
    error: null,
  });

  const keyMapping: Record<string, string> = {
    firstName: "first_name",
    lastName1: "last_name1",
    lastName2: "last_name2",
    instagram_username: "instagram_username",
    soundcloud_url: "soundcloud_url",
    beatport_url: "beatport_url",
    nickname: "nickname",
    description: "description",
    role: "role",
  };

  const normalizeValue = (value: ArtistValue): string | null | boolean => {
    // Convierte cadenas vacías a null para la comparación
    if (value === "" || value === undefined) return null;
    return value;
  };

  const normalizeKeys = (data: typeof formData) => {
    const normalizedData = Object.entries(data).reduce((acc, [key, value]) => {
      const dbKey = keyMapping[key] || key;
      const normalizedValue = normalizeValue(value);

      // Siempre incluimos el nickname y normalized_nickname
      if (dbKey === "nickname") {
        acc[dbKey] = value || ""; // Usamos el valor original para nickname
        acc["normalized_nickname"] = normalizeNickname(value || "");
      }
      // Para otros campos, siempre los incluimos, incluso si son null
      else if (dbKey !== "normalized_nickname") {
        acc[dbKey] = normalizedValue;
      }

      return acc;
    }, {} as Record<string, string | null | boolean>);

    return normalizedData;
  };

  // Actualizar el normalized_nickname cuando cambie el nickname
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      normalized_nickname: normalizeNickname(prev.nickname),
    }));
  }, [formData.nickname]);

  const handleSubmit = async () => {
    setStatus({ isLoading: true, success: {}, error: null });

    try {
      // Validaciones
      if (!formData.nickname.match(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9_\s-]+$/)) {
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

      let dataSuccess = false;

      if (artist?.id) {
        // Modo actualización
        const formFields = Object.keys(formData) as (keyof typeof formData)[];
        const changedFields = formFields.reduce((acc, key) => {
          const currentValue = normalizeValue(formData[key]);
          const originalValue = normalizeValue(
            artist[key as keyof typeof artist]
          );

          // Incluimos el campo si ha cambiado o si es una cadena vacía (para permitir establecer null)
          if (currentValue !== originalValue || formData[key] === "") {
            acc[key as keyof typeof formData] = formData[key];
          }
          return acc;
        }, {} as Record<keyof typeof formData, string>);

        const dataToUpdate = normalizeKeys(changedFields);

        const { error: dbError } = await supabase
          .from("artists")
          .update(dataToUpdate)
          .eq("id", artist.id);

        if (dbError) throw dbError;
        dataSuccess = true;
      } else {
        // Modo creación
        const normalizedData = normalizeKeys(formData);
        const dataToInsert = {
          ...normalizedData,
          is_active: true,
          nickname: formData.nickname,
        } as Database["public"]["Tables"]["artists"]["Insert"];

        const { error: dbError } = await supabase
          .from("artists")
          .insert(dataToInsert);

        if (dbError) throw dbError;
        dataSuccess = true;
      }

      // Subir avatar si existe
      let avatarSuccess = false;
      if (avatarFile) {
        await uploadArtistAvatar(
          avatarFile,
          normalizeNickname(formData.nickname)
        );
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
