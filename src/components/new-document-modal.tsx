"use client";

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import type { Document, Project } from "@/lib/api";
import { previewNextDocumentCode, splitDocumentTypeOption } from "@/lib/api";
import { documentTypeOptions } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { CancelButton } from "@/components/ui/cancel-button";
import { FormInput, FormSelect, FormTextarea } from "@/components/ui/form-fields";
import { FormModalShell } from "@/components/ui/form-modal-shell";

type ErrorPayload = {
  detail?: string;
  title?: string;
  errors?: Array<{
    message?: string;
    error?: string;
  }>;
};

type NewDocumentModalProps = {
  apiBaseURL: string;
  open: boolean;
  projectId?: string;
  projectCode?: string;
  projects?: Project[];
  onClose: () => void;
  onCreated: (document: Document) => void;
};

function getAPIErrorMessage(payload: ErrorPayload | null, fallback: string) {
  if (!payload) {
    return fallback;
  }

  const firstError = payload.errors?.[0];
  return firstError?.message || firstError?.error || payload.detail || payload.title || fallback;
}

export function NewDocumentModal({
  apiBaseURL,
  open,
  projectId,
  projectCode,
  projects = [],
  onClose,
  onCreated
}: NewDocumentModalProps) {
  const [name, setName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(projectId ?? "");
  const [typeValue, setTypeValue] = useState("");
  const [detail, setDetail] = useState("");
  const [documentCode, setDocumentCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const previewRequestIDRef = useRef(0);

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ??
    (projectId ? { id: projectId, projectCode: projectCode ?? "" } : null);

  const previewCode = documentCode && selectedProject?.projectCode ? `${selectedProject.projectCode}-${documentCode}` : "";

  function handleClose() {
    previewRequestIDRef.current += 1;
    setName("");
    setSelectedProjectId(projectId ?? "");
    setTypeValue("");
    setDetail("");
    setDocumentCode("");
    setErrorMessage("");
    setIsPreviewLoading(false);
    onClose();
  }

  const handleCloseEvent = useEffectEvent(() => {
    handleClose();
  });

  async function previewDocumentCode(nextTypeValue: string, nextProjectId: string) {
    previewRequestIDRef.current += 1;
    const requestID = previewRequestIDRef.current;
    const { type } = splitDocumentTypeOption(nextTypeValue);

    setDocumentCode("");
    setErrorMessage("");

    if (!type || !nextProjectId) {
      setIsPreviewLoading(false);
      return;
    }

    setIsPreviewLoading(true);

    try {
      const nextCode = await previewNextDocumentCode(type);
      if (previewRequestIDRef.current !== requestID) {
        return;
      }
      setDocumentCode(nextCode);
    } catch {
      if (previewRequestIDRef.current !== requestID) {
        return;
      }
      setErrorMessage("ไม่สามารถพรีวิวรหัสเอกสารได้");
    } finally {
      if (previewRequestIDRef.current === requestID) {
        setIsPreviewLoading(false);
      }
    }
  }

  async function handleTypeChange(nextTypeValue: string) {
    setTypeValue(nextTypeValue);
    await previewDocumentCode(nextTypeValue, selectedProjectId);
  }

  async function handleProjectChange(nextProjectId: string) {
    setSelectedProjectId(nextProjectId);
    await previewDocumentCode(typeValue, nextProjectId);
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

    if (!selectedProjectId || !name.trim() || !typeValue) {
      setErrorMessage("กรุณาเลือกโครงการ กรอกชื่อเอกสาร และเลือกประเภทเอกสาร");
      return;
    }

    const { type, subType } = splitDocumentTypeOption(typeValue);

    startTransition(async () => {
      try {
        const response = await fetch(`${apiBaseURL}/api/v1/projects/${selectedProjectId}/documents`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name.trim(),
            type,
            subType: subType || undefined,
            detail: detail.trim()
          })
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as ErrorPayload | null;
          setErrorMessage(getAPIErrorMessage(payload, "ไม่สามารถเปิดเอกสารใหม่ได้"));
          return;
        }

        const payload = (await response.json()) as { document?: Document };
        if (payload.document) {
          onCreated(payload.document);
        }
        handleClose();
      } catch {
        setErrorMessage("ไม่สามารถเชื่อมต่อกับ API ได้");
      }
    });
  }

  return (
    <FormModalShell onClose={handleClose} title="เปิดเอกสารใหม่">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-m font-medium text-black">รหัสเอกสาร</span>
          <FormInput
            disabled
            placeholder={isPreviewLoading ? "กำลังโหลดรหัสเอกสาร..." : "XXXX-XXXX"}
            value={previewCode}
          />
        </label>

        {projects.length > 0 ? (
          <label className="block space-y-2">
            <span className="text-m font-medium text-black">
              โครงการ <span className="text-carmine">*</span>
            </span>
            <FormSelect
              onChange={(event) => {
                void handleProjectChange(event.target.value);
              }}
              value={selectedProjectId}
            >
              <option value="">เลือกโครงการ</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.projectCode} {project.name}
                </option>
              ))}
            </FormSelect>
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-m font-medium text-black">
            ชื่อเอกสาร <span className="text-carmine">*</span>
          </span>
          <FormInput
            onChange={(event) => setName(event.target.value)}
            placeholder="กรอกชื่อเอกสาร"
            value={name}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-m font-medium text-black">
            ประเภทเอกสาร <span className="text-carmine">*</span>
          </span>
          <FormSelect
            onChange={(event) => {
              void handleTypeChange(event.target.value);
            }}
            value={typeValue}
          >
            <option value="">เลือกประเภทเอกสาร</option>
            {documentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormSelect>
        </label>

        <label className="block space-y-2">
          <span className="text-m font-medium text-black">รายละเอียด (optional)</span>
          <FormTextarea
            onChange={(event) => setDetail(event.target.value)}
            placeholder="รายละเอียดเพิ่มเติม"
            value={detail}
          />
        </label>

        <div className="flex items-center justify-end gap-3 pt-2">
          {errorMessage ? <div className="mr-auto text-base font-medium text-carmine">{errorMessage}</div> : null}
          <CancelButton onClick={handleClose} />
          <Button
            className="h-12 rounded-2xl bg-carmine px-6 text-base font-semibold text-white hover:bg-red-800"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "กำลังเปิดเอกสาร..." : "+ เปิดเอกสาร"}
          </Button>
        </div>
      </form>
    </FormModalShell>
  );
}
