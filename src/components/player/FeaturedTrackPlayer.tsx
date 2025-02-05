import { useRef, useState } from "react";
import { Music, Play, Pause, ExternalLink } from "lucide-react";
import { useFeaturedTrack } from "../../hooks/useFeaturedTrack";
import { motion, AnimatePresence } from "framer-motion";

export const FeaturedTrackPlayer = () => {
  const { track, audioUrl, artworkUrl, isLoading } = useFeaturedTrack();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (isLoading || !track) return null;

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="relative group bg-black/20 backdrop-blur-sm p-3 rounded-full hover:bg-black/30 transition-colors"
        >
          {artworkUrl ? (
            <img
              src={artworkUrl}
              alt={track.title}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <Music className="w-6 h-6 text-mantra-gold" />
          )}
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
            Track destacado
          </span>
        </button>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-md p-6 rounded-xl border border-mantra-gold/20 shadow-xl"
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <button onClick={togglePlay} className="relative group">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    {artworkUrl ? (
                      <img
                        src={artworkUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-mantra-gold/10 flex items-center justify-center">
                        <Music className="w-8 h-8 text-mantra-gold" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white" />
                    )}
                  </div>
                </button>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">{track.title}</h3>
                <p className="text-mantra-gold">{track.artist?.nickname}</p>
              </div>

              {track.beatportUrl && (
                <a
                  href={track.beatportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#02FF95] text-black px-4 py-2 rounded-full flex items-center gap-2 hover:scale-105 transition-transform text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Comprar en Beatport
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
