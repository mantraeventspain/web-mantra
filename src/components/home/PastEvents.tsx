import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Image as ImageIcon,
  Users,
  X,
  ChevronDown,
} from "lucide-react";
import { usePastEvents } from "../../hooks/usePastEvents";
import { useEventGallery } from "../../hooks/useEventGallery";
import { SectionTitle } from "../ui/SectionTitle";
import { EventLineup } from "../events/EventLineup";
import { ScrollableSection } from "../ui/ScrollableSection";
import { LazyLoadImage } from "react-lazy-load-image-component";

const PastEvents = () => {
  const { events, isLoading: eventsLoading, error } = usePastEvents();
  const [selectedLineupEventId, setSelectedLineupEventId] = useState<
    string | null
  >(null);
  const [selectedGalleryEventTitle, setSelectedGalleryEventTitle] = useState<
    string | null
  >(null);
  const [loadingGalleryId, setLoadingGalleryId] = useState<string | null>(null);

  const {
    images: galleryImages,
    isLoading: isLoadingGallery,
    hasMore,
    loadMore,
  } = useEventGallery({
    eventTitle: selectedGalleryEventTitle || "",
    imagesPerPage: 10,
  });

  const handleGalleryOpen = async (event: { title: string; id: string }) => {
    if (isLoadingGallery) return; // Prevenir apertura mientras carga

    setLoadingGalleryId(event.id);
    setSelectedGalleryEventTitle(event.title);
    setLoadingGalleryId(null);
  };

  const handleLineupOpen = (eventId: string) => {
    setSelectedLineupEventId(eventId);

    setTimeout(() => {
      const modalElement = document.querySelector('[role="dialog"]');
      if (modalElement) {
        const headerHeight = 80;
        const windowHeight = window.innerHeight;
        const modalHeight = modalElement.getBoundingClientRect().height;

        const scrollPosition = Math.max(
          window.scrollY + headerHeight,
          window.scrollY + (windowHeight - modalHeight) / 2
        );

        window.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      }
    }, 100);
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
    <div className="container mx-auto px-4 pt-2">
      <SectionTitle title="Eventos Pasados" />
      <ScrollableSection className="py-4">
        <div className="flex gap-8 px-4">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="cursor-pointer flex-shrink-0 w-[300px] md:w-[350px]"
            >
              <div className="relative aspect-video mb-4">
                <div className="absolute inset-0 rounded-xl overflow-hidden hover:scale-95 transition-transform duration-300">
                  <LazyLoadImage
                    src={event.imageUrl || "/default-event.jpg"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    draggable="false"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 text-mantra-gold" />
                      <span className="text-sm">
                        {new Date(event.date).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-medium text-white text-center mb-4">
                {event.title}
              </h3>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleLineupOpen(event.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-mantra-gold/10 hover:bg-mantra-gold/20 text-mantra-gold rounded-lg transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Line-up
                </button>

                <button
                  onClick={() => handleGalleryOpen(event)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors bg-mantra-gold/10 hover:bg-mantra-gold/20 text-mantra-gold`}
                  disabled={loadingGalleryId === event.id || isLoadingGallery}
                >
                  {loadingGalleryId === event.id || isLoadingGallery ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-mantra-gold" />
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      Galería
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollableSection>

      {/* Modal de Galería */}
      <AnimatePresence>
        {selectedGalleryEventTitle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Contenido del modal */}
            <div
              className="relative max-w-7xl w-full bg-gradient-to-b from-mantra-warmBlack to-black rounded-xl shadow-2xl flex flex-col"
              style={{ height: "calc(100vh - 8rem)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header fijo */}
              <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-mantra-gold/10 bg-mantra-blue/30 backdrop-blur-md rounded-t-xl">
                <h3 className="text-xl font-bold text-white">
                  Galería de Fotos
                </h3>
                <button
                  onClick={() => setSelectedGalleryEventTitle(null)}
                  className="text-white/70 hover:text-mantra-gold transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Contenido scrolleable con estilo personalizado */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galleryImages.map((image, index) => (
                    <div
                      key={`${image.originalPath}-${index}`}
                      className="relative group aspect-square"
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <img
                        src={image.thumbnail || "/placeholder.jpg"}
                        alt="Evento"
                        className="w-full h-full object-cover rounded-lg"
                        draggable="false"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <span className="text-white text-sm">Vista previa</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer fijo con botón de cargar más */}
              {hasMore && (
                <div className="sticky bottom-0 p-6 border-t border-mantra-gold/10 bg-mantra-blue/30 backdrop-blur-md rounded-b-xl">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      loadMore();
                    }}
                    className="w-full py-3 px-6 bg-mantra-gold/10 hover:bg-mantra-gold/20 text-mantra-gold rounded-lg transition-colors flex items-center justify-center gap-2"
                    disabled={isLoadingGallery}
                  >
                    {isLoadingGallery ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-mantra-gold" />
                    ) : (
                      <>
                        <span>Cargar más imágenes</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Line-up */}
      <AnimatePresence>
        {selectedLineupEventId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedLineupEventId(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative max-w-7xl w-full bg-gradient-to-b from-mantra-warmBlack to-black rounded-xl shadow-2xl flex flex-col"
              style={{ height: "calc(100vh - 8rem)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header fijo */}
              <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-mantra-gold/10 bg-mantra-blue/30 backdrop-blur-md rounded-t-xl">
                <h3 className="text-xl font-bold text-white">
                  Line-up del Evento
                </h3>
                <button
                  onClick={() => setSelectedLineupEventId(null)}
                  className="text-white/70 hover:text-mantra-gold transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Contenido scrolleable */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <EventLineup eventId={selectedLineupEventId} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PastEvents;
