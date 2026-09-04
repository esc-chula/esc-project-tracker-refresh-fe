"use client";

import { useEffect, useMemo, useState } from "react";
import { BudgetDonutChart, type BudgetItem } from "@/components/budget-donut-chart";
import { AppContentSection } from "@/components/app-shell";
import {
  ProjectDocumentsAccordion,
  type ProjectDocumentsAccordionItem
} from "@/components/project-documents-accordion";
import { EmptyState } from "@/components/ui/empty-state";
import { MultiFilterDropdown } from "@/components/ui/multi-filter-dropdown";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PageSearchBar } from "@/components/ui/page-search-bar";
import { SortControls, type SortDirection, type SortOption } from "@/components/ui/sort-controls";
import {
  getFinanceDashboardClient,
  getFinanceSummaryClient,
  type ProjectBudget,
  type FinanceSummaryProject
} from "@/lib/api";
import { departmentOptions } from "@/lib/document-view";

type SummarySortKey = "lastDocumentUpdate" | "projectCode" | "projectName";

const pageSizeOptions = [10, 20, 50] as const;
const academicYears = [2025, 2026, 2027] as const;
const sortOptions = [
  { value: "lastDocumentUpdate", label: "เวลาแก้ไขเอกสารล่าสุด" },
  { value: "projectCode", label: "รหัสโครงการ" },
  { value: "projectName", label: "ชื่อโครงการ" }
] satisfies readonly SortOption<SummarySortKey>[];

function budgetAmount(project: FinanceSummaryProject, source: "esc" | "sponsor" | "other") {
  return (project.budget.sources.find((item) => item.source === source)?.allocatedSatang ?? 0) / 100;
}

function budgetToChartData(budget: ProjectBudget): BudgetItem[] {
  const sourceAmount = (source: "esc" | "sponsor" | "other") =>
    (budget.sources.find((item) => item.source === source)?.allocatedSatang ?? 0) / 100;

  return [
    { category: "studentAffairs", amount: sourceAmount("esc") },
    { category: "sponsor", amount: sourceAmount("sponsor") },
    { category: "others", amount: sourceAmount("other") }
  ];
}

function createItems(projects: FinanceSummaryProject[]): ProjectDocumentsAccordionItem[] {
  return projects.map((project) => ({
    project: {
      activityBudget: budgetAmount(project, "esc"),
      id: project.id,
      name: project.name,
      otherBudget: budgetAmount(project, "other"),
      projectCode: project.projectCode,
      sponsorBudget: budgetAmount(project, "sponsor")
    },
    documents: project.documents.map((document) => ({
      documentCode: `${project.projectCode}-${document.documentCode}`,
      href: `/project/${encodeURIComponent(`${project.projectCode}-${document.documentCode}`)}`,
      id: document.id,
      name: document.name
    }))
  }));
}

export default function FinanceSummaryPage() {
  const [projects, setProjects] = useState<FinanceSummaryProject[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [academicYear, setAcademicYear] = useState<(typeof academicYears)[number]>(2026);
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SummarySortKey>("lastDocumentUpdate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageSize, setPageSize] = useState<(typeof pageSizeOptions)[number]>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(() => new Set());
  const [hasSelectionOverride, setHasSelectionOverride] = useState(false);
  const [yearBudget, setYearBudget] = useState<ProjectBudget | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      setIsLoading(true);
      setError("");
      void getFinanceSummaryClient({
        order: sortDirection,
        pageNum: currentPage,
        pageSize,
        search: query,
        sortBy,
        type: selectedTypes[0],
        year: academicYear
      }).then((result) => {
        if (cancelled) return;
        if (result.error || !result.summary) {
          setProjects([]);
          setTotalProjects(0);
          setSelectedProjectIds(new Set());
          setHasSelectionOverride(false);
          setError(result.error ?? "ไม่สามารถโหลดสรุปงบประมาณได้");
        } else {
          setProjects(result.summary.projects);
          setTotalProjects(result.summary.total);
          setSelectedProjectIds(new Set(result.summary.projects.map((project) => project.id)));
          setHasSelectionOverride(false);
        }
        setIsLoading(false);
      });

    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [academicYear, currentPage, pageSize, query, selectedTypes, sortBy, sortDirection]);

  useEffect(() => {
    let cancelled = false;
    void getFinanceDashboardClient({ year: academicYear }).then((result) => {
      if (!cancelled) {
        setYearBudget(result.dashboard?.budget ?? null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [academicYear]);

  useEffect(() => {
    setCurrentPage(1);
  }, [academicYear, pageSize, query, selectedTypes, sortBy, sortDirection]);

  const accordionItems = useMemo(() => createItems(projects), [projects]);
  const selectedItems = useMemo(
    () => accordionItems.filter(({ project }) => selectedProjectIds.has(project.id)),
    [accordionItems, selectedProjectIds]
  );
  const selectedBudgetData = useMemo<BudgetItem[]>(
    () => [
      { category: "studentAffairs", amount: selectedItems.reduce((total, { project }) => total + project.activityBudget, 0) },
      { category: "sponsor", amount: selectedItems.reduce((total, { project }) => total + project.sponsorBudget, 0) },
      { category: "others", amount: selectedItems.reduce((total, { project }) => total + project.otherBudget, 0) }
    ],
    [selectedItems]
  );
  const isDefaultYearSummary = !query.trim() && selectedTypes.length === 0 && !hasSelectionOverride;
  const donutData = isDefaultYearSummary && yearBudget ? budgetToChartData(yearBudget) : selectedBudgetData;
  const totalBudget = donutData.reduce((total, item) => total + item.amount, 0);

  return (
    <AppContentSection>
      <div className="space-y-7">
        <section>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">สรุปงบประมาณรวม</h1>
              <p className="mt-1">ทั้งหมด {totalProjects} โครงการ</p>
            </div>
            <label className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700">
              <span className="sr-only">ปีการศึกษา</span>
              <select
                className="bg-transparent outline-none"
                onChange={(event) => setAcademicYear(Number(event.target.value) as (typeof academicYears)[number])}
                value={academicYear}
              >
                {academicYears.map((year) => (
                  <option key={year} value={year}>ปี {year + 543}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mx-auto mt-3 max-w-2xl">
            <BudgetDonutChart data={donutData} totalAmount={totalBudget} />
          </div>

          {hasSelectionOverride && selectedProjectIds.size > 0 ? (
            <div className="mx-auto mt-3 flex max-w-sm items-center justify-between rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm">
              <span>เลือกแล้ว {selectedProjectIds.size} โครงการ</span>
              <button
                className="font-medium text-red-700 hover:underline"
                onClick={() => {
                  setSelectedProjectIds(new Set());
                  setHasSelectionOverride(true);
                }}
                type="button"
              >
                ล้างตัวเลือก
              </button>
            </div>
          ) : null}
        </section>

        <div className="flex flex-col gap-3 lg:flex-row">
          <PageSearchBar
            className="flex-1"
            emptyRecentText=""
            onChange={setQuery}
            placeholder="ค้นหาโครงการ"
            recentItems={[]}
            searchItems={[]}
            searchScope="projects"
            value={query}
          />
          <div className="flex flex-wrap gap-3">
            <MultiFilterDropdown
              onChange={(values) => setSelectedTypes(values.slice(-1))}
              options={departmentOptions}
              placeholder="ประเภทโครงการ"
              selectedValues={selectedTypes}
            />
            <SortControls
              onSortByChange={setSortBy}
              onSortDirectionChange={setSortDirection}
              options={sortOptions}
              sortBy={sortBy}
              sortDirection={sortDirection}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-500" />
          </div>
        ) : null}

        {!isLoading && error ? <EmptyState>{error}</EmptyState> : null}
        {!isLoading && !error && accordionItems.length === 0 ? <EmptyState>ไม่พบโครงการ</EmptyState> : null}

        {!isLoading && !error && accordionItems.length > 0 ? (
          <div className="space-y-4 overflow-x-auto">
            <ProjectDocumentsAccordion
              items={accordionItems}
              onSelectedProjectIdsChange={(projectIds) => {
                setSelectedProjectIds(projectIds);
                setHasSelectionOverride(true);
              }}
              selectedProjectIds={selectedProjectIds}
            />
            <PaginationControls
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={(value) => setPageSize(value as (typeof pageSizeOptions)[number])}
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              totalItems={totalProjects}
            />
          </div>
        ) : null}
      </div>
    </AppContentSection>
  );
}
