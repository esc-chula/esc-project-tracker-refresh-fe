"use client";

import { Plus } from "lucide-react";
import { useEffect, useEffectEvent, useMemo, useRef, useState, useTransition } from "react";
import { FormInput, FormSelect } from "@/components/ui/form-fields";
import { FormModalActions } from "@/components/ui/form-modal-actions";
import { FormModalShell } from "@/components/ui/form-modal-shell";
import type { Document, Project } from "@/lib/api";
import { createDocument, getAPIErrorMessage, previewNextDocumentCode, splitDocumentTypeOption, updateDocument } from "@/lib/api";
import { documentTypeOptions } from "@/lib/catalog";
import { departmentOptions } from "@/lib/document-view";

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
  selectedProjectType: string;
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
    selectedProjectType: "",
    typeValue: document ? (document.subType ? `${document.type}-${document.subType}` : document.type) : ""
  };
}

function isExternalDocumentType(typeValue: string) {
  return splitDocumentTypeOption(typeValue).type === "9";
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
  const isProjectScoped = Boolean(projectId);
  const externalTypeSelected = isExternalDocumentType(formState.typeValue);
  const availableDocumentTypeOptions = useMemo(
    () => (isProjectScoped ? documentTypeOptions.filter((option) => splitDocumentTypeOption(option.value).type !== "9") : documentTypeOptions),
    [isProjectScoped]
  );

  const selectedProject =
    projects.find((item) => item.id === formState.selectedProjectId) ??
    (projectId ? { id: projectId, projectCode: projectCode ?? "", name: "", type: "" } : null);

  const previewProjectCode = externalTypeSelected
    ? (formState.selectedProjectType ? `${formState.selectedProjectType}00` : "")
    : (selectedProject?.projectCode ?? "");
  const previewCode = formState.documentCode && previewProjectCode ? `${previewProjectCode}-${formState.documentCode}` : "";

  function handleClose() {
    previewRequestIDRef.current += 1;
    setFormState(buildInitialDocumentState({ document, projectId }));
    onClose();
  }

  const handleCloseEvent = useEffectEvent(() => {
    handleClose();
  });

  async function previewDocumentCode(nextTypeValue: string, nextProjectId: string, nextProjectType: string) {
    previewRequestIDRef.current += 1;
    const requestID = previewRequestIDRef.current;
    const { type } = splitDocumentTypeOption(nextTypeValue);
    const requiresSelection = type === "9" ? Boolean(nextProjectType) : Boolean(nextProjectId);

    setFormState((current) => ({
      ...current,
      documentCode: "",
      errorMessage: "",
      isPreviewLoading: Boolean(type && requiresSelection)
    }));

    if (!type || !requiresSelection) {
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
    const nextIsExternal = isExternalDocumentType(nextTypeValue);

    setFormState((current) => ({
      ...current,
      typeValue: nextTypeValue,
      selectedProjectId: nextIsExternal ? "" : current.selectedProjectId,
      selectedProjectType: nextIsExternal ? current.selectedProjectType : ""
    }));

    await previewDocumentCode(
      nextTypeValue,
      nextIsExternal ? "" : formState.selectedProjectId,
      nextIsExternal ? formState.selectedProjectType : ""
    );
  }

  async function handleProjectChange(nextProjectId: string) {
    setFormState((current) => ({
      ...current,
      selectedProjectId: nextProjectId
    }));
    await previewDocumentCode(formState.typeValue, nextProjectId, formState.selectedProjectType);
  }

  async function handleProjectTypeChange(nextProjectType: string) {
    setFormState((current) => ({
      ...current,
      selectedProjectType: nextProjectType
    }));
    await previewDocumentCode(formState.typeValue, "", nextProjectType);
  }

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseEvent();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleCloseEvent]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const hasSelection = externalTypeSelected ? Boolean(formState.selectedProjectType) : Boolean(formState.selectedProjectId);
    if (!hasSelection || !formState.name.trim() || !formState.typeValue) {
      setFormState((current) => ({
        ...current,
        errorMessage: externalTypeSelected
          ? "กรุณาเลือกประเภทโครงการ กรอกชื่อเอกสาร และเลือกประเภทเอกสาร"
          : "กรุณาเลือกโครงการ กรอกชื่อเอกสาร และเลือกประเภทเอกสาร"
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
          projectId: externalTypeSelected ? undefined : formState.selectedProjectId,
          projectType: externalTypeSelected ? formState.selectedProjectType : undefined,
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
          <FormInput
            disabled
            placeholder={formState.isPreviewLoading ? "กำลังโหลดรหัสเอกสาร..." : "XXXX-XXXX"}
            value={previewCode}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-m font-medium text-black">
            ประเภทเอกสาร <span className="text-red-600">*</span>
          </span>
          <FormSelect
            onValueChange={(nextValue) => {
              void handleTypeChange(nextValue);
            }}
            options={availableDocumentTypeOptions}
            placeholder="เลือกประเภทเอกสาร"
            value={formState.typeValue}
          />
        </label>

        {!isEditing && externalTypeSelected ? (
          <label className="block space-y-2">
            <span className="text-m font-medium text-black">
              ประเภทโครงการ <span className="text-red-600">*</span>
            </span>
            <FormSelect
              onValueChange={(nextValue) => {
                void handleProjectTypeChange(nextValue);
              }}
              options={departmentOptions}
              placeholder="เลือกประเภทโครงการ"
              value={formState.selectedProjectType}
            />
          </label>
        ) : null}

        {projects.length > 0 && !isEditing && !externalTypeSelected ? (
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
