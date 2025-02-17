import { useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useArtists } from "../../hooks/useArtists";
import { useTrackForm } from "../../hooks/useTrackForm";
import type { Track } from "../../types/track";

interface TrackFormProps {
  track?: Track;
  onSuccess: () => void;
  onCancel: () => void;
}

const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "video/mp4",
  "audio/x-m4a",
  "audio/mp4",
];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const TrackForm = ({ track, onSuccess, onCancel }: TrackFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const { artists } = useArtists({ includeInactive: false });
  const { formData, setFormData, setFiles, status, handleSubmit } =
    useTrackForm(track, onSuccess);

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      <div className="absolute inset-0 bg-black opacity-90" />

      <div className="relative w-full max-w-2xl bg-mantra-blue rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="sticky top-0 z-10 bg-mantra-darkBlue px-6 py-4 border-b border-mantra-gold/20 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-semibold text-white">
            {track ? "Editar Track" : "Nuevo Track"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form ref={formRef} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Artista *
                </label>
                <select
                  value={formData.artistId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      artistId: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  required
                >
                  <option value="">Selecciona un artista</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.nickname}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha de Lanzamiento
                </label>
                <input
                  type="date"
                  value={formData.releaseDate || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      releaseDate: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de Beatport
                </label>
                <input
                  type="url"
                  value={formData.beatportUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      beatportUrl: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  placeholder="https://www.beatport.com/track/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de SoundCloud
                </label>
                <input
                  type="url"
                  value={formData.soundcloudUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      soundcloudUrl: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  placeholder="https://soundcloud.com/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Archivo de Audio *
              </label>
              <input
                type="file"
                accept={ALLOWED_AUDIO_TYPES.join(",")}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
                      alert(
                        "El archivo debe ser un audio (MP3, WAV, OGG, MP4, M4A)"
                      );
                      e.target.value = "";
                      return;
                    }

                    setFiles((prev) => ({ ...prev, audio: file }));
                  }
                }}
                className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
              />
              <p className="mt-1 text-sm text-gray-400">
                Formatos permitidos: MP3, WAV, OGG, MP4, M4A
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Carátula
              </label>
              <input
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                      alert(
                        "El archivo debe ser una imagen (JPEG, PNG o WEBP)"
                      );
                      e.target.value = "";
                      return;
                    }
                    setFiles((prev) => ({ ...prev, artwork: file }));
                  }
                }}
                className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
              />
              <p className="mt-1 text-sm text-gray-400">
                Formatos permitidos: JPEG, PNG, WEBP
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isFeatured: e.target.checked,
                    }))
                  }
                  className="form-checkbox h-4 w-4 text-mantra-gold rounded border-mantra-gold/20 bg-black/30"
                />
                <span className="text-sm text-gray-300">Track Destacado</span>
              </label>
            </div>
          </form>
        </div>

        <div className="sticky bottom-0 z-10 bg-mantra-darkBlue px-6 py-4 border-t border-mantra-gold/20 flex items-center justify-between rounded-b-xl">
          <div className="flex gap-2">
            {status.success.data && (
              <span className="text-green-400 text-sm">
                ✓ Datos actualizados correctamente
              </span>
            )}
            {status.success.files && (
              <span className="text-green-400 text-sm">
                ✓ Archivos actualizados correctamente
              </span>
            )}
            {status.error && (
              <span className="text-red-400 text-sm">✗ {status.error}</span>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              disabled={status.isLoading}
            >
              Cancelar
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              disabled={status.isLoading}
              className="px-4 py-2 bg-mantra-gold hover:bg-mantra-darkGold text-black rounded-lg transition-colors disabled:opacity-50"
            >
              {status.isLoading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
