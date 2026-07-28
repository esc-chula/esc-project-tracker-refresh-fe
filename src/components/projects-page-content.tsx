"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { NewProjectModal } from "@/components/new-project-modal";
import { ActionSuccessPopup } from "@/components/ui/action-success-popup";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MultiFilterDropdown } from "@/components/ui/multi-filter-dropdown";
import { PageSearchBar } from "@/components/ui/page-search-bar";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { SortControls, type SortDirection, type SortOption } from "@/components/ui/sort-controls";
import type { Project } from "@/lib/api";
import { getProjectRoute } from "@/lib/api";
import { departmentOptions, getDepartmentLabel } from "@/lib/document-view";
import { getRecentItems, type RecentItem } from "@/lib/recent-items";
import { buildGlobalSearchItems } from "@/lib/search-items";

type ProjectSortKey = "updatedAt" | "projectCode" | "name";

const projectSortOptions = [
  { value: "updatedAt", label: "เวลา" },
  { value: "projectCode", label: "รหัสโครงการ" },
  { value: "name", label: "ชื่อโครงการ" }
] satisfies readonly SortOption<ProjectSortKey>[];

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
  const [sortBy, setSortBy] = useState<ProjectSortKey>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingRoute, setPendingRoute] = useState("");

  const searchItems = useMemo(() => buildGlobalSearchItems({ projects }), [projects]);

  const filteredProjects = useMemo(() => {
    const nextProjects = projects.filter((project) => {
      return selectedDepartments.length === 0 || selectedDepartments.includes(project.type);
    });

    nextProjects.sort((left, right) => {
      const direction = sortDirection === "asc" ? 1 : -1;

      if (sortBy === "updatedAt") {
        return (new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime()) * direction;
      }

      return left[sortBy].localeCompare(right[sortBy], "th") * direction;
    });

    return nextProjects;
  }, [projects, selectedDepartments, sortBy, sortDirection]);

  return (
    <>
      <div className="space-y-8">
        <PageToolbar
          action={
            <Button onClick={() => setIsCreateModalOpen(true)} type="button" variant="appRed">
              <Plus className="h-5 w-5" strokeWidth={2.5} />
              เปิดโครงการใหม่
            </Button>
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

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                code={project.projectCode}
                href={getProjectRoute(project)}
                key={project.id}
                subtitle={getDepartmentLabel(project.type)}
                title={project.name}
              />
            ))}
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
