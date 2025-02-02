import { useContext } from "react";
import { SupabaseContext } from "../context/SupabaseContext";

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase debe ser usado dentro de SupabaseProvider");
  }
  return context;
}
