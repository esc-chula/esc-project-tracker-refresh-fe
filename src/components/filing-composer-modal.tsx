"use client";

import type { FormEvent } from "react";
import { Paperclip } from "lucide-react";
import { useMemo, useState } from "react";
import { createFiling, type Filing } from "@/lib/api";
import { approveSubmittedFiling, returnSubmittedFiling } from "@/lib/filing-review";
import { FilePreviewChip } from "@/components/ui/file-preview-chip";
import { FormSelect, FormTextarea } from "@/components/ui/form-fields";
import { FormModalActions } from "@/components/ui/form-modal-actions";
import { FormModalShell } from "@/components/ui/form-modal-shell";

type FilingComposerAction = "submitted" | "returned" | "approved";
const manualActionFilingId = "append-only-action";

type FilingComposerModalProps = {
  apiBaseURL: string;
  documentId: string;
  documentStatus: string;
  latestFilingId?: string;
  open: boolean;
  onClose: () => void;
  onCreated: (filing: Filing) => void | Promise<void>;
  onSuccess: (message: string) => void;
  projectId: string;
  role: string;
};

const adminActionOptions = [
  { label: "อนุมัติ", value: "approved" },
  { label: "ตีกลับ", value: "returned" },
  { label: "ส่งเอกสาร", value: "submitted" }
] as const;

const maxFileSizeBytes = 5 * 1024 * 1024;

function getAvailableAdminActions() {
  return adminActionOptions;
}

function getFallbackAction(options: readonly { label: string; value: FilingComposerAction }[], isAdmin: boolean): FilingComposerAction {
  if (!isAdmin) {
    return "submitted";
  }

  return options.find((option) => option.value === "approved")?.value ?? options[0]?.value ?? "submitted";
}

function getSuccessMessage(action: FilingComposerAction) {
  if (action === "returned") return "ตีกลับเอกสารสำเร็จแล้ว";
  if (action === "approved") return "อนุมัติเอกสารสำเร็จแล้ว";
  return "อัปโหลดไฟล์สำเร็จแล้ว";
}

export function FilingComposerModal({
  apiBaseURL,
  documentId,
  documentStatus: _documentStatus,
  latestFilingId,
  open,
  onClose,
  onCreated,
  onSuccess,
  projectId: _projectId,
  role
}: FilingComposerModalProps) {
  const isAdmin = role === "admin";
  const availableAdminActions = useMemo(() => getAvailableAdminActions(), []);
  const fallbackAction = getFallbackAction(availableAdminActions, isAdmin);
  const [action, setAction] = useState<FilingComposerAction>(fallbackAction);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAction = isAdmin && availableAdminActions.some((option) => option.value === action) ? action : fallbackAction;
  const totalSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);
  const canSubmit = message.trim().length > 0 || files.length > 0;

  if (!open) {
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
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let result: { filing?: Filing; error?: string };

      if (isAdmin) {
        if (selectedAction === "returned") {
          result = await returnSubmittedFiling({
            apiBaseURL,
            documentId,
            filingId: latestFilingId || manualActionFilingId,
            returnMessage: message,
            files
          });
        } else if (selectedAction === "approved") {
          result = await approveSubmittedFiling({
            apiBaseURL,
            documentId,
            filingId: latestFilingId || manualActionFilingId,
            approveMessage: message,
            files
          });
        } else {
          result = await createFiling({
            apiBaseURL,
            documentId,
            message,
            files
          });
        }
      } else {
        result = await createFiling({
          apiBaseURL,
          documentId,
          message,
          files
        });
      }

      if (result.error || !result.filing) {
        setErrorMessage(result.error || "ไม่สามารถดำเนินการได้");
        return;
      }

      await onCreated(result.filing);
      onSuccess(getSuccessMessage(selectedAction));
      resetAndClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormModalShell onClose={resetAndClose} title="อัปโหลดไฟล์">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {isAdmin ? (
          <label className="block space-y-2">
            <span className="text-m font-medium text-black">
              ประเภท <span className="text-red-600">*</span>
            </span>
            <FormSelect
              onValueChange={(nextValue) => setAction(nextValue as FilingComposerAction)}
              options={availableAdminActions}
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
