import { useRef } from "react";
import { createPortal } from "react-dom";
import type { Artist } from "../../types/artist";
import { X } from "lucide-react";
import { useArtistForm } from "../../hooks/useArtistForm";

interface ArtistFormProps {
  artist?: Artist;
  onSuccess: () => void;
  onCancel: () => void;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ArtistForm = ({
  artist,
  onSuccess,
  onCancel,
}: ArtistFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const { formData, setFormData, setAvatarFile, status, handleSubmit } =
    useArtistForm(artist, onSuccess);

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      <div className="absolute inset-0 bg-black opacity-90" />

      <div className="relative w-full max-w-2xl bg-mantra-blue rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-mantra-darkBlue px-6 py-4 border-b border-mantra-gold/20 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-semibold text-white">
            {artist ? "Editar Artista" : "Nuevo Artista"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nickname *
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nickname: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primer Apellido
                </label>
                <input
                  type="text"
                  value={formData.lastName1}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName1: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Segundo Apellido
                </label>
                <input
                  type="text"
                  value={formData.lastName2}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName2: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Avatar
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                      alert(
                        "El archivo debe ser una imagen (JPEG, PNG, WEBP o GIF)"
                      );
                      e.target.value = "";
                      return;
                    }
                    setAvatarFile(file);
                  }
                }}
                className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
              />
              <p className="mt-1 text-sm text-gray-400">
                Formatos permitidos: JPEG, PNG, WEBP, GIF. Tamaño máximo: 5MB
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Usuario de Instagram
                </label>
                <input
                  type="text"
                  value={formData.instagram_username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      instagram_username: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  placeholder="usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de SoundCloud
                </label>
                <input
                  type="url"
                  value={formData.soundcloud_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      soundcloud_url: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  placeholder="https://soundcloud.com/usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de Beatport
                </label>
                <input
                  type="url"
                  value={formData.beatport_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      beatport_url: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  placeholder="https://www.beatport.com/artist/nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rol
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  placeholder="DJ Residente"
                />
              </div>
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
            {status.success.avatar && (
              <span className="text-green-400 text-sm">
                ✓ Avatar actualizado correctamente
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
