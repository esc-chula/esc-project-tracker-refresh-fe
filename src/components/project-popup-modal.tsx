"use client";

import { useState } from "react";
import Image from "next/image";
import { FormModalShell } from "@/components/ui/form-modal-shell";
import { FormInput } from "@/components/ui/form-fields";
import { FormModalActions } from "@/components/ui/form-modal-actions";

type ProjectPopupModalProps = {
  onClose: () => void;
  open: boolean;
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

function formatBudget(value: number) {
  return value.toLocaleString("th-TH", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
}

export function ProjectPopupModal({ onClose, open, projectName }: ProjectPopupModalProps) {
  if (!open) {
    return null;
  }

  return (
    <FormModalShell onClose={onClose} subtitle={projectName} title="แก้ไขงบประมาณ">
      <div className="flex flex-col">
        <BudgetInput onCancel={onClose} />
      </div>
    </FormModalShell>
  );
}

function BudgetInput({ onCancel }: { onCancel: () => void }) {
  const [activityBudget, setActivityBudget] = useState("");
  const [sponsorBudget, setSponsorBudget] = useState("");
  const [otherBudget, setOtherBudget] = useState("");
  const totalBudget =
    parseBudgetValue(activityBudget) +
    parseBudgetValue(sponsorBudget) +
    parseBudgetValue(otherBudget);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <label className="block space-y-2">
        <span className="text-[16px] font-normal text-black">งบกิจการนิสิต</span>
        <FormInput
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
        onCancel={onCancel}
        submitIcon={<Image alt="" height={20} src="/icons/save-as.svg" width={20} />}
        submitLabel="บันทึกงบประมาณ"
      />
    </form>
  );
}
