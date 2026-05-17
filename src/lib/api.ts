type HealthResult = {
  ok: boolean;
  message: string;
};

const apiBaseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export async function getHealth(): Promise<HealthResult> {
  try {
    const response = await fetch(`${apiBaseURL}/healthz`, {
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
