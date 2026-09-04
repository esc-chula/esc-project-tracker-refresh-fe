"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProjectDocumentsAccordionItem = {
  documents: {
    documentCode: string;
    href: string;
    id: string;
    name: string;
  }[];
  project: {
    activityBudget: number;
    id: string;
    name: string;
    otherBudget: number;
    projectCode: string;
    sponsorBudget: number;
  };
};

type ProjectDocumentsAccordionProps = {
  allProjectsSelected: boolean;
  excludedProjectIds: Set<string>;
  items: ProjectDocumentsAccordionItem[];
  onAllProjectsSelectedChange: (allProjectsSelected: boolean) => void;
  onExcludedProjectIdsChange: (excludedProjectIds: Set<string>) => void;
  onSelectedProjectIdsChange: (selectedProjectIds: Set<string>, selectionMode: "all" | "custom") => void;
  selectedProjectIds: Set<string>;
};

function formatBudget(value: number) {
  return `฿ ${value.toLocaleString("th-TH")}`;
}

function toggleExpandedProjectId(currentExpandedProjectIds: Set<string>, projectId: string) {
  const nextExpandedProjectIds = new Set(currentExpandedProjectIds);

  if (nextExpandedProjectIds.has(projectId)) {
    nextExpandedProjectIds.delete(projectId);
  } else {
    nextExpandedProjectIds.add(projectId);
  }

  return nextExpandedProjectIds;
}

function toggleSelectedProjectId(currentSelectedProjectIds: Set<string>, projectId: string) {
  const nextSelectedProjectIds = new Set(currentSelectedProjectIds);

  if (nextSelectedProjectIds.has(projectId)) {
    nextSelectedProjectIds.delete(projectId);
  } else {
    nextSelectedProjectIds.add(projectId);
  }

  return nextSelectedProjectIds;
}

export function ProjectDocumentsAccordion({
  allProjectsSelected,
  excludedProjectIds,
  items,
  onAllProjectsSelectedChange,
  onExcludedProjectIdsChange,
  onSelectedProjectIdsChange,
  selectedProjectIds
}: ProjectDocumentsAccordionProps) {
  const [openProjectIds, setOpenProjectIds] = useState<Set<string>>(() => new Set());
  const isAllVisibleProjectsSelected =
    (allProjectsSelected && items.every(({ project }) => !excludedProjectIds.has(project.id))) ||
    (items.length > 0 && items.every(({ project }) => selectedProjectIds.has(project.id)));

  function toggleAllVisibleProjects() {
    if (allProjectsSelected) {
      onAllProjectsSelectedChange(false);
      return;
    }

    const nextSelectedProjectIds = new Set(selectedProjectIds);

    if (isAllVisibleProjectsSelected) {
      items.forEach(({ project }) => nextSelectedProjectIds.delete(project.id));
    } else {
      items.forEach(({ project }) => nextSelectedProjectIds.add(project.id));
    }

    onSelectedProjectIdsChange(nextSelectedProjectIds, isAllVisibleProjectsSelected ? "custom" : "all");
  }

  return (
    <div className="min-w-[900px] overflow-hidden">
      <div className="divide-y divide-gray-200">
        <div className="grid grid-cols-[56px_2fr_5fr_3fr_3fr_3fr_3fr_48px] items-center gap-3 px-4 py-2 text-base font-bold text-black">
          <div className="flex items-center justify-start">
            <input
              aria-label="เลือกโครงการทั้งหมด"
              className="h-4 w-4 rounded border-gray-300 accent-red-700"
              checked={isAllVisibleProjectsSelected}
              onChange={toggleAllVisibleProjects}
              type="checkbox"
            />
          </div>
          <span>รหัส</span>
          <span>ชื่อโครงการ</span>
          <span className="text-right">งบกิจการนิสิต</span>
          <span className="text-right">งบสปอนเซอร์</span>
          <span className="text-right">งบอื่นๆ</span>
          <span className="text-right">งบรวม</span>
          <span />
        </div>

        {items.map(({ documents, project }) => {
          const isOpen = openProjectIds.has(project.id);
          const isSelected =
            (allProjectsSelected && !excludedProjectIds.has(project.id)) || selectedProjectIds.has(project.id);
          const totalBudget = project.activityBudget + project.sponsorBudget + project.otherBudget;

          return (
            <Fragment key={project.id}>
              <div
                className={cn(
                  "grid h-12 grid-cols-[56px_2fr_5fr_3fr_3fr_3fr_3fr_48px] items-center gap-3 px-4 text-sm font-normal text-black",
                  isSelected && "bg-red-100"
                )}
              >
                <div className="flex items-center justify-start">
                  <input
                    aria-label={`เลือกโครงการ ${project.projectCode}`}
                    className="h-4 w-4 rounded border-gray-300 accent-red-700"
                    checked={isSelected}
                    onChange={() => {
                      if (allProjectsSelected) {
                        onExcludedProjectIdsChange(toggleSelectedProjectId(excludedProjectIds, project.id));
                        return;
                      }

                      onSelectedProjectIdsChange(toggleSelectedProjectId(selectedProjectIds, project.id), "custom");
                    }}
                    type="checkbox"
                  />
                </div>
                <div className="flex min-w-0 items-center gap-0 ml-[-30px]">
                  <button
                    aria-expanded={isOpen}
                    aria-label={isOpen ? "ย่อรายการเอกสาร" : "ขยายรายการเอกสาร"}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-black transition hover:bg-gray-100"
                    onClick={() => setOpenProjectIds((current) => toggleExpandedProjectId(current, project.id))}
                    type="button"
                  >
                    <ChevronDown className={cn("h-5 w-5 transition-transform", !isOpen && "-rotate-90")} />
                  </button>
                  <span className="min-w-0 truncate">{project.projectCode}</span>
                </div>
                <span className="min-w-0 truncate">{project.name}</span>
                <span className="text-right">{formatBudget(project.activityBudget)}</span>
                <span className="text-right">{formatBudget(project.sponsorBudget)}</span>
                <span className="text-right">{formatBudget(project.otherBudget)}</span>
                <span className="text-right font-semibold text-red-700">{formatBudget(totalBudget)}</span>
                <span />
              </div>

              {isOpen && documents.length > 0
                ? documents.map((document) => (
                    <div
                      className="grid h-12 grid-cols-[56px_2fr_5fr_3fr_3fr_3fr_3fr_48px] items-center gap-3 bg-gray-100 px-4 text-sm font-normal text-black"
                      key={document.id}
                    >
                      <span />
                      <span className="text-black">{document.documentCode}</span>
                      <div className="flex min-w-0 items-center gap-2 text-black">
                        <span className="min-w-0 truncate">{document.name}</span>
                        <Link
                          aria-label={`เปิดเอกสาร ${document.documentCode}`}
                          className="shrink-0 text-black transition hover:text-red-700"
                          href={document.href}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))
                : null}

              {isOpen && documents.length === 0 ? (
                <div className="grid h-12 grid-cols-[56px_2fr_5fr_3fr_3fr_3fr_3fr_48px] items-center gap-3 bg-gray-50 px-4 text-sm text-gray-500">
                  <span />
                  <span />
                  <span className="min-w-0 truncate">ยังไม่มีเอกสารในโครงการนี้</span>
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
