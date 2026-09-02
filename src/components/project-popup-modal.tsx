"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import { updateProjectBudget } from "@/lib/api";
import { FormModalShell } from "@/components/ui/form-modal-shell";
import { FormInput } from "@/components/ui/form-fields";
import { FormModalActions } from "@/components/ui/form-modal-actions";

type ProjectPopupModalProps = {
  apiBaseURL: string;
  onBudgetUpdated?: () => void;
  onClose: () => void;
  open: boolean;
  projectId: string;
  projectName: string;
};

function sanitizeBudgetInput(value: string) {
  const sanitizedValue = value.replace(/[^\d.]/g, "");
  const [wholeNumber = "", decimal = ""] = sanitizedValue.split(".");
  const decimalValue = decimal.slice(0, 2);

  if (!sanitizedValue.includes(".")) {
    return wholeNumber;
  }

  return `${wholeNumber}.${decimalValue}`;
}

function parseBudgetValue(value: string) {
  return Number(value) || 0;
}

function toSatang(value: string) {
  return Math.round(parseBudgetValue(value) * 100);
}

function formatBudget(value: number) {
  return value.toLocaleString("th-TH", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
}

export function ProjectPopupModal({
  apiBaseURL,
  onBudgetUpdated,
  onClose,
  open,
  projectId,
  projectName
}: ProjectPopupModalProps) {
  if (!open) {
    return null;
  }

  return (
    <FormModalShell onClose={onClose} subtitle={projectName} title="แก้ไขงบประมาณ">
      <div className="flex flex-col">
        <BudgetInput
          apiBaseURL={apiBaseURL}
          onBudgetUpdated={onBudgetUpdated}
          onCancel={onClose}
          projectId={projectId}
        />
      </div>
    </FormModalShell>
  );
}

function BudgetInput({
  apiBaseURL,
  onBudgetUpdated,
  onCancel,
  projectId
}: {
  apiBaseURL: string;
  onBudgetUpdated?: () => void;
  onCancel: () => void;
  projectId: string;
}) {
  const [activityBudget, setActivityBudget] = useState("");
  const [sponsorBudget, setSponsorBudget] = useState("");
  const [otherBudget, setOtherBudget] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalBudget =
    parseBudgetValue(activityBudget) +
    parseBudgetValue(sponsorBudget) +
    parseBudgetValue(otherBudget);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await updateProjectBudget({
        apiBaseURL,
        projectId,
        escSatang: toSatang(activityBudget),
        sponsorSatang: toSatang(sponsorBudget),
        otherSatang: toSatang(otherBudget)
      });

      if (result.error) {
        setErrorMessage(result.error);
        return;
      }

      onBudgetUpdated?.();
      onCancel();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-[16px] font-normal text-black">งบกิจการนิสิต</span>
        <FormInput
          disabled={isSubmitting}
          inputMode="decimal"
          onChange={(event) => setActivityBudget(sanitizeBudgetInput(event.target.value))}
          placeholder="กรอกจำนวนเงิน"
          type="text"
          value={activityBudget}
        />
      </label>
      <label className="block space-y-2">
        <span className="text-[16px] font-normal text-black">งบสปอนเซอร์</span>
        <FormInput
          disabled={isSubmitting}
          inputMode="decimal"
          onChange={(event) => setSponsorBudget(sanitizeBudgetInput(event.target.value))}
          placeholder="กรอกจำนวนเงิน"
          type="text"
          value={sponsorBudget}
        />
      </label>
      <label className="block space-y-2">
        <span className="text-[16px] font-normal text-black">งบอื่นๆ</span>
        <FormInput
          disabled={isSubmitting}
          inputMode="decimal"
          onChange={(event) => setOtherBudget(sanitizeBudgetInput(event.target.value))}
          placeholder="กรอกจำนวนเงิน"
          type="text"
          value={otherBudget}
        />
      </label>
      <div className="mt-4 flex items-center justify-between font-semibold">
        <span className="text-[16px] text-red-700">ยอดรวมทั้งหมด</span>
        <span className="text-[20px] text-red-700">฿ {formatBudget(totalBudget)}</span>
      </div>
      <FormModalActions
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        submitDisabled={isSubmitting}
        submitIcon={<Image alt="" height={20} src="/icons/save-as.svg" width={20} />}
        submitLabel="บันทึกงบประมาณ"
        submittingLabel="กำลังบันทึก..."
      />
    </form>
  );
}
