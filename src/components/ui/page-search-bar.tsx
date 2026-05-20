"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock3, FileText, FolderOpen, Search } from "lucide-react";
import type { RecentItem } from "@/lib/recent-items";
import { cn } from "@/lib/utils";

export type SearchScope = "all" | "projects" | "documents" | "project-documents";

function matchesScope(item: RecentItem, scope: SearchScope) {
  if (scope === "all") {
    return true;
  }

  if (scope === "projects") {
    return item.kind === "project";
  }

  return item.kind === "document";
}

function matchesQuery(item: RecentItem, query: string) {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.toLowerCase();
  return [item.title, item.subtitle, item.href].join(" ").toLowerCase().includes(normalizedQuery);
}

export function PageSearchBar({
  value,
  onChange,
  placeholder,
  readOnly = false,
  searchScope,
  className,
  recentItems = [],
  emptyRecentText = "ยังไม่มีรายการล่าสุด"
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder: string;
  readOnly?: boolean;
  searchScope: SearchScope;
  className?: string;
  recentItems?: RecentItem[];
  emptyRecentText?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const query = (value ?? "").trim().toLowerCase();
  const shouldShowRecentDropdown = isFocused && !readOnly;
  const showRecentHeading = query.length === 0;

  const visibleRecentItems = useMemo(
    () => recentItems.filter((item) => matchesScope(item, searchScope) && matchesQuery(item, query)),
    [query, recentItems, searchScope]
  );

  return (
    <div className={cn("relative", className)} data-search-scope={searchScope}>
      <label className="relative block">
        <Search
          className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-black"
          strokeWidth={2.2}
        />
        <input
          className="h-[48px] w-full rounded-full border-0 bg-gray-100 pl-16 pr-5 text-base text-black outline-none transition placeholder:text-gray-500 focus-visible:ring-0"
          onBlur={() => {
            window.setTimeout(() => setIsFocused(false), 120);
          }}
          onChange={(event) => onChange?.(event.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          readOnly={readOnly}
          value={value ?? ""}
        />
      </label>

      {shouldShowRecentDropdown ? (
        <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-30 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
          {showRecentHeading ? (
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 text-sm font-medium text-gray-500">
              <Clock3 className="h-4 w-4" />
              รายการล่าสุด
            </div>
          ) : null}

          {visibleRecentItems.length > 0 ? (
            <div className="py-2">
              {visibleRecentItems.map((item) => (
                <Link
                  className="flex items-center gap-3 px-5 py-3 transition hover:bg-gray-50"
                  href={item.href}
                  key={`${item.kind}:${item.id}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                    {item.kind === "project" ? (
                      <FolderOpen className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-black">{item.title}</span>
                    <span className="block truncate text-xs text-gray-500">{item.subtitle || "เปิดล่าสุด"}</span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-6 text-sm text-gray-500">
              {showRecentHeading ? emptyRecentText : "ไม่พบรายการที่ตรงกัน"}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
