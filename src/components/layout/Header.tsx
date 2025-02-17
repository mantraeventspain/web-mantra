import { Link } from "react-router-dom";
import { useSiteConfig } from "../../hooks/useSiteConfig";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useState, useEffect } from "react";

export const Header = () => {
  const { config } = useSiteConfig();
  const [isScrolledPastVideo, setIsScrolledPastVideo] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const videoHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      setIsScrolledPastVideo(scrollPosition > videoHeight * 0.8);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
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
          <LazyLoadImage
            src="/logo-mantra-letras.png"
            alt="Mantra Logo"
            className="h-8 w-auto"
            effect="blur"
            threshold={100}
          />
        </Link>

        {/* Botón de tickets solo visible en desktop */}
        <div className="hidden md:block">
          {config.tickets_url?.startsWith("http") ? (
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
          )}
        </div>
      </div>
    </header>
  );
};
