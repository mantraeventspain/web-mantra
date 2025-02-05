import { Link } from "react-router-dom";
// import { Menu, ShoppingCart, Music } from "lucide-react";
import { Menu, Music } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { FeaturedTrackPlayer } from "../player/FeaturedTrackPlayer";

export const Header = () => {
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  // const [isNavVisible, setIsNavVisible] = useState(false);
  const mouseTimeoutRef = useRef<number | null>(null);

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

      // Mostrar/ocultar header basado en la dirección del scroll
      // if (scrollPosition > 100) {
      //   setIsNavVisible(true);
      // } else {
      //   setIsNavVisible(false);
      // }
    };

    const handleMouseMove = () => {
      // setIsNavVisible(true);

      // Limpiar el timeout anterior si existe
      if (mouseTimeoutRef.current) {
        window.clearTimeout(mouseTimeoutRef.current);
      }

      // Establecer un nuevo timeout
      // mouseTimeoutRef.current = window.setTimeout(() => {
      //   setIsNavVisible(false);
      // }, 2000); // Ocultar después de 2 segundos de inactividad
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

  // const scrollToSection = (sectionId: string) => {
  //   const element = document.getElementById(sectionId);
  //   if (element) {
  //     // Usamos scrollIntoView en lugar de scrollTo para mejor compatibilidad
  //     element.scrollIntoView({
  //       behavior: "smooth",
  //       block: "start",
  //     });
  //   }
  // };

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

      {/* Menú hamburguesa en móvil */}
      <div className="absolute top-8 right-8 md:hidden">
        <button className="text-mantra-gold hover:scale-105 transition-transform">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <FeaturedTrackPlayer />

      {/* Botón de tickets mejorado */}
      <div className="absolute top-8 right-8 hidden md:block">
        <Link
          to="/subscribe"
          className="group relative inline-flex items-center px-6 py-2 overflow-hidden rounded-full bg-transparent"
        >
          <span className="absolute inset-0 bg-mantra-gold transition-transform duration-300 group-hover:scale-105" />
          <span className="relative z-10 text-black font-medium text-sm uppercase tracking-wider transition-transform duration-300 group-hover:scale-105">
            Comprar Tickets
          </span>
          <div className="absolute inset-0 border border-mantra-gold rounded-full opacity-50 group-hover:opacity-0 transition-opacity duration-300" />
        </Link>
      </div>
    </header>
  );
};
