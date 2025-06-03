import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Ticket, ExternalLink } from "lucide-react";
import TicketEventsManager from "./TicketEventsManager";

interface SocialLinks {
  facebook_url: string;
  instagram_url: string;
  soundcloud_url: string;
  tickets_url: string;
  beatport_url: string;
  spotify_url: string;
  soundcloud_mantra_url: string;
}

const SiteConfigManager = () => {
  const [links, setLinks] = useState<SocialLinks>({
    facebook_url: "",
    instagram_url: "",
    soundcloud_url: "",
    tickets_url: "",
    beatport_url: "",
    spotify_url: "",
    soundcloud_mantra_url: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"social" | "tickets">("social");

  useEffect(() => {
    loadCurrentLinks();
  }, []);

  const loadCurrentLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("site_config")
        .select("*")
        .in("key", [
          "facebook_url",
          "instagram_url",
          "soundcloud_url",
          "tickets_url",
          "beatport_url",
          "spotify_url",
          "soundcloud_mantra_url",
        ]);

      if (error) throw error;

      const currentLinks = data.reduce(
        (acc, item) => ({
          ...acc,
          [item.key]: item.value,
        }),
        {} as SocialLinks
      );

      setLinks(currentLinks);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Error al cargar la configuración"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Trim all values in links
      const trimmedLinks = Object.entries(links).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: value.trim(),
        }),
        {} as SocialLinks
      );

      const updates = Object.entries(trimmedLinks).map(([key, value]) => ({
        key,
        value,
      }));

      const { error } = await supabase
        .from("site_config")
        .upsert(updates, { onConflict: "key" });

      if (error) throw error;
      alert("Enlaces actualizados correctamente");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Error al actualizar los enlaces"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-black/20 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("social")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
            activeTab === "social"
              ? "bg-mantra-gold text-black"
              : "text-mantra-light/70 hover:text-white"
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          Enlaces Sociales
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
            activeTab === "tickets"
              ? "bg-mantra-gold text-black"
              : "text-mantra-light/70 hover:text-white"
          }`}
        >
          <Ticket className="w-4 h-4" />
          Eventos de Entradas
        </button>
      </div>

      {/* Content */}
      {activeTab === "social" ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Configuración de Enlaces Sociales
            </h2>
            <p className="text-mantra-light/70">
              Configura los enlaces a redes sociales y plataformas de música
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de Facebook
                </label>
                <input
                  type="url"
                  value={links.facebook_url}
                  onChange={(e) =>
                    setLinks((prev) => ({
                      ...prev,
                      facebook_url: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de Instagram
                </label>
                <input
                  type="url"
                  value={links.instagram_url}
                  onChange={(e) =>
                    setLinks((prev) => ({
                      ...prev,
                      instagram_url: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de SoundCloud
                </label>
                <input
                  type="url"
                  value={links.soundcloud_url}
                  onChange={(e) =>
                    setLinks((prev) => ({
                      ...prev,
                      soundcloud_url: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  placeholder="https://soundcloud.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de Beatport
                </label>
                <input
                  type="url"
                  value={links.beatport_url}
                  onChange={(e) =>
                    setLinks((prev) => ({
                      ...prev,
                      beatport_url: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  placeholder="https://beatport.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de Entradas (Fallback)
                </label>
                <input
                  type="text"
                  value={links.tickets_url}
                  onChange={(e) =>
                    setLinks((prev) => ({
                      ...prev,
                      tickets_url: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  placeholder="URL externa o ruta interna"
                />
                <p className="text-xs text-mantra-light/50 mt-1">
                  Se usa solo si no hay eventos configurados en la pestaña
                  "Eventos de Entradas"
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de Spotify
                </label>
                <input
                  type="url"
                  value={links.spotify_url}
                  onChange={(e) =>
                    setLinks((prev) => ({
                      ...prev,
                      spotify_url: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  placeholder="https://open.spotify.com/playlist/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de SoundCloud Mantra Event
                </label>
                <input
                  type="url"
                  value={links.soundcloud_mantra_url}
                  onChange={(e) =>
                    setLinks((prev) => ({
                      ...prev,
                      soundcloud_mantra_url: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
                  placeholder="https://soundcloud.com/..."
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-mantra-gold hover:bg-mantra-darkGold text-black rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </button>
          </form>
        </div>
      ) : (
        <TicketEventsManager />
      )}
    </div>
  );
};

export default SiteConfigManager;
