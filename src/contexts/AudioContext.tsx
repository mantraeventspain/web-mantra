import { createContext, useContext, useState } from "react";

type AudioContextType = {
  currentlyPlaying: string | null;
  setCurrentlyPlaying: (trackId: string | null) => void;
  stopAll: () => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const stopAll = () => setCurrentlyPlaying(null);

  return (
    <AudioContext.Provider
      value={{ currentlyPlaying, setCurrentlyPlaying, stopAll }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
