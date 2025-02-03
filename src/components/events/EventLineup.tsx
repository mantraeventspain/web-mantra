import { useEventLineup } from "../../hooks/useEventLineup";

export const EventLineup = () => {
  const { event, lineup, isLoading, error } = useEventLineup();

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
        No hay eventos próximos programados.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Información del evento */}
      <div className="mb-16 text-center">
        <h2 className="text-4xl font-bold text-mantra-gold mb-4">
          {event.title}
        </h2>
        <p className="text-xl text-gray-300 mb-6">{event.description}</p>
        <div className="flex justify-center items-center space-x-8 text-gray-400">
          <div>
            <span className="block text-mantra-gold">Fecha</span>
            {new Date(event.date).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          <div>
            <span className="block text-mantra-gold">Ubicación</span>
            {event.location}
          </div>
        </div>
      </div>

      {/* Line-up */}
      <h3 className="text-3xl font-bold text-mantra-gold text-center mb-12">
        Line-up
      </h3>

      {/* Artista Principal */}
      {lineup
        .filter((artist) => artist.isHeadliner)
        .map((headliner) => (
          <div key={headliner.id} className="mb-16">
            <div className="relative bg-mantra-blue/40 rounded-xl p-8 backdrop-blur-lg border border-mantra-gold/20 transform hover:scale-[1.02] transition-transform">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-mantra-gold px-4 py-1 rounded-full text-black text-sm">
                Artista Principal
              </span>
              <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                <div className="relative w-40 h-40 md:w-48 md:h-48">
                  {headliner.avatarUrl ? (
                    <img
                      src={headliner.avatarUrl}
                      alt={headliner.nickname}
                      className="w-full h-full object-cover rounded-full ring-4 ring-mantra-gold/50"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-mantra-blue flex items-center justify-center ring-4 ring-mantra-gold/50">
                      <span className="text-5xl text-mantra-gold">
                        {headliner.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center md:text-left">
                  <h4 className="text-3xl font-bold text-white mb-2">
                    {headliner.nickname}
                  </h4>
                  <p className="text-xl text-gray-300 mb-4">{headliner.role}</p>
                  {headliner.startTime && (
                    <p className="text-mantra-gold text-xl">
                      {new Date(headliner.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

      {/* Artistas Secundarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {lineup
          .filter((artist) => !artist.isHeadliner)
          .map((artist) => (
            <div
              key={artist.id}
              className="bg-mantra-blue/30 rounded-lg p-6 backdrop-blur-sm hover:bg-mantra-blue/40 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="relative w-20 h-20">
                  {artist.avatarUrl ? (
                    <img
                      src={artist.avatarUrl}
                      alt={artist.nickname}
                      className="w-full h-full object-cover rounded-full ring-2 ring-mantra-gold/30"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-mantra-blue flex items-center justify-center ring-2 ring-mantra-gold/30">
                      <span className="text-2xl text-mantra-gold">
                        {artist.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">
                    {artist.nickname}
                  </h4>
                  <p className="text-sm text-gray-400">{artist.role}</p>
                  {artist.startTime && (
                    <p className="text-mantra-gold mt-2">
                      {new Date(artist.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
