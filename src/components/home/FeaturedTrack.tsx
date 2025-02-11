import { motion } from "framer-motion";
import { useTracks } from "../../hooks/useTracks";
import { SiBeatport } from "react-icons/si";
import { Play, Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { SectionTitle } from "../ui/SectionTitle";
import { ScrollableSection } from "../ui/ScrollableSection";
import { useFeaturedTrack } from "../../hooks/useFeaturedTrack";
import type { Track } from "../../types/track";

export const TracksSection = () => {
  const { tracks } = useTracks();
  const featuredTrack = tracks.find((track) => track.isFeatured);
  const regularTracks = tracks.filter((track) => !track.isFeatured);

  return (
    <div className="container mx-auto px-4 py-16">
      <SectionTitle title="Tracks" />

      {/* Track Destacado */}
      {featuredTrack && <FeaturedTrack track={featuredTrack} />}

      {/* Carrusel de Tracks */}
      {regularTracks.length > 0 && (
        <div className="mt-16">
          <h3 className="text-xl text-mantra-gold mb-8 pl-4">Más Tracks</h3>
          <ScrollableSection>
            <div className="flex gap-6 px-4 pb-4">
              {regularTracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </ScrollableSection>
        </div>
      )}
    </div>
  );
};

// Componente para el track destacado (mantiene la lógica actual)
const FeaturedTrack = ({ track }: { track: Track }) => {
  const { audioUrl, artworkUrl, isLoading, error } = useFeaturedTrack();
  const [isPlaying, setIsPlaying] = useState(false);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!waveformRef.current || !audioUrl) return;

    // Destruir la instancia anterior si existe
    if (wavesurfer) {
      wavesurfer.destroy();
    }

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#B8860B",
      progressColor: "#FFD700",
      cursorColor: "transparent",
      barWidth: 2,
      barGap: 3,
      height: 60,
      barRadius: 3,
      normalize: true,
      backend: "WebAudio",
    });

    ws.load(audioUrl);
    setWavesurfer(ws);
    setIsPlaying(false);

    ws.on("finish", () => setIsPlaying(false));

    return () => {
      ws.destroy();
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!wavesurfer) return;
    wavesurfer.playPause();
    setIsPlaying(!isPlaying);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mantra-gold"></div>
      </div>
    );
  }

  if (error || !track) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-mantra-blue/40 to-black/60 rounded-xl p-8 backdrop-blur-sm border border-mantra-gold/20"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4 flex justify-center">
        <span className="bg-mantra-gold px-4 sm:px-6 py-2 rounded-full text-black text-xs sm:text-sm font-bold tracking-wider uppercase whitespace-nowrap">
          Track Destacado
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Artwork y controles */}
        <div className="relative group w-64 h-64 flex-shrink-0">
          <img
            src={artworkUrl || "/default-artwork.jpg"}
            alt={track.title}
            className="w-full h-full object-cover rounded-lg shadow-xl"
          />
          <button
            onClick={togglePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            {isPlaying ? (
              <Pause className="w-16 h-16 text-mantra-gold" />
            ) : (
              <Play className="w-16 h-16 text-mantra-gold" />
            )}
          </button>
        </div>

        {/* Información y waveform */}
        <div className="flex-1 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {track.title}
            </h3>
            <p className="text-mantra-gold text-lg">
              {track.artist?.nickname || "Artista no disponible"}
            </p>
          </div>

          {/* Waveform */}
          <div
            ref={waveformRef}
            className="w-full rounded-lg overflow-hidden"
          />

          {/* Botón de Beatport */}
          {track.beatportUrl && (
            <motion.a
              href={track.beatportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#02FF95] text-black px-6 py-3 rounded-full font-semibold hover:bg-[#00E085] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SiBeatport className="w-5 h-5" />
              Comprar en Beatport
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Componente para las tarjetas de tracks en el carrusel
const TrackCard = ({ track }: { track: Track }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cursor-pointer flex-shrink-0 w-[300px]"
    >
      <div className="relative aspect-square mb-4">
        <div className="absolute inset-0 rounded-xl overflow-hidden hover:scale-95 transition-transform duration-300">
          <img
            src={track.artworkUrl || "/default-artwork.jpg"}
            alt={track.title}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-16 h-16 text-mantra-gold" />
            ) : (
              <Play className="w-16 h-16 text-mantra-gold" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 px-2">
        <div>
          <h3
            className="text-lg font-bold text-white mb-1 truncate hover:text-mantra-gold transition-colors"
            title={track.title}
          >
            {track.title}
          </h3>
          <p className="text-mantra-gold text-sm truncate">
            {track.artist?.nickname || "Artista no disponible"}
          </p>
        </div>

        {/* Audio element oculto */}
        <audio ref={audioRef} src={track.audioUrl || ""} />

        {/* Indicador de reproducción */}
        {isPlaying && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-4 bg-mantra-gold rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-mantra-gold">Reproduciendo</span>
          </div>
        )}

        {track.beatportUrl && (
          <motion.a
            href={track.beatportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#02FF95]/10 hover:bg-[#02FF95] text-[#02FF95] hover:text-black px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SiBeatport className="w-4 h-4" />
            Comprar en Beatport
          </motion.a>
        )}
      </div>
    </motion.div>
  );
};
