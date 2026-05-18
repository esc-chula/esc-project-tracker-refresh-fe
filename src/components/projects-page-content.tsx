import Link from "next/link";
import { FolderOpen, Plus, Search as SearchIcon } from "lucide-react";
import type { Project } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProjectsPageContent({ projects }: { projects: Project[] }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-black" />
          <Input
            className="h-[60px] rounded-full border-0 bg-gray-100 pl-16 text-[17px] text-black shadow-none placeholder:text-gray-500 focus-visible:ring-0"
            placeholder="ค้นหาโครงการ"
            readOnly
          />
        </div>
        <Button asChild className="h-[48px] rounded-2xl bg-red-700 px-6 text-[16px] font-semibold text-white hover:bg-red-800">
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            เปิดโครงการใหม่
          </Link>
        </Button>
      </div>

      <section>
        <div className="mb-6 flex items-center gap-3 text-[22px] font-semibold text-black">
          <FolderOpen className="h-6 w-6 text-carmine" />
          <span>โครงการทั้งหมด</span>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {projects.map((project) => (
              <Link href={`/project/${project.id}`} key={project.id}>
                <div className="rounded-2xl bg-gray-100 px-5 py-5 transition hover:bg-gray-200">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[22px] font-bold text-black">{project.projectCode || "NEW"}</div>
                    <div className="text-[13px] text-gray-500">{project.status}</div>
                  </div>
                  <div className="mt-3 line-clamp-1 text-[18px] font-medium text-black">{project.name}</div>
                  <div className="mt-2 line-clamp-2 text-[14px] text-gray-500">{project.detail || "ไม่มีรายละเอียด"}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[260px] items-center justify-center text-center text-[20px] text-gray-500">ไม่พบโครงการ</div>
        )}
      </section>
    </div>
  );
}
