import { fetchWithSessionRetry, type Filing } from "@/lib/api";

type APIErrorPayload = {
  detail?: string;
  title?: string;
  errors?: Array<{
    message?: string;
    error?: string;
  }>;
};

function getAPIErrorMessage(payload: APIErrorPayload | null, fallback: string) {
  if (!payload) {
    return fallback;
  }

  const firstError = payload.errors?.[0];
  return firstError?.message || firstError?.error || payload.detail || payload.title || fallback;
}

export async function returnSubmittedFiling(input: {
  apiBaseURL: string;
  documentId: string;
  filingId: string;
  returnMessage?: string;
  files?: File[];
}): Promise<{ filing?: Filing; error?: string }> {
  try {
    const formData = new FormData();
    if (input.returnMessage?.trim()) {
      formData.set("message", input.returnMessage.trim());
    }
    for (const file of input.files ?? []) {
      formData.append("files", file);
    }

    const response = await fetchWithSessionRetry(
      `${input.apiBaseURL}/api/v1/documents/${input.documentId}/filings/${input.filingId}/return`,
      {
        method: "PATCH",
        body: formData
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return {
        error: getAPIErrorMessage(payload, "ไม่สามารถตีกลับ filing ได้")
      };
    }

    const payload = (await response.json()) as { filing?: Filing };
    return { filing: payload.filing };
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}

export async function approveSubmittedFiling(input: {
  apiBaseURL: string;
  documentId: string;
  filingId: string;
  approveMessage?: string;
  files?: File[];
}): Promise<{ filing?: Filing; error?: string }> {
  try {
    const formData = new FormData();
    if (input.approveMessage?.trim()) {
      formData.set("message", input.approveMessage.trim());
    }
    for (const file of input.files ?? []) {
      formData.append("files", file);
    }

    const response = await fetchWithSessionRetry(
      `${input.apiBaseURL}/api/v1/documents/${input.documentId}/filings/${input.filingId}/approve`,
      {
        method: "PATCH",
        body: formData
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as APIErrorPayload | null;
      return {
        error: getAPIErrorMessage(payload, "ไม่สามารถอนุมัติ filing ได้")
      };
    }

    const payload = (await response.json()) as { filing?: Filing };
    return { filing: payload.filing };
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อกับ API ได้" };
  }
}
