"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CancelButton } from "@/components/ui/cancel-button";
import { FormModalShell } from "@/components/ui/form-modal-shell";

export function ConfirmDeleteModal({
  description,
  errorMessage,
  onClose,
  onConfirm,
  open,
  title
}: {
  description: string;
  errorMessage?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  open: boolean;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return null;
  }

  return (
    <FormModalShell onClose={onClose} title={title}>
      <div className="space-y-6">
        <p className="text-base text-gray-600">{description}</p>
        <div className="flex items-center justify-end gap-3">
          {errorMessage ? <div className="mr-auto text-base font-medium text-carmine">{errorMessage}</div> : null}
          <CancelButton onClick={onClose} />
          <Button
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await onConfirm();
              });
            }}
            type="button"
            variant="appRed"
          >
            {isPending ? "กำลังลบ..." : "ยืนยัน"}
          </Button>
        </div>
      </div>
    </FormModalShell>
  );
}
