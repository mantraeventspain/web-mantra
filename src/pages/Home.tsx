import { motion } from "framer-motion";
import { usePublicUrl } from "../hooks/useSupabase";
import { AnimatedSection } from "../components/home/AnimatedSection";
import { FeaturedEvents } from "../components/home/FeaturedEvents";
import { ArtistShowcase } from "../components/home/ArtistShowcase";

export const Home = () => {
  const { url: videoUrl, isLoading } = usePublicUrl(
    "media",
    "videos/pecope2.mp4"
  );

  return (
    <div className="relative">
      {/* Hero Section con video */}
      <div className="relative min-h-screen">
        <div className="absolute inset-0 w-full h-screen">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="object-cover w-full h-full"
            poster="https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&q=80"
          >
            {!isLoading && videoUrl && (
              <source src={videoUrl} type="video/mp4" />
            )}
          </video>
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative min-h-screen flex items-end justify-center text-white pb-10"
        >
          <div className="text-center px-4">
            {/* <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Experiencias Techno Únicas
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Descubre los mejores eventos de música electrónica
            </p> */}
            <a
              href="/events"
              className="inline-block bg-mantra-gold hover:bg-mantra-darkGold text-mantra-blue px-8 py-3 rounded-full text-lg font-semibold transition-colors"
            >
              Ver Próximos Eventos
            </a>
          </div>
        </motion.div>
      </div>

      {/* Secciones animadas */}
      <AnimatedSection>
        <div id="eventos">
          <FeaturedEvents />
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <div id="artistas">
          <ArtistShowcase />
        </div>
      </AnimatedSection>
    </div>
  );
};
