import type { CartItemData, SearchResultsViewState } from "@yami/prototypes";

export interface PrototypeSession {
  query: string;
  cart: CartItemData[];
  saved: CartItemData[];
  searches: Record<string, SearchResultsViewState>;
}

export function emptyPrototypeSession(): PrototypeSession {
  return { query: "", cart: [], saved: [], searches: {} };
}

export function prototypeSessionKey(project: string, variant: string) {
  return `yami-prototype:session:v1:${project}:${variant}`;
}

export function readPrototypeSession(storage: Pick<Storage, "getItem">, key: string): PrototypeSession {
  try {
    const value = JSON.parse(storage.getItem(key) ?? "null");
    if (value && typeof value.query === "string" && Array.isArray(value.cart) && Array.isArray(value.saved) && value.searches && typeof value.searches === "object") return value;
  } catch { /* Unavailable storage or an older session starts a fresh demonstration. */ }
  return emptyPrototypeSession();
}

export function addPrototypeItem(items: CartItemData[], item: CartItemData) {
  const existing = items.find((entry) => entry.id === item.id);
  return existing
    ? items.map((entry) => entry.id === item.id ? { ...entry, quantity: Math.min(entry.maxQuantity, entry.quantity + item.quantity) } : entry)
    : [...items, item];
}
