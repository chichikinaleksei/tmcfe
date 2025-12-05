import { useState, useEffect, useRef } from "react";
import { TextInput, ScrollArea, Loader, Stack, Button } from "@mantine/core";
import { selectionChanged } from "../events";

type Item = { id: number };
const API_URL = import.meta.env.VITE_API_URL;

export function LeftList() {
  const [filter, setFilter] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const limit = 20;
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const hasMore = total === null || items.length < total;

  async function fetchPage(targetOffset: number) {
    setLoading(true);

    const params = new URLSearchParams({
      filter,
      offset: String(targetOffset),
      limit: String(limit),
    });

    const resp = await fetch(`${API_URL}/items?` + params.toString());
    const data = await resp.json();

    const newItems = data.items as Item[];
    const newTotal = data.total as number;

    setTotal(newTotal);

    setItems((prev) =>
      targetOffset === 0 ? newItems : [...prev, ...newItems]
    );

    setLoading(false);
  }

  useEffect(() => {
    setItems([]);
    setOffset(0);
    setTotal(null);
    fetchPage(0);
  }, [filter]);

  useEffect(() => {
    if (offset === 0) return;
    fetchPage(offset);
  }, [offset]);

  useEffect(() => {
    const target = loaderRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && !loading && hasMore) {
        setOffset((prev) => prev + limit);
      }
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  async function selectItem(id: number) {
    await fetch(`${API_URL}/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setFilter("");

    setTimeout(() => {
      selectionChanged.emit();
    }, 1100);
  }

  useEffect(() => {
    const unsubscribe = selectionChanged.subscribe(() => {
      setItems([]);
      setOffset(0);
      setTotal(null);
      fetchPage(0);
    });

    return unsubscribe;
  }, []);

  return (
    <Stack gap="sm" style={{ height: "100%" }}>
      <TextInput
        placeholder="Filter by ID..."
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
      />

      <ScrollArea style={{ flex: 1 }}>
        <Stack gap="xs">
          {items.map((it) => (
            <Button
              variant="light"
              key={it.id}
              fullWidth
              onClick={() => selectItem(it.id)}
            >
              Select ID: {it.id}
            </Button>
          ))}

          {hasMore && (
            <div ref={loaderRef} style={{ padding: 20, textAlign: "center" }}>
              <Loader size="sm" />
            </div>
          )}

          {!hasMore && total !== null && (
            <div style={{ padding: 10, textAlign: "center", fontSize: 12 }}>
              Loaded {items.length} of {total}
            </div>
          )}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
