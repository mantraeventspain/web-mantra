import { useEffect, useState } from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setAuthState({
        user: session?.user ?? null,
        isLoading: false,
        error: error,
      });
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState((current) => ({
        ...current,
        user: session?.user ?? null,
        isLoading: false,
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (credentials: { email: string; password: string }) => {
    setAuthState((current) => ({ ...current, isLoading: true, error: null }));
    const response = await supabase.auth.signInWithPassword(credentials);
    setAuthState((current) => ({
      ...current,
      isLoading: false,
      error: response.error,
    }));
    return response;
  };

  const signOut = async () => {
    setAuthState((current) => ({ ...current, isLoading: true, error: null }));
    const { error } = await supabase.auth.signOut();
    setAuthState((current) => ({ ...current, isLoading: false, error }));
  };

  return {
    ...authState,
    signIn,
    signUp: supabase.auth.signUp,
    signOut,
  };
}
