import { Instagram, X } from "lucide-react";
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
          className="bg-gradient-to-b from-mantra-darkBlue/50 to-black rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl"
        >
          <div className="relative h-full">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-50 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative">
              {/* Header con gradiente */}
              {/* <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-0" /> */}

              {/* Información principal del artista */}
              <div className="p-8 relative z-10 pointer-events-none">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                  <div className="w-48 h-48 rounded-full overflow-hidden bg-mantra-blue flex-shrink-0 shadow-2xl">
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
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-300 font-medium mb-2">
                      {artist.role}
                    </p>
                    <h2 className="text-5xl font-bold text-white mb-4">
                      {artist.nickname}
                    </h2>
                    <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
                      {artist.description ||
                        "Artista residente en Mantra Events"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección de redes sociales */}
              <div className="px-8 pb-8">
                <div className="flex flex-wrap gap-4 mt-4">
                  {artist.instagram_username && (
                    <motion.div whileHover={{ y: -2 }} whileTap={{ y: 2 }}>
                      <SocialLink
                        href={`https://instagram.com/${artist.instagram_username}`}
                        icon={<Instagram className="w-5 h-5" />}
                        label="Instagram"
                      />
                    </motion.div>
                  )}
                  {artist.soundcloud_url && (
                    <motion.div whileHover={{ y: -2 }} whileTap={{ y: 2 }}>
                      <SocialLink
                        href={artist.soundcloud_url}
                        icon={<FaSoundcloud className="w-5 h-5" />}
                        label="SoundCloud"
                      />
                    </motion.div>
                  )}
                  {artist.beatport_url && (
                    <motion.div whileHover={{ y: -2 }} whileTap={{ y: 2 }}>
                      <SocialLink
                        href={artist.beatport_url}
                        icon={<SiBeatport className="w-5 h-5" />}
                        label="Beatport"
                      />
                    </motion.div>
                  )}
                </div>
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
    className="group flex items-center gap-2 px-6 py-3 rounded-full 
      bg-white/10 hover:bg-white/20 active:bg-white/30 
      transition-all duration-200 ease-in-out cursor-pointer
      hover:scale-105 active:scale-95 text-white
      hover:shadow-lg hover:shadow-white/10"
  >
    <span className="group-hover:text-mantra-gold transition-colors">
      {icon}
    </span>
    <span className="group-hover:text-mantra-gold transition-colors">
      {label}
    </span>
  </a>
);
