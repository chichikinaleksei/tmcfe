import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useState, useEffect, useRef } from "react";
import { ScrollArea, Stack, Loader } from "@mantine/core";

import { SortableItem } from "./SortableItem";
import { selectionChanged } from "../events";

type Item = { id: number };
const API_URL = import.meta.env.VITE_API_URL;

export function RightList() {
  const [items, setItems] = useState<Item[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const limit = 20;
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const hasMore = total === null || items.length < total;

  const sensors = useSensors(useSensor(PointerSensor));

  async function fetchPage(targetOffset: number) {
    setLoading(true);

    const params = new URLSearchParams({
      offset: String(targetOffset),
      limit: String(limit),
    });

    const resp = await fetch(`${API_URL}/selected?` + params);
    const data = await resp.json();
    const newItems = data.items as Item[];

    setItems((prev) => {
      const merged =
        targetOffset === 0 ? newItems : [...prev, ...newItems];

      const map = new Map<number, Item>();
      merged.forEach((it) => map.set(it.id, it));
      return Array.from(map.values());
    });

    setTotal(data.total);
    setLoading(false);
  }

  useEffect(() => {
    fetchPage(0);
  }, []);

  useEffect(() => {
    const target = loaderRef.current;
    if (!target) return;

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        const next = offset + limit;
        setOffset(next);
        fetchPage(next);
      }
    });

    obs.observe(target);
    return () => obs.disconnect();
  }, [loading, hasMore, offset]);

  useEffect(() => {
    const unsub = selectionChanged.subscribe(() => {
      setItems([]);
      setOffset(0);
      setTotal(null);
      fetchPage(0);
    });

    return unsub;
  }, []);

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((x) => x.id === active.id);
    const newIndex = items.findIndex((x) => x.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    const newOrder = newItems.map((x) => x.id);

    await fetch(`${API_URL}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newOrder }),
    });

  }

  return (
    <Stack gap="xs" style={{ height: "100%" }}>
      <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 15 }}>
        Loaded {items.length} of {total ?? 0}
      </div>

      <ScrollArea style={{ height: "75vh", position: "relative" }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((x) => x.id)}
            strategy={verticalListSortingStrategy}
          >
            <Stack gap="xs" style={{ paddingBottom: 50 }}>
              {items.map((it) => (
                <SortableItem key={it.id} id={it.id} />
              ))}

              {hasMore && (
                <div
                  ref={loaderRef}
                  style={{ padding: 16, textAlign: "center" }}
                >
                  <Loader size="sm" />
                </div>
              )}
            </Stack>
          </SortableContext>
        </DndContext>
      </ScrollArea>
    </Stack>
  );
}
