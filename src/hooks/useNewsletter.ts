import { useState } from "react";

export function useNewsletter() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": import.meta.env.VITE_BREVO_API_KEY,
        },
        body: JSON.stringify({
          email,
          listIds: [parseInt(import.meta.env.VITE_BREVO_LIST_ID)],
          updateEnabled: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al procesar la suscripción");
      }

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
