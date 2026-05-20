"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export function ViewToggle({
  value,
  onChange
}: {
  value: "table" | "card";
  onChange: (value: "table" | "card") => void;
}) {
  return (
    <div className="inline-flex h-10 overflow-hidden rounded-[18px] border border-gray-400 bg-white">
      <button
        className={cn(
          "flex h-full w-14 items-center justify-center transition-colors",
          value === "card" ? "bg-gray-100 text-black" : "bg-white text-gray-500 hover:bg-gray-50"
        )}
        onClick={() => onChange("card")}
        type="button"
      >
        <LayoutGrid className="h-5 w-5" strokeWidth={2.2} />
      </button>
      <button
        className={cn(
          "flex h-full w-14 items-center justify-center border-l border-gray-400 transition-colors",
          value === "table" ? "bg-gray-100 text-black" : "bg-white text-gray-500 hover:bg-gray-50"
        )}
        onClick={() => onChange("table")}
        type="button"
      >
        <List className="h-5 w-5" strokeWidth={2.2} />
      </button>
    </div>
  );
}
