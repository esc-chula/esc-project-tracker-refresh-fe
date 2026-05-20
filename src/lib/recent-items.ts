export type RecentItem = {
  kind: "project" | "document";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  viewedAt: number;
};

const RECENT_ITEMS_STORAGE_KEY = "esc-project-tracker:recent-items";
const RECENT_ITEMS_LIMIT = 5;

export function getRecentItems(): RecentItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(RECENT_ITEMS_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as RecentItem[];
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter((item) => item && item.id && item.title && item.href && item.viewedAt)
      .sort((left, right) => right.viewedAt - left.viewedAt)
      .slice(0, RECENT_ITEMS_LIMIT);
  } catch {
    return [];
  }
}

export function saveRecentItem(nextItem: Omit<RecentItem, "viewedAt">) {
  if (typeof window === "undefined") {
    return;
  }

  const recentItems = getRecentItems();
  const dedupedItems = recentItems.filter(
    (item) => !(item.kind === nextItem.kind && item.id === nextItem.id && item.href === nextItem.href)
  );

  const updatedItems: RecentItem[] = [{ ...nextItem, viewedAt: Date.now() }, ...dedupedItems].slice(
    0,
    RECENT_ITEMS_LIMIT
  );

  window.localStorage.setItem(RECENT_ITEMS_STORAGE_KEY, JSON.stringify(updatedItems));
}
