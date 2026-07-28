"use client";

import type { ReactNode } from "react";
import { DeleteIcon, DocumentIcon, EditIcon } from "@/components/ui/document-action-icons";

const iconSlotClassName = "flex h-6 w-6 shrink-0 items-center justify-center [&>svg]:h-6 [&>svg]:w-6";
const iconButtonClassName = "flex h-6 w-6 shrink-0 items-center justify-center text-gray-500 transition-colors hover:text-black";
const deleteButtonClassName = "flex h-6 w-6 shrink-0 items-center justify-center text-gray-500 transition-colors hover:text-red-700";

export function SelectedActionBar({
  title,
  icon,
  editIcon,
  deleteIcon,
  onEdit,
  onDelete
}: {
  title: string;
  icon?: ReactNode;
  editIcon?: ReactNode;
  deleteIcon?: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className={iconSlotClassName}>{icon ?? <DocumentIcon className="h-6 w-6" />}</span>
      <span className="min-w-0 truncate text-xl font-medium leading-8 text-black">{title}</span>
      <button aria-label="แก้ไข" className={iconButtonClassName} onClick={onEdit} type="button">
        <span className={iconSlotClassName}>{editIcon ?? <EditIcon className="h-6 w-6" />}</span>
      </button>
      <button aria-label="ลบ" className={deleteButtonClassName} onClick={onDelete} type="button">
        <span className={iconSlotClassName}>{deleteIcon ?? <DeleteIcon className="h-6 w-6" />}</span>
      </button>
    </div>
  );
}
