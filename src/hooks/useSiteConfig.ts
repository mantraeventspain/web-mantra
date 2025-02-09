import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface SiteConfig {
  tickets_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  soundcloud_url?: string;
  beatport_url?: string;
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>({
    tickets_url: "/",
    facebook_url: "https://www.facebook.com/p/Mantra-events-61557011395289/",
    instagram_url: "https://www.instagram.com/mantra_event/",
    soundcloud_url: "https://soundcloud.com/mantra-parties",
    beatport_url: "https://beatport.com/mantra-events",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data, error } = await supabase
          .from("site_config")
          .select("*")
          .in("key", [
            "tickets_url",
            "facebook_url",
            "instagram_url",
            "soundcloud_url",
            "beatport_url",
          ]);

        if (error) throw error;

        const configObj = data.reduce(
          (acc, item) => ({
            ...acc,
            [item.key]: item.value,
          }),
          {} as SiteConfig
        );

        setConfig((prevConfig) => ({
          ...prevConfig,
          ...configObj,
        }));
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
