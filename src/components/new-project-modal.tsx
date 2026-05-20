"use client";

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { getProjectRoute, previewNextProjectCode, projectTypeOptions } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CancelButton } from "@/components/ui/cancel-button";
import { FormInput, FormSelect, FormTextarea } from "@/components/ui/form-fields";

type ErrorPayload = {
  detail?: string;
  title?: string;
  errors?: Array<{
    message?: string;
    error?: string;
  }>;
};

type NewProjectModalProps = {
  apiBaseURL: string;
  open: boolean;
  onClose: () => void;
};

function getAPIErrorMessage(payload: ErrorPayload | null, fallback: string) {
  if (!payload) {
    return fallback;
  }

  const firstError = payload.errors?.[0];
  return firstError?.message || firstError?.error || payload.detail || payload.title || fallback;
}

function getTodayInBangkok(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

export function NewProjectModal({ apiBaseURL, open, onClose }: NewProjectModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [detail, setDetail] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const previewRequestIDRef = useRef(0);

  function handleClose() {
    previewRequestIDRef.current += 1;
    setName("");
    setType("");
    setDetail("");
    setProjectCode("");
    setErrorMessage("");
    setIsPreviewLoading(false);
    onClose();
  }

  const handleCloseEvent = useEffectEvent(() => {
    handleClose();
  });

  async function handleTypeChange(nextType: string) {
    previewRequestIDRef.current += 1;
    const requestID = previewRequestIDRef.current;

    setType(nextType);
    setProjectCode("");
    setErrorMessage("");

    if (!nextType) {
      setIsPreviewLoading(false);
      return;
    }

    setIsPreviewLoading(true);

    try {
      const nextCode = await previewNextProjectCode(nextType);
      if (previewRequestIDRef.current !== requestID) {
        return;
      }
      setProjectCode(nextCode);
    } catch {
      if (previewRequestIDRef.current !== requestID) {
        return;
      }
      setErrorMessage("ไม่สามารถพรีวิวรหัสโครงการได้");
    } finally {
      if (previewRequestIDRef.current === requestID) {
        setIsPreviewLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseEvent();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  if (!open) {
    return null;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !type) {
      setErrorMessage("กรุณากรอกชื่อโครงการและเลือกประเภทโครงการ");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`${apiBaseURL}/api/v1/projects`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name.trim(),
            type,
            reserveDate: getTodayInBangkok(),
            detail: detail.trim()
          })
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as ErrorPayload | null;
          setErrorMessage(getAPIErrorMessage(payload, "ไม่สามารถเปิดโครงการใหม่ได้"));
          return;
        }

        const payload = (await response.json()) as {
          project?: { id: string; projectCode: string };
        };
        handleClose();
        if (payload.project) {
          router.push(getProjectRoute(payload.project));
        }
        router.refresh();
      } catch {
        setErrorMessage("ไม่สามารถเชื่อมต่อกับ API ได้");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-8"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[640px] rounded-[28px] bg-white p-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-modal-title"
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <h2 className="text-3xl font-medium text-black" id="new-project-modal-title">
            เปิดโครงการใหม่
          </h2>
          <button
            type="button"
            aria-label="ปิด"
            className="rounded-full p-1 text-black transition hover:bg-gray-100"
            onClick={handleClose}
          >
            <X className="h-8 w-8" strokeWidth={2.2} />
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-m font-medium text-black">รหัสโครงการ</span>
            <FormInput
              disabled
              value={projectCode}
              placeholder={isPreviewLoading ? "กำลังโหลดรหัสโครงการ..." : "XXXX"}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-m font-medium text-black">
              ชื่อโครงการ (TH) <span className="text-red-700">*</span>
            </span>
            <FormInput
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="กรอกชื่อโครงการ"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-m font-medium text-black">
              ประเภทโครงการ <span className="text-red-700">*</span>
            </span>
            <FormSelect
              value={type}
              onChange={(event) => {
                void handleTypeChange(event.target.value);
              }}
            >
              <option value="">เลือกประเภทโครงการ</option>
              {projectTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FormSelect>
          </label>

          <label className="block space-y-2">
            <span className="text-m font-medium text-black">รายละเอียด (optional)</span>
            <FormTextarea
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="รายละเอียดเพิ่มเติม"
            />
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            {errorMessage ? <div className="mr-auto text-base font-medium text-red-700">{errorMessage}</div> : null}
            <CancelButton onClick={handleClose} />
            <Button
              type="submit"
              disabled={isPending}
              className="h-12 rounded-2xl bg-red-700 px-6 text-base font-semibold text-white hover:bg-red-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isPending ? "กำลังเปิดโครงการ..." : "เปิดโครงการ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
