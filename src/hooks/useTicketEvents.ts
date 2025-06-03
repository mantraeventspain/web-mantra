import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { TicketEvent } from "../types/tickets";

export function useTicketEvents() {
  const [ticketEvents, setTicketEvents] = useState<TicketEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchTicketEvents();
  }, []);

  const fetchTicketEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("ticket_events")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;

      setTicketEvents(data || []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Error desconocido"));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTicketEvents = () => {
    fetchTicketEvents();
  };

  return {
    ticketEvents,
    isLoading,
    error,
    refreshTicketEvents,
  };
}
