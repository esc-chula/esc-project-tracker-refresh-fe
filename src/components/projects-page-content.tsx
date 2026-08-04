"use client";

import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NewProjectModal } from "@/components/new-project-modal";
import { ActionSuccessPopup } from "@/components/ui/action-success-popup";
import { Button } from "@/components/ui/button";
import { DocumentProcessLink } from "@/components/ui/document-process-link";
import { EmptyState } from "@/components/ui/empty-state";
import { MultiFilterDropdown } from "@/components/ui/multi-filter-dropdown";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PageSearchBar } from "@/components/ui/page-search-bar";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { ProjectCard } from "@/components/project-card";
import { SortControls, type SortDirection, type SortOption } from "@/components/ui/sort-controls";
import type { Project } from "@/lib/api";
import { getProjectRoute, getProjectsClient } from "@/lib/api";
import { departmentOptions, getDepartmentLabel } from "@/lib/document-view";
import { getRecentItems, type RecentItem } from "@/lib/recent-items";
import { buildGlobalSearchItems } from "@/lib/search-items";

type ProjectSortKey = "updatedAt" | "projectCode" | "name";

const projectSortOptions = [
  { value: "updatedAt", label: "เวลา" },
  { value: "projectCode", label: "รหัสโครงการ" },
  { value: "name", label: "ชื่อโครงการ" }
] satisfies readonly SortOption<ProjectSortKey>[];

const projectPageSizeOptions = [9, 18, 36] as const;
const EMPTY_PROJECTS: Project[] = [];

export function ProjectsPageContent({
  apiBaseURL,
  projects: initialProjectProp
}: {
  apiBaseURL: string;
  projects?: Project[];
}) {
  const initialProjects = initialProjectProp ?? EMPTY_PROJECTS;
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(initialProjects.length === 0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recentItems] = useState<RecentItem[]>(() => getRecentItems());
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<ProjectSortKey>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingRoute, setPendingRoute] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof projectPageSizeOptions)[number]>(projectPageSizeOptions[0]);

  useEffect(() => {
    if (initialProjects.length > 0) {
      setProjects(initialProjects);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    void getProjectsClient({ apiBaseURL }).then((nextProjects) => {
      if (!cancelled) {
        setProjects(nextProjects);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [apiBaseURL, initialProjects]);

  const searchItems = useMemo(() => buildGlobalSearchItems({ projects }), [projects]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const nextProjects = projects.filter((project) => {
      const matchesDepartment = selectedDepartments.length === 0 || selectedDepartments.includes(project.type);
      const matchesSearch =
        normalizedQuery.length === 0 ||
        [project.projectCode, project.name]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesDepartment && matchesSearch;
    });

    nextProjects.sort((left, right) => {
      const direction = sortDirection === "asc" ? 1 : -1;

      if (sortBy === "updatedAt") {
        return (new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime()) * direction;
      }

      return left[sortBy].localeCompare(right[sortBy], "th") * direction;
    });

    return nextProjects;
  }, [projects, query, selectedDepartments, sortBy, sortDirection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, query, selectedDepartments, sortBy, sortDirection]);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProjects.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredProjects, pageSize]);

  return (
    <>
      <div className="space-y-8">
        <PageToolbar
          action={
            <div className="flex shrink-0 items-center gap-3">
              <DocumentProcessLink />
              <Button onClick={() => setIsCreateModalOpen(true)} type="button" variant="appRed">
                <Plus className="h-5 w-5" strokeWidth={2.5} />
                เปิดโครงการใหม่
              </Button>
            </div>
          }
          controls={
            <>
              <MultiFilterDropdown
                onChange={setSelectedDepartments}
                options={departmentOptions}
                placeholder="ประเภทโครงการ"
                popupClassName="w-[340px]"
                selectedValues={selectedDepartments}
              />
              <SortControls
                onSortByChange={setSortBy}
                onSortDirectionChange={setSortDirection}
                options={projectSortOptions}
                sortBy={sortBy}
                sortDirection={sortDirection}
              />
            </>
          }
          search={
            <PageSearchBar
              emptyRecentText="ยังไม่มีรายการล่าสุด"
              onChange={setQuery}
              placeholder="ค้นหาโครงการหรือเอกสาร"
              recentItems={recentItems}
              searchItems={searchItems}
              searchScope="all"
              value={query}
            />
          }
        />

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-500" />
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {paginatedProjects.map((project) => (
                <ProjectCard
                  code={project.projectCode}
                  href={getProjectRoute(project)}
                  key={project.id}
                  subtitle={getDepartmentLabel(project.type)}
                  title={project.name}
                />
              ))}
            </div>
            <PaginationControls
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={(nextPageSize) => setPageSize(nextPageSize as (typeof projectPageSizeOptions)[number])}
              pageSize={pageSize}
              pageSizeOptions={projectPageSizeOptions}
              totalItems={filteredProjects.length}
            />
          </div>
        ) : (
          <EmptyState>ไม่พบโครงการ</EmptyState>
        )}
      </div>

      <NewProjectModal
        apiBaseURL={apiBaseURL}
        onCreated={({ message, route }) => {
          setPendingRoute(route);
          setSuccessMessage(message);
        }}
        onClose={() => setIsCreateModalOpen(false)}
        open={isCreateModalOpen}
      />

      <ActionSuccessPopup
        message={successMessage}
        onClose={() => {
          const nextRoute = pendingRoute;
          setSuccessMessage("");
          setPendingRoute("");
          if (nextRoute) {
            window.location.href = nextRoute;
          }
        }}
        open={Boolean(successMessage)}
      />
    </>
  );
}
