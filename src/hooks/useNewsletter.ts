import { useState } from "react";
import { supabase } from "../lib/supabase";

interface NewsletterResponse {
  success?: boolean;
  error?: string;
}

export function useNewsletter() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Guardar en Supabase
      const { error: dbError } = await supabase
        .from("newsletter_subscribers")
        .insert([{ email }]);

      if (dbError) throw dbError;

      // 2. Enviar a Resend via Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/newsletter-signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      const data: NewsletterResponse = await response.json();

      if (!response.ok) throw new Error(data.error);

      return true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Error al procesar la suscripción"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { subscribe, isLoading, error };
}
