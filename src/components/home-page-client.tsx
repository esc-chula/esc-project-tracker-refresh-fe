"use client";

import { useMemo, useState } from "react";
import { FileSearch, FolderOpen } from "lucide-react";
import { getProjectRoute, type CurrentUser, type Project } from "@/lib/api";
import { getRecentItems, type RecentItem } from "@/lib/recent-items";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
  EmptyTableRow
} from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSearchBar } from "@/components/ui/page-search-bar";
import { PageSectionHeader } from "@/components/ui/page-section-header";
import { ProjectCard } from "@/components/project-card";
import {
  formatUpdatedAt,
  getDocumentStatusClassName,
  getDocumentStatusLabel,
  getDocumentTypeLabel,
  type DocumentExplorerRow
} from "@/lib/document-view";

type HomePageClientProps = {
  currentUser: CurrentUser | null;
  initialProjects: Project[];
  initialDocuments: DocumentExplorerRow[];
};

export function HomePageClient({ currentUser, initialProjects, initialDocuments }: HomePageClientProps) {
  const [query, setQuery] = useState("");
  const [recentItems] = useState<RecentItem[]>(() => getRecentItems());

  const latestProjects = useMemo(() => initialProjects.slice(0, 4), [initialProjects]);

  return (
    <div className="space-y-8">
      <PageSearchBar
        emptyRecentText="ยังไม่มีรายการล่าสุด"
        onChange={setQuery}
        placeholder="ค้นหาโครงการหรือเอกสาร"
        recentItems={recentItems}
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

        <DataTable className="overflow-hidden rounded-2xl">
          <DataTableHead>
            <DataTableHeaderCell>รหัสเอกสาร</DataTableHeaderCell>
            <DataTableHeaderCell>ชื่อโครงการ</DataTableHeaderCell>
            <DataTableHeaderCell>ชื่อเอกสาร</DataTableHeaderCell>
            <DataTableHeaderCell>นิสิตผู้รับผิดชอบ</DataTableHeaderCell>
            <DataTableHeaderCell>เบอร์โทรศัพท์</DataTableHeaderCell>
            <DataTableHeaderCell>สถานะ</DataTableHeaderCell>
            <DataTableHeaderCell>อัปเดตล่าสุด</DataTableHeaderCell>
          </DataTableHead>
          <DataTableBody>
            {initialDocuments.length > 0 ? (
              initialDocuments.map((row) => (
                <DataTableRow className="text-sm" key={row.id}>
                  <DataTableCell>{row.projectCode}-{row.documentCode}</DataTableCell>
                  <DataTableCell>{row.projectName}</DataTableCell>
                  <DataTableCell>{row.name || getDocumentTypeLabel(row.type, row.subType)}</DataTableCell>
                  <DataTableCell>{currentUser?.displayName || "-"}</DataTableCell>
                  <DataTableCell>-</DataTableCell>
                  <DataTableCell className={`${getDocumentStatusClassName(row.status)} font-medium`}>
                    {getDocumentStatusLabel(row.status)}
                  </DataTableCell>
                  <DataTableCell className="text-gray-500">{formatUpdatedAt(row.updatedAt)}</DataTableCell>
                </DataTableRow>
              ))
            ) : (
              <EmptyTableRow colSpan={7}>ไม่พบเอกสาร</EmptyTableRow>
            )}
          </DataTableBody>
        </DataTable>
      </section>
    </div>
  );
}
