import { Link } from "react-router-dom";
import { useSiteConfig } from "../../hooks/useSiteConfig";
import { useState, useEffect } from "react";
import { useTicketEvents } from "../../hooks/useTicketEvents";
import { TicketEventModal } from "../tickets/TicketEventModal";

export const Header = () => {
  const { config } = useSiteConfig();
  const { ticketEvents, isLoading } = useTicketEvents();
  const [isScrolledPastVideo, setIsScrolledPastVideo] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const videoHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      setIsScrolledPastVideo(scrollPosition > videoHeight * 0.8);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderTicketButton = () => {
    // Si hay eventos de tickets configurados, usar el nuevo sistema
    if (!isLoading && ticketEvents.length > 0) {
      // Si hay un solo evento, ir directamente
      if (ticketEvents.length === 1) {
        const event = ticketEvents[0];
        return event.url.startsWith("http") ? (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Entradas
          </a>
        ) : (
          <Link to={event.url} className="btn btn-primary">
            Entradas
          </Link>
        );
      }

      // Si hay múltiples eventos, mostrar modal
      return (
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          Entradas
        </button>
      );
    }

    // Fallback al sistema anterior si no hay eventos configurados
    return config.tickets_url?.startsWith("http") ? (
      <a
        href={config.tickets_url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
      >
        Entradas
      </a>
    ) : (
      <Link to={config.tickets_url ?? ""} className="btn btn-primary">
        Entradas
      </Link>
    );
  };

  return (
    <>
      <header className="fixed w-full z-50">
        {/* Barra de navegación con transición suave - altura reducida */}
        <div
          className={`
            w-full h-16 transform transition-all duration-300 ease-in-out
            ${
              isScrolledPastVideo
                ? "opacity-100 bg-black/80 backdrop-blur-sm border-b border-mantra-gold/10 shadow-lg"
                : "opacity-0 pointer-events-none"
            }
          `}
        />

        {/* Contenido siempre visible - padding vertical reducido */}
        <div className="absolute top-0 left-0 right-0 px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link
            to="./"
            className="flex items-center hover:scale-105 transition-all duration-300"
          >
            <img
              src="/logo-mantra-letras.png"
              alt="Mantra Logo"
              className="h-8 w-auto"
              draggable="false"
            />
          </Link>

          {/* Botón de tickets solo visible en desktop */}
          <div className="hidden md:block">{renderTicketButton()}</div>
        </div>
      </header>

      {/* Modal de eventos de tickets */}
      {!isLoading && ticketEvents.length > 1 && (
        <TicketEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          events={ticketEvents}
        />
      )}
    </>
  );
};
