import { useAuth } from "../hooks/useAuth";
import { VideoManager } from "../components/admin/VideoManager";
import { Navigate } from "react-router-dom";
import { SiteConfigManager } from "../components/admin/SiteConfigManager";
import { ArtistManager } from "../components/admin/ArtistManager";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { EventManager } from "../components/admin/EventManager";
import { TrackManager } from "../components/admin/TrackManager";

interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const AccordionSection = ({
  title,
  isOpen,
  onToggle,
  children,
}: AccordionSectionProps) => {
  return (
    <div className="bg-mantra-blue/30 rounded-xl backdrop-blur-sm border border-mantra-gold/20 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex justify-between items-center text-xl font-semibold text-white hover:bg-mantra-blue/40 transition-colors"
      >
        {title}
        <ChevronDown
          className={`w-6 h-6 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 border-t border-mantra-gold/20">{children}</div>
      </div>
    </div>
  );
};

export const Admin = () => {
  const { user, isLoading } = useAuth();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mantra-gold"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-mantra-blue to-black p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-mantra-gold mb-8">
          Panel de Administración
        </h1>

        <AccordionSection
          title="Gestionar Artistas"
          isOpen={openSection === "artists"}
          onToggle={() => toggleSection("artists")}
        >
          <ArtistManager />
        </AccordionSection>

        <AccordionSection
          title="Gestionar Eventos"
          isOpen={openSection === "events"}
          onToggle={() => toggleSection("events")}
        >
          <EventManager />
        </AccordionSection>

        <AccordionSection
          title="Gestionar Tracks"
          isOpen={openSection === "tracks"}
          onToggle={() => toggleSection("tracks")}
        >
          <TrackManager />
        </AccordionSection>

        <AccordionSection
          title="Configuración del Sitio"
          isOpen={openSection === "config"}
          onToggle={() => toggleSection("config")}
        >
          <SiteConfigManager />
        </AccordionSection>

        <AccordionSection
          title="Gestionar Videos"
          isOpen={openSection === "videos"}
          onToggle={() => toggleSection("videos")}
        >
          <VideoManager />
        </AccordionSection>
      </div>
    </div>
  );
};
