"use client";

import { useMemo, useState } from "react";
import { FileSearch, FolderOpen } from "lucide-react";
import { getProjectRoute, type Project } from "@/lib/api";
import { ProjectCard } from "@/components/project-card";
import { DocumentTable } from "@/components/ui/document-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSearchBar } from "@/components/ui/page-search-bar";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PageSectionHeader } from "@/components/ui/page-section-header";
import type { DocumentExplorerRow } from "@/lib/document-view";
import { getRecentItems, type RecentItem } from "@/lib/recent-items";
import { buildGlobalSearchItems } from "@/lib/search-items";

type HomePageClientProps = {
  initialProjects: Project[];
  initialDocuments: DocumentExplorerRow[];
};

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export function HomePageClient({ initialProjects, initialDocuments }: HomePageClientProps) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [recentItems] =useState<RecentItem[]>(() => getRecentItems());

  const pagedDocuments = useMemo(
    () => initialDocuments.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, initialDocuments, pageSize]
  );

  const latestProjects = useMemo(() => initialProjects.slice(0, 4), [initialProjects]);
  const searchItems = useMemo(
    () => buildGlobalSearchItems({ projects: initialProjects, documents: initialDocuments }),
    [initialDocuments, initialProjects]
  );

  return (
    <div className="space-y-8">
      <PageSearchBar
        emptyRecentText="ยังไม่มีรายการล่าสุด"
        onChange={setQuery}
        placeholder="ค้นหาโครงการหรือเอกสาร"
        recentItems={recentItems}
        searchItems={searchItems}
        searchScope="all"
        value={query}
      />

      <section>
        <PageSectionHeader
          href="/projects"
          icon={<FolderOpen className="h-5 w-5 text-black md:h-6 md:w-6" />}
          linkLabel="ดูโครงการทั้งหมด"
          title="โครงการล่าสุด"
        />

        {latestProjects.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {latestProjects.map((project) => (
              <ProjectCard
                code={project.projectCode}
                compact
                href={getProjectRoute(project)}
                key={project.id}
                title={project.name}
              />
            ))}
          </div>
        ) : (
          <EmptyState className="min-h-[120px]">ไม่พบโครงการ</EmptyState>
        )}
      </section>

      <section>
        <PageSectionHeader
          href="/documents"
          icon={<FileSearch className="h-5 w-5 text-black md:h-6 md:w-6" />}
          linkLabel="ดูเอกสารทั้งหมด"
          title="เอกสารล่าสุด"
        />

        <div className="hidden md:block">
          <DocumentTable
            documents={initialDocuments.slice(0, 4)}
            emptyText="ไม่พบเอกสาร"
          />
        </div>

        <div className="space-y-5 md:hidden">
          <DocumentTable
            documents={pagedDocuments}
            emptyText="ไม่พบเอกสาร"
          />
          {initialDocuments.length > 0 ? (
            <PaginationControls
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              totalItems={initialDocuments.length}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
