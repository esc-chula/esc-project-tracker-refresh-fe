"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, FileSearch, FolderOpen, Search as SearchIcon } from "lucide-react";
import { getProjectRoute, type CurrentUser, type Project } from "@/lib/api";
import { Input } from "@/components/ui/input";

type HomePageClientProps = {
  currentUser: CurrentUser | null;
  initialProjects: Project[];
  googleLoginURL: string;
};

type DocumentRow = {
  code: string;
  projectName: string;
  documentName: string;
  owner: string;
  phone: string;
  status: string;
  updatedAt: string;
  color: string;
};

export function HomePageClient({ currentUser, initialProjects, googleLoginURL }: HomePageClientProps) {
  const [query, setQuery] = useState("");

  const filteredProjects = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return initialProjects;
    }

    return initialProjects.filter((project) =>
      [project.projectCode, project.name, project.type, project.detail].join(" ").toLowerCase().includes(keyword)
    );
  }, [initialProjects, query]);

  const latestProjects = filteredProjects.slice(0, 4);

  const documentRows = useMemo<DocumentRow[]>(() => {
    if (!currentUser) {
      return [];
    }

    return latestProjects.map((project, index) => ({
      code: project.projectCode ? `${project.projectCode}-${String(index + 1).padStart(4, "0")}` : `DOC-${index + 1}`,
      projectName: project.name,
      documentName: "จะเริ่มใน Document MVP",
      owner: currentUser.displayName || currentUser.email,
      phone: "-",
      status: "ยังไม่เริ่ม",
      updatedAt: new Date(project.updatedAt).toLocaleDateString("th-TH"),
      color: "text-gray-500"
    }));
  }, [currentUser, latestProjects]);

  return (
    <div className="space-y-8">
      <div className="relative">
        <SearchIcon className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-black" />
        <Input
          className="h-[60px] rounded-full border-0 bg-gray-100 pl-16 text-base text-black shadow-none placeholder:text-gray-500 focus-visible:ring-0"
          placeholder="ค้นหาโครงการหรือเอกสาร"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xl font-semibold text-black">
            <FolderOpen className="h-6 w-6 text-black" />
            <span>โครงการล่าสุด</span>
          </div>
          <Link className="flex items-center gap-2 text-lg text-black" href="/projects">
            ดูโครงการทั้งหมด
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>

        {latestProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            {latestProjects.map((project) => (
              <Link href={getProjectRoute(project)} key={project.id}>
                <div className="rounded-2xl bg-gray-100 px-5 py-4 transition hover:bg-gray-200">
                  <div className="text-2xl font-bold leading-none text-black">{project.projectCode || "NEW"}</div>
                  <div className="mt-3 line-clamp-2 text-sm text-gray-700">{project.name}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[120px] items-center justify-center text-center text-lg text-gray-500">ไม่พบโครงการ</div>
        )}
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xl font-semibold text-black">
            <FileSearch className="h-6 w-6 text-black" />
            <span>เอกสารล่าสุด</span>
          </div>
          <div className="flex items-center gap-2 text-lg text-gray-500">
            ดูเอกสารทั้งหมด
            <ArrowRight className="h-6 w-6" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-300 text-base font-semibold text-black">
                <th className="px-3 py-3">รหัสเอกสาร</th>
                <th className="px-3 py-3">ชื่อโครงการ</th>
                <th className="px-3 py-3">ชื่อเอกสาร</th>
                <th className="px-3 py-3">นิสิตผู้รับผิดชอบ</th>
                <th className="px-3 py-3">เบอร์โทรศัพท์</th>
                <th className="px-3 py-3">สถานะ</th>
                <th className="px-3 py-3">อัปเดตล่าสุด</th>
              </tr>
            </thead>
            <tbody>
              {documentRows.length > 0 ? (
                documentRows.map((row) => (
                  <tr className="border-b border-gray-300 text-sm text-black" key={row.code}>
                    <td className="px-3 py-4">{row.code}</td>
                    <td className="px-3 py-4">{row.projectName}</td>
                    <td className="px-3 py-4">{row.documentName}</td>
                    <td className="px-3 py-4">{row.owner}</td>
                    <td className="px-3 py-4">{row.phone}</td>
                    <td className={`${row.color} px-3 py-4 font-medium`}>{row.status}</td>
                    <td className="px-3 py-4 text-gray-500">{row.updatedAt}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-12 text-center text-lg text-gray-500" colSpan={7}>
                    ไม่พบเอกสาร
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
