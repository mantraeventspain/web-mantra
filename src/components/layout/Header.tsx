import { Link } from "react-router-dom";
import { Music } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useSiteConfig } from "../../hooks/useSiteConfig";

export const Header = () => {
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const mouseTimeoutRef = useRef<number | null>(null);
  const { config } = useSiteConfig();

  useEffect(() => {
    const handleScroll = () => {
      // Altura del viewport
      const viewportHeight = window.innerHeight;
      const scrollPosition = window.scrollY;

      // El video deja de ser visible cuando hemos scrolleado más del 90% de su altura
      if (scrollPosition > viewportHeight * 0.9) {
        setIsVideoVisible(false);
      } else {
        setIsVideoVisible(true);
      }
    };

    const handleMouseMove = () => {
      // Limpiar el timeout anterior si existe
      if (mouseTimeoutRef.current) {
        window.clearTimeout(mouseTimeoutRef.current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      // Limpiar el timeout al desmontar
      if (mouseTimeoutRef.current) {
        window.clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 ${
        !isVideoVisible
          ? "opacity-0 -translate-y-full pointer-events-none"
          : "opacity-100 translate-y-0"
      }`}
    >
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
        {config.tickets_url.startsWith("http") ? (
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
            to={config.tickets_url}
            target="_blank"
            rel="noopener noreferrer"
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
