import { ProjectDashboard } from "@/components/project-dashboard";
import { getCurrentUser, getGoogleLoginURL, getHealth, getProjects } from "@/lib/api";
import { cookies } from "next/headers";

export default async function HomePage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const currentUser = await getCurrentUser(cookieHeader);
  const projects = currentUser ? await getProjects(cookieHeader) : [];
  const health = await getHealth();
  const googleLoginURL = getGoogleLoginURL();
  const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">ESC Project Tracker Refresh</p>
        <h1>Revamp foundation is ready for the first vertical slice.</h1>
        <p className="lede">
          The next target is Google login, app-owned sessions, and project
          create/list through the Go API.
        </p>
        <a className="loginLink" href={googleLoginURL}>
          Continue with Google
        </a>
        <div className="panel">
          <span>API health</span>
          <strong>{health.ok ? "Connected" : "Waiting for API"}</strong>
          <small>{health.message}</small>
        </div>
        {currentUser ? (
          <ProjectDashboard
            apiBaseURL={apiBaseURL}
            currentUser={currentUser}
            initialProjects={projects}
          />
        ) : null}
      </section>
    </main>
  );
}
