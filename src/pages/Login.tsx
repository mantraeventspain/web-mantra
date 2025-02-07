import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export const Login = () => {
  const { signIn, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mantra-gold"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { error } = await signIn({ email, password });
      if (error) throw error;
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError("Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-mantra-blue to-black p-4">
      <div className="max-w-md w-full space-y-8 bg-mantra-blue/30 p-8 rounded-xl backdrop-blur-sm border border-mantra-gold/20">
        <div>
          <h2 className="text-center text-3xl font-bold text-mantra-gold">
            Panel de Administración
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Accede para gestionar el contenido
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-black/30 border border-mantra-gold/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mantra-gold focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-black/30 border border-mantra-gold/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mantra-gold focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-mantra-gold hover:bg-mantra-darkGold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mantra-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};
