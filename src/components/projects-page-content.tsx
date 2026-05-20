"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Project } from "@/lib/api";
import { getProjectRoute } from "@/lib/api";
import { ProjectCard } from "@/components/project-card";
import { NewProjectModal } from "@/components/new-project-modal";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
  EmptyTableRow,
  SortableHeaderCell
} from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { MultiFilterDropdown } from "@/components/ui/multi-filter-dropdown";
import { PageSearchBar } from "@/components/ui/page-search-bar";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { type SortDirection, type SortOption, SortControls } from "@/components/ui/sort-controls";
import { ViewToggle } from "@/components/ui/view-toggle";
import { departmentOptions, getDepartmentLabel } from "@/lib/document-view";
import { getRecentItems, type RecentItem } from "@/lib/recent-items";

type ViewMode = "table" | "card";
type ProjectSortKey = "updatedAt" | "projectCode" | "name";

const projectSortOptions: readonly SortOption<ProjectSortKey>[] = [
  { value: "updatedAt", label: "เวลา" },
  { value: "projectCode", label: "รหัสโครงการ" },
  { value: "name", label: "ชื่อโครงการ" }
];

export function ProjectsPageContent({
  apiBaseURL,
  projects
}: {
  apiBaseURL: string;
  projects: Project[];
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recentItems] = useState<RecentItem[]>(() => getRecentItems());
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [sortBy, setSortBy] = useState<ProjectSortKey>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const filteredProjects = useMemo(() => {
    const nextProjects = projects.filter((project) => {
      const matchesDepartment =
        selectedDepartments.length === 0 || selectedDepartments.includes(project.type);

      return matchesDepartment;
    });

    nextProjects.sort((left, right) => {
      const direction = sortDirection === "asc" ? 1 : -1;

      if (sortBy === "updatedAt") {
        return (new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime()) * direction;
      }

      return left[sortBy].localeCompare(right[sortBy]) * direction;
    });

    return nextProjects;
  }, [projects, selectedDepartments, sortBy, sortDirection]);

  function handleTableSort(nextSortBy: ProjectSortKey) {
    if (sortBy === nextSortBy) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(nextSortBy);
    setSortDirection(nextSortBy === "updatedAt" ? "desc" : "asc");
  }

  function getActiveDirection(column: ProjectSortKey) {
    return sortBy === column ? sortDirection : undefined;
  }

  const toolbarControls = (
    <>
      <MultiFilterDropdown
        onChange={setSelectedDepartments}
        options={departmentOptions}
        placeholder="ประเภทโครงการ"
        popupClassName="w-[340px]"
        selectedValues={selectedDepartments}
      />
      {viewMode === "card" ? (
        <SortControls
          onSortByChange={setSortBy}
          onSortDirectionChange={setSortDirection}
          options={projectSortOptions}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
      ) : null}
    </>
  );

  return (
    <>
      <div className="space-y-8">
        <PageToolbar
          action={
            <Button
              className="h-[48px] rounded-2xl bg-carmine px-6 text-base font-semibold text-white hover:bg-red-800"
              onClick={() => setIsCreateModalOpen(true)}
              type="button"
            >
              + เปิดโครงการใหม่
            </Button>
          }
          controls={toolbarControls}
          search={
            <PageSearchBar
              emptyRecentText="ยังไม่มีรายการโครงการล่าสุด"
              onChange={setQuery}
              placeholder="ค้นหาโครงการ"
              recentItems={recentItems}
              searchScope="projects"
              value={query}
            />
          }
          trailing={<ViewToggle onChange={setViewMode} value={viewMode} />}
        />

        {filteredProjects.length > 0 ? (
          viewMode === "card" ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  code={project.projectCode}
                  href={getProjectRoute(project)}
                  key={project.id}
                  subtitle={project.detail || getDepartmentLabel(project.type)}
                  title={project.name}
                />
              ))}
            </div>
          ) : (
            <DataTable>
              <DataTableHead>
                <SortableHeaderCell
                  activeDirection={getActiveDirection("projectCode")}
                  label="รหัสโครงการ"
                  onClick={() => handleTableSort("projectCode")}
                />
                <DataTableHeaderCell>ฝ่าย</DataTableHeaderCell>
                <SortableHeaderCell
                  activeDirection={getActiveDirection("name")}
                  label="ชื่อโครงการ"
                  onClick={() => handleTableSort("name")}
                />
              </DataTableHead>
              <DataTableBody>
                {filteredProjects.map((project) => (
                  <DataTableRow key={project.id}>
                    <DataTableCell className="whitespace-nowrap">
                      <Link className="hover:underline" href={getProjectRoute(project)}>
                        {project.projectCode}
                      </Link>
                    </DataTableCell>
                    <DataTableCell>{getDepartmentLabel(project.type)}</DataTableCell>
                    <DataTableCell>{project.name}</DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          )
        ) : viewMode === "table" ? (
          <DataTable>
            <DataTableHead>
              <SortableHeaderCell
                activeDirection={getActiveDirection("projectCode")}
                label="รหัสโครงการ"
                onClick={() => handleTableSort("projectCode")}
              />
              <DataTableHeaderCell>ฝ่าย</DataTableHeaderCell>
              <SortableHeaderCell
                activeDirection={getActiveDirection("name")}
                label="ชื่อโครงการ"
                onClick={() => handleTableSort("name")}
              />
            </DataTableHead>
            <DataTableBody>
              <EmptyTableRow colSpan={3}>ไม่พบโครงการ</EmptyTableRow>
            </DataTableBody>
          </DataTable>
        ) : (
          <EmptyState>ไม่พบโครงการ</EmptyState>
        )}
      </div>

      <NewProjectModal
        apiBaseURL={apiBaseURL}
        onClose={() => setIsCreateModalOpen(false)}
        open={isCreateModalOpen}
      />
    </>
  );
}
