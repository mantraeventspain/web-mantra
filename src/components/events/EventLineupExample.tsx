import { FutureEventLineups } from "./FutureEventLineups";
import { EventLineup } from "./EventLineup";

interface EventLineupExampleProps {
  mode: "single" | "multiple";
  eventId?: string;
}

/**
 * Componente de ejemplo que muestra cómo usar los lineups
 *
 * Para mostrar TODOS los lineup futuros:
 * <EventLineupExample mode="multiple" />
 *
 * Para mostrar un evento específico:
 * <EventLineupExample mode="single" eventId="event-id" />
 */
export const EventLineupExample = ({
  mode,
  eventId,
}: EventLineupExampleProps) => {
  if (mode === "multiple") {
    // Muestra todos los eventos futuros con lineup
    // Priorizando los destacados y luego orden cronológico
    return <FutureEventLineups />;
  }

  // Muestra un evento específico o el próximo evento
  return <EventLineup eventId={eventId} />;
};

// Ejemplo de uso directo:
export const FutureLineupsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mantra-dark via-mantra-blue to-mantra-dark">
      {/* Esto mostrará TODOS los lineup futuros con artistas asignados */}
      <FutureEventLineups />
    </div>
  );
};
