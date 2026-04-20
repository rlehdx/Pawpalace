"use client";

import { useCallback, useEffect, useState } from "react";

export const WISHLIST_STORAGE_KEY = "paw-palace-wishlist";

function loadIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

function saveIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore quota / private mode
  }
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>(() => loadIds());

  useEffect(() => {
    saveIds(ids);
  }, [ids]);

  const toggle = useCallback((productId: string) => {
    setIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const has = useCallback((productId: string) => ids.includes(productId), [ids]);

  return { ids, toggle, remove, clear, has, count: ids.length };
}
