import { FaSoundcloud } from "react-icons/fa";
import { useEventLineupById } from "../../hooks/useEventLineupById";
import { SectionTitle } from "../ui/SectionTitle";
import { Instagram } from "lucide-react";
import { SiBeatport } from "react-icons/si";

interface EventLineupProps {
  eventId?: string | null;
}

export const EventLineup = ({ eventId }: EventLineupProps) => {
  const { event, lineup, isLoading, error } = useEventLineupById(
    eventId || null
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mantra-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Error al cargar el evento: {error.message}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12 text-gray-400">
        No se encontró el evento.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Información del evento */}
      <div className="relative mb-8 text-center">
        {/* Añadir decoración visual */}

        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-mantra-gold to-transparent"></div>

        <h2 className="text-4xl md:text-5xl font-bold text-mantra-gold mb-4 tracking-tight">
          {event.title}
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          {event.description}
        </p>

        {/* Mejorar la visualización de fecha y ubicación */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 text-gray-400">
          <div className="bg-mantra-blue/30 px-8 py-4 rounded-lg backdrop-blur-sm border border-mantra-gold/10 hover:border-mantra-gold/30 transition-colors group">
            <span className="block text-mantra-gold text-lg mb-1 group-hover:text-white transition-colors">
              Fecha
            </span>
            <time className="text-xl">
              {new Date(event.date).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </div>
          <div className="bg-mantra-blue/30 px-8 py-4 rounded-lg backdrop-blur-sm border border-mantra-gold/10 hover:border-mantra-gold/30 transition-colors group">
            <span className="block text-mantra-gold text-lg mb-1 group-hover:text-white transition-colors">
              Ubicación
            </span>
            <address className="text-xl not-italic">{event.location}</address>
          </div>
        </div>
      </div>

      <SectionTitle title="Line-up" />

      {/* Artistas Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {lineup
          .filter((artist) => artist.isHeadliner)
          .map((headliner, index, array) => (
            <div
              key={headliner.id}
              className={`relative ${
                // Si es el único headliner o es impar y el último, ocupar todo el ancho
                array.length === 1 ||
                (array.length % 2 !== 0 && index === array.length - 1)
                  ? "lg:col-span-2 max-w-3xl mx-auto w-full"
                  : ""
              }`}
            >
              {/* Efecto de brillo */}
              <div className="absolute -inset-1 bg-gradient-to-r from-mantra-gold/20 to-mantra-gold/0 rounded-xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative bg-gradient-to-br from-mantra-blue/60 to-mantra-blue/40 rounded-xl p-8 backdrop-blur-lg border border-mantra-gold/20 transform hover:scale-[1.02] transition-all duration-300 shadow-xl">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-mantra-gold px-4 sm:px-6 py-2 rounded-full text-black text-xs sm:text-sm font-bold tracking-wider uppercase whitespace-nowrap">
                  Headliner
                </span>
                <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-12">
                  <div className="relative w-48 h-48 group">
                    {headliner.avatarUrl ? (
                      <img
                        src={headliner.avatarUrl}
                        alt={headliner.nickname}
                        className="w-full h-full object-cover rounded-full ring-4 ring-mantra-gold/50 group-hover:ring-mantra-gold transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-mantra-blue flex items-center justify-center ring-4 ring-mantra-gold/50">
                        <span className="text-6xl text-mantra-gold">
                          {headliner.nickname.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                      {headliner.instagram_username && (
                        <a
                          href={`https://instagram.com/${headliner.instagram_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-mantra-gold text-black p-3 rounded-full hover:scale-110 transition-transform"
                        >
                          <Instagram size={20} />
                        </a>
                      )}
                      {headliner.beatport_url && (
                        <a
                          href={headliner.beatport_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-mantra-gold text-black p-3 rounded-full hover:scale-110 transition-transform"
                        >
                          <SiBeatport />
                        </a>
                      )}
                      {headliner.soundcloud_url && (
                        <a
                          href={headliner.soundcloud_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-mantra-gold text-black p-3 rounded-full hover:scale-110 transition-transform"
                        >
                          <FaSoundcloud />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h4 className="text-4xl font-bold text-white mb-3">
                      {headliner.nickname}
                    </h4>
                    {headliner.startTime && (
                      <div className="inline-block bg-mantra-gold/20 px-6 py-2 rounded-full">
                        <p className="text-mantra-gold text-xl font-medium">
                          {new Date(headliner.startTime).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Artistas Secundarios - Mejorar la presentación */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {lineup
          .filter((artist) => !artist.isHeadliner)
          .map((artist) => (
            <div
              key={artist.id}
              className="group bg-gradient-to-br from-mantra-blue/40 to-mantra-blue/30 rounded-lg p-2 backdrop-blur-sm hover:from-mantra-blue/50 hover:to-mantra-blue/40 transition-all duration-300 border border-mantra-gold/10 hover:border-mantra-gold/30"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-32 h-32">
                  {artist.avatarUrl ? (
                    <img
                      src={artist.avatarUrl}
                      alt={artist.nickname}
                      className="w-full h-full object-cover rounded-full ring-2 ring-mantra-gold/30 group-hover:ring-mantra-gold/50 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-mantra-blue flex items-center justify-center ring-2 ring-mantra-gold/30">
                      <span className="text-3xl text-mantra-gold">
                        {artist.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-white mb-2">
                    {artist.nickname}
                  </h4>
                  {artist.startTime && (
                    <div className="relative mt-4">
                      <p className="relative text-mantra-gold font-medium px-4 py-2 rounded-full bg-mantra-gold/5 inline-block">
                        {new Date(artist.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-center gap-4 mt-4">
                    {artist.instagram_username && (
                      <a
                        href={`https://instagram.com/${artist.instagram_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mantra-gold hover:text-white transition-colors"
                      >
                        <Instagram size={24} />
                      </a>
                    )}
                    {artist.beatport_url && (
                      <a
                        href={artist.beatport_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mantra-gold hover:text-white transition-colors"
                      >
                        <SiBeatport />
                      </a>
                    )}
                    {artist.soundcloud_url && (
                      <a
                        href={artist.soundcloud_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mantra-gold hover:text-white transition-colors"
                      >
                        <FaSoundcloud />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
