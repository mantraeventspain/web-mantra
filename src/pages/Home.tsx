import { motion } from "framer-motion";
import { usePublicUrl } from "../hooks/useSupabase";
import { AnimatedSection } from "../components/home/AnimatedSection";
import { ArtistShowcase } from "../components/home/ArtistShowcase";
import { EventLineup } from "../components/events/EventLineup";
import { FeaturedTrack } from "../components/home/FeaturedTrack";
import { PastEvents } from "../components/home/PastEvents";

export const Home = () => {
  const { url: videoUrl, isLoading } = usePublicUrl(
    "media",
    "videos/intro.mp4"
  );

  return (
    <div className="relative min-h-screen">
      {/* Video section sin gradientes */}
      <div className="relative min-h-screen">
        {/* Contenedor del video */}
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
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative min-h-screen flex items-end justify-center text-white pb-10"
        >
          <div className="text-center px-4">
            {/* <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Experiencias Techno Únicas
            </h1> */}
            {/* <a
              href="/events"
              className="inline-block bg-mantra-gold hover:bg-mantra-darkGold text-mantra-blue px-8 py-3 rounded-full text-lg font-semibold transition-colors"
            >
              Ver Próximos Eventos
            </a> */}
          </div>
        </motion.div>
      </div>

      {/* Contenido adicional con gradientes */}
      <div className="relative bg-gradient-to-b from-black via-mantra-darkGold/10 to-black">
        {/* Gradiente decorativo */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-radial from-mantra-gold/20 via-black/95 to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,166,87,0.15),rgba(15,26,36,0.95)_50%,rgba(0,0,0,1)_100%)]" />
          </div>
        </div>

        {/* Secciones animadas */}
        <AnimatedSection delay={0.2} className="pt-10">
          <div id="lineup">
            <EventLineup />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="container mx-auto px-4">
            <FeaturedTrack />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <PastEvents />
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div id="artistas">
            <ArtistShowcase />
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};
