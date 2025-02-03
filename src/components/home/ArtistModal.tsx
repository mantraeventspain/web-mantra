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
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-3xl bg-zinc-900/95 rounded-2xl overflow-hidden"
        >
          <div className="relative aspect-video">
            {artist.avatarUrl ? (
              <img
                src={artist.avatarUrl}
                alt={artist.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-mantra-blue">
                <span className="text-6xl text-mantra-gold">
                  {artist.nickname.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 to-transparent" />
          </div>

          <div className="relative p-8 -mt-20">
            <button
              onClick={onClose}
              className="absolute right-4 top-0 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold text-white">
                  {artist.nickname}
                </h2>
                <h3 className="text-mantra-gold text-lg font-medium">
                  {artist.role}
                </h3>
              </div>

              <p className="text-gray-300 text-lg">
                {artist.description || "Artista residente en Mantra Events"}
              </p>

              <div className="flex flex-wrap gap-3 pt-4">
                {artist.instagramUsername && (
                  <SocialLink
                    href={`https://instagram.com/${artist.instagramUsername}`}
                    icon={<Instagram className="w-5 h-5" />}
                    label="Instagram"
                  />
                )}
                {artist.soundcloudUrl && (
                  <SocialLink
                    href={artist.soundcloudUrl}
                    icon={<FaSoundcloud className="w-5 h-5" />}
                    label="SoundCloud"
                  />
                )}
                {artist.beatportUrl && (
                  <SocialLink
                    href={artist.beatportUrl}
                    icon={<SiBeatport className="w-5 h-5" />}
                    label="Beatport"
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const SocialLink = ({ href, icon, label }: SocialLinkProps) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 px-4 py-2 rounded-full 
              bg-zinc-800/50 hover:bg-white/10 transition-colors 
              group text-white hover:text-mantra-gold"
  >
    {icon}
    <span className="font-medium">{label}</span>
  </a>
);
