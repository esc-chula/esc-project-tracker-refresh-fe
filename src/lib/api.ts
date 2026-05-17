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

const apiBaseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

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
      message: "Start the API with `go run ./cmd/api`"
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
