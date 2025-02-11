import { AnimatedSection } from "../components/home/AnimatedSection";
import { ArtistShowcase } from "../components/home/ArtistShowcase";
import { EventLineup } from "../components/events/EventLineup";
import { TracksSection } from "../components/home/FeaturedTrack";
import { PastEvents } from "../components/home/PastEvents";
import { usePublicUrl } from "../hooks/useSupabase";
import { FloatingTicketButton } from "../components/layout/FloatingTicketButton";

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
      </div>

      {/* Contenido adicional con gradientes */}
      <div className="relative bg-gradient-to-b from-black via-mantra-orange/10 to-black">
        {/* Gradiente decorativo */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-radial from-mantra-orange/20 via-black/95 to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,140,66,0.15),rgba(26,22,20,0.95)_50%,rgba(0,0,0,1)_100%)]" />
          </div>
        </div>

        {/* Secciones animadas */}
        <AnimatedSection delay={0.2}>
          <div id="lineup">
            <EventLineup />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="container mx-auto px-4">
            <TracksSection />
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
      <FloatingTicketButton />
    </div>
  );
};
