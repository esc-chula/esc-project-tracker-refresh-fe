"use client";

import Image from "next/image";
import { FormModalShell } from "@/components/ui/form-modal-shell";
import { FormInput } from "@/components/ui/form-fields";
import { FormModalActions } from "@/components/ui/form-modal-actions";

type ProjectPopupModalProps = {
  onClose: () => void;
  open: boolean;
  projectName: string;
};

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
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <label className="block space-y-2">
        <span className="text-[16px] font-normal text-black">งบกิจการนิสิต</span>
        <FormInput placeholder="กรอกจำนวนเงิน" type="text" />
      </label>
      <label className="block space-y-2">
        <span className="text-[16px] font-normal text-black">งบสปอนเซอร์</span>
        <FormInput placeholder="กรอกจำนวนเงิน" type="text" />
      </label>
      <label className="block space-y-2">
        <span className="text-[16px] font-normal text-black">งบอื่นๆ</span>
        <FormInput placeholder="กรอกจำนวนเงิน" type="text" />
      </label>
      <div className="mt-4 flex items-center justify-between font-semibold">
        <span className="text-[16px] text-red-700">ยอดรวมทั้งหมด</span>
        <span className="text-[20px] text-red-700">฿ xx</span>
      </div>
      <FormModalActions
        onCancel={onCancel}
        submitIcon={<Image alt="" height={20} src="/icons/save-as.svg" width={20} />}
        submitLabel="บันทึกงบประมาณ"
      />
    </form>
  );
}
