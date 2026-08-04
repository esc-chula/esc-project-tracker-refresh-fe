"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PaginationControls({
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSize,
  pageSizeOptions,
  totalItems
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSize: number;
  pageSizeOptions: readonly number[];
  totalItems: number;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsPageSizeOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPageSizeOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="flex flex-col gap-3 pt-1 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-gray-500">ทั้งหมด {totalItems} ผลลัพธ์</div>

      <div className="flex flex-wrap items-center gap-3 md:gap-5">
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous page"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex h-8 min-w-[2rem] items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-black">
            {currentPage}
          </div>

          <button
            aria-label="Next page"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="relative" ref={containerRef}>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 transition hover:border-gray-300"
            onClick={() => setIsPageSizeOpen((currentOpen) => !currentOpen)}
            type="button"
          >
            <span>{pageSize} / Page</span>
            <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isPageSizeOpen && "rotate-180")} />
          </button>

          {isPageSizeOpen ? (
            <Card className="absolute bottom-[calc(100%+8px)] right-0 z-30 min-w-[112px] rounded-xl border-gray-200 bg-white shadow-lg">
              <CardContent className="p-1">
                <div className="space-y-1">
                  {pageSizeOptions.map((option) => {
                    const selected = option === pageSize;

                    return (
                      <button
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-black transition hover:bg-gray-100",
                          selected && "bg-gray-100"
                        )}
                        key={option}
                        onClick={() => {
                          onPageSizeChange(option);
                          setIsPageSizeOpen(false);
                        }}
                        type="button"
                      >
                        <span>{option} / Page</span>
                        <span className="flex h-4 w-4 items-center justify-center">
                          {selected ? <Check className="h-4 w-4" strokeWidth={2.4} /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
