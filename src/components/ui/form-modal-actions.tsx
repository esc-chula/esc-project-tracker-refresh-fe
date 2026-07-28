"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CancelButton } from "@/components/ui/cancel-button";

type FormModalActionsProps = {
  errorClassName?: string;
  errorMessage?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  showCancel?: boolean;
  submitDisabled?: boolean;
  submitIcon?: ReactNode;
  submitLabel: string;
  submittingLabel?: string;
};

export function FormModalActions({
  errorClassName = "text-carmine",
  errorMessage,
  isSubmitting = false,
  onCancel,
  showCancel = true,
  submitDisabled = false,
  submitIcon,
  submitLabel,
  submittingLabel
}: FormModalActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      {errorMessage ? <div className={`mr-auto text-base font-medium ${errorClassName}`}>{errorMessage}</div> : null}
      {showCancel ? <CancelButton onClick={onCancel} /> : null}
      <Button disabled={submitDisabled} type="submit" variant="appRed">
        {isSubmitting ? submittingLabel ?? submitLabel : (
          <>
            {submitIcon}
            {submitLabel}
          </>
        )}
      </Button>
    </div>
  );
}
