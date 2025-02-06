import { useState, useEffect } from "react";
import {
  getTemporaryLinks,
  getOriginalImage,
  type ImageUrl,
} from "../services/dropboxService";

interface UseEventGalleryProps {
  eventTitle: string;
  imagesPerPage?: number;
}

export function useEventGallery({
  eventTitle,
  imagesPerPage = 25,
}: UseEventGalleryProps) {
  const [images, setImages] = useState<ImageUrl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!eventTitle) return;

    setImages([]);
    setPage(1);
    setHasMore(true);
    fetchImages(1);
  }, [eventTitle]);

  const fetchImages = async (pageNum: number) => {
    try {
      setIsLoading(true);
      const path = `/MANTRA/${eventTitle}`;
      const start = (pageNum - 1) * imagesPerPage;
      const end = start + imagesPerPage;

      const allImages = await getTemporaryLinks(path);
      const pageImages = allImages.slice(start, end);

      if (pageNum === 1) {
        setImages(pageImages);
      } else {
        setImages((prev) => [...prev, ...pageImages]);
      }

      setHasMore(end < allImages.length);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Error al cargar imágenes")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchImages(nextPage);
    }
  };

  const getOriginal = async (path: string) => {
    return await getOriginalImage(path);
  };

  return {
    images,
    isLoading,
    error,
    hasMore,
    loadMore,
    getOriginal,
  };
}
