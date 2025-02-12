import { useState } from "react";
import { Upload, AlertCircle, X } from "lucide-react";
import { useVideoUpload } from "../../hooks/useVideoUpload";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB en bytes

const VideoManager = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadVideo, isLoading, error } = useVideoUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("El archivo no debe superar los 50MB");
        return;
      }
      if (!file.type.includes("video/")) {
        alert("Por favor, selecciona un archivo de video");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await uploadVideo(selectedFile);
      setSelectedFile(null);
      // Forzar recarga de la página para actualizar el video
      window.location.reload();
    } catch (error) {
      console.error("Error al subir el video:", error);
    }
  };

  return (
    <div className="bg-mantra-blue/30 rounded-xl p-6 backdrop-blur-sm border border-mantra-gold/20">
      <h2 className="text-xl font-semibold text-white mb-4">
        Gestionar Video de Introducción
      </h2>

      <div className="mb-4">
        <div className="flex items-center text-amber-400 bg-amber-400/10 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p className="text-sm">
            El video debe pesar menos de 50MB y estar en formato MP4
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-mantra-gold/20 border-dashed rounded-lg cursor-pointer hover:bg-mantra-blue/20 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 text-mantra-gold mb-3" />
              <p className="mb-2 text-sm text-gray-300">
                <span className="font-semibold">Haz click para subir</span> o
                arrastra y suelta
              </p>
              <p className="text-xs text-gray-400">MP4 (MAX. 50MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="video/mp4"
              onChange={handleFileSelect}
            />
          </label>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between bg-mantra-blue/20 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-gray-300">{selectedFile.name}</span>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1 hover:bg-mantra-blue/30 rounded-full transition-colors"
                title="Cancelar"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
              </button>
            </div>
            <button
              onClick={handleUpload}
              disabled={isLoading}
              className="px-4 py-2 bg-mantra-gold hover:bg-mantra-darkGold text-black rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "Subiendo..." : "Subir Video"}
            </button>
          </div>
        )}

        {error && (
          <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoManager;
