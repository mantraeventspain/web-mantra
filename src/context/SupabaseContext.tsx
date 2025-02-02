import { createContext, ReactNode } from "react";
import { supabase } from "../lib/supabase";

interface SupabaseContextType {
  supabase: typeof supabase;
}

export const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}
