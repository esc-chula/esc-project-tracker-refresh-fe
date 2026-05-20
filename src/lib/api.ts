import { documentTypeOptions, projectTypeOptions } from "@/lib/catalog";

type HealthResult = {
  ok: boolean;
  message: string;
};

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: string;
  emailVerified: boolean;
};

export type Project = {
  id: string;
  ownerUserId: string;
  projectCode: string;
  name: string;
  type: string;
  status: string;
  reserveDate?: string;
  detail: string;
  createdAt: string;
  updatedAt: string;
};

export type Document = {
  id: string;
  projectId: string;
  ownerUserId: string;
  projectCode: string;
  documentCode: string;
  name: string;
  type: string;
  subType?: string;
  status: string;
  detail: string;
  createdAt: string;
  updatedAt: string;
};

export { documentTypeOptions, projectTypeOptions };

const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export function getGoogleLoginURL(): string {
  return `${apiBaseURL}/api/v1/auth/google/login`;
}

export async function getHealth(): Promise<HealthResult> {
  try {
    const response = await fetch(`${apiBaseURL}/api/v1/healthz`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `API returned ${response.status}`
      };
    }

    return {
      ok: true,
      message: "Go API /healthz responded successfully"
    };
  } catch {
    return {
      ok: false,
      message: "Start the API with `go run ./cmd`"
    };
  }
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

export async function previewNextProjectCode(projectType: string): Promise<string> {
  if (!projectType) {
    return "";
  }

  const response = await fetch(
    `${apiBaseURL}/api/v1/projects/next-code?type=${encodeURIComponent(projectType)}`,
    {
      cache: "no-store",
      credentials: "include"
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

  const response = await fetch(
    `${apiBaseURL}/api/v1/documents/next-code?type=${encodeURIComponent(documentType)}`,
    {
      cache: "no-store",
      credentials: "include"
    }
  );

  if (!response.ok) {
    throw new Error("ไม่สามารถพรีวิวรหัสเอกสารได้");
  }

  const payload = (await response.json()) as { documentCode?: string };
  return payload.documentCode ?? "";
}

export function getProjectRoute(project: Pick<Project, "id" | "projectCode">): string {
  const publicIdentifier = project.projectCode || project.id;
  return `/project/${encodeURIComponent(publicIdentifier)}`;
}

export function splitDocumentTypeOption(value: string): { type: string; subType: string } {
  const [type, ...rest] = value.split("-");
  return {
    type,
    subType: rest.join("-")
  };
}
