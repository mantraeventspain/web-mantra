import { createContext } from "react";
import { supabase } from "../lib/supabase";

interface SupabaseContextType {
  supabase: typeof supabase;
}

export const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);
