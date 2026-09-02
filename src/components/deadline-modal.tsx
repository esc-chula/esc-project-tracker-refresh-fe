"use client";

import { Save, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CancelButton } from "@/components/ui/cancel-button";
import { FormInput } from "@/components/ui/form-fields";
import { toDeadlineDateInputValue, type DeadlineFormValues, type ProjectDeadline } from "@/lib/deadline";

export function DeadlineModal({
  deadline,
  onClose,
  onSave,
  open
}: {
  deadline?: ProjectDeadline;
  onClose: () => void;
  onSave: (values: DeadlineFormValues) => Promise<string | undefined>;
  open: boolean;
}) {
  const [title, setTitle] = useState(deadline?.title ?? "");
  const [dueDate, setDueDate] = useState(deadline ? toDeadlineDateInputValue(deadline.dueDate) : "");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !dueDate) {
      setErrorMessage("กรุณากรอกชื่อกำหนดการและวันที่ครบกำหนด");
      return;
    }
    setErrorMessage("");
    startTransition(async () => {
      const error = await onSave({ dueDate, title: title.trim() });
      if (error) {
        setErrorMessage(error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4 py-8" role="presentation">
      <div aria-modal="true" className="w-full max-w-[460px] rounded-[22px] bg-white p-5 shadow-2xl sm:p-6" role="dialog">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-black">จัดการ Deadline</h2>
          <button aria-label="ปิด" className="rounded-lg p-1 text-gray-800 hover:bg-gray-100" onClick={onClose} type="button">
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-black">ชื่อกำหนดการ</span>
            <FormInput className="h-11 rounded-xl px-4 text-sm" onChange={(event) => setTitle(event.target.value)} placeholder="กรอกชื่อกำหนดการ" value={title} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-black">วันที่ครบกำหนด</span>
            <FormInput className="h-11 rounded-xl px-4 text-sm" onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} />
          </label>
          <div className="flex items-center justify-end gap-2 pt-2">
            {errorMessage ? <p className="mr-auto text-sm font-medium text-carmine">{errorMessage}</p> : null}
            <CancelButton className="h-10 rounded-xl px-4 text-sm" onClick={onClose} />
            <Button className="h-10 rounded-xl px-4 text-sm" disabled={isPending} type="submit" variant="appRed">
              <Save className="h-4 w-4" strokeWidth={2.4} />
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
