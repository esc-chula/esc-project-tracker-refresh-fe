"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";
export type SortOption<T extends string> = {
  value: T;
  label: string;
};

const directionOptions = [
  { value: "asc" as const, label: "น้อยไปมาก" },
  { value: "desc" as const, label: "มากไปน้อย" }
];

function getSortLabel<T extends string>(sortBy: T, options: readonly SortOption<T>[]) {
  return options.find((option) => option.value === sortBy)?.label ?? options[0]?.label ?? "";
}

export function SortControls<T extends string>({
  options,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange
}: {
  options: readonly SortOption<T>[];
  sortBy: T;
  sortDirection: SortDirection;
  onSortByChange: (value: T) => void;
  onSortDirectionChange: (value: SortDirection) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const triggerLabel = useMemo(() => getSortLabel(sortBy, options), [options, sortBy]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="inline-flex h-10 items-center gap-2 rounded-full bg-gray-100 px-5 text-base font-normal text-black transition hover:bg-gray-200"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        type="button"
      >
        <span>{triggerLabel}</span>
        <ArrowDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} strokeWidth={2.2} />
      </button>

      {open ? (
        <Card className="absolute left-0 top-[calc(100%+10px)] z-30 w-[270px] rounded-2xl border-gray-200 bg-white shadow-lg">
          <CardContent className="p-0">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="text-xs font-medium tracking-wide text-gray-500">เรียงตาม</div>
            </div>
            <div className="py-1">
              {options.map((option) => (
                <button
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-black transition hover:bg-gray-100",
                    sortBy === option.value && "bg-gray-100"
                  )}
                  key={option.value}
                  onClick={() => {
                    onSortByChange(option.value);
                    setOpen(false);
                  }}
                  type="button"
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    {sortBy === option.value ? <Check className="h-4 w-4" strokeWidth={2.4} /> : null}
                  </span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>

            <div className="border-y border-gray-200 px-4 py-3">
              <div className="text-xs font-medium tracking-wide text-gray-500">ลำดับการเรียง</div>
            </div>
            <div className="py-1">
              {directionOptions.map((option) => (
                <button
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-black transition hover:bg-gray-100",
                    sortDirection === option.value && "bg-gray-100"
                  )}
                  key={option.value}
                  onClick={() => {
                    onSortDirectionChange(option.value);
                    setOpen(false);
                  }}
                  type="button"
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    {sortDirection === option.value ? <Check className="h-4 w-4" strokeWidth={2.4} /> : null}
                  </span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
