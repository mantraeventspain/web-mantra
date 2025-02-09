import { Facebook, Instagram, ArrowUp, Users } from "lucide-react";
import { FaSoundcloud } from "react-icons/fa";
import { useSiteConfig } from "../../hooks/useSiteConfig";
import { NewsletterForm } from "../newsletter/NewsletterForm";

export const Footer = () => {
  const { config } = useSiteConfig();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToLineup = () => {
    const lineupElement = document.getElementById("lineup");
    if (lineupElement) {
      lineupElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-gradient-to-b from-mantra-blue via-mantra-darkBlue to-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <NewsletterForm />
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-mantra-gold">
              Síguenos
            </h4>
            <div className="flex space-x-4">
              <a
                href={
                  config.facebook_url ||
                  "https://www.facebook.com/p/Mantra-events-61557011395289/"
                }
                className="text-gray-300 hover:text-mantra-gold transition-colors duration-200"
                aria-label="Síguenos en Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href={
                  config.instagram_url ||
                  "https://www.instagram.com/mantra_event/"
                }
                className="text-gray-300 hover:text-mantra-gold transition-colors duration-200"
                aria-label="Síguenos en Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href={
                  config.soundcloud_url ||
                  "https://soundcloud.com/mantra-parties"
                }
                className="text-gray-300 hover:text-mantra-gold transition-colors duration-200"
                aria-label="Síguenos en Soundcloud"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaSoundcloud className="text-2xl" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-mantra-gold">
              Navegación Rápida
            </h4>
            <div className="flex flex-col space-y-3">
              <button
                onClick={scrollToTop}
                className="flex items-center gap-2 text-gray-300 hover:text-mantra-gold transition-colors duration-200"
              >
                <ArrowUp className="w-5 h-5" />
                <span>Ir al inicio</span>
              </button>
              <button
                onClick={scrollToLineup}
                className="flex items-center gap-2 text-gray-300 hover:text-mantra-gold transition-colors duration-200"
              >
                <Users className="w-5 h-5" />
                <span>Ver Line-up</span>
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-mantra-gold">Mantra</h3>
            <p className="text-gray-300"># Dance With Us.</p>
          </div>
        </div>

        <div className="border-t border-mantra-darkGold/30 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Mantra. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
