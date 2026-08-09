"use client";

import type { FormEvent } from "react";
import { Paperclip } from "lucide-react";
import { useMemo, useState } from "react";
import { performDocumentWorkflowAction, type DocumentWorkflowAction, type Filing } from "@/lib/api";
import { FilePreviewChip } from "@/components/ui/file-preview-chip";
import { FormSelect, FormTextarea } from "@/components/ui/form-fields";
import { FormModalActions } from "@/components/ui/form-modal-actions";
import { FormModalShell } from "@/components/ui/form-modal-shell";

const actionLabels: Record<DocumentWorkflowAction, string> = {
  submitted: "ส่งเอกสาร",
  returned: "ตีกลับ",
  signed: "กวศ. ลงลายเซ็น",
  forwarded: "ส่งให้กิจการนิสิตแล้ว",
  approved: "อนุมัติ",
  cancelled: "ยกเลิกเอกสาร"
};

const successMessages: Record<DocumentWorkflowAction, string> = {
  submitted: "ส่งเอกสารสำเร็จแล้ว",
  returned: "ตีกลับเอกสารสำเร็จแล้ว",
  signed: "บันทึกการลงลายเซ็นสำเร็จแล้ว",
  forwarded: "ส่งเอกสารให้กิจการนิสิตสำเร็จแล้ว",
  approved: "อนุมัติเอกสารสำเร็จแล้ว",
  cancelled: "ยกเลิกเอกสารสำเร็จแล้ว"
};

// These actions are procedural workflow steps and do not require a note,
// unlike submit/return/approve which carry meaningful context for the
// filing history.
const actionsWithOptionalMessage = new Set<DocumentWorkflowAction>(["signed", "forwarded", "cancelled"]);

const maxFileSizeBytes = 5 * 1024 * 1024;

type FilingComposerModalProps = {
  apiBaseURL: string;
  documentId: string;
  allowedActions: string[];
  open: boolean;
  onClose: () => void;
  onCreated: (filing: Filing) => void | Promise<void>;
  onSuccess: (message: string) => void;
};

function isWorkflowAction(value: string): value is DocumentWorkflowAction {
  return value in actionLabels;
}

export function FilingComposerModal({
  apiBaseURL,
  documentId,
  allowedActions,
  open,
  onClose,
  onCreated,
  onSuccess
}: FilingComposerModalProps) {
  const actionOptions = useMemo(
    () =>
      allowedActions
        .filter(isWorkflowAction)
        .map((value) => ({ value, label: actionLabels[value] })),
    [allowedActions]
  );
  const fallbackAction = actionOptions[0]?.value;
  const [action, setAction] = useState<DocumentWorkflowAction | undefined>(fallbackAction);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAction = action && actionOptions.some((option) => option.value === action) ? action : fallbackAction;
  const totalSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);
  const messageOptional = selectedAction ? actionsWithOptionalMessage.has(selectedAction) : false;
  const canSubmit = Boolean(selectedAction) && (messageOptional || message.trim().length > 0 || files.length > 0);

  if (!open || !selectedAction) {
    return null;
  }

  function resetAndClose() {
    setAction(fallbackAction);
    setMessage("");
    setFiles([]);
    setErrorMessage("");
    setIsSubmitting(false);
    onClose();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files ?? []);
    const mergedFiles = [...files, ...nextFiles].filter(
      (file, index, currentFiles) => currentFiles.findIndex((item) => item.name === file.name && item.size === file.size) === index
    );
    const nextTotalSize = mergedFiles.reduce((sum, file) => sum + file.size, 0);

    if (nextTotalSize > maxFileSizeBytes) {
      setErrorMessage("ไฟล์รวมกันต้องไม่เกิน 5 MB");
      event.target.value = "";
      return;
    }

    setErrorMessage("");
    setFiles(mergedFiles);
    event.target.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || isSubmitting || !selectedAction) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const result = await performDocumentWorkflowAction({
        apiBaseURL,
        documentId,
        action: selectedAction,
        message,
        files
      });

      if (result.error || !result.filing) {
        setErrorMessage(result.error || "ไม่สามารถดำเนินการได้");
        return;
      }

      await onCreated(result.filing);
      onSuccess(successMessages[selectedAction]);
      resetAndClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormModalShell onClose={resetAndClose} title="อัปโหลดไฟล์">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {actionOptions.length > 1 ? (
          <label className="block space-y-2">
            <span className="text-m font-medium text-black">
              ประเภท <span className="text-red-600">*</span>
            </span>
            <FormSelect
              onValueChange={(nextValue) => setAction(nextValue as DocumentWorkflowAction)}
              options={actionOptions}
              placeholder="เลือกประเภท"
              value={selectedAction}
            />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-m font-medium text-black">อัปโหลดไฟล์</span>
          <div className="rounded-[20px] border border-dashed border-gray-300 bg-gray-50 px-5 py-4">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 py-2 text-base font-medium text-black ring-1 ring-gray-300 hover:bg-gray-50">
              <Paperclip className="h-5 w-5" />
              เลือกไฟล์
              <input className="hidden" multiple onChange={handleFileChange} type="file" />
            </label>

            <div className="mt-3 space-y-3 text-sm text-gray-500">
              <div>รวมกันไม่เกิน 5 MB</div>

              {files.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {files.map((file) => (
                    <FilePreviewChip
                      fileName={file.name}
                      key={`${file.name}-${file.size}`}
                      onDelete={() => {
                        setFiles((currentFiles) =>
                          currentFiles.filter((currentFile) => !(currentFile.name === file.name && currentFile.size === file.size))
                        );
                      }}
                    />
                  ))}
                </div>
              ) : null}

              <div>{(totalSize / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-m font-medium text-black">ข้อความ</span>
          <FormTextarea onChange={(event) => setMessage(event.target.value)} placeholder="กรอกข้อความเพิ่มเติม" value={message} />
        </label>

        <FormModalActions
          errorClassName="text-red-700"
          errorMessage={errorMessage}
          isSubmitting={isSubmitting}
          onCancel={resetAndClose}
          submitDisabled={!canSubmit || isSubmitting}
          submitLabel="ยืนยัน"
        />
      </form>
    </FormModalShell>
  );
}
