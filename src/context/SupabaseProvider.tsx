import { ReactNode } from "react";
import { SupabaseContext } from "./supabaseContext";
import { supabase } from "../lib/supabase";

export function SupabaseProvider({ children }: { children: ReactNode }) {
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}
