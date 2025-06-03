import { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ExternalLink,
  Link as LinkIcon,
  Image,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  TicketEvent,
  TicketEventInsert,
  TicketEventUpdate,
} from "../../types/tickets";

interface EditingEvent extends Partial<TicketEvent> {
  isNew?: boolean;
}

const TicketEventsManager = () => {
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<EditingEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("ticket_events")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar eventos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingEvent) return;

    try {
      setIsLoading(true);
      setError(null);

      // Validaciones
      if (!editingEvent.name?.trim()) {
        throw new Error("El nombre del evento es requerido");
      }
      if (!editingEvent.url?.trim()) {
        throw new Error("La URL es requerida");
      }

      if (editingEvent.isNew) {
        // Para eventos nuevos, obtener el siguiente orden disponible
        const { data: existingEvents } = await supabase
          .from("ticket_events")
          .select("display_order")
          .order("display_order", { ascending: false })
          .limit(1);

        const nextOrder =
          existingEvents && existingEvents.length > 0
            ? existingEvents[0].display_order + 1
            : 1;

        const eventData = {
          name: editingEvent.name.trim(),
          url: editingEvent.url.trim(),
          display_order: nextOrder,
          is_active: true, // Siempre activo por defecto
        };

        // Crear nuevo evento
        const { error } = await supabase
          .from("ticket_events")
          .insert([eventData as TicketEventInsert]);

        if (error) throw error;
      } else {
        // Actualizar evento existente (solo nombre y URL)
        if (!editingEvent.id) {
          throw new Error("ID del evento no encontrado");
        }

        const eventData = {
          name: editingEvent.name.trim(),
          url: editingEvent.url.trim(),
        };

        const { error } = await supabase
          .from("ticket_events")
          .update(eventData as TicketEventUpdate)
          .eq("id", editingEvent.id);

        if (error) throw error;
      }

      await loadEvents();
      setEditingEvent(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar evento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este evento?")) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("ticket_events")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await loadEvents();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar evento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (event: TicketEvent) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("ticket_events")
        .update({ is_active: !event.is_active })
        .eq("id", event.id);

      if (error) throw error;
      await loadEvents();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar estado");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (event: TicketEvent | null = null) => {
    if (event) {
      setEditingEvent({
        ...event,
      });
    } else {
      setEditingEvent({
        isNew: true,
        name: "",
        url: "",
        is_active: true,
      });
    }
  };

  const cancelEditing = () => {
    setEditingEvent(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Gestión de Eventos de Entradas
          </h2>
          <p className="text-mantra-light/70">
            Configura múltiples eventos con sus URLs de entradas. El orden se
            asigna automáticamente y el estado se cambia con el icono del ojo.
          </p>
        </div>
        <button
          onClick={() => startEditing()}
          className="flex items-center gap-2 px-4 py-2 bg-mantra-gold hover:bg-mantra-darkGold text-black rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Evento
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className={`p-6 bg-black/30 border rounded-lg transition-all ${
              event.is_active
                ? "border-mantra-gold/20 hover:border-mantra-gold/40"
                : "border-gray-600/20 opacity-60"
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Event Image/Icon */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg bg-mantra-gold/10 flex items-center justify-center border border-mantra-gold/20">
                  <Image className="w-8 h-8 text-mantra-gold/50" />
                </div>
              </div>

              {/* Event Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {event.name}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-mantra-gold/20 text-mantra-gold">
                    #{event.display_order}
                  </span>
                  {event.url.startsWith("http") ? (
                    <ExternalLink className="w-4 h-4 text-mantra-light/50" />
                  ) : (
                    <LinkIcon className="w-4 h-4 text-mantra-light/50" />
                  )}
                </div>

                <p className="text-mantra-light/70 text-sm mb-2">{event.url}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(event)}
                  className={`p-2 rounded-lg transition-colors ${
                    event.is_active
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                  }`}
                  title={event.is_active ? "Desactivar" : "Activar"}
                >
                  {event.is_active ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => startEditing(event)}
                  className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(event.id)}
                  className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && !isLoading && (
          <div className="text-center py-12 text-mantra-light/50">
            <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay eventos configurados</p>
            <p className="text-sm">Crea tu primer evento para comenzar</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-mantra-warmBlack border border-mantra-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingEvent.isNew ? "Nuevo Evento" : "Editar Evento"}
              </h3>
              <button
                onClick={cancelEditing}
                className="p-2 text-mantra-light/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del Evento *
                </label>
                <input
                  type="text"
                  value={editingEvent.name || ""}
                  onChange={(e) =>
                    setEditingEvent((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  placeholder="Ej: Mantra Summer Festival"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de Entradas *
                </label>
                <input
                  type="text"
                  value={editingEvent.url || ""}
                  onChange={(e) =>
                    setEditingEvent((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  placeholder="https://eventbrite.com/... o /tickets/event"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={cancelEditing}
                className="px-4 py-2 text-mantra-light/70 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-mantra-gold hover:bg-mantra-darkGold text-black rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mantra-gold"></div>
        </div>
      )}
    </div>
  );
};

export default TicketEventsManager;
