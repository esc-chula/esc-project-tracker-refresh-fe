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
  ownerUserId: string;
  owner?: {
    id: string;
    displayName: string;
    phone?: string;
  };
  documentCode: string;
  name: string;
  type: string;
  subType?: string;
  status: string;
  displayStatus?: string;
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
    case "payment_received":
    case "forwarded_to_student_affairs":
    case "receipt_forwarded":
      return "text-green-500";
    case "under_review":
    case "awaiting_receipt":
    case "awaiting_student_affairs":
      return "text-yellow-500";
    case "returned":
    case "awaiting_receipt_fix":
    case "rejected":
    case "payment_not_received":
      return "text-red-700";
    case "cancelled":
      return "text-neutral-500";
    default:
      return "text-neutral-500";
  }
}

export function getDocumentDisplayStatusLabel(status: string) {
  switch (normalizeDocumentStatus(status)) {
    case "draft":
      return "ฉบับร่าง";
    case "under_review":
      return "กำลังตรวจสอบ";
    case "awaiting_receipt":
      return "รอการส่งบิล";
    case "returned":
      return "ตีกลับ";
    case "awaiting_receipt_fix":
      return "รอแก้ไขบิล";
    case "rejected":
      return "ปฏิเสธ";
    case "awaiting_student_affairs":
      return "รอส่งให้กิจการนิสิต";
    case "forwarded_to_student_affairs":
      return "ส่งให้กิจการนิสิตแล้ว";
    case "receipt_forwarded":
      return "ส่งบิลแล้ว";
    case "approved":
      return "อนุมัติ";
    case "payment_received":
      return "ได้รับเงินแล้ว";
    case "payment_not_received":
      return "ไม่ได้รับเงิน";
    case "cancelled":
      return "ยกเลิกเอกสาร";
  }
}

export function getDocumentStatusBadgeClassName(status: string) {
  switch (normalizeDocumentStatus(status)) {
    case "approved":
    case "payment_received":
    case "forwarded_to_student_affairs":
    case "receipt_forwarded":
      return "bg-green-500 text-white";
    case "under_review":
    case "awaiting_receipt":
    case "awaiting_student_affairs":
      return "bg-yellow-500 text-white";
    case "returned":
    case "awaiting_receipt_fix":
    case "rejected":
    case "payment_not_received":
      return "bg-red-700 text-white";
    case "cancelled":
      return "bg-neutral-500 text-white";
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
