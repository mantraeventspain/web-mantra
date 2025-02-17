import { useRef } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2 } from "lucide-react";
import type { Event } from "../../types";
import { useEventForm } from "../../hooks/useEventForm";
import { useArtists } from "../../hooks/useArtists";

interface EventFormProps {
  event?: Event;
  onSuccess: () => void;
  onCancel: () => void;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Función auxiliar para manejar las horas
function setTimeForEvent(date: string, time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const eventDate = new Date(date);

  // Si la hora es menor a 6, asumimos que es del día siguiente
  if (hours < 6) {
    eventDate.setDate(eventDate.getDate() + 1);
  }

  eventDate.setHours(hours, minutes);
  return eventDate.toISOString();
}

// Función auxiliar para obtener la hora formateada
function getFormattedTime(isoString: string | null): string {
  if (!isoString) return "";

  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

export const EventForm = ({ event, onSuccess, onCancel }: EventFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const { artists } = useArtists({ includeInactive: false });
  const {
    formData,
    setFormData,
    lineup,
    setLineup,
    setImageFile,
    status,
    handleSubmit,
  } = useEventForm(event, onSuccess);

  const handleAddArtist = () => {
    setLineup([
      ...lineup,
      {
        ...artists[0],
        isHeadliner: false,
        performanceOrder: lineup.length + 1,
        startTime: null,
        endTime: null,
      },
    ]);
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      <div className="absolute inset-0 bg-black opacity-90" />

      <div className="relative w-full max-w-4xl bg-mantra-blue rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="sticky top-0 z-10 bg-mantra-darkBlue px-6 py-4 border-b border-mantra-gold/20 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-semibold text-white">
            {event ? "Editar Evento" : "Nuevo Evento"}
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
              <div className="md:col-span-2">
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

              <div className="md:col-span-2">
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
                  Fecha *
                </label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ubicación *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagen del Evento
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
                      setImageFile(file);
                    }
                  }}
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="border-t border-mantra-gold/20 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Line-up</h3>
                <button
                  type="button"
                  onClick={handleAddArtist}
                  className="flex items-center gap-2 px-4 py-2 bg-mantra-gold/10 hover:bg-mantra-gold/20 text-mantra-gold rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Añadir Artista
                </button>
              </div>

              <div className="space-y-4">
                {lineup.map((artist, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-black/20 rounded-lg"
                  >
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Artista
                      </label>
                      <select
                        value={artist.id}
                        onChange={(e) => {
                          const selectedArtist = artists.find(
                            (a) => a.id === e.target.value
                          );
                          if (selectedArtist) {
                            const updatedLineup = [...lineup];
                            updatedLineup[index] = {
                              ...selectedArtist,
                              isHeadliner: artist.isHeadliner,
                              performanceOrder: artist.performanceOrder,
                              startTime: artist.startTime,
                              endTime: artist.endTime,
                            };
                            setLineup(updatedLineup);
                          }
                        }}
                        className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                      >
                        {artists.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.nickname}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Hora Inicio
                      </label>
                      <input
                        type="time"
                        value={
                          artist.startTime
                            ? getFormattedTime(artist.startTime)
                            : ""
                        }
                        onChange={(e) => {
                          const updatedLineup = [...lineup];
                          updatedLineup[index] = {
                            ...artist,
                            startTime: setTimeForEvent(
                              formData.date,
                              e.target.value
                            ),
                          };
                          setLineup(updatedLineup);
                        }}
                        className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Hora Fin
                      </label>
                      <input
                        type="time"
                        value={
                          artist.endTime ? getFormattedTime(artist.endTime) : ""
                        }
                        onChange={(e) => {
                          const updatedLineup = [...lineup];
                          updatedLineup[index] = {
                            ...artist,
                            endTime: setTimeForEvent(
                              formData.date,
                              e.target.value
                            ),
                          };
                          setLineup(updatedLineup);
                        }}
                        className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                      />
                    </div>

                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                          <input
                            type="checkbox"
                            checked={artist.isHeadliner}
                            onChange={(e) => {
                              const updatedLineup = [...lineup];
                              updatedLineup[index] = {
                                ...artist,
                                isHeadliner: e.target.checked,
                              };
                              setLineup(updatedLineup);
                            }}
                            className="form-checkbox h-4 w-4 text-mantra-gold rounded border-mantra-gold/20 bg-black/30"
                          />
                          Headliner
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updatedLineup = lineup.filter(
                            (_, i) => i !== index
                          );
                          setLineup(updatedLineup);
                        }}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
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
            {status.success.image && (
              <span className="text-green-400 text-sm">
                ✓ Imagen actualizada correctamente
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
