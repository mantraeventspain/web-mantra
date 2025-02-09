import { useState } from "react";
import { useArtists } from "../../hooks/useArtists";
import { ArtistModal } from "./ArtistModal";
import { motion } from "framer-motion";
import type { Artist } from "../../types/artist.ts";
import { SectionTitle } from "../ui/SectionTitle.tsx";
import { ScrollableSection } from "../ui/ScrollableSection.tsx";

export const ArtistShowcase = () => {
  const { artists, isLoading, error } = useArtists();
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mantra-gold"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-red-500">
          Error al cargar los artistas: {error.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <SectionTitle title="Artistas" />
        <ScrollableSection className="py-4">
          <div className="flex gap-8 px-4">
            {artists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedArtist(artist)}
                className="cursor-pointer flex-shrink-0 w-[200px] md:w-[250px]"
              >
                <div className="relative aspect-square mb-4">
                  <div className="absolute inset-0 rounded-xl overflow-hidden hover:scale-95 transition-transform duration-300">
                    {artist.avatarUrl ? (
                      <img
                        src={artist.avatarUrl}
                        alt={artist.nickname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-mantra-blue">
                        <span className="text-4xl text-mantra-gold">
                          {artist.nickname.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-white text-center hover:text-mantra-gold transition-colors">
                  {artist.nickname}
                </h3>
              </motion.div>
            ))}
          </div>
        </ScrollableSection>
      </div>

      <ArtistModal
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
      />
    </>
  );
};
