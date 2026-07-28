"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCurrentUserProfile, type CurrentUser } from "@/lib/api";
import { FormInput } from "@/components/ui/form-fields";
import { FormModalActions } from "@/components/ui/form-modal-actions";
import { FormModalShell } from "@/components/ui/form-modal-shell";

type ProfileErrors = {
  displayName?: string;
  phone?: string;
  form?: string;
};

export function ProfileCompletionModal({ currentUser }: { currentUser: CurrentUser | null }) {
  const router = useRouter();
  const profileIncomplete = Boolean(currentUser && (!currentUser.displayName?.trim() || !currentUser.phone?.trim()));
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isCreateMode = profileIncomplete;
  const isOpen = profileIncomplete || editOpen;

  useEffect(() => {
    function handleOpenProfileModal() {
      setEditOpen(true);
    }

    window.addEventListener("open-profile-modal", handleOpenProfileModal);
    return () => window.removeEventListener("open-profile-modal", handleOpenProfileModal);
  }, []);

  if (!currentUser || !isOpen) {
    return null;
  }

  return (
    <ProfileCompletionForm
      currentUser={currentUser}
      isCreateMode={isCreateMode}
      isPending={isPending}
      onClose={() => setEditOpen(false)}
      onSubmit={(input) => {
        startTransition(async () => {
          const result = await updateCurrentUserProfile(input);
          if (result.error) {
            input.onError(result.error);
            return;
          }

          setEditOpen(false);
          router.refresh();
        });
      }}
    />
  );
}

function ProfileCompletionForm({
  currentUser,
  isCreateMode,
  isPending,
  onClose,
  onSubmit
}: {
  currentUser: CurrentUser;
  isCreateMode: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (input: { displayName: string; onError: (message: string) => void; phone: string }) => void;
}) {
  const [displayName, setDisplayName] = useState(isCreateMode ? "" : currentUser.displayName ?? "");
  const [phone, setPhone] = useState(currentUser.phone ?? "");
  const [errors, setErrors] = useState<ProfileErrors>({});

  function handlePhoneChange(value: string) {
    setPhone(value.replace(/\D/g, "").slice(0, 10));
  }

  function validate() {
    const nextErrors: ProfileErrors = {};

    if (!displayName.trim()) {
      nextErrors.displayName = "กรุณากรอกชื่อ-นามสกุล";
    }
    if (phone.length !== 10) {
      nextErrors.phone = "เบอร์โทรศัพท์ต้องมี 10 หลัก";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    if (!validate()) {
      return;
    }

    onSubmit({
      displayName: displayName.trim(),
      onError: (message) => setErrors({ form: message }),
      phone
    });
  }

  return (
    <FormModalShell closeable={!isCreateMode} onClose={onClose} title={isCreateMode ? "สร้างบัญชี" : "แก้ไขโปรไฟล์"}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-m font-medium text-black">
            อีเมล <span className="text-red-600">*</span>
          </span>
          <FormInput disabled value={currentUser.email} />
        </label>

        <label className="block space-y-2">
          <span className="text-m font-medium text-black">
            ชื่อ-นามสกุล <span className="text-red-600">*</span>
          </span>
          <FormInput error={errors.displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="สมชาย ใจดี" value={displayName} />
        </label>

        <label className="block space-y-2">
          <span className="text-m font-medium text-black">
            เบอร์โทรศัพท์ <span className="text-red-600">*</span>
          </span>
          <FormInput
            error={errors.phone}
            inputMode="numeric"
            onChange={(event) => handlePhoneChange(event.target.value)}
            placeholder="กรอกเฉพาะตัวเลข"
            value={phone}
          />
        </label>

        <FormModalActions
          errorClassName="text-red-700"
          errorMessage={errors.form}
          isSubmitting={isPending}
          onCancel={onClose}
          showCancel={!isCreateMode}
          submitLabel="ยืนยัน"
          submittingLabel="กำลังบันทึก..."
        />
      </form>
    </FormModalShell>
  );
}
