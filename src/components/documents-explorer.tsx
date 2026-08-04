"use client";

import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DocumentProcessLink } from "@/components/ui/document-process-link";
import { DocumentTable } from "@/components/ui/document-table";
import { MultiFilterDropdown } from "@/components/ui/multi-filter-dropdown";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PageSearchBar, type SearchScope } from "@/components/ui/page-search-bar";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { SortControls, type SortDirection, type SortOption } from "@/components/ui/sort-controls";
import {
  departmentOptions,
  documentStatusOptions,
  documentTypeOptions,
  normalizeDocumentStatus,
  type DocumentExplorerRow
} from "@/lib/document-view";
import type { RecentItem } from "@/lib/recent-items";

type DocumentSortBy = "updatedAt" | "documentCode" | "documentName";

const documentSortOptions = [
  { value: "updatedAt", label: "เวลา" },
  { value: "documentCode", label: "รหัสเอกสาร" },
  { value: "documentName", label: "ชื่อเอกสาร" }
] satisfies readonly SortOption<DocumentSortBy>[];

function getDocumentSortValue(document: DocumentExplorerRow, sortBy: DocumentSortBy) {
  if (sortBy === "updatedAt") return new Date(document.updatedAt).getTime();
  if (sortBy === "documentCode") return `${document.projectCode}-${document.documentCode}`;
  return document.name || "";
}

export function DocumentsExplorer({
  isLoading = false,
  documents,
  searchScope,
  searchPlaceholder,
  searchItems = [],
  emptyText,
  createButtonLabel,
  onCreateClick,
  afterFiltersContent,
  leadingAction,
  hideProjectTypeFilter = false,
  recentItems = [],
  pageSizeOptions
}: {
  isLoading?: boolean;
  documents: DocumentExplorerRow[];
  searchScope: SearchScope;
  searchPlaceholder: string;
  searchItems?: RecentItem[];
  emptyText: string;
  createButtonLabel?: string;
  onCreateClick?: () => void;
  afterFiltersContent?: React.ReactNode;
  leadingAction?: React.ReactNode;
  hideProjectTypeFilter?: boolean;
  recentItems?: RecentItem[];
  pageSizeOptions?: readonly number[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>([]);
  const [selectedDocumentStatuses, setSelectedDocumentStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<DocumentSortBy>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions?.[0] ?? 0);

  useEffect(() => {
    if (pageSizeOptions?.length) {
      setPageSize(pageSizeOptions[0]);
    }
  }, [pageSizeOptions]);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const nextDocuments = documents.filter((document) => {
      const matchesDepartment =
        hideProjectTypeFilter ||
        selectedDepartments.length === 0 ||
        selectedDepartments.includes(document.projectType);
      const matchesType =
        selectedDocumentTypes.length === 0 ||
        selectedDocumentTypes.includes(document.subType ? `${document.type}-${document.subType}` : document.type) ||
        selectedDocumentTypes.includes(document.type);
      const matchesStatus =
        selectedDocumentStatuses.length === 0 ||
        selectedDocumentStatuses.includes(normalizeDocumentStatus(document.status));
      const matchesSearch =
        normalizedQuery.length === 0 ||
        [
          document.projectCode,
          document.projectName,
          document.documentCode,
          document.name,
          `${document.projectCode}-${document.documentCode}`
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesDepartment && matchesType && matchesStatus && matchesSearch;
    });

    nextDocuments.sort((left, right) => {
      const multiplier = sortDirection === "asc" ? 1 : -1;
      const leftValue = getDocumentSortValue(left, sortBy);
      const rightValue = getDocumentSortValue(right, sortBy);

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return (leftValue - rightValue) * multiplier;
      }

      return String(leftValue).localeCompare(String(rightValue), "th") * multiplier;
    });

    return nextDocuments;
  }, [
    documents,
    hideProjectTypeFilter,
    searchQuery,
    selectedDepartments,
    selectedDocumentStatuses,
    selectedDocumentTypes,
    sortBy,
    sortDirection
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [hideProjectTypeFilter, pageSize, searchQuery, selectedDepartments, selectedDocumentStatuses, selectedDocumentTypes, sortBy, sortDirection]);

  const paginatedDocuments = useMemo(() => {
    if (!pageSizeOptions?.length || pageSize <= 0) {
      return filteredDocuments;
    }

    const startIndex = (currentPage - 1) * pageSize;
    return filteredDocuments.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredDocuments, pageSize, pageSizeOptions]);

  return (
    <div className="space-y-8">
      <PageToolbar
        action={
          onCreateClick || leadingAction ? (
            <div className="flex shrink-0 items-center gap-3">
              {leadingAction ?? <DocumentProcessLink />}
              {onCreateClick ? (
                <Button onClick={onCreateClick} type="button" variant="appRed">
                  <Plus className="h-5 w-5" strokeWidth={2.5} />
                  {createButtonLabel}
                </Button>
              ) : null}
            </div>
          ) : undefined
        }
        controls={
          <>
            {!hideProjectTypeFilter ? (
              <MultiFilterDropdown
                onChange={setSelectedDepartments}
                options={departmentOptions}
                placeholder="ประเภทโครงการ"
                popupClassName="w-[340px]"
                selectedValues={selectedDepartments}
              />
            ) : null}

            <MultiFilterDropdown
              onChange={setSelectedDocumentTypes}
              options={documentTypeOptions}
              placeholder="ประเภทเอกสาร"
              popupClassName="w-[340px]"
              selectedValues={selectedDocumentTypes}
            />

            <MultiFilterDropdown
              onChange={setSelectedDocumentStatuses}
              options={documentStatusOptions}
              placeholder="สถานะเอกสาร"
              popupClassName="w-[260px]"
              selectedValues={selectedDocumentStatuses}
            />

            <SortControls
              onSortByChange={setSortBy}
              onSortDirectionChange={setSortDirection}
              options={documentSortOptions}
              sortBy={sortBy}
              sortDirection={sortDirection}
            />
          </>
        }
        search={
          <PageSearchBar
            emptyRecentText="ยังไม่มีรายการล่าสุด"
            onChange={setSearchQuery}
            placeholder={searchPlaceholder}
            recentItems={recentItems}
            searchItems={searchItems}
            searchScope={searchScope}
            value={searchQuery}
          />
        }
      />

      {afterFiltersContent ? <div>{afterFiltersContent}</div> : null}

      <div className="space-y-5">
        <DocumentTable
          documents={paginatedDocuments}
          emptyText={emptyText}
          isLoading={isLoading}
        />
        {pageSizeOptions?.length && filteredDocuments.length > 0 && !isLoading ? (
          <PaginationControls
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            totalItems={filteredDocuments.length}
          />
        ) : null}
      </div>
    </div>
  );
}
