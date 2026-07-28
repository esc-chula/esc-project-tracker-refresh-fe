"use client";

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import type { Document, Project } from "@/lib/api";
import { createDocument, getAPIErrorMessage, previewNextDocumentCode, splitDocumentTypeOption, updateDocument } from "@/lib/api";
import { documentTypeOptions } from "@/lib/catalog";
import { FormInput, FormSelect } from "@/components/ui/form-fields";
import { FormModalActions } from "@/components/ui/form-modal-actions";
import { FormModalShell } from "@/components/ui/form-modal-shell";

type NewDocumentModalProps = {
  apiBaseURL: string;
  document?: Document;
  onClose: () => void;
  onCreated: (document: Document) => void;
  onCreateSuccess?: (message: string) => void;
  onUpdated?: (document: Document) => void;
  open: boolean;
  projectCode?: string;
  projectId?: string;
  projects?: Project[];
};

type DocumentFormState = {
  documentCode: string;
  errorMessage: string;
  isPreviewLoading: boolean;
  name: string;
  selectedProjectId: string;
  typeValue: string;
};

function buildInitialDocumentState(input: {
  document?: Document;
  projectId?: string;
}): DocumentFormState {
  const { document, projectId } = input;

  return {
    documentCode: document?.documentCode ?? "",
    errorMessage: "",
    isPreviewLoading: false,
    name: document?.name ?? "",
    selectedProjectId: document?.projectId ?? projectId ?? "",
    typeValue: document ? (document.subType ? `${document.type}-${document.subType}` : document.type) : ""
  };
}

export function NewDocumentModal(props: NewDocumentModalProps) {
  const { document, open, projectId } = props;

  if (!open) {
    return null;
  }

  return <DocumentModalForm key={document?.id ?? `create-document-${projectId ?? "global"}`} {...props} />;
}

function DocumentModalForm({
  apiBaseURL,
  document,
  onClose,
  onCreated,
  onCreateSuccess,
  onUpdated,
  projectCode,
  projectId,
  projects = []
}: NewDocumentModalProps) {
  const [formState, setFormState] = useState<DocumentFormState>(() => buildInitialDocumentState({ document, projectId }));
  const [isPending, startTransition] = useTransition();
  const previewRequestIDRef = useRef(0);
  const isEditing = Boolean(document);

  const selectedProject =
    projects.find((item) => item.id === formState.selectedProjectId) ??
    (projectId ? { id: projectId, projectCode: projectCode ?? "" } : null);

  const previewCode = formState.documentCode && selectedProject?.projectCode ? `${selectedProject.projectCode}-${formState.documentCode}` : "";

  function handleClose() {
    previewRequestIDRef.current += 1;
    setFormState(buildInitialDocumentState({ document, projectId }));
    onClose();
  }

  const handleCloseEvent = useEffectEvent(() => {
    handleClose();
  });

  async function previewDocumentCode(nextTypeValue: string, nextProjectId: string) {
    previewRequestIDRef.current += 1;
    const requestID = previewRequestIDRef.current;
    const { type } = splitDocumentTypeOption(nextTypeValue);

    setFormState((current) => ({
      ...current,
      documentCode: "",
      errorMessage: "",
      isPreviewLoading: Boolean(type && nextProjectId)
    }));

    if (!type || !nextProjectId) {
      return;
    }

    try {
      const nextCode = await previewNextDocumentCode(type);
      if (previewRequestIDRef.current !== requestID) {
        return;
      }

      setFormState((current) => ({
        ...current,
        documentCode: nextCode,
        isPreviewLoading: false
      }));
    } catch {
      if (previewRequestIDRef.current !== requestID) {
        return;
      }

      setFormState((current) => ({
        ...current,
        errorMessage: "ไม่สามารถพรีวิวรหัสเอกสารได้",
        isPreviewLoading: false
      }));
    }
  }

  async function handleTypeChange(nextTypeValue: string) {
    setFormState((current) => ({
      ...current,
      typeValue: nextTypeValue
    }));
    await previewDocumentCode(nextTypeValue, formState.selectedProjectId);
  }

  async function handleProjectChange(nextProjectId: string) {
    setFormState((current) => ({
      ...current,
      selectedProjectId: nextProjectId
    }));
    await previewDocumentCode(formState.typeValue, nextProjectId);
  }

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseEvent();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState.selectedProjectId || !formState.name.trim() || !formState.typeValue) {
      setFormState((current) => ({
        ...current,
        errorMessage: "กรุณาเลือกโครงการ กรอกชื่อเอกสาร และเลือกประเภทเอกสาร"
      }));
      return;
    }

    setFormState((current) => ({
      ...current,
      errorMessage: ""
    }));

    const { type, subType } = splitDocumentTypeOption(formState.typeValue);

    startTransition(async () => {
      try {
        if (document) {
          const result = await updateDocument({
            apiBaseURL,
            id: document.id,
            name: formState.name.trim(),
            type,
            subType: subType || undefined
          });

          if (result.error || !result.document) {
            setFormState((current) => ({
              ...current,
              errorMessage: result.error ?? "ไม่สามารถแก้ไขเอกสารได้"
            }));
            return;
          }

          onUpdated?.(result.document);
          handleClose();
          return;
        }

        const result = await createDocument({
          apiBaseURL,
          projectId: formState.selectedProjectId,
          name: formState.name.trim(),
          type,
          subType: subType || undefined
        });

        if (result.error || !result.document) {
          const payload = result.error ? { errors: [{ message: result.error }] } : null;
          setFormState((current) => ({
            ...current,
            errorMessage: getAPIErrorMessage(payload, "ไม่สามารถสร้างเอกสารใหม่ได้")
          }));
          return;
        }

        onCreated(result.document);
        handleClose();
        onCreateSuccess?.("สร้างเอกสารสำเร็จแล้ว");
      } catch {
        setFormState((current) => ({
          ...current,
          errorMessage: "ไม่สามารถเชื่อมต่อกับ API ได้"
        }));
      }
    });
  }

  return (
    <FormModalShell onClose={handleClose} title={isEditing ? "แก้ไขเอกสาร" : "สร้างเอกสารใหม่"}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-m font-medium text-black">รหัสเอกสาร</span>
          <FormInput disabled placeholder={formState.isPreviewLoading ? "กำลังโหลดรหัสเอกสาร..." : "XXXX-XXXX"} value={previewCode} />
        </label>

        {projects.length > 0 && !isEditing ? (
          <label className="block space-y-2">
            <span className="text-m font-medium text-black">
              โครงการ <span className="text-red-600">*</span>
            </span>
            <FormSelect
              onValueChange={(nextValue) => {
                void handleProjectChange(nextValue);
              }}
              options={projects.map((item) => ({
                label: `${item.projectCode} ${item.name}`,
                value: item.id
              }))}
              placeholder="เลือกโครงการ"
              searchPlaceholder="ค้นหาโครงการ"
              value={formState.selectedProjectId}
            />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-m font-medium text-black">
            ประเภทเอกสาร <span className="text-red-600">*</span>
          </span>
          <FormSelect
            onValueChange={(nextValue) => {
              void handleTypeChange(nextValue);
            }}
            options={documentTypeOptions}
            placeholder="เลือกประเภทเอกสาร"
            value={formState.typeValue}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-m font-medium text-black">
            ชื่อเอกสาร <span className="text-red-600">*</span>
          </span>
          <FormInput
            onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
            placeholder="กรอกชื่อเอกสาร"
            value={formState.name}
          />
        </label>

        <FormModalActions
          errorMessage={formState.errorMessage}
          isSubmitting={isPending}
          onCancel={handleClose}
          submitIcon={<Plus className="h-5 w-5" strokeWidth={2.5} />}
          submitLabel={isEditing ? "บันทึก" : "สร้างเอกสาร"}
          submittingLabel={isEditing ? "กำลังบันทึก..." : "กำลังสร้างเอกสาร..."}
        />
      </form>
    </FormModalShell>
  );
}
