import { Facebook, Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-mantra-blue via-mantra-darkBlue to-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-mantra-gold">Mantra</h3>
            <p className="text-gray-300">
              Creando experiencias únicas en la escena techno.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-mantra-gold">
              Enlaces
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/events"
                  className="text-gray-300 hover:text-mantra-gold transition-colors"
                >
                  Eventos
                </a>
              </li>
              <li>
                <a
                  href="/shop"
                  className="text-gray-300 hover:text-mantra-gold transition-colors"
                >
                  Tienda
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-300 hover:text-mantra-gold transition-colors"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-mantra-gold">
              Síguenos
            </h4>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/p/Mantra-events-61557011395289/"
                className="text-gray-300 hover:text-mantra-gold transition-colors duration-200"
                aria-label="Síguenos en Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/mantra_event/"
                className="text-gray-300 hover:text-mantra-gold transition-colors duration-200"
                aria-label="Síguenos en Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
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
