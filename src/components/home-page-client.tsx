"use client";

import { useMemo, useState } from "react";
import { FileSearch, FolderOpen } from "lucide-react";
import { getProjectRoute, type Project } from "@/lib/api";
import { ProjectCard } from "@/components/project-card";
import { DocumentTable } from "@/components/ui/document-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSearchBar } from "@/components/ui/page-search-bar";
import { PageSectionHeader } from "@/components/ui/page-section-header";
import type { DocumentExplorerRow } from "@/lib/document-view";
import { getRecentItems, type RecentItem } from "@/lib/recent-items";
import { buildGlobalSearchItems } from "@/lib/search-items";

type HomePageClientProps = {
  initialProjects: Project[];
  initialDocuments: DocumentExplorerRow[];
};

export function HomePageClient({ initialProjects, initialDocuments }: HomePageClientProps) {
  const [query, setQuery] = useState("");
  const [recentItems] = useState<RecentItem[]>(() => getRecentItems());

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
          icon={<FolderOpen className="h-6 w-6 text-black" />}
          linkLabel="ดูโครงการทั้งหมด"
          title="โครงการล่าสุด"
        />

        {latestProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
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
          icon={<FileSearch className="h-6 w-6 text-black" />}
          linkLabel="ดูเอกสารทั้งหมด"
          title="เอกสารล่าสุด"
        />

        <DocumentTable
          documents={initialDocuments}
          emptyText="ไม่พบเอกสาร"
        />
      </section>
    </div>
  );
}
