import { useState } from "react";
import { useEvents } from "../../hooks/useEvents";
import { EventForm } from "./EventForm";
import { Event } from "../../types";
import { Edit, Plus, Calendar, Trash2 } from "lucide-react";
import { deleteEvent } from "../../utils/eventHelpers";

const EventManager = () => {
  const { events, isLoading, error, refetch } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFormSuccess = async () => {
    setShowForm(false);
    setSelectedEvent(null);
    await refetch();
  };

  const handleDeleteEvent = async (event: Event) => {
    if (isDeleting) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar el evento "${event.title}"? Esta acción eliminará también el lineup y no se puede deshacer.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteEvent(event.id);
      await refetch();
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
      alert("Error al eliminar el evento");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mantra-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error al cargar los eventos: {error.message}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-mantra-gold hover:bg-mantra-darkGold text-black rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Evento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-mantra-blue/30 rounded-xl backdrop-blur-sm border border-mantra-gold/20 overflow-hidden"
          >
            <div className="aspect-video relative">
              <img
                src={event.imageUrl || "/default-event.jpg"}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {new Date(event.date).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-mantra-gold/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-300">{event.location}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowForm(true);
                    }}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    title="Eliminar"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <EventForm
          event={selectedEvent || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </>
  );
};

export default EventManager;
