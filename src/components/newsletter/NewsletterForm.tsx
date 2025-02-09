import { useState } from "react";
import { Mail } from "lucide-react";
import { supabase } from "../../lib/supabase";

export const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{
    isLoading: boolean;
    error: string | null;
    success: boolean;
  }>({
    isLoading: false,
    error: null,
    success: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ isLoading: true, error: null, success: false });

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert([{ email }]);

      if (error) throw error;

      setStatus({ isLoading: false, error: null, success: true });
      setEmail("");

      setTimeout(() => {
        setStatus((prev) => ({ ...prev, success: false }));
      }, 3000);
    } catch (err) {
      console.error(err);
      setStatus({
        isLoading: false,
        error: "Este email ya está registrado o es inválido",
        success: false,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h4 className="text-lg font-semibold text-mantra-gold">Newsletter</h4>
      <p className="text-gray-300 text-sm">
        Suscríbete para recibir las últimas novedades
      </p>

      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          required
          className="w-full pl-10 pr-4 py-2 bg-black/30 border border-mantra-gold/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mantra-gold focus:border-transparent"
        />
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mantra-gold" />
      </div>

      <button
        type="submit"
        disabled={status.isLoading}
        className="w-full px-4 py-2 bg-mantra-gold hover:bg-mantra-darkGold text-black rounded-lg transition-colors disabled:opacity-50"
      >
        {status.isLoading ? "Suscribiendo..." : "Suscribirse"}
      </button>

      {status.error && <p className="text-red-500 text-sm">{status.error}</p>}

      {status.success && (
        <p className="text-green-500 text-sm">¡Gracias por suscribirte!</p>
      )}
    </form>
  );
};
