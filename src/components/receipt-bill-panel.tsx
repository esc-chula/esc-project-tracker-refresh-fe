"use client";

import { ChevronDown, ChevronUp, FileText, Trash2, Upload } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ConfirmDeleteModal } from "@/components/confirm-delete-modal";
import {
  deleteDocumentReceipt,
  reorderDocumentReceipts,
  uploadDocumentReceipts,
  type Receipt
} from "@/lib/api";

const maxUploadBytes = 5 * 1024 * 1024;

function normalizeReceiptURL(url: string) {
  const trimmedURL = url.trim();
  if (!trimmedURL || /^https?:\/\//i.test(trimmedURL)) {
    return trimmedURL;
  }
  return `https://${trimmedURL.replace(/^\/+/, "")}`;
}

function normalizePositions(receipts: Receipt[]) {
  return receipts.map((receipt, index) => ({ ...receipt, position: index + 1 }));
}

type ReceiptBillPanelProps = {
  apiBaseURL: string;
  canEdit: boolean;
  documentId: string;
  initialReceipts: Receipt[];
  onSuccess: (message: string) => void;
};

export type ReceiptBillPanelHandle = {
  openFileExplorer: () => void;
};

export const ReceiptBillPanel = forwardRef<ReceiptBillPanelHandle, ReceiptBillPanelProps>(function ReceiptBillPanel(
  { apiBaseURL, canEdit, documentId, initialReceipts, onSuccess },
  ref
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [receipts, setReceipts] = useState(() => [...initialReceipts].sort((left, right) => left.position - right.position));
  const [draggedReceiptId, setDraggedReceiptId] = useState<string | null>(null);
  const [receiptToDelete, setReceiptToDelete] = useState<Receipt | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function openFileExplorer() {
    if (isUploading || !canEdit) {
      return;
    }
    setErrorMessage("");
    fileInputRef.current?.click();
  }

  useImperativeHandle(ref, () => ({ openFileExplorer }), [canEdit, isUploading]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0 || isUploading) {
      return;
    }

    const hasUnsupportedFile = files.some((file) => file.type !== "application/pdf" && !file.type.startsWith("image/"));
    if (hasUnsupportedFile) {
      setErrorMessage("อัปโหลดได้เฉพาะไฟล์รูปภาพหรือ PDF");
      return;
    }

    const totalSize = files.reduce((total, file) => total + file.size, 0);
    if (totalSize > maxUploadBytes) {
      setErrorMessage("ไฟล์รวมกันต้องไม่เกิน 5 MB");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    try {
      const result = await uploadDocumentReceipts({ apiBaseURL, documentId, files });
      if (result.error) {
        setErrorMessage(result.error);
        return;
      }
      setReceipts((currentReceipts) => normalizePositions([...currentReceipts, ...result.receipts]));
      onSuccess("อัปโหลดบิลสำเร็จแล้ว");
    } finally {
      setIsUploading(false);
    }
  }

  async function moveReceipt(draggedId: string, targetId: string) {
    if (draggedId === targetId || isReordering) {
      return;
    }

    const nextReceipts = [...receipts];
    const draggedIndex = nextReceipts.findIndex((receipt) => receipt.id === draggedId);
    const targetIndex = nextReceipts.findIndex((receipt) => receipt.id === targetId);
    if (draggedIndex < 0 || targetIndex < 0) {
      return;
    }

    const [draggedReceipt] = nextReceipts.splice(draggedIndex, 1);
    nextReceipts.splice(targetIndex, 0, draggedReceipt);
    const orderedReceipts = normalizePositions(nextReceipts);

    setIsReordering(true);
    setErrorMessage("");
    try {
      const result = await reorderDocumentReceipts({
        apiBaseURL,
        documentId,
        orderedReceiptIds: orderedReceipts.map((receipt) => receipt.id)
      });
      if (result.error) {
        setErrorMessage(result.error);
        return;
      }
      setReceipts(normalizePositions(result.receipts));
      onSuccess("เรียงลำดับบิลสำเร็จแล้ว");
    } finally {
      setIsReordering(false);
    }
  }

  async function handleDrop(event: DragEvent<HTMLLIElement>, targetReceiptId: string) {
    event.preventDefault();
    const sourceReceiptId = draggedReceiptId ?? event.dataTransfer.getData("text/plain");
    setDraggedReceiptId(null);
    if (sourceReceiptId) {
      await moveReceipt(sourceReceiptId, targetReceiptId);
    }
  }

  async function handleDelete() {
    if (!receiptToDelete || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");
    const result = await deleteDocumentReceipt({
      apiBaseURL,
      documentId,
      receiptId: receiptToDelete.id
    });
    setIsDeleting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    setReceipts((currentReceipts) => normalizePositions(currentReceipts.filter((receipt) => receipt.id !== receiptToDelete.id)));
    setReceiptToDelete(null);
    onSuccess("ลบบิลสำเร็จแล้ว");
  }

  return (
    <section aria-labelledby="receipt-bill-heading" className="mt-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-black" id="receipt-bill-heading">
          บิลที่อัปโหลด
        </h3>
        <input
          accept="image/*,application/pdf"
          className="hidden"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
      </div>

      {receipts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-7 py-6">
          <FileText aria-hidden="true" className="h-7 w-7 text-gray-300" strokeWidth={1.8} />
          <p className="mt-3 text-sm font-semibold text-black">ยังไม่มีบิลที่อัปโหลด</p>
          <p className="mt-1 text-sm text-gray-500">{canEdit ? "กดปุ่มด้านล่างเพื่อเลือกไฟล์" : "ยังไม่มีรายการบิล"}</p>
          {canEdit ? (
            <button
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isUploading}
              onClick={openFileExplorer}
              type="button"
            >
              <Upload className="h-4 w-4" strokeWidth={2.5} />
              {isUploading ? "กำลังอัปโหลด..." : "อัปโหลดบิล"}
            </button>
          ) : null}
        </div>
      ) : (
        <ol className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {receipts.map((receipt, index) => (
            <li
              className={`flex min-h-12 items-center gap-3 border-b border-gray-200 px-4 py-2 last:border-b-0 ${
                canEdit ? "cursor-grab active:cursor-grabbing" : ""
              }`}
              draggable={canEdit && !isReordering}
              key={receipt.id}
              onDragEnd={() => setDraggedReceiptId(null)}
              onDragOver={(event) => {
                if (canEdit) event.preventDefault();
              }}
              onDragStart={(event) => {
                if (!canEdit) return;
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", receipt.id);
                setDraggedReceiptId(receipt.id);
              }}
              onDrop={(event) => void handleDrop(event, receipt.id)}
            >
              <span className="w-5 shrink-0 text-sm text-gray-500">{index + 1}</span>
              <FileText aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-300" strokeWidth={1.8} />
              <a
                className="min-w-0 flex-1 truncate text-sm font-medium text-black underline-offset-2 hover:underline"
                href={normalizeReceiptURL(receipt.url)}
                rel="noreferrer"
                target="_blank"
              >
                {receipt.name}
              </a>
              {canEdit ? (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    aria-label={`เลื่อนบิล ${receipt.name} ขึ้น`}
                    className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                    disabled={index === 0 || isDeleting || isReordering}
                    onClick={() => void moveReceipt(receipt.id, receipts[index - 1]?.id ?? receipt.id)}
                    type="button"
                  >
                    <ChevronUp className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                  <button
                    aria-label={`เลื่อนบิล ${receipt.name} ลง`}
                    className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                    disabled={index === receipts.length - 1 || isDeleting || isReordering}
                    onClick={() => void moveReceipt(receipt.id, receipts[index + 1]?.id ?? receipt.id)}
                    type="button"
                  >
                    <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                  <button
                    aria-label={`ลบบิล ${receipt.name}`}
                    className="rounded-lg p-1 text-gray-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isDeleting || isReordering}
                    onClick={() => setReceiptToDelete(receipt)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      )}

      {errorMessage ? <p className="text-sm font-medium text-red-700">{errorMessage}</p> : null}

      <ConfirmDeleteModal
        description={receiptToDelete ? `ต้องการลบบิล “${receiptToDelete.name}” ใช่หรือไม่? เมื่อลบแล้วจะไม่สามารถย้อนกลับได้` : ""}
        errorMessage={errorMessage}
        onClose={() => {
          if (!isDeleting) setReceiptToDelete(null);
        }}
        onConfirm={handleDelete}
        open={Boolean(receiptToDelete)}
        title="ยืนยันการลบบิล"
      />
    </section>
  );
});
