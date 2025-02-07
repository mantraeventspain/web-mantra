import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface SiteConfig {
  tickets_url: string;
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>({
    tickets_url: "/",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data, error } = await supabase.from("site_config").select("*");

        if (error) throw error;

        const configObj = data.reduce(
          (acc, item) => ({
            ...acc,
            [item.key]: item.value,
          }),
          {} as SiteConfig
        );

        setConfig(configObj);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Error desconocido"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchConfig();
  }, []);

  return { config, isLoading, error };
}
