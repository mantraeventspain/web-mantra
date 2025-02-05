import { motion } from "framer-motion";
import { useFeaturedTrack } from "../../hooks/useFeaturedTrack";
import { SiBeatport } from "react-icons/si";
import { Play, Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export const FeaturedTrack = () => {
  const { track, audioUrl, artworkUrl, isLoading, error } = useFeaturedTrack();
  const [isPlaying, setIsPlaying] = useState(false);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!waveformRef.current || !audioUrl) return;

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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="bg-mantra-gold px-6 py-2 rounded-full text-black text-sm font-bold tracking-wider uppercase">
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
            className="w-full rounded-lg overflow-hidden bg-black/30 backdrop-blur-sm"
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
