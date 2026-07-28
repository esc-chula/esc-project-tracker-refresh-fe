"use client";

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/api";
import { createProject, getAPIErrorMessage, getProjectRoute, previewNextProjectCode, updateProject } from "@/lib/api";
import { projectTypeFilterOptions } from "@/lib/catalog";
import { FormInput, FormSelect } from "@/components/ui/form-fields";
import { FormModalActions } from "@/components/ui/form-modal-actions";
import { FormModalShell } from "@/components/ui/form-modal-shell";

type NewProjectModalProps = {
  apiBaseURL: string;
  onClose: () => void;
  onCreated?: (input: { message: string; route: string }) => void;
  onUpdated?: (project: Project) => void;
  open: boolean;
  project?: Project;
};

type ProjectFormState = {
  errorMessage: string;
  isPreviewLoading: boolean;
  name: string;
  projectCode: string;
  type: string;
};

function buildInitialProjectState(project?: Project): ProjectFormState {
  return {
    errorMessage: "",
    isPreviewLoading: false,
    name: project?.name ?? "",
    projectCode: project?.projectCode ?? "",
    type: project?.type ?? ""
  };
}

export function NewProjectModal(props: NewProjectModalProps) {
  const { open, project } = props;

  if (!open) {
    return null;
  }

  return <ProjectModalForm key={project?.id ?? "create-project"} {...props} />;
}

function ProjectModalForm({ apiBaseURL, onClose, onCreated, onUpdated, project }: NewProjectModalProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<ProjectFormState>(() => buildInitialProjectState(project));
  const [isPending, startTransition] = useTransition();
  const previewRequestIDRef = useRef(0);
  const isEditing = Boolean(project);

  function handleClose() {
    previewRequestIDRef.current += 1;
    setFormState(buildInitialProjectState(project));
    onClose();
  }

  const handleCloseEvent = useEffectEvent(() => {
    handleClose();
  });

  async function handleTypeChange(nextType: string) {
    previewRequestIDRef.current += 1;
    const requestID = previewRequestIDRef.current;

    setFormState((current) => ({
      ...current,
      errorMessage: "",
      isPreviewLoading: Boolean(nextType),
      projectCode: "",
      type: nextType
    }));

    if (!nextType) {
      return;
    }

    try {
      const nextCode = await previewNextProjectCode(nextType);
      if (previewRequestIDRef.current !== requestID) {
        return;
      }

      setFormState((current) => ({
        ...current,
        isPreviewLoading: false,
        projectCode: nextCode
      }));
    } catch {
      if (previewRequestIDRef.current !== requestID) {
        return;
      }

      setFormState((current) => ({
        ...current,
        errorMessage: "ไม่สามารถพรีวิวรหัสโครงการได้",
        isPreviewLoading: false
      }));
    }
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

    if (!formState.name.trim() || !formState.type) {
      setFormState((current) => ({
        ...current,
        errorMessage: "กรุณากรอกชื่อโครงการและเลือกประเภทโครงการ"
      }));
      return;
    }

    setFormState((current) => ({
      ...current,
      errorMessage: ""
    }));

    startTransition(async () => {
      try {
        if (project) {
          const result = await updateProject({
            apiBaseURL,
            id: project.id,
            name: formState.name.trim(),
            status: project.status,
            type: formState.type
          });

          if (result.error || !result.project) {
            setFormState((current) => ({
              ...current,
              errorMessage: result.error ?? "ไม่สามารถแก้ไขโครงการได้"
            }));
            return;
          }

          onUpdated?.(result.project);
          handleClose();
          router.refresh();
          return;
        }

        const result = await createProject({
          apiBaseURL,
          name: formState.name.trim(),
          type: formState.type
        });

        if (result.error || !result.project) {
          const payload = result.error ? { errors: [{ message: result.error }] } : null;
          setFormState((current) => ({
            ...current,
            errorMessage: getAPIErrorMessage(payload, "ไม่สามารถเปิดโครงการใหม่ได้")
          }));
          return;
        }

        handleClose();
        onCreated?.({
          message: "เปิดโครงการสำเร็จแล้ว",
          route: getProjectRoute(result.project)
        });
      } catch {
        setFormState((current) => ({
          ...current,
          errorMessage: "ไม่สามารถเชื่อมต่อกับ API ได้"
        }));
      }
    });
  }

  return (
    <FormModalShell onClose={handleClose} title={isEditing ? "แก้ไขโครงการ" : "เปิดโครงการใหม่"}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-m font-medium text-black">รหัสโครงการ</span>
          <FormInput disabled placeholder={formState.isPreviewLoading ? "กำลังโหลดรหัสโครงการ..." : "XXXX"} value={formState.projectCode} />
        </label>

        <label className="block space-y-2">
          <span className="text-m font-medium text-black">
            ประเภทโครงการ <span className="text-red-600">*</span>
          </span>
          <FormSelect
            onValueChange={(nextValue) => {
              void handleTypeChange(nextValue);
            }}
            options={projectTypeFilterOptions}
            placeholder="เลือกประเภทโครงการ"
            value={formState.type}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-m font-medium text-black">
            ชื่อโครงการ (TH) <span className="text-red-600">*</span>
          </span>
          <FormInput
            onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
            placeholder="กรอกชื่อโครงการ"
            value={formState.name}
          />
        </label>

        <FormModalActions
          errorMessage={formState.errorMessage}
          isSubmitting={isPending}
          onCancel={handleClose}
          submitIcon={<Plus className="h-5 w-5" strokeWidth={2.5} />}
          submitLabel={isEditing ? "บันทึก" : "เปิดโครงการ"}
          submittingLabel={isEditing ? "กำลังบันทึก..." : "กำลังเปิดโครงการ..."}
        />
      </form>
    </FormModalShell>
  );
}
