"use client";

import type { ReactNode } from "react";
import { DeleteIcon, DocumentIcon, EditIcon } from "@/components/ui/document-action-icons";

const iconSlotClassName = "flex h-6 w-6 shrink-0 items-center justify-center [&>svg]:h-6 [&>svg]:w-6";
const iconButtonClassName = "flex h-6 w-6 shrink-0 items-center justify-center text-gray-500 transition-colors hover:text-black";
const deleteButtonClassName = "flex h-6 w-6 shrink-0 items-center justify-center text-gray-500 transition-colors hover:text-red-700";

export function SelectedActionBar({
  code,
  title,
  icon,
  editIcon,
  deleteIcon,
  onEdit,
  onDelete,
  hideEdit = false,
  hideDelete = false
}: {
  // Shown as its own block so it can wrap above the title on narrow screens.
  code?: string;
  title: string;
  icon?: ReactNode;
  editIcon?: ReactNode;
  deleteIcon?: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  hideEdit?: boolean;
  hideDelete?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <span className={iconSlotClassName}>{icon ?? <DocumentIcon className="h-6 w-6" />}</span>
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 text-lg font-medium leading-7 text-black md:text-xl md:leading-8">
          {code ? <span className="shrink-0">{code}</span> : null}
          <span className="min-w-0 truncate">{title}</span>
        </div>
        {hideEdit && hideDelete ? null : (
          <div className="ml-auto flex shrink-0 items-center gap-3 md:ml-0">
            {hideEdit ? null : (
              <button aria-label="แก้ไข" className={iconButtonClassName} onClick={onEdit} type="button">
                <span className={iconSlotClassName}>{editIcon ?? <EditIcon className="h-6 w-6" />}</span>
              </button>
            )}
            {hideDelete ? null : (
              <button aria-label="ลบ" className={deleteButtonClassName} onClick={onDelete} type="button">
                <span className={iconSlotClassName}>{deleteIcon ?? <DeleteIcon className="h-6 w-6" />}</span>
              </button>
            )}
          </div>
        )}
      </div>
   );
}
