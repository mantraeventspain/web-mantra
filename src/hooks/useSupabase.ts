import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database.types";

export function useEvents() {
  const [events, setEvents] = useState<
    Database["public"]["Tables"]["events"]["Row"][]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true });

        if (error) throw error;
        setEvents(data);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Error desconocido"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return { events, isLoading, error };
}

export function useProducts() {
  const [products, setProducts] = useState<
    Database["public"]["Tables"]["products"]["Row"][]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProducts(data);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Error desconocido"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, isLoading, error };
}

export function usePublicUrl(bucket: string, path: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getPublicUrl() {
      try {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);

        if (data?.publicUrl) {
          setUrl(data.publicUrl);
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Error al obtener la URL"));
      } finally {
        setIsLoading(false);
      }
    }

    getPublicUrl();
  }, [bucket, path]);

  return { url, isLoading, error };
}
