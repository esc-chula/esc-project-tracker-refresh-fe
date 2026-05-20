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

export const projectTypeOptions = [
  { value: "10", label: "10xx - โครงการฝ่ายกิจการภายใน" },
  { value: "11", label: "11xx - โครงการฝ่ายศิลปะและวัฒนธรรม" },
  { value: "12", label: "12xx - โครงการฝ่ายกีฬา" },
  { value: "13", label: "13xx - โครงการฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์" },
  { value: "14", label: "14xx - โครงการสวัสดิการนิสิตและสิ่งแวดล้อม" },
  { value: "20", label: "20xx - โครงการฝ่ายกิจการภายนอก" },
  { value: "30", label: "30xx - โครงการฝ่ายนิสิตสัมพันธ์" },
  { value: "40", label: "40xx - โครงการฝ่ายเทคโนโลยี" },
  { value: "50", label: "50xx - โครงการฝ่ายพัฒนาองค์กร" },
  { value: "60", label: "60xx - โครงการฝ่ายประชาสัมพันธ์และการตลาด" },
  { value: "70", label: "70xx - โครงการฝ่ายวิชาการ" },
  { value: "80", label: "80xx - โครงการอื่นๆ ของ กวศ." },
  { value: "90", label: "90xx - โครงการฝ่ายสำนักงานและพัสดุ" }
] as const;

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
