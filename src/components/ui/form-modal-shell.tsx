import { X } from "lucide-react";

export function FormModalShell({
  title,
  onClose,
  children
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        aria-modal="true"
        className="w-full max-w-[640px] rounded-[28px] bg-white p-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <h2 className="text-3xl font-medium text-black">{title}</h2>
          <button
            aria-label="ปิด"
            className="rounded-full p-1 text-black transition hover:bg-gray-100"
            onClick={onClose}
            type="button"
          >
            <X className="h-8 w-8" strokeWidth={2.2} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
