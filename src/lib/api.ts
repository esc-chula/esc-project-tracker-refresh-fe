import { documentTypeOptions, projectTypeOptions } from "@/lib/catalog";
import type { DeadlinePermissions, ProjectDeadline } from "@/lib/deadline";

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  avatarUrl: string;
  role: string;
  emailVerified: boolean;
};

export type ProjectPermissions = {
  canEdit: boolean;
  canDelete: boolean;
  canCreateDocument: boolean;
  canManageMembers: boolean;
};

export type ProjectBudgetSource = {
  source: "esc" | "sponsor" | "other";
  allocatedSatang: number;
  percentage: number;
};

export type ProjectBudget = {
  sources: ProjectBudgetSource[];
  totalSatang: number;
};

export type FinanceSummaryDocument = {
  id: string;
  documentCode: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type FinanceSummaryProject = {
  id: string;
  projectCode: string;
  name: string;
  type: string;
  budget: ProjectBudget;
  createdAt: string;
  updatedAt: string;
  lastDocumentUpdate: string;
  documents: FinanceSummaryDocument[];
};

export type FinanceSummaryPagination = {
  prev: number | null;
  now: number;
  next: number | null;
  last: number;
};

export type FinanceSummary = {
  total: number;
  projects: FinanceSummaryProject[];
  pagination: FinanceSummaryPagination;
};

export type FinanceDashboard = {
  budget: ProjectBudget;
};

export type Project = {
  id: string;
  ownerUserId: string;
  projectCode: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  permissions?: ProjectPermissions;
  budget?: ProjectBudget;
};

export type DocumentPermissions = {
  canEdit: boolean;
  canDelete: boolean;
  allowedWorkflowActions: string[];
};

export type Document = {
  id: string;
  projectId: string;
  ownerUserId: string;
  owner?: {
    id: string;
    displayName: string;
    phone?: string;
  };
  projectCode: string;
  documentCode: string;
  name: string;
  type: string;
  subType?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  permissions?: DocumentPermissions;
};

export type DocumentProjectSummary = {
  id: string;
  projectCode: string;
  name: string;
};

export type LatestFilingSummary = {
  id: string;
  status: string;
  submittedAt: string;
  updatedAt: string;
  approvedAt?: string;
};

export type DocumentDetail = Document & {
  project: DocumentProjectSummary;
  owner: {
    id: string;
    displayName: string;
    phone?: string;
  };
  filingCount: number;
  latestFiling?: LatestFilingSummary;
};

export type FilingAttachment = {
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
};

export type Filing = {
  id: string;
  documentId: string;
  projectId: string;
  ownerUserId: string;
  ownerName?: string;
  status: string;
  action?: string;
  message: string;
  returnMessage?: string;
  replyMessage?: string;
  signMessage?: string;
  forwardMessage?: string;
  approveMessage?: string;
  cancelMessage?: string;
  attachments?: FilingAttachment[];
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  approvedAt?: string;
};

export type ProjectMemberPermission = "viewer" | "editor";

export type ProjectMember = {
  userId: string;
  email: string;
  displayName: string;
  permission: string;
};

export type ProjectDeadlinesResult = {
  deadlines: ProjectDeadline[];
  permissions: DeadlinePermissions;
  error?: string;
};

export type FilingTimelineEvent = {
  filingId: string;
  event: string;
  status: string;
  message?: string;
  occurredAt: string;
};

type APIErrorPayload = {
  detail?: string;
  title?: string;
  errors?: Array<{
    message?: string;
    error?: string;
  }>;
};

export { documentTypeOptions, projectTypeOptions };

const defaultDevelopmentAPIBaseURL = "http://localhost:8080";

export function getAPIBaseURL(): string {
  const configuredAPIBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configuredAPIBaseURL) {
    return configuredAPIBaseURL;
  }

  if (process.env.NODE_ENV !== "production") {
    return defaultDevelopmentAPIBaseURL;
  }

  throw new Error("NEXT_PUBLIC_API_BASE_URL is required in production");
}

const apiBaseURL = getAPIBaseURL();

async function fetchWithSessionRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    credentials: "include"
  });

  if (response.status !== 401) {
    return response;
  }

  const refreshResponse = await fetch(`${apiBaseURL}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include"
  }).catch(() => null);

  if (!refreshResponse?.ok) {
    if (typeof window !== "undefined") {
      window.location.href = getGoogleLoginURL();
    }
    return response;
  }

  return fetch(input, {
    ...init,
    credentials: "include"
  });
}

export { fetchWithSessionRetry };

export function getGoogleLoginURL(): string {
  return `${apiBaseURL}/api/v1/auth/google/login`;
}

export function getLogoutURL(): string {
  return `${apiBaseURL}/api/v1/auth/logout`;
}

export async function getCurrentUser(cookieHeader: string): Promise<CurrentUser | null> {
  if (!cookieHeader) {
    return null;
  }

  try {
    const response = await fetch(`${apiBaseURL}/api/v1/auth/me`, {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader
      }
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { user?: CurrentUser };
    return payload.user ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentUserClient(input?: {
  apiBaseURL?: string;
}): Promise<CurrentUser | null> {
  try {
    const response = await fetchWithSessionRetry(`${input?.apiBaseURL ?? apiBaseURL}/api/v1/auth/me`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { user?: CurrentUser };
    return payload.user ?? null;
  } catch {
    return null;
  }
}

export async function updateCurrentUserProfile(input: {
  displayName: string;
  phone: string;
}): Promise<{ user?: CurrentUser; error?: string }> {
  try {
    const response = await fetchWithSessionRetry(`${apiBaseURL}/api/v1/auth/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return {
        error: getAPIErrorMessage(payload, `ไม่สามารถบันทึกโปรไฟล์ได้ (${response.status})`)
      };
    }

    const payload = (await response.json()) as { user?: CurrentUser };
    return { user: payload.user };
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function getProjects(cookieHeader: string): Promise<Project[]> {
  if (!cookieHeader) {
    return [];
  }

  try {
    const response = await fetch(`${apiBaseURL}/api/v1/projects`, {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader
      }
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { projects?: Project[] };
    return payload.projects ?? [];
  } catch {
    return [];
  }
}

export async function getProjectsClient(input?: { apiBaseURL?: string }): Promise<Project[]> {
  try {
    const response = await fetchWithSessionRetry(`${input?.apiBaseURL ?? apiBaseURL}/api/v1/projects`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { projects?: Project[] };
    return payload.projects ?? [];
  } catch {
    return [];
  }
}

export async function getFinanceSummaryClient(input: {
  search?: string;
  type?: string;
  year?: number;
  sortBy?: "lastDocumentUpdate" | "projectCode" | "projectName";
  order?: "asc" | "desc";
  pageNum?: number;
  pageSize?: 10 | 20 | 50;
  apiBaseURL?: string;
}): Promise<{ summary?: FinanceSummary; error?: string }> {
  const searchParams = new URLSearchParams();
  if (input.search?.trim()) searchParams.set("search", input.search.trim());
  if (input.type) searchParams.set("type", input.type);
  if (input.year) searchParams.set("year", String(input.year));
  if (input.sortBy) searchParams.set("sortBy", input.sortBy);
  if (input.order) searchParams.set("order", input.order);
  if (input.pageNum) searchParams.set("pageNum", String(input.pageNum));
  if (input.pageSize) searchParams.set("pageSize", String(input.pageSize));

  try {
    const response = await fetchWithSessionRetry(
      `${input.apiBaseURL ?? apiBaseURL}/api/v1/finance/summary?${searchParams.toString()}`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { error: getAPIErrorMessage(payload, "ไม่สามารถโหลดสรุปงบประมาณได้") };
    }

    const payload = (await response.json()) as Omit<FinanceSummary, "pagination"> & {
      pagination?: FinanceSummaryPagination;
    };
    return {
      summary: {
        total: payload.total ?? 0,
        projects: payload.projects ?? [],
        pagination: payload.pagination ?? { last: 1, next: null, now: 1, prev: null }
      }
    };
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function getFinanceDashboardClient(input: {
  year: number;
  apiBaseURL?: string;
}): Promise<{ dashboard?: FinanceDashboard; error?: string }> {
  const searchParams = new URLSearchParams({ year: String(input.year) });

  try {
    const response = await fetchWithSessionRetry(
      `${input.apiBaseURL ?? apiBaseURL}/api/v1/finance/dashboard?${searchParams.toString()}`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { error: getAPIErrorMessage(payload, "ไม่สามารถโหลดภาพรวมงบประมาณได้") };
    }

    const payload = (await response.json()) as { budget?: ProjectBudget };
    if (!payload.budget) {
      return { error: "ไม่พบข้อมูลงบประมาณ" };
    }
    return { dashboard: { budget: payload.budget } };
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function getProjectById(cookieHeader: string, projectId: string): Promise<Project | null> {
  if (!cookieHeader || !projectId) {
    return null;
  }

  try {
    const response = await fetch(`${apiBaseURL}/api/v1/projects/${projectId}`, {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader
      }
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { project?: Project };
    return payload.project ?? null;
  } catch {
    return null;
  }
}

const noDeadlinePermissions: DeadlinePermissions = {
  canCreate: false,
  canDelete: false,
  canRead: false,
  canUpdate: false
};

function emptyProjectDeadlinesResult(error?: string): ProjectDeadlinesResult {
  return { deadlines: [], permissions: noDeadlinePermissions, ...(error ? { error } : {}) };
}

function toDeadlineRequestDateTime(dueDate: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(dueDate) ? `${dueDate}T00:00:00.000Z` : dueDate;
}

export async function getProjectDeadlines(cookieHeader: string, projectId: string): Promise<ProjectDeadlinesResult> {
  if (!cookieHeader || !projectId) {
    return emptyProjectDeadlinesResult();
  }

  try {
    const response = await fetch(`${apiBaseURL}/api/v1/projects/${projectId}/deadlines`, {
      cache: "no-store",
      headers: { Cookie: cookieHeader }
    });
    if (!response.ok) {
      return emptyProjectDeadlinesResult();
    }
    const payload = (await response.json()) as Partial<ProjectDeadlinesResult>;
    return {
      deadlines: payload.deadlines ?? [],
      permissions: payload.permissions ?? noDeadlinePermissions
    };
  } catch {
    return emptyProjectDeadlinesResult();
  }
}

export async function createProjectDeadline(input: {
  apiBaseURL?: string;
  projectId: string;
  title: string;
  dueDate: string;
}): Promise<{ deadline?: ProjectDeadline; error?: string }> {
  try {
    const response = await fetchWithSessionRetry(`${input.apiBaseURL ?? apiBaseURL}/api/v1/projects/${input.projectId}/deadlines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate: toDeadlineRequestDateTime(input.dueDate), title: input.title })
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { error: getAPIErrorMessage(payload, "ไม่สามารถเพิ่ม Deadline ได้") };
    }
    const payload = (await response.json()) as { deadline?: ProjectDeadline };
    return { deadline: payload.deadline };
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function updateProjectDeadline(input: {
  apiBaseURL?: string;
  projectId: string;
  deadlineId: string;
  title: string;
  dueDate: string;
}): Promise<{ deadline?: ProjectDeadline; error?: string }> {
  try {
    const response = await fetchWithSessionRetry(
      `${input.apiBaseURL ?? apiBaseURL}/api/v1/projects/${input.projectId}/deadlines/${input.deadlineId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: toDeadlineRequestDateTime(input.dueDate), title: input.title })
      }
    );
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { error: getAPIErrorMessage(payload, "ไม่สามารถแก้ไข Deadline ได้") };
    }
    const payload = (await response.json()) as { deadline?: ProjectDeadline };
    return { deadline: payload.deadline };
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function deleteProjectDeadline(input: {
  apiBaseURL?: string;
  projectId: string;
  deadlineId: string;
}): Promise<{ error?: string }> {
  try {
    const response = await fetchWithSessionRetry(
      `${input.apiBaseURL ?? apiBaseURL}/api/v1/projects/${input.projectId}/deadlines/${input.deadlineId}`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { error: getAPIErrorMessage(payload, "ไม่สามารถลบ Deadline ได้") };
    }
    return {};
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function getDocumentsByProject(cookieHeader: string, projectId: string): Promise<Document[]> {
  if (!cookieHeader || !projectId) {
    return [];
  }

  try {
    const response = await fetch(`${apiBaseURL}/api/v1/projects/${projectId}/documents`, {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader
      }
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { documents?: Document[] };
    return payload.documents ?? [];
  } catch {
    return [];
  }
}

export async function getDocumentsByProjectClient(
  projectId: string,
  input?: { apiBaseURL?: string }
): Promise<Document[]> {
  if (!projectId) {
    return [];
  }

  try {
    const response = await fetchWithSessionRetry(`${input?.apiBaseURL ?? apiBaseURL}/api/v1/projects/${projectId}/documents`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { documents?: Document[] };
    return payload.documents ?? [];
  } catch {
    return [];
  }
}

export async function getDocuments(cookieHeader: string): Promise<Document[]> {
  if (!cookieHeader) {
    return [];
  }

  try {
    const response = await fetch(`${apiBaseURL}/api/v1/documents`, {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader
      }
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { documents?: Document[] };
    return payload.documents ?? [];
  } catch {
    return [];
  }
}

export async function getDocumentsClient(input?: { apiBaseURL?: string }): Promise<Document[]> {
  try {
    const response = await fetchWithSessionRetry(`${input?.apiBaseURL ?? apiBaseURL}/api/v1/documents`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { documents?: Document[] };
    return payload.documents ?? [];
  } catch {
    return [];
  }
}

export async function getDocumentById(cookieHeader: string, documentId: string): Promise<DocumentDetail | null> {
  if (!cookieHeader || !documentId) {
    return null;
  }

  try {
    const response = await fetch(`${apiBaseURL}/api/v1/documents/${documentId}`, {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader
      }
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { document?: DocumentDetail };
    return payload.document ?? null;
  } catch {
    return null;
  }
}

export async function getDocumentByIdClient(
  documentId: string,
  input?: { apiBaseURL?: string }
): Promise<DocumentDetail | null> {
  if (!documentId) {
    return null;
  }

  try {
    const response = await fetchWithSessionRetry(`${input?.apiBaseURL ?? apiBaseURL}/api/v1/documents/${documentId}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { document?: DocumentDetail };
    return payload.document ?? null;
  } catch {
    return null;
  }
}

export async function getDocumentByCode(cookieHeader: string, code: string): Promise<DocumentDetail | null> {
  if (!cookieHeader || !code) {
    return null;
  }

  try {
    const response = await fetch(`${apiBaseURL}/api/v1/document-codes/${encodeURIComponent(code)}`, {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader
      }
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { document?: DocumentDetail };
    return payload.document ?? null;
  } catch {
    return null;
  }
}

export async function getFilingsByDocument(
  cookieHeader: string,
  documentId: string
): Promise<{ filings: Filing[]; timeline: FilingTimelineEvent[] }> {
  if (!cookieHeader || !documentId) {
    return {
      filings: [],
      timeline: []
    };
  }

  try {
    const response = await fetch(`${apiBaseURL}/api/v1/documents/${documentId}/filings`, {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader
      }
    });

    if (!response.ok) {
      return {
        filings: [],
        timeline: []
      };
    }

    const payload = (await response.json()) as {
      filings?: Filing[];
      timeline?: FilingTimelineEvent[];
    };
    return {
      filings: payload.filings ?? [],
      timeline: payload.timeline ?? []
    };
  } catch {
    return {
      filings: [],
      timeline: []
    };
  }
}

export async function getFilingsByDocumentClient(
  documentId: string,
  input?: { apiBaseURL?: string }
): Promise<{ filings: Filing[]; timeline: FilingTimelineEvent[]; error?: string }> {
  if (!documentId) {
    return {
      filings: [],
      timeline: []
    };
  }

  try {
    const response = await fetchWithSessionRetry(`${input?.apiBaseURL ?? apiBaseURL}/api/v1/documents/${documentId}/filings`, {
      cache: "no-store"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return {
        filings: [],
        timeline: [],
        error: getAPIErrorMessage(payload, "ไม่สามารถโหลดประวัติเอกสารได้")
      };
    }

    const payload = (await response.json()) as {
      filings?: Filing[];
      timeline?: FilingTimelineEvent[];
    };
    return {
      filings: payload.filings ?? [],
      timeline: payload.timeline ?? []
    };
  } catch {
    return {
      filings: [],
      timeline: [],
      error: "ไม่สามารถเชื่อมต่อกับ API ได้"
    };
  }
}

export async function previewNextProjectCode(projectType: string): Promise<string> {
  if (!projectType) {
    return "";
  }

  const response = await fetchWithSessionRetry(
    `${apiBaseURL}/api/v1/projects/next-code?type=${encodeURIComponent(projectType)}`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("ไม่สามารถพรีวิวรหัสโครงการได้");
  }

  const payload = (await response.json()) as { projectCode?: string };
  return payload.projectCode ?? "";
}

export async function previewNextDocumentCode(documentType: string): Promise<string> {
  if (!documentType) {
    return "";
  }

  const response = await fetchWithSessionRetry(
    `${apiBaseURL}/api/v1/documents/next-code?type=${encodeURIComponent(documentType)}`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("ไม่สามารถพรีวิวรหัสเอกสารได้");
  }

  const payload = (await response.json()) as { documentCode?: string };
  return payload.documentCode ?? "";
}

export async function createProject(input: {
  apiBaseURL?: string;
  name: string;
  type: string;
}): Promise<{ project?: Pick<Project, "id" | "projectCode">; error?: string }> {
  try {
    const response = await fetchWithSessionRetry(`${input.apiBaseURL ?? apiBaseURL}/api/v1/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        type: input.type
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { error: getAPIErrorMessage(payload, "ไม่สามารถเปิดโครงการใหม่ได้") };
    }

    return (await response.json()) as { project?: Pick<Project, "id" | "projectCode"> };
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function updateProject(input: {
  apiBaseURL?: string;
  id: string;
  name: string;
  type: string;
  status: string;
}): Promise<{ project?: Project; error?: string }> {
  try {
    const response = await fetchWithSessionRetry(`${input.apiBaseURL ?? apiBaseURL}/api/v1/projects/${input.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        type: input.type,
        status: input.status
      })
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { error: getAPIErrorMessage(payload, "ไม่สามารถแก้ไขโครงการได้") };
    }
    return (await response.json()) as { project?: Project };
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function updateProjectBudget(input: {
  apiBaseURL?: string;
  projectId: string;
  escSatang: number;
  otherSatang: number;
  sponsorSatang: number;
}): Promise<{ project?: Project; error?: string }> {
  try {
    const response = await fetchWithSessionRetry(
      `${input.apiBaseURL ?? apiBaseURL}/api/v1/projects/${input.projectId}/budget`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escSatang: input.escSatang,
          otherSatang: input.otherSatang,
          sponsorSatang: input.sponsorSatang
        })
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { error: getAPIErrorMessage(payload, "ไม่สามารถบันทึกงบประมาณได้") };
    }

    return (await response.json()) as { project?: Project };
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function deleteProject(input: { apiBaseURL?: string; id: string }): Promise<{ error?: string }> {
  try {
    const response = await fetchWithSessionRetry(`${input.apiBaseURL ?? apiBaseURL}/api/v1/projects/${input.id}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { error: getAPIErrorMessage(payload, "ไม่สามารถลบโครงการได้") };
    }
    return {};
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function createDocument(input: {
  apiBaseURL?: string;
  projectId?: string;
  projectType?: string;
  name: string;
  type: string;
  subType?: string;
}): Promise<{ document?: Document; error?: string }> {
  try {
    const isExternalDocument = input.type === "9";
    const endpoint = isExternalDocument
      ? `${input.apiBaseURL ?? apiBaseURL}/api/v1/documents`
      : `${input.apiBaseURL ?? apiBaseURL}/api/v1/projects/${input.projectId}/documents`;
    const response = await fetchWithSessionRetry(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        type: input.type,
        subType: input.subType,
        projectType: input.projectType
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { error: getAPIErrorMessage(payload, "ไม่สามารถสร้างเอกสารใหม่ได้") };
    }

    return (await response.json()) as { document?: Document };
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function updateDocument(input: {
  apiBaseURL?: string;
  id: string;
  name: string;
  type: string;
  subType?: string;
}): Promise<{ document?: Document; error?: string }> {
  try {
    const response = await fetchWithSessionRetry(`${input.apiBaseURL ?? apiBaseURL}/api/v1/documents/${input.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        type: input.type,
        subType: input.subType
      })
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { error: getAPIErrorMessage(payload, "ไม่สามารถแก้ไขเอกสารได้") };
    }
    return (await response.json()) as { document?: Document };
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function deleteDocument(input: { apiBaseURL?: string; id: string }): Promise<{ error?: string }> {
  try {
    const response = await fetchWithSessionRetry(`${input.apiBaseURL ?? apiBaseURL}/api/v1/documents/${input.id}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { error: getAPIErrorMessage(payload, "ไม่สามารถลบเอกสารได้") };
    }
    return {};
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export function getProjectRoute(project: Pick<Project, "id" | "projectCode">): string {
  const publicIdentifier = project.projectCode || project.id;
  return `/project/${encodeURIComponent(publicIdentifier)}`;
}

export function getDocumentRoute(document: Pick<Document, "documentCode" | "projectCode">): string {
  const documentIdentifier = `${document.projectCode}-${document.documentCode}`;
  return `/project/${encodeURIComponent(documentIdentifier)}`;
}

export function splitDocumentTypeOption(value: string): { type: string; subType: string } {
  const [type, ...rest] = value.split("-");
  return {
    type,
    subType: rest.join("-")
  };
}

export function getAPIErrorMessage(payload: APIErrorPayload | null, fallback: string) {
  if (!payload) {
    return fallback;
  }

  const firstError = payload.errors?.[0];
  return firstError?.message || firstError?.error || payload.detail || payload.title || fallback;
}

export type DocumentWorkflowAction = "submitted" | "returned" | "signed" | "forwarded" | "approved" | "cancelled";

export async function performDocumentWorkflowAction(input: {
  apiBaseURL?: string;
  documentId: string;
  action: DocumentWorkflowAction;
  message?: string;
  files?: File[];
}): Promise<{ filing?: Filing; error?: string }> {
  try {
    const formData = new FormData();
    formData.set("action", input.action);
    if (input.message?.trim()) {
      formData.set("message", input.message.trim());
    }
    for (const file of input.files ?? []) {
      formData.append("files", file);
    }

    const response = await fetchWithSessionRetry(
      `${input.apiBaseURL ?? apiBaseURL}/api/v1/documents/${input.documentId}/workflow`,
      {
        method: "PATCH",
        body: formData
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return {
        error: getAPIErrorMessage(payload, "ไม่สามารถดำเนินการได้")
      };
    }

    const payload = (await response.json()) as { filing?: Filing };
    return { filing: payload.filing };
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function getProjectMembersClient(
  projectId: string,
  input?: { apiBaseURL?: string }
): Promise<{ members: ProjectMember[]; error?: string }> {
  try {
    const response = await fetchWithSessionRetry(
      `${input?.apiBaseURL ?? apiBaseURL}/api/v1/projects/${projectId}/members`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { members: [], error: getAPIErrorMessage(payload, "ไม่สามารถโหลดรายชื่อผู้เข้าถึงได้") };
    }

    const payload = (await response.json()) as { members?: ProjectMember[] };
    return { members: payload.members ?? [] };
  } catch {
    return { members: [], error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function addProjectMember(input: {
  apiBaseURL?: string;
  projectId: string;
  studentId: string;
  permission?: ProjectMemberPermission;
}): Promise<{ member?: ProjectMember; error?: string }> {
  try {
    const response = await fetchWithSessionRetry(
      `${input.apiBaseURL ?? apiBaseURL}/api/v1/projects/${input.projectId}/members`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: input.studentId, permission: input.permission })
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { error: getAPIErrorMessage(payload, "ไม่สามารถเพิ่มผู้เข้าถึงได้") };
    }

    const payload = (await response.json()) as { member?: ProjectMember };
    return { member: payload.member };
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function updateProjectMemberPermission(input: {
  apiBaseURL?: string;
  projectId: string;
  userId: string;
  permission: ProjectMemberPermission;
}): Promise<{ member?: ProjectMember; error?: string }> {
  try {
    const response = await fetchWithSessionRetry(
      `${input.apiBaseURL ?? apiBaseURL}/api/v1/projects/${input.projectId}/members/${input.userId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permission: input.permission })
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { error: getAPIErrorMessage(payload, "ไม่สามารถเปลี่ยนสิทธิ์การเข้าถึงได้") };
    }

    const payload = (await response.json()) as { member?: ProjectMember };
    return { member: payload.member };
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function removeProjectMember(input: {
  apiBaseURL?: string;
  projectId: string;
  userId: string;
}): Promise<{ error?: string }> {
  try {
    const response = await fetchWithSessionRetry(
      `${input.apiBaseURL ?? apiBaseURL}/api/v1/projects/${input.projectId}/members/${input.userId}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return { error: getAPIErrorMessage(payload, "ไม่สามารถลบผู้เข้าถึงได้") };
    }

    return {};
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}
