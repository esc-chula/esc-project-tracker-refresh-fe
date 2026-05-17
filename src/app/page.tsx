import { getHealth } from "@/lib/api";

export default async function HomePage() {
  const health = await getHealth();

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">ESC Project Tracker Refresh</p>
        <h1>Revamp foundation is ready for the first vertical slice.</h1>
        <p className="lede">
          The next target is Google login, app-owned sessions, and project
          create/list through the Go API.
        </p>
        <div className="panel">
          <span>API health</span>
          <strong>{health.ok ? "Connected" : "Waiting for API"}</strong>
          <small>{health.message}</small>
        </div>
      </section>
    </main>
  );
}
