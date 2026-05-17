"use client";

import { useState, useTransition } from "react";
import type { Project } from "@/lib/api";
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
                projectCode: project.projectCode,
                name: project.name,
                type: project.type,
                reserveDate: project.reserveDate || undefined,
                detail: project.detail
              }
            : {
                projectCode: project.projectCode,
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
          setErrorMessage(
            getAPIErrorMessage(payload, mode === "create" ? "ไม่สามารถเปิดโครงการใหม่ได้" : "ไม่สามารถบันทึกข้อมูลโครงการได้")
          );
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
      <section className="rounded-3xl bg-[#f8f8fb] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-[28px] font-bold text-black">
              {project.name || (mode === "create" ? "เปิดโครงการใหม่" : "โครงการ")}
            </div>
            <div className="mt-2 text-[15px] text-[#666]">{project.projectCode || "ไม่มีรหัสโครงการ"}</div>
          </div>
          <div className="rounded-full bg-[#f1f2f7] px-4 py-2 text-[14px] text-[#6f1018]">{project.status || "draft"}</div>
        </div>

        <form className="grid grid-cols-1 gap-4 xl:grid-cols-2" onSubmit={handleSubmit}>
          <Input
            className="h-12 rounded-xl border-[#dddddd] bg-white text-[15px]"
            value={project.projectCode}
            onChange={(event) => updateField("projectCode", event.target.value)}
            placeholder="รหัสโครงการ"
          />
          <Input
            className="h-12 rounded-xl border-[#dddddd] bg-white text-[15px]"
            value={project.status}
            onChange={(event) => updateField("status", event.target.value)}
            placeholder="สถานะ"
            readOnly={mode === "create"}
          />
          <Input
            className="h-12 rounded-xl border-[#dddddd] bg-white text-[15px] xl:col-span-2"
            value={project.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="ชื่อโครงการ"
          />
          <Input
            className="h-12 rounded-xl border-[#dddddd] bg-white text-[15px]"
            value={project.type}
            onChange={(event) => updateField("type", event.target.value)}
            placeholder="ประเภทโครงการ"
          />
          <Input
            className="h-12 rounded-xl border-[#dddddd] bg-white text-[15px]"
            type="date"
            value={project.reserveDate || ""}
            onChange={(event) => updateField("reserveDate", event.target.value)}
          />
          <textarea
            className="min-h-[140px] rounded-xl border border-[#dddddd] bg-white px-4 py-3 text-[15px] outline-none xl:col-span-2"
            value={project.detail}
            onChange={(event) => updateField("detail", event.target.value)}
            placeholder="รายละเอียดโครงการ"
          />
          <div className="flex items-center gap-4 xl:col-span-2">
            <Button className="h-12 rounded-xl bg-[#6f1018] px-8 text-[15px] hover:bg-[#5a0d14]" disabled={isPending} type="submit">
              {isPending ? (mode === "create" ? "กำลังเปิดโครงการ..." : "กำลังบันทึก...") : mode === "create" ? "เปิดโครงการใหม่" : "บันทึกข้อมูล"}
            </Button>
            {successMessage ? <div className="text-[14px] font-medium text-[#0b7a34]">{successMessage}</div> : null}
            {errorMessage ? <div className="text-[14px] font-medium text-[#d13333]">{errorMessage}</div> : null}
          </div>
        </form>
      </section>
    </div>
  );
}
