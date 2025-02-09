import { useState, useEffect } from "react";
import { Mail, Trash2, Download } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
  status: string | null;
}

export const NewsletterManager = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscribers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar suscriptores");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este suscriptor?")) return;

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await loadSubscribers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar suscriptor");
    }
  };

  const exportToCSV = () => {
    const headers = ["Email", "Fecha de suscripción", "Estado"];
    const csvData = subscribers.map((sub) => [
      sub.email,
      new Date(sub.created_at).toLocaleDateString("es-ES"),
      sub.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suscriptores-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mantra-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-mantra-gold" />
          <span className="text-lg">
            Total suscriptores: {subscribers.length}
          </span>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-mantra-gold hover:bg-mantra-darkGold text-black rounded-lg transition-colors"
        >
          <Download className="w-5 h-5" />
          Exportar CSV
        </button>
      </div>

      {error && (
        <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">{error}</div>
      )}

      <div className="bg-mantra-blue/30 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-mantra-darkBlue">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                  Fecha de suscripción
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mantra-gold/10">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-mantra-blue/50">
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {subscriber.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(subscriber.created_at).toLocaleDateString(
                      "es-ES"
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                      {subscriber.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(subscriber.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
