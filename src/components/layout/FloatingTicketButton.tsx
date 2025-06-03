import { useState } from "react";
import { Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "../../hooks/useSiteConfig";
import { useTicketEvents } from "../../hooks/useTicketEvents";
import { TicketEventModal } from "../tickets/TicketEventModal";

export const FloatingTicketButton = () => {
  const { config } = useSiteConfig();
  const { ticketEvents, isLoading } = useTicketEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const ButtonContent = () => (
    <div className="flex items-center gap-2">
      <Ticket className="w-5 h-5" />
      <span className="font-medium text-sm uppercase tracking-wider">
        Entradas
      </span>
    </div>
  );

  // Si hay eventos de tickets configurados, usar el nuevo sistema
  if (!isLoading && ticketEvents.length > 0) {
    // Si hay un solo evento, ir directamente
    if (ticketEvents.length === 1) {
      const event = ticketEvents[0];
      return (
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          {event.url.startsWith("http") ? (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-mantra-gold hover:bg-mantra-darkGold text-black px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <ButtonContent />
            </a>
          ) : (
            <Link
              to={event.url}
              className="flex items-center bg-mantra-gold hover:bg-mantra-darkGold text-black px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <ButtonContent />
            </Link>
          )}
        </div>
      );
    }

    // Si hay múltiples eventos, mostrar modal
    return (
      <>
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-mantra-gold hover:bg-mantra-darkGold text-black px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ButtonContent />
          </button>
        </div>

        <TicketEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          events={ticketEvents}
        />
      </>
    );
  }

  // Fallback al sistema anterior si no hay eventos configurados
  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      {config.tickets_url?.startsWith("http") ? (
        <a
          href={config.tickets_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-mantra-gold hover:bg-mantra-darkGold text-black px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <ButtonContent />
        </a>
      ) : (
        <Link
          to={config.tickets_url ?? ""}
          className="flex items-center bg-mantra-gold hover:bg-mantra-darkGold text-black px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <ButtonContent />
        </Link>
      )}
    </div>
  );
};
