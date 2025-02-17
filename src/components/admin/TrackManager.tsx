import { useState } from "react";
import { Edit, Plus, Music, Star, Trash2 } from "lucide-react";
import { useTracks } from "../../hooks/useTracks";
import { TrackForm } from "./TrackForm";
import type { Track } from "../../types/track";
import { supabase } from "../../lib/supabase";
import { deleteTrack } from "../../hooks/useTrackForm";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const TrackManager = () => {
  const { tracks, isLoading, error, refetch } = useTracks();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleFeatureTrack = async (track: Track) => {
    try {
      // Primero, desmarcamos cualquier track destacado
      await supabase
        .from("tracks")
        .update({ is_featured: false })
        .eq("is_featured", true);

      // Luego, marcamos el nuevo track como destacado
      const { error } = await supabase
        .from("tracks")
        .update({ is_featured: true })
        .eq("id", track.id);

      if (error) throw error;
      await refetch();
    } catch (e) {
      console.error("Error al destacar el track:", e);
      alert("Error al destacar el track");
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setSelectedTrack(null);
    await refetch();
  };

  const handleDeleteTrack = async (track: Track) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este track?")) {
      return;
    }

    try {
      await deleteTrack(track);
      await refetch();
    } catch (e) {
      console.error("Error al eliminar el track:", e);
      alert("Error al eliminar el track");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mantra-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error al cargar los tracks: {error.message}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-mantra-gold hover:bg-mantra-darkGold text-black rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Track
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="bg-mantra-blue/30 rounded-xl p-6 backdrop-blur-sm border border-mantra-gold/20"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/30 flex-shrink-0">
                  {track.artworkUrl ? (
                    <LazyLoadImage
                      src={track.artworkUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                      effect="blur"
                      threshold={100}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-8 h-8 text-mantra-gold/50" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {track.title}
                  </h3>
                  <p className="text-mantra-gold">
                    {track.artist?.nickname || "Artista no disponible"}
                  </p>
                  {track.releaseDate && (
                    <p className="text-sm text-gray-400">
                      {new Date(track.releaseDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedTrack(track);
                    setShowForm(true);
                  }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Editar"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleFeatureTrack(track)}
                  className={`p-2 transition-colors ${
                    track.isFeatured
                      ? "text-mantra-gold"
                      : "text-gray-400 hover:text-mantra-gold"
                  }`}
                  title={
                    track.isFeatured ? "Track destacado" : "Destacar track"
                  }
                >
                  <Star className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteTrack(track)}
                  className="p-2 text-red-400 hover:text-red-500 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {track.beatportUrl && (
              <a
                href={track.beatportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-mantra-gold hover:text-mantra-darkGold transition-colors"
              >
                Ver en Beatport
              </a>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <TrackForm
          track={selectedTrack || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setSelectedTrack(null);
          }}
        />
      )}
    </>
  );
};

export default TrackManager;
