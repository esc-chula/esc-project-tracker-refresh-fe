"use client";

import { useState, useTransition } from "react";
import type { CurrentUser, Project } from "@/lib/api";

type ProjectDashboardProps = {
  apiBaseURL: string;
  currentUser: CurrentUser;
  initialProjects: Project[];
};

type FormState = {
  name: string;
  projectCode: string;
  type: string;
  reserveDate: string;
  detail: string;
};

const initialFormState: FormState = {
  name: "",
  projectCode: "",
  type: "",
  reserveDate: "",
  detail: ""
};

export function ProjectDashboard({
  apiBaseURL,
  currentUser,
  initialProjects
}: ProjectDashboardProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    startTransition(async () => {
      try {
        const response = await fetch(`${apiBaseURL}/api/v1/projects`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: form.name,
            projectCode: form.projectCode,
            type: form.type,
            reserveDate: form.reserveDate || undefined,
            detail: form.detail
          })
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { detail?: string; title?: string }
            | null;
          setErrorMessage(payload?.detail || payload?.title || "Unable to create project");
          return;
        }

        const payload = (await response.json()) as { project: Project };
        setProjects((currentProjects) => [payload.project, ...currentProjects]);
        setForm(initialFormState);
        setSuccessMessage("Project created");
      } catch {
        setErrorMessage("Unable to reach the API");
      }
    });
  }

  return (
    <section className="dashboard">
      <div className="dashboardHeader">
        <div className="panel">
          <span>Signed in</span>
          <strong>{currentUser.displayName || currentUser.email}</strong>
          <small>
            {currentUser.email} · {currentUser.role}
          </small>
        </div>
        <div className="panel">
          <span>Projects</span>
          <strong>{projects.length}</strong>
          <small>Authenticated CRUD slice is now active.</small>
        </div>
      </div>

      <div className="workspace">
        <form className="composer" onSubmit={handleSubmit}>
          <p className="sectionEyebrow">Create Project</p>
          <label>
            <span>Name</span>
            <input
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="ESC Project Tracker Revamp"
            />
          </label>
          <label>
            <span>Project Code</span>
            <input
              value={form.projectCode}
              onChange={(event) => updateField("projectCode", event.target.value)}
              placeholder="PRJ-001"
            />
          </label>
          <label>
            <span>Type</span>
            <input
              value={form.type}
              onChange={(event) => updateField("type", event.target.value)}
              placeholder="internal"
            />
          </label>
          <label>
            <span>Reserve Date</span>
            <input
              type="date"
              value={form.reserveDate}
              onChange={(event) => updateField("reserveDate", event.target.value)}
            />
          </label>
          <label>
            <span>Detail</span>
            <textarea
              rows={4}
              value={form.detail}
              onChange={(event) => updateField("detail", event.target.value)}
              placeholder="Initial revamp scope"
            />
          </label>
          <button className="loginLink" disabled={isPending} type="submit">
            {isPending ? "Creating..." : "Create Project"}
          </button>
          {errorMessage ? <p className="formMessage error">{errorMessage}</p> : null}
          {successMessage ? <p className="formMessage success">{successMessage}</p> : null}
        </form>

        <div className="projectFeed">
          <p className="sectionEyebrow">Your Projects</p>
          {projects.length === 0 ? (
            <div className="panel">
              <span>Empty</span>
              <strong>No projects yet</strong>
              <small>Create one to confirm the auth-to-Mongo flow end to end.</small>
            </div>
          ) : (
            projects.map((project) => (
              <article className="projectCard" key={project.id}>
                <div className="projectMeta">
                  <span>{project.status}</span>
                  <span>{project.type || "untyped"}</span>
                </div>
                <h2>{project.name}</h2>
                <p>{project.detail || "No detail yet."}</p>
                <div className="projectFacts">
                  <small>{project.projectCode || "No project code"}</small>
                  <small>{project.reserveDate || "No reserve date"}</small>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
