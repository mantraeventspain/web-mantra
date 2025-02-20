import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useArtists } from "../../hooks/useArtists";
import { ArtistForm } from "./ArtistForm";
import { Artist } from "../../types/artist";
import { Edit, UserPlus, UserX, UserCheck, Trash2 } from "lucide-react";
import { ArtistOrderManager } from "./ArtistOrderManager";
import {
  deleteArtistFiles,
  checkArtistReferences,
} from "../../utils/artistHelpers";

const ArtistManager = () => {
  const [activeTab, setActiveTab] = useState<"list" | "order">("list");
  const [showInactive, setShowInactive] = useState(false);
  const { artists, isLoading, error, refetch } = useArtists({
    includeInactive: showInactive,
    orderBy: "display_order",
  });
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (artist: Artist) => {
    const newStatus = !artist.is_active;
    const message = newStatus
      ? `¿Estás seguro de que deseas dar de alta a ${artist.nickname}?`
      : `¿Estás seguro de que deseas dar de baja a ${artist.nickname}?`;

    if (!window.confirm(message)) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("artists")
        .update({ is_active: newStatus })
        .eq("id", artist.id);

      if (error) throw error;
      await refetch();
    } catch (e) {
      console.error("Error al cambiar el estado del artista:", e);
      alert("Error al cambiar el estado del artista");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteArtist = async (artist: Artist) => {
    setIsDeleting(true);
    try {
      // Primero verificamos si el artista tiene referencias
      const references = await checkArtistReferences(artist.id);

      if (!references.canDelete) {
        alert(references.message);
        return;
      }

      // Si no hay referencias, procedemos con la confirmación
      const message = `¿Estás seguro de que deseas eliminar permanentemente a ${artist.nickname}? Esta acción no se puede deshacer y eliminará todos sus archivos asociados.`;

      if (!window.confirm(message)) return;

      // Eliminamos los archivos del storage
      await deleteArtistFiles(artist.normalized_nickname);

      // Eliminamos el registro de la base de datos
      const { error } = await supabase
        .from("artists")
        .delete()
        .eq("id", artist.id);

      if (error) throw error;
      await refetch();
    } catch (e) {
      console.error("Error al eliminar el artista:", e);
      alert("Error al eliminar el artista");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setSelectedArtist(null);
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mantra-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error al cargar los artistas: {error.message}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg overflow-hidden bg-black/20">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 ${
                activeTab === "list"
                  ? "bg-mantra-gold text-black"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setActiveTab("order")}
              className={`px-4 py-2 ${
                activeTab === "order"
                  ? "bg-mantra-gold text-black"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Ordenar
            </button>
          </div>
          {activeTab === "list" && (
            <>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-mantra-gold hover:bg-mantra-darkGold text-black rounded-lg transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Nuevo Artista
              </button>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-mantra-gold rounded border-mantra-gold/20 bg-black/30"
                />
                Mostrar inactivos
              </label>
            </>
          )}
        </div>
      </div>

      {activeTab === "list" ? (
        <div
          className="overflow-x-auto custom-scrollbar overflow-y-auto"
          style={{ maxHeight: "calc(10 * 76px + 45px)" }}
        >
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-mantra-gold/20">
                <th className="px-4 py-2 text-mantra-gold">Artista</th>
                <th className="px-4 py-2 text-mantra-gold">Rol</th>
                <th className="px-4 py-2 text-mantra-gold">Estado</th>
                <th className="px-4 py-2 text-mantra-gold">Redes Sociales</th>
                <th className="px-4 py-2 text-mantra-gold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((artist) => (
                <tr
                  key={artist.id}
                  className={`border-b border-mantra-gold/10 ${
                    !artist.is_active ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-mantra-blue flex-shrink-0">
                        {artist.avatarUrl ? (
                          <img
                            src={artist.avatarUrl}
                            alt={artist.nickname}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xl text-mantra-gold">
                              {artist.nickname.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {artist.nickname}
                        </p>
                        <p className="text-sm text-gray-400">
                          {artist.firstName} {artist.lastName1}{" "}
                          {artist.lastName2}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-300">
                    {artist.role || "-"}
                  </td>
                  <td className="px-4 py-4 text-gray-300">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        artist.is_active
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {artist.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {artist.instagram_username && (
                        <span className="px-2 py-1 bg-mantra-gold/10 text-mantra-gold rounded text-sm">
                          Instagram
                        </span>
                      )}
                      {artist.soundcloud_url && (
                        <span className="px-2 py-1 bg-mantra-gold/10 text-mantra-gold rounded text-sm">
                          SoundCloud
                        </span>
                      )}
                      {artist.beatport_url && (
                        <span className="px-2 py-1 bg-mantra-gold/10 text-mantra-gold rounded text-sm">
                          Beatport
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedArtist(artist);
                          setShowForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(artist)}
                        disabled={isDeleting}
                        className={`p-2 transition-colors ${
                          artist.is_active
                            ? "text-gray-400 hover:text-red-500"
                            : "text-gray-400 hover:text-green-500"
                        }`}
                        title={artist.is_active ? "Dar de baja" : "Dar de alta"}
                      >
                        {artist.is_active ? (
                          <UserX className="w-5 h-5" />
                        ) : (
                          <UserCheck className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteArtist(artist)}
                        disabled={isDeleting}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar artista"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ArtistOrderManager artists={artists} onReorder={refetch} />
      )}

      {showForm && (
        <ArtistForm
          artist={selectedArtist || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setSelectedArtist(null);
          }}
        />
      )}
    </>
  );
};

export default ArtistManager;
