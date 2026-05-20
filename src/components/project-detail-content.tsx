"use client";

import { useState, useTransition } from "react";
import type { Project } from "@/lib/api";
import { projectTypeOptions } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ErrorPayload = {
  detail?: string;
  title?: string;
  errors?: Array<{
    message?: string;
    error?: string;
    location?: string;
    value?: unknown;
  }>;
};

function getAPIErrorMessage(payload: ErrorPayload | null, fallback: string) {
  if (!payload) {
    return fallback;
  }

  if (payload.errors && payload.errors.length > 0) {
    const firstError = payload.errors[0];
    return firstError.message || firstError.error || payload.detail || payload.title || fallback;
  }

  return payload.detail || payload.title || fallback;
}

function getProjectTypeLabel(type: string) {
  return projectTypeOptions.find((option) => option.value === type)?.label ?? "เลือกประเภทโครงการ";
}

export function ProjectDetailContent({
  apiBaseURL,
  initialProject,
  mode = "edit"
}: {
  apiBaseURL: string;
  initialProject: Project;
  mode?: "create" | "edit";
}) {
  const [project, setProject] = useState(initialProject);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function updateField(key: keyof Project, value: string) {
    setProject((currentProject) => ({
      ...currentProject,
      [key]: value
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    startTransition(async () => {
      try {
        const endpoint =
          mode === "create" ? `${apiBaseURL}/api/v1/projects` : `${apiBaseURL}/api/v1/projects/${project.id}`;

        const body =
          mode === "create"
            ? {
                name: project.name,
                type: project.type,
                reserveDate: project.reserveDate || undefined,
                detail: project.detail
              }
            : {
                name: project.name,
                type: project.type,
                status: project.status,
                reserveDate: project.reserveDate || undefined,
                detail: project.detail
              };

        const response = await fetch(endpoint, {
          method: mode === "create" ? "POST" : "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as ErrorPayload | null;
          setErrorMessage(getAPIErrorMessage(payload, mode === "create" ? "ไม่สามารถเปิดโครงการใหม่ได้" : "ไม่สามารถบันทึกข้อมูลโครงการได้"));
          return;
        }

        const payload = (await response.json()) as { project: Project };
        setProject(payload.project);
        setSuccessMessage(mode === "create" ? "เปิดโครงการใหม่สำเร็จ" : "บันทึกข้อมูลโครงการสำเร็จ");
      } catch {
        setErrorMessage("ไม่สามารถเชื่อมต่อกับ API ได้");
      }
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gray-50 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-black">{project.name || (mode === "create" ? "เปิดโครงการใหม่" : "โครงการ")}</div>
            <div className="mt-2 text-sm text-gray-500">
              {project.projectCode || (mode === "create" ? "รหัสโครงการจะถูกสร้างอัตโนมัติตามประเภทโครงการ" : "ไม่มีรหัสโครงการ")}
            </div>
          </div>
          <div className="rounded-full bg-gray-50 px-4 py-2 text-sm text-carmine">{project.status || "draft"}</div>
        </div>

        <form className="grid grid-cols-1 gap-4 xl:grid-cols-2" onSubmit={handleSubmit}>
          <div className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-500">
            {mode === "create" ? "ระบบจะสร้างรหัสโครงการอัตโนมัติหลังเลือกประเภทโครงการและบันทึกข้อมูล" : project.projectCode || "ไม่มีรหัสโครงการ"}
          </div>
          <Input
            className="h-12 rounded-xl border-gray-300 bg-white text-sm text-black"
            value={project.status}
            onChange={(event) => updateField("status", event.target.value)}
            placeholder="สถานะ"
            readOnly={mode === "create"}
          />
          <Input
            className="h-12 rounded-xl border-gray-300 bg-white text-sm text-black xl:col-span-2"
            value={project.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="ชื่อโครงการ"
          />
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-black">ประเภทโครงการ</span>
            <select
              className="h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-black outline-none"
              value={project.type}
              onChange={(event) => updateField("type", event.target.value)}
            >
              <option value="">{getProjectTypeLabel("")}</option>
              {projectTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Input
            className="h-12 rounded-xl border-gray-300 bg-white text-sm text-black"
            type="date"
            value={project.reserveDate || ""}
            onChange={(event) => updateField("reserveDate", event.target.value)}
          />
          <textarea
            className="min-h-[140px] rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none xl:col-span-2"
            value={project.detail}
            onChange={(event) => updateField("detail", event.target.value)}
            placeholder="รายละเอียดโครงการ"
          />
          <div className="flex items-center gap-4 xl:col-span-2">
            <Button className="h-12 rounded-xl bg-carmine px-8 text-sm text-white hover:bg-carmine/90" disabled={isPending} type="submit">
              {isPending ? (mode === "create" ? "กำลังเปิดโครงการ..." : "กำลังบันทึก...") : mode === "create" ? "เปิดโครงการใหม่" : "บันทึกข้อมูล"}
            </Button>
            {successMessage ? <div className="text-sm font-medium text-green-700">{successMessage}</div> : null}
            {errorMessage ? <div className="text-sm font-medium text-red-700">{errorMessage}</div> : null}
          </div>
        </form>
      </section>
    </div>
  );
}
