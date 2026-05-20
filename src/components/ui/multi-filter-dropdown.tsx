"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type FilterOption = {
  value: string;
  label: string;
};

type DropdownPosition = {
  left: number;
  top: number;
  maxHeight: number;
};

function getTriggerLabel(
  placeholder: string,
  options: readonly FilterOption[],
  selectedValues: string[]
) {
  if (selectedValues.length === 0) {
    return placeholder;
  }

  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);

  if (selectedLabels.length === 0) {
    return placeholder;
  }

  if (selectedLabels.length === 1) {
    return selectedLabels[0];
  }

  return `${selectedLabels[0]} +${selectedLabels.length - 1}`;
}

export function MultiFilterDropdown({
  placeholder,
  options,
  selectedValues,
  onChange,
  className,
  popupClassName
}: {
  placeholder: string;
  options: readonly FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  className?: string;
  popupClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<DropdownPosition | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInsideTrigger = containerRef.current?.contains(target);
      const clickedInsidePopup = popupRef.current?.contains(target);

      if (!clickedInsideTrigger && !clickedInsidePopup) {
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

  useEffect(() => {
    if (!open || !containerRef.current) {
      return;
    }

    function updatePosition() {
      if (!containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom - 20;
      const spaceAbove = rect.top - 20;
      const openUpward = spaceBelow < 240 && spaceAbove > spaceBelow;
      const maxHeight = Math.max(180, Math.min(360, openUpward ? spaceAbove - 12 : spaceBelow - 12));

      setPosition({
        left: rect.left,
        top: openUpward ? Math.max(20, rect.top - maxHeight - 12) : rect.bottom + 12,
        maxHeight
      });
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const triggerLabel = useMemo(
    () => getTriggerLabel(placeholder, options, selectedValues),
    [options, placeholder, selectedValues]
  );

  function toggleValue(value: string) {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((currentValue) => currentValue !== value));
      return;
    }

    onChange([...selectedValues, value]);
  }

  const popup =
    open && position
      ? createPortal(
          <div className="fixed inset-0 z-30 pointer-events-none">
            <Card
              className={cn(
                "pointer-events-auto absolute w-[320px] rounded-2xl border-gray-200 bg-white shadow-lg",
                popupClassName
              )}
              ref={popupRef}
              style={{
                left: position.left,
                top: position.top
              }}
            >
              <CardContent className="overflow-y-auto p-3" style={{ maxHeight: position.maxHeight }}>
                <div className="space-y-1">
                  {options.map((option) => {
                    const checked = selectedValues.includes(option.value);

                    return (
                      <label
                        className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-3 text-sm text-black transition hover:bg-gray-50"
                        key={option.value}
                      >
                        <input
                          checked={checked}
                          className="peer sr-only"
                          onChange={() => toggleValue(option.value)}
                          type="checkbox"
                        />
                        <span
                          aria-hidden="true"
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border border-gray-400 bg-white text-white transition-colors peer-checked:border-black peer-checked:bg-black"
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                        <span className="min-w-0 flex-1 leading-5">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className={cn("relative", className)} ref={containerRef}>
        <Button
          className="h-10 min-w-[88px] justify-between rounded-full bg-gray-100 px-5 text-base font-normal text-black hover:bg-gray-200"
          onClick={() => setOpen((currentOpen) => !currentOpen)}
          type="button"
          variant="ghost"
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown className="ml-3 h-4 w-4 shrink-0" />
        </Button>
      </div>

      {popup}
    </>
  );
}
