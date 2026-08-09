"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import {
  addProjectMember,
  getProjectMembersClient,
  removeProjectMember,
  updateProjectMemberPermission,
  type ProjectMember,
  type ProjectMemberPermission
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-fields";
import { FormModalShell } from "@/components/ui/form-modal-shell";
import { cn } from "@/lib/utils";

const studentIdPattern = /^[0-9]{10}$/;

const permissionOptions = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" }
] as const satisfies readonly { value: ProjectMemberPermission; label: string }[];

// A minimal, self-sized dropdown for this fixed 2-option menu. The
// shared FormSelect component is built for long searchable option lists
// and enforces a 180px minimum popup height, which towers over a
// 2-item menu — so this renders its own small popup sized to its
// actual content instead.
function PermissionSelect({
  disabled,
  onChange,
  value
}: {
  disabled?: boolean;
  onChange: (value: ProjectMemberPermission) => void;
  value: ProjectMemberPermission;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = permissionOptions.find((option) => option.value === value);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        className="flex h-[52px] w-full items-center justify-between rounded-[18px] border border-gray-300 bg-white px-4 text-left text-sm text-black outline-none disabled:opacity-50"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>{selected?.label ?? value}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-black transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-full min-w-[110px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          {permissionOptions.map((option) => (
            <button
              className={cn(
                "block w-full px-4 py-2.5 text-left text-sm text-black transition hover:bg-gray-50",
                option.value === value && "bg-gray-100"
              )}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type ManageProjectMembersModalProps = {
  apiBaseURL: string;
  onClose: () => void;
  open: boolean;
  projectId: string;
};

export function ManageProjectMembersModal({ apiBaseURL, onClose, open, projectId }: ManageProjectMembersModalProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [newMemberPermission, setNewMemberPermission] = useState<ProjectMemberPermission>("viewer");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setStudentId("");
    setNewMemberPermission("viewer");
    setFieldError("");
    setFormError("");
    setSuccessMessage("");
    setIsLoading(true);

    let cancelled = false;
    void getProjectMembersClient(projectId, { apiBaseURL }).then((result) => {
      if (cancelled) {
        return;
      }
      setMembers(result.members);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [apiBaseURL, open, projectId]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError("");
    setFormError("");
    setSuccessMessage("");

    const trimmedStudentId = studentId.trim();
    if (!studentIdPattern.test(trimmedStudentId)) {
      setFieldError("รหัสนิสิตต้องเป็นตัวเลข 10 หลัก");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addProjectMember({
        apiBaseURL,
        projectId,
        studentId: trimmedStudentId,
        permission: newMemberPermission
      });
      if (result.error || !result.member) {
        setFormError(result.error || "ไม่สามารถเพิ่มผู้เข้าถึงได้");
        return;
      }

      setMembers((current) => {
        const withoutDuplicate = current.filter((member) => member.userId !== result.member!.userId);
        return [result.member!, ...withoutDuplicate];
      });
      setSuccessMessage(`แอดสำเร็จ: ${result.member.displayName || result.member.email}`);
      setStudentId("");
      setNewMemberPermission("viewer");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePermissionChange(userId: string, permission: ProjectMemberPermission) {
    setFormError("");
    setSuccessMessage("");
    setUpdatingUserId(userId);
    try {
      const result = await updateProjectMemberPermission({ apiBaseURL, projectId, userId, permission });
      if (result.error || !result.member) {
        setFormError(result.error || "ไม่สามารถเปลี่ยนสิทธิ์การเข้าถึงได้");
        return;
      }
      setMembers((current) => current.map((member) => (member.userId === userId ? result.member! : member)));
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function handleRemove(userId: string) {
    setFormError("");
    setSuccessMessage("");
    setRemovingUserId(userId);
    try {
      const result = await removeProjectMember({ apiBaseURL, projectId, userId });
      if (result.error) {
        setFormError(result.error);
        return;
      }
      setMembers((current) => current.filter((member) => member.userId !== userId));
    } finally {
      setRemovingUserId(null);
    }
  }

  return (
    <FormModalShell onClose={onClose} title="จัดการผู้เข้าถึงโครงการ">
      <div className="space-y-6">
        <form className="space-y-2" onSubmit={handleSubmit}>
          <span className="text-m font-medium text-black">
            รหัสนิสิต <span className="text-red-600">*</span>
          </span>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <FormInput
                error={fieldError}
                inputMode="numeric"
                onChange={(event) => setStudentId(event.target.value)}
                placeholder="เช่น 6512345678"
                value={studentId}
              />
            </div>
            <div className="w-[130px] shrink-0">
              <PermissionSelect onChange={setNewMemberPermission} value={newMemberPermission} />
            </div>
            <Button className="h-14" disabled={isSubmitting} type="submit" variant="appRed">
              {isSubmitting ? "กำลังเพิ่ม..." : "เพิ่ม"}
            </Button>
          </div>
          {formError ? <p className="text-sm font-medium text-red-700">{formError}</p> : null}
          {successMessage ? <p className="text-sm font-medium text-emerald-600">{successMessage}</p> : null}
        </form>

        <div className="space-y-2">
          <div className="text-base font-semibold text-black">ผู้ที่เข้าถึงได้</div>
          {isLoading ? (
            <div className="text-sm text-gray-400">กำลังโหลด...</div>
          ) : members.length === 0 ? (
            <div className="text-sm text-gray-400">ยังไม่มีผู้ได้รับสิทธิ์เข้าถึง</div>
          ) : (
            <ul className="space-y-2">
              {members.map((member) => {
                const isOwner = member.permission === "owner";
                return (
                  <li
                    className="flex items-center justify-between gap-3 rounded-xl bg-gray-100 px-4 py-3"
                    key={member.userId}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-black">{member.displayName || member.email}</div>
                      <div className="truncate text-xs text-gray-500">{member.email}</div>
                    </div>
                    {isOwner ? (
                      <span className="shrink-0 rounded-full bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600">
                        เจ้าของ
                      </span>
                    ) : (
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="w-[130px]">
                          <PermissionSelect
                            disabled={updatingUserId === member.userId}
                            onChange={(value) => handlePermissionChange(member.userId, value)}
                            value={member.permission as ProjectMemberPermission}
                          />
                        </div>
                        <button
                          aria-label="ลบผู้เข้าถึง"
                          className="shrink-0 rounded-full p-1 text-gray-500 transition hover:bg-white hover:text-red-700 disabled:opacity-50"
                          disabled={removingUserId === member.userId}
                          onClick={() => handleRemove(member.userId)}
                          type="button"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </FormModalShell>
  );
}
