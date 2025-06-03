import { useEffect, useRef } from "react";
import { X, Calendar, ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { TicketEvent } from "../../types/tickets";

interface TicketEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: TicketEvent[];
}

export const TicketEventModal = ({
  isOpen,
  onClose,
  events,
}: TicketEventModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEventClick = (url: string) => {
    if (url.startsWith("http")) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop con blur mejorado */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200" />

      {/* Modal más compacto */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg max-h-[85vh] bg-gradient-to-br from-mantra-warmBlack via-black to-mantra-warmBlack border border-mantra-gold/30 rounded-3xl shadow-2xl shadow-mantra-gold/10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 overflow-hidden"
      >
        {/* Header compacto */}
        <div className="relative p-5 pb-3">
          <div className="absolute inset-0 bg-gradient-to-r from-mantra-gold/8 via-mantra-orange/5 to-mantra-gold/8" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mantra-gold/20 to-mantra-orange/20 flex items-center justify-center border border-mantra-gold/30">
                <Sparkles className="w-5 h-5 text-mantra-gold" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">
                  Selecciona tu Evento
                </h2>
                <p className="text-mantra-light/60 text-xs mt-0.5">
                  {events.length} evento{events.length !== 1 ? "s" : ""}{" "}
                  disponible{events.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-mantra-gold/10 hover:bg-mantra-gold/20 text-mantra-gold/70 hover:text-mantra-gold transition-all duration-200 hover:scale-105 active:scale-95 hover:rotate-90"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content más compacto */}
        <div className="px-5 pb-5 pt-3 max-h-[55vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            {events.map((event, index) => {
              const isExternal = event.url.startsWith("http");

              const EventContent = () => (
                <div className="group relative p-4 bg-gradient-to-r from-black/50 via-mantra-warmBlack/30 to-black/50 border border-mantra-gold/15 hover:border-mantra-gold/40 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-mantra-gold/5 cursor-pointer hover:-translate-y-0.5 active:translate-y-0">
                  {/* Gradient overlay mejorado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-mantra-gold/0 via-mantra-gold/5 to-mantra-orange/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300" />

                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl" />

                  <div className="relative flex items-center gap-4">
                    {/* Event Icon más elegante */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mantra-gold/25 to-mantra-orange/25 flex items-center justify-center border border-mantra-gold/25 group-hover:border-mantra-gold/40 transition-all duration-300 group-hover:scale-105">
                        <Calendar className="w-6 h-6 text-mantra-gold group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-white group-hover:text-mantra-gold transition-colors duration-300 leading-tight">
                        {event.name}
                      </h3>
                      <p className="text-mantra-light/50 text-xs mt-1 group-hover:text-mantra-light/70 transition-colors duration-300">
                        Haz clic para{" "}
                        {isExternal ? "abrir enlace" : "continuar"}
                      </p>
                    </div>

                    {/* Arrow/External Icon mejorado */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-mantra-gold/10 group-hover:bg-mantra-gold/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                        {isExternal ? (
                          <ExternalLink className="w-4 h-4 text-mantra-gold/70 group-hover:text-mantra-gold transition-colors duration-300" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-mantra-gold/70 group-hover:text-mantra-gold group-hover:translate-x-0.5 transition-all duration-300" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );

              return (
                <div
                  key={event.id}
                  className="animate-in slide-in-from-left-4 fade-in duration-400"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {isExternal ? (
                    <div onClick={() => handleEventClick(event.url)}>
                      <EventContent />
                    </div>
                  ) : (
                    <Link to={event.url} onClick={onClose}>
                      <EventContent />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Estilos mejorados para el scrollbar
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(200, 86, 39, 0.05);
    border-radius: 2px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, rgba(200, 86, 39, 0.3), rgba(200, 86, 39, 0.5));
    border-radius: 2px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, rgba(200, 86, 39, 0.5), rgba(200, 86, 39, 0.7));
  }
  
  /* Smooth scrolling */
  .custom-scrollbar {
    scroll-behavior: smooth;
  }
  
  /* Hide scrollbar for Firefox */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(200, 86, 39, 0.3) rgba(200, 86, 39, 0.05);
  }
`;

// Inyectar estilos mejorados
if (typeof document !== "undefined") {
  const existingStyle = document.querySelector("style[data-ticket-modal]");
  if (existingStyle) {
    existingStyle.remove();
  }

  const styleElement = document.createElement("style");
  styleElement.setAttribute("data-ticket-modal", "true");
  styleElement.textContent = scrollbarStyles;
  document.head.appendChild(styleElement);
}
