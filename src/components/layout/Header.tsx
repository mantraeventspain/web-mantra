import { Link } from "react-router-dom";
import { Music } from "lucide-react";
import { useSiteConfig } from "../../hooks/useSiteConfig";

export const Header = () => {
  const { config } = useSiteConfig();

  return (
    <header className="fixed w-full z-50">
      {/* Logo en la esquina superior izquierda */}
      <div className="absolute top-8 left-8">
        <Link
          to="/"
          className="flex items-center space-x-2 hover:scale-105 transition-transform"
        >
          <Music className="w-8 h-8 text-mantra-gold" />
          <span className="text-xl font-bold text-mantra-gold">Mantra</span>
        </Link>
      </div>

      {/* Botón de tickets mejorado */}
      <div className="absolute top-8 right-8 hidden md:block">
        {config.tickets_url?.startsWith("http") ? (
          <a
            href={config.tickets_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center px-6 py-2 overflow-hidden rounded-full bg-transparent"
          >
            <span className="absolute inset-0 bg-mantra-gold transition-transform duration-300 group-hover:scale-105" />
            <span className="relative z-10 text-black font-medium text-sm uppercase tracking-wider transition-transform duration-300 group-hover:scale-105">
              Entradas
            </span>
            <div className="absolute inset-0 border border-mantra-gold rounded-full opacity-50 group-hover:opacity-0 transition-opacity duration-300" />
          </a>
        ) : (
          <Link
            to={config.tickets_url ?? ""}
            className="group relative inline-flex items-center px-6 py-2 overflow-hidden rounded-full bg-transparent"
          >
            <span className="absolute inset-0 bg-mantra-gold transition-transform duration-300 group-hover:scale-105" />
            <span className="relative z-10 text-black font-medium text-sm uppercase tracking-wider transition-transform duration-300 group-hover:scale-105">
              Entradas
            </span>
            <div className="absolute inset-0 border border-mantra-gold rounded-full opacity-50 group-hover:opacity-0 transition-opacity duration-300" />
          </Link>
        )}
      </div>
    </header>
  );
};
