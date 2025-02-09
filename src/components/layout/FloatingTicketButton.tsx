import { Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "../../hooks/useSiteConfig";

export const FloatingTicketButton = () => {
  const { config } = useSiteConfig();

  const ButtonContent = () => (
    <div className="flex items-center gap-2">
      <Ticket className="w-5 h-5" />
      <span className="font-medium text-sm uppercase tracking-wider">
        Entradas
      </span>
    </div>
  );

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
