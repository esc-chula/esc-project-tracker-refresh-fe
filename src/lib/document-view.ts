import {
  documentStatusOptions,
  documentTypeOptions,
  getDocumentStatusLabel,
  getDocumentTypeLabel,
  getProjectTypeLabel,
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
export { documentStatusOptions, documentTypeOptions, getDocumentStatusLabel, getDocumentTypeLabel };

export function getDepartmentLabel(projectType: string) {
  return getProjectTypeLabel(projectType);
}

export function getDocumentStatusClassName(status: string) {
  switch (status) {
    case "approved":
      return "text-green-500";
    case "pending":
      return "text-amber-500";
    case "rejected":
      return "text-red-600";
    default:
      return "text-gray-400";
  }
}

export function formatUpdatedAt(updatedAt: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit"
  }).format(new Date(updatedAt));
}
