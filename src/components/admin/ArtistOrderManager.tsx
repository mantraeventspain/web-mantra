import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Artist } from "../../types/artist";
import type { DropResult } from "@hello-pangea/dnd";

interface ArtistOrderManagerProps {
  artists: Artist[];
  onReorder: () => void;
}

export const ArtistOrderManager = ({
  artists,
  onReorder,
}: ArtistOrderManagerProps) => {
  const [orderedArtists, setOrderedArtists] = useState(artists);
  const [autoScroll, setAutoScroll] = useState(false);

  // Habilitar el auto-scroll cuando se está arrastrando
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (autoScroll) {
        window.scrollBy({
          top: e.deltaY * 2, // Multiplicador para scroll más rápido
          behavior: "smooth",
        });
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [autoScroll]);

  const updateOrder = async (newOrder: Artist[]) => {
    try {
      const updates = newOrder.map((artist, index) => ({
        id: artist.id,
        display_order: index,
        nickname: artist.nickname,
        normalized_nickname: artist.normalized_nickname,
      }));

      const { error } = await supabase.from("artists").upsert(updates, {
        onConflict: "id",
      });

      if (error) throw error;
      onReorder();
    } catch (e) {
      console.error("Error al actualizar el orden:", e);
      alert("Error al actualizar el orden");
    }
  };

  const moveArtist = async (fromIndex: number, toIndex: number) => {
    const newOrder = [...orderedArtists];
    const [movedArtist] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedArtist);
    setOrderedArtists(newOrder);
    await updateOrder(newOrder);
  };

  const onDragEnd = async (result: DropResult) => {
    setAutoScroll(false);
    if (!result.destination) return;
    await moveArtist(result.source.index, result.destination.index);
  };

  const onDragStart = () => {
    setAutoScroll(true);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <Droppable droppableId="artists">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="max-h-[70vh] overflow-y-auto space-y-1 p-2 custom-scrollbar"
          >
            {orderedArtists.map((artist, index) => (
              <Draggable key={artist.id} draggableId={artist.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      snapshot.isDragging
                        ? "bg-mantra-gold/20 shadow-lg"
                        : "bg-black/20 hover:bg-black/30"
                    }`}
                  >
                    <div
                      {...provided.dragHandleProps}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate text-sm">
                        {artist.nickname}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => moveArtist(index, index - 1)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:hover:text-gray-400"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveArtist(index, index + 1)}
                        disabled={index === orderedArtists.length - 1}
                        className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:hover:text-gray-400"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
