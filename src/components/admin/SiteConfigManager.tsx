import { useState } from "react";
import { supabase } from "../../lib/supabase";

export const SiteConfigManager = () => {
  const [ticketsUrl, setTicketsUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("site_config")
        .upsert(
          { key: "tickets_url", value: ticketsUrl },
          { onConflict: "key" }
        );

      if (error) throw error;
      alert("URL actualizada correctamente");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar la URL");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          URL de Entradas
        </label>
        <input
          type="text"
          value={ticketsUrl}
          onChange={(e) => setTicketsUrl(e.target.value)}
          className="w-full px-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white"
          placeholder="URL externa "
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-mantra-gold hover:bg-mantra-darkGold text-black rounded-lg transition-colors disabled:opacity-50"
      >
        {isLoading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
};
