export type DeadlinePermissions = {
  canCreate: boolean;
  canDelete: boolean;
  canRead: boolean;
  canUpdate: boolean;
};

export type ProjectDeadline = {
  createdAt: string;
  dueDate: string;
  id: string;
  projectId: string;
  title: string;
  updatedAt: string;
};

export type DeadlineFormValues = Pick<ProjectDeadline, "dueDate" | "title">;

export type DeadlineUrgency = "overdue" | "urgent" | "upcoming";

export const urgentDeadlineDays = 7;

function dateFromISODate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

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

export function getDaysUntilDeadline(dueDate: string): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((dateFromISODate(dueDate).getTime() - getBangkokToday().getTime()) / millisecondsPerDay);
}

export function getDeadlineUrgency(dueDate: string): DeadlineUrgency {
  const daysUntil = getDaysUntilDeadline(dueDate);
  if (daysUntil < 0) return "overdue";
  if (daysUntil <= urgentDeadlineDays) return "urgent";
  return "upcoming";
}

export function getDeadlineCountdownLabel(dueDate: string): string {
  const daysUntil = getDaysUntilDeadline(dueDate);
  if (daysUntil < 0) return `เกินกำหนด ${Math.abs(daysUntil)} วัน`;
  if (daysUntil === 0) return "ครบกำหนดวันนี้";
  return `เหลือ ${daysUntil} วัน`;
}

export function formatDeadlineDate(dueDate: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "2-digit"
  }).format(dateFromISODate(dueDate));
}

export function sortDeadlinesByDueDate(deadlines: ProjectDeadline[]): ProjectDeadline[] {
  return [...deadlines].sort((left, right) => left.dueDate.localeCompare(right.dueDate));
}
