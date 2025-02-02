import { X, Instagram } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Artist } from "../../types/artist";
import { FaSoundcloud } from "react-icons/fa";
import { SiBeatport } from "react-icons/si";

interface ArtistModalProps {
  artist: Artist | null;
  onClose: () => void;
}

export const ArtistModal = ({ artist, onClose }: ArtistModalProps) => {
  if (!artist) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-mantra-darkBlue to-black rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl"
        >
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-mantra-blue flex-shrink-0">
                  {artist.avatarUrl ? (
                    <img
                      src={artist.avatarUrl}
                      alt={artist.nickname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-mantra-blue">
                      <span className="text-5xl text-mantra-gold">
                        {artist.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {artist.nickname}
                  </h2>
                  <p className="text-gray-400">{artist.role}</p>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-gray-300 leading-relaxed">
                  {artist.description || "Artista residente en Mantra Events"}
                </p>
              </div>

              <div className="mt-8 flex gap-4">
                {artist.instagramUsername && (
                  <a
                    href={`https://instagram.com/${artist.instagramUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-mantra-blue hover:bg-mantra-gold transition-colors text-white"
                  >
                    <Instagram className="w-5 h-5" />
                    <span>Instagram</span>
                  </a>
                )}
                {artist.soundcloudUrl && (
                  <a
                    href={artist.soundcloudUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-mantra-blue hover:bg-mantra-gold transition-colors text-white"
                  >
                    <FaSoundcloud className="w-5 h-5" />
                    <span>SoundCloud</span>
                  </a>
                )}
                {artist.beatportUrl && (
                  <a
                    href={artist.beatportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-mantra-blue hover:bg-mantra-gold transition-colors text-white"
                  >
                    <SiBeatport className="w-5 h-5" />
                    <span>Beatport</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
