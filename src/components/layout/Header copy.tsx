import { Link } from "react-router-dom";
// import { Menu, ShoppingCart, Music } from "lucide-react";
import { Menu, Music } from "lucide-react";
import { useEffect, useState } from "react";

export const Header = () => {
  // TODO: Hacer que el header se muestre cuando el usuario haga scroll o mueva el mouse
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar el header después de 100px de scroll o si el usuario mueve el mouse
      if (window.scrollY > 100) {
        setIsVisible(true);
      }
    };

    const handleMouseMove = () => {
      setIsVisible(true);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    // <header className="fixed w-full z-50 bg-mantra-darkBlue/80 backdrop-blur-sm">
    <header
      className={`fixed w-full z-50 bg-mantra-darkBlue/80 backdrop-blur-sm transition-all duration-500 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Music className="w-8 h-8 text-mantra-gold" />
            <span className="text-xl font-bold text-mantra-gold">Mantra</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("eventos")}
              className="text-white hover:text-mantra-gold transition-colors"
            >
              Eventos
            </button>
            <button
              onClick={() => scrollToSection("artistas")}
              className="text-white hover:text-mantra-gold transition-colors"
            >
              Artistas
            </button>
            {/* <Link
              to="/shop"
              className="text-white hover:text-mantra-gold transition-colors"
            >
              Tienda
            </Link> */}
            <Link
              to="/gallery"
              className="text-white hover:text-mantra-gold transition-colors"
            >
              Galería
            </Link>
            <Link
              to="/cart"
              className="text-white hover:text-mantra-gold transition-colors"
            >
              {/* <ShoppingCart className="w-6 h-6" /> */}
            </Link>
          </div>

          <button className="md:hidden text-mantra-gold">
            <Menu className="w-6 h-6" />
          </button>
        </nav>
      </div>
    </header>
  );
};
