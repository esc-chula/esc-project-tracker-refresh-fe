import {
  documentStatusOptions,
  documentTypeOptions,
  getDocumentStatusLabel,
  getDocumentTypeLabel,
  getProjectTypeLabel,
  normalizeDocumentStatus,
  projectTypeFilterOptions
} from "@/lib/catalog";

export type DocumentExplorerRow = {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  projectType: string;
  documentCode: string;
  name: string;
  type: string;
  subType?: string;
  status: string;
  updatedAt: string;
};

export const departmentOptions = projectTypeFilterOptions;
export {
  documentStatusOptions,
  documentTypeOptions,
  getDocumentStatusLabel,
  getDocumentTypeLabel,
  normalizeDocumentStatus
};

export function getDepartmentLabel(projectType: string) {
  return getProjectTypeLabel(projectType);
}

export function getDocumentStatusClassName(status: string) {
  switch (normalizeDocumentStatus(status)) {
    case "approved":
      return "text-emerald-500";
    case "submitted":
      return "text-yellow-500";
    case "returned":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
}

export function getDocumentDisplayStatusLabel(status: string) {
  switch (normalizeDocumentStatus(status)) {
    case "draft":
      return "ฉบับร่าง";
    case "submitted":
      return "กำลังตรวจสอบ";
    case "returned":
      return "ตีกลับ";
    case "approved":
      return "อนุมัติ";
  }
}

export function getDocumentStatusBadgeClassName(status: string) {
  switch (normalizeDocumentStatus(status)) {
    case "approved":
      return "bg-emerald-500 text-white";
    case "submitted":
      return "bg-yellow-500 text-white";
    case "returned":
      return "bg-red-500 text-white";
  }
}

export function formatUpdatedAt(updatedAt: string) {
  const date = new Date(updatedAt);
  const dateLabel = new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    timeZone: "Asia/Bangkok"
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok"
  }).format(date);

  return `${dateLabel} ${timeLabel} น.`;
}
