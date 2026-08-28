import type { DeadlinePermissions, ProjectDeadline } from "@/lib/deadline";

function getBangkokToday(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Bangkok",
    year: "numeric"
  }).formatToParts(new Date());
  const getPart = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);

  return new Date(Date.UTC(getPart("year"), getPart("month") - 1, getPart("day")));
}

function dateAfterToday(days: number): string {
  const date = getBangkokToday();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getMockDeadlines(projectId: string): ProjectDeadline[] {
  const now = new Date().toISOString();

  return [
    {
      createdAt: now,
      dueDate: dateAfterToday(3),
      id: "deadline-mock-urgent",
      projectId,
      title: "ส่งชื่อและโลโก้",
      updatedAt: now
    },
    {
      createdAt: now,
      dueDate: dateAfterToday(20),
      id: "deadline-mock-upcoming",
      projectId,
      title: "ส่งบิลค่าเดินทาง",
      updatedAt: now
    }
  ];
}

export function getMockDeadlinePermissions(role: string): DeadlinePermissions {
  switch (role) {
    case "admin":
      return { canCreate: true, canDelete: true, canRead: true, canUpdate: true };
    case "finance":
    case "secretary":
      return { canCreate: true, canDelete: false, canRead: true, canUpdate: true };
    default:
      return { canCreate: false, canDelete: false, canRead: true, canUpdate: false };
  }
}
