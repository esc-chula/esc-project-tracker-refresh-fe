"use client";

import { Check } from "lucide-react";
import { useEffect } from "react";

type ActionSuccessPopupProps = {
  message: string;
  onClose: () => void;
  open: boolean;
  variant?: "success" | "error";
};

export function ActionSuccessPopup({ message, onClose, open, variant = "success" }: ActionSuccessPopupProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const timeoutId = window.setTimeout(onClose, 1600);
    return () => window.clearTimeout(timeoutId);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const iconClassName = variant === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white";

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[120]">
      <div className="pointer-events-auto flex min-w-[240px] max-w-[300px] items-center gap-3 rounded-2xl border border-black bg-white px-4 py-3 shadow-xl">
        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
          <Check className="h-4 w-4" strokeWidth={3.25} />
        </div>
        <div className="text-sm font-medium text-black">{message}</div>
      </div>
    </div>
  );
}
