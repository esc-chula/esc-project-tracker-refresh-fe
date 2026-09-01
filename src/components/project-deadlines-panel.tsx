"use client";

import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import {
  formatDeadlineDate,
  getDeadlineCountdownLabel,
  getDeadlineUrgency,
  getDaysUntilDeadline,
  sortDeadlinesByDueDate,
  type DeadlinePermissions,
  type ProjectDeadline
} from "@/lib/deadline";

export function ProjectDeadlinesPanel({
  deadlines,
  onAdd,
  onDelete,
  onEdit,
  permissions
}: {
  deadlines: ProjectDeadline[];
  onAdd: () => void;
  onDelete: (deadline: ProjectDeadline) => void;
  onEdit: (deadline: ProjectDeadline) => void;
  permissions: DeadlinePermissions;
}) {
  const canManageDeadlines = permissions.canCreate || permissions.canUpdate || permissions.canDelete;

  if (!permissions.canRead || (deadlines.length === 0 && !canManageDeadlines)) return null;

  return (
    <section aria-labelledby="deadline-heading" className="rounded-[20px] bg-red-50 px-4 py-4 sm:px-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-carmine" strokeWidth={2.2} />
          <h2 className="text-base font-semibold text-black" id="deadline-heading">
            กำหนด Deadline
          </h2>
        </div>
      </div>

      <div className="space-y-2">
        {sortDeadlinesByDueDate(deadlines).map((deadline) => {
          const urgency = getDeadlineUrgency(deadline.dueDate);
          const daysUntil = getDaysUntilDeadline(deadline.dueDate);
          const attention = urgency !== "upcoming";

          return (
            <article
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 sm:px-4 ${
                attention ? "border-red-300 bg-red-100" : "border-transparent bg-white"
              }`}
              key={deadline.id}
            >
              <div className={`min-w-[46px] text-center ${attention ? "text-red-700" : "text-gray-700"}`}>
                <div className="text-xl font-semibold leading-5">{Math.abs(daysUntil)}</div>
                <div className="mt-1 text-[11px] font-medium leading-none">วัน</div>
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold sm:text-base ${attention ? "text-red-800" : "text-black"}`}>
                  {deadline.title}
                </p>
                <p className={`mt-0.5 text-xs ${attention ? "text-red-700" : "text-gray-500"}`}>
                  {getDeadlineCountdownLabel(deadline.dueDate)} · ครบกำหนด {formatDeadlineDate(deadline.dueDate)}
                </p>
              </div>
              {permissions.canUpdate || permissions.canDelete ? (
                <div className="flex shrink-0 items-center gap-1">
                  {permissions.canUpdate ? (
                    <button
                      aria-label={`แก้ไข ${deadline.title}`}
                      className="rounded-lg p-2 text-gray-500 transition hover:bg-white hover:text-carmine"
                      onClick={() => onEdit(deadline)}
                      type="button"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={2.25} />
                    </button>
                  ) : null}
                  {permissions.canDelete ? (
                    <button
                      aria-label={`ลบ ${deadline.title}`}
                      className="rounded-lg p-2 text-gray-500 transition hover:bg-white hover:text-red-700"
                      onClick={() => onDelete(deadline)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2.25} />
                    </button>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {permissions.canCreate ? (
        <button
          className="mt-4 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-red-700 transition hover:bg-red-100"
          onClick={onAdd}
          type="button"
        >
          <Plus className="h-4 w-4" strokeWidth={2.7} />
          เพิ่ม Deadline
        </button>
      ) : null}
    </section>
  );
}
