"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const frameClassName =
  "rounded-[20px] border border-transparent p-[2px] transition-colors duration-150 focus-within:border-carmine";
const inputClassName =
  "h-[52px] rounded-[18px] border border-gray-300 px-5 text-base text-black placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";
const textareaClassName =
  "min-h-[180px] rounded-[18px] border border-gray-300 px-5 py-4 text-base text-black placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";
const selectButtonClassName =
  "flex h-[52px] w-full items-center justify-between rounded-[18px] border border-gray-300 bg-white px-5 text-left text-base text-black outline-none";

export function FormFieldFrame({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(frameClassName, className)}>{children}</div>;
}

type FieldErrorProps = {
  error?: string;
};

export const FormInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input> & FieldErrorProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <>
        <FormFieldFrame className={error ? "border-red-700" : undefined}>
          <Input ref={ref} className={cn(inputClassName, className)} {...props} />
        </FormFieldFrame>
        {error ? <p className="mt-1 text-sm font-medium text-red-700">{error}</p> : null}
      </>
    );
  }
);

FormInput.displayName = "FormInput";

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<typeof Textarea>>(
  ({ className, ...props }, ref) => {
    return (
      <FormFieldFrame>
        <Textarea ref={ref} className={cn(textareaClassName, className)} {...props} />
      </FormFieldFrame>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

export type FormSelectOption = {
  label: string;
  value: string;
};

type FormSelectProps = {
  className?: string;
  disabled?: boolean;
  error?: string;
  onValueChange: (value: string) => void;
  options: readonly FormSelectOption[];
  placeholder: string;
  searchPlaceholder?: string;
  value: string;
};

export function FormSelect({
  className,
  disabled,
  error,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  value
}: FormSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [popupStyle, setPopupStyle] = React.useState<React.CSSProperties | null>(null);
  const selectedOption = options.find((option) => option.value === value);
  const canSearch = Boolean(searchPlaceholder);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions =
    canSearch && normalizedQuery ? options.filter((option) => option.label.toLowerCase().includes(normalizedQuery)) : options;

  function closeDropdown() {
    setOpen(false);
    setQuery("");
  }

  React.useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      const clickedInsideTrigger = rootRef.current?.contains(target);
      const clickedInsidePopup = popupRef.current?.contains(target);

      if (!clickedInsideTrigger && !clickedInsidePopup) {
        closeDropdown();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  React.useEffect(() => {
    if (!open || !rootRef.current) {
      return;
    }

    function updatePopupPosition() {
      if (!rootRef.current) {
        return;
      }

      const rect = rootRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom - 20;
      const spaceAbove = rect.top - 20;
      const openUpward = spaceBelow < 240 && spaceAbove > spaceBelow;
      const maxHeight = Math.max(180, Math.min(320, openUpward ? spaceAbove - 12 : spaceBelow - 12));

      setPopupStyle({
        left: rect.left,
        top: openUpward ? Math.max(20, rect.top - maxHeight - 12) : rect.bottom + 12,
        width: rect.width,
        maxHeight
      });
    }

    updatePopupPosition();
    window.addEventListener("resize", updatePopupPosition);
    window.addEventListener("scroll", updatePopupPosition, true);

    return () => {
      window.removeEventListener("resize", updatePopupPosition);
      window.removeEventListener("scroll", updatePopupPosition, true);
    };
  }, [open]);

  const popup =
    open && popupStyle
      ? createPortal(
          <div className="pointer-events-none fixed inset-0 z-[70]">
            <Card
              className="pointer-events-auto absolute rounded-2xl border-gray-200 bg-white shadow-lg"
              ref={popupRef}
              style={popupStyle}
            >
              <CardContent className="overflow-y-auto p-3" style={{ maxHeight: popupStyle.maxHeight }}>
                {canSearch ? (
                  <div className="sticky top-0 z-10 bg-white pb-2">
                    <input
                      autoFocus
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-black outline-none placeholder:text-gray-400 focus:border-gray-300"
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          closeDropdown();
                        }
                      }}
                      placeholder={searchPlaceholder}
                      value={query}
                    />
                  </div>
                ) : null}

                <div className="space-y-1">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <button
                        className={cn(
                          "block w-full rounded-xl px-3 py-3 text-left text-black transition hover:bg-gray-50",
                          option.value === value && "bg-gray-100"
                        )}
                        key={option.value}
                        onClick={() => {
                          onValueChange(option.value);
                          closeDropdown();
                        }}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-base text-gray-400">ไม่พบรายการ</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <FormFieldFrame className={cn("focus-within:border-transparent", error && "border-red-700")}>
        <div className="relative" ref={rootRef}>
          <button
            className={cn(selectButtonClassName, !selectedOption && "text-gray-400", className)}
            disabled={disabled}
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            <span className="truncate">{selectedOption?.label || placeholder}</span>
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-black transition-transform", open && "rotate-180")} />
          </button>
        </div>
      </FormFieldFrame>
      {popup}
      {error ? <p className="mt-1 text-sm font-medium text-red-700">{error}</p> : null}
    </>
  );
}

FormSelect.displayName = "FormSelect";
