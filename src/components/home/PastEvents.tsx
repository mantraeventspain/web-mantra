import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Image as ImageIcon, Users, X } from "lucide-react";
import { usePastEvents } from "../../hooks/usePastEvents";
import { useEventGallery } from "../../hooks/useEventGallery";
import { SectionTitle } from "../ui/SectionTitle";
import { EventLineup } from "../events/EventLineup";
import { getOriginalImage } from "../../services/dropboxService";

export const PastEvents = () => {
  const { events, isLoading: eventsLoading, error } = usePastEvents();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState<string | null>(
    null
  );

  const {
    images: galleryImages,
    isLoading: galleryLoading,
    hasMore,
    loadMore,
  } = useEventGallery({
    eventTitle: selectedEventTitle || "",
    imagesPerPage: 25,
  });

  const handleGalleryOpen = (event: { title: string }) => {
    setSelectedEventTitle(event.title);
  };

  if (eventsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mantra-gold"></div>
      </div>
    );
  }

  if (error) return null;

  return (
    <div className="container mx-auto px-4">
      <SectionTitle title="Eventos Pasados" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-gradient-to-br from-mantra-blue/40 to-black/60 rounded-xl overflow-hidden flex flex-col h-full"
          >
            {/* Imagen principal del evento */}
            <div className="aspect-video relative overflow-hidden">
              <img
                src={event.imageUrl || "/default-event.jpg"}
                alt={event.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />
            </div>

            {/* Contenido del evento */}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-2xl font-bold text-white mb-4">
                {event.title}
              </h3>

              {/* Espaciador flexible */}
              <div className="flex-1"></div>

              {/* Información y botones (fijados abajo) */}
              <div className="mt-auto">
                <div className="space-y-3 text-gray-300 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-mantra-gold" />
                    <span>
                      {new Date(event.date).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-mantra-gold" />
                    <span>{event.galleryImages?.length || 0} fotos</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedEvent(event.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-mantra-gold/10 hover:bg-mantra-gold/20 text-mantra-gold rounded-lg transition-colors"
                  >
                    <Users className="w-5 h-5" />
                    Line-up
                  </button>

                  <button
                    onClick={() => handleGalleryOpen(event)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors
                      ${
                        event.galleryImages?.length
                          ? "bg-mantra-gold/10 hover:bg-mantra-gold/20 text-mantra-gold cursor-pointer"
                          : "bg-gray-700/10 text-gray-500 cursor-not-allowed"
                      }`}
                    disabled={!event.galleryImages?.length}
                  >
                    <ImageIcon className="w-5 h-5" />
                    Galería
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de Galería */}
      <AnimatePresence>
        {selectedEventTitle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedEventTitle(null)}
          >
            <div className="relative max-w-7xl w-full bg-mantra-blue/30 rounded-xl p-6 backdrop-blur-sm">
              <button
                onClick={() => setSelectedEventTitle(null)}
                className="absolute right-4 top-4 text-white/70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[80vh] overflow-y-auto">
                {galleryImages.map((image, index) => (
                  <div
                    key={`${image.originalPath}-${index}`}
                    className="relative group aspect-square cursor-pointer"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const originalUrl = await getOriginalImage(
                        image.originalPath
                      );
                      if (originalUrl) {
                        window.open(originalUrl, "_blank");
                      }
                    }}
                  >
                    <img
                      src={image.thumbnail || "/placeholder.jpg"}
                      alt="Evento"
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm">Ver original</span>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loadMore();
                  }}
                  className="mt-6 w-full py-4 text-mantra-gold hover:text-white transition-colors"
                >
                  {galleryLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-mantra-gold mx-auto" />
                  ) : (
                    "Cargar más imágenes"
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Line-up */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="relative max-w-7xl w-full bg-mantra-blue/30 rounded-xl p-6 backdrop-blur-sm overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute right-4 top-4 text-white/70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <EventLineup eventId={selectedEvent} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
