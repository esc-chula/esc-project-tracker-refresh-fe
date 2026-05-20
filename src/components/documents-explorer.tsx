"use client";

import { useMemo, useState } from "react";
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
import { MultiFilterDropdown } from "@/components/ui/multi-filter-dropdown";
import { PageSearchBar } from "@/components/ui/page-search-bar";
import { PageToolbar } from "@/components/ui/page-toolbar";
import type { RecentItem } from "@/lib/recent-items";
import {
  departmentOptions,
  documentStatusOptions,
  documentTypeOptions,
  formatUpdatedAt,
  getDocumentStatusClassName,
  getDocumentStatusLabel,
  getDocumentTypeLabel,
  type DocumentExplorerRow
} from "@/lib/document-view";

type DocumentSortKey = "documentCode" | "projectName" | "name" | "status" | "updatedAt";

export function DocumentsExplorer({
  documents,
  ownerDisplayName,
  searchScope,
  searchPlaceholder,
  emptyText,
  createButtonLabel,
  onCreateClick,
  afterFiltersContent,
  recentItems = []
}: {
  documents: DocumentExplorerRow[];
  ownerDisplayName: string;
  searchScope: "documents" | "project-documents";
  searchPlaceholder: string;
  emptyText: string;
  createButtonLabel?: string;
  onCreateClick?: () => void;
  afterFiltersContent?: React.ReactNode;
  recentItems?: RecentItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>([]);
  const [selectedDocumentStatuses, setSelectedDocumentStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<DocumentSortKey>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filteredDocuments = useMemo(() => {
    const nextDocuments = documents.filter((document) => {
      const matchesDepartment =
        selectedDepartments.length === 0 || selectedDepartments.includes(document.projectType);
      const matchesType =
        selectedDocumentTypes.length === 0 ||
        selectedDocumentTypes.includes(document.subType ? `${document.type}-${document.subType}` : document.type) ||
        selectedDocumentTypes.includes(document.type);
      const matchesStatus =
        selectedDocumentStatuses.length === 0 || selectedDocumentStatuses.includes(document.status);

      return matchesDepartment && matchesType && matchesStatus;
    });

    nextDocuments.sort((left, right) => {
      const direction = sortDirection === "asc" ? 1 : -1;

      if (sortBy === "updatedAt") {
        return (new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime()) * direction;
      }

      if (sortBy === "documentCode") {
        return (
          `${left.projectCode}-${left.documentCode}`.localeCompare(`${right.projectCode}-${right.documentCode}`) *
          direction
        );
      }

      return left[sortBy].localeCompare(right[sortBy]) * direction;
    });

    return nextDocuments;
  }, [
    documents,
    selectedDepartments,
    selectedDocumentStatuses,
    selectedDocumentTypes,
    sortBy,
    sortDirection
  ]);

  function handleTableSort(nextSortBy: DocumentSortKey) {
    if (sortBy === nextSortBy) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(nextSortBy);
    setSortDirection(nextSortBy === "updatedAt" ? "desc" : "asc");
  }

  function getActiveDirection(column: DocumentSortKey) {
    return sortBy === column ? sortDirection : undefined;
  }

  return (
    <div className="space-y-8">
      <PageToolbar
        action={
          onCreateClick ? (
            <Button
              className="h-[48px] rounded-2xl bg-carmine px-6 text-base font-semibold text-white hover:bg-red-800"
              onClick={onCreateClick}
              type="button"
            >
              + {createButtonLabel}
            </Button>
          ) : undefined
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
          </>
        }
        search={
          <PageSearchBar
            emptyRecentText="ยังไม่มีรายการเอกสารล่าสุด"
            onChange={setSearchQuery}
            placeholder={searchPlaceholder}
            recentItems={recentItems}
            searchScope={searchScope}
            value={searchQuery}
          />
        }
      />

      {afterFiltersContent ? <div>{afterFiltersContent}</div> : null}

      <DataTable>
        <DataTableHead>
          <SortableHeaderCell
            activeDirection={getActiveDirection("documentCode")}
            label="รหัสเอกสาร"
            onClick={() => handleTableSort("documentCode")}
          />
          <SortableHeaderCell
            activeDirection={getActiveDirection("projectName")}
            label="ชื่อโครงการ"
            onClick={() => handleTableSort("projectName")}
          />
          <SortableHeaderCell
            activeDirection={getActiveDirection("name")}
            label="ชื่อเอกสาร"
            onClick={() => handleTableSort("name")}
          />
          <DataTableHeaderCell>นิสิตผู้รับผิดชอบ</DataTableHeaderCell>
          <DataTableHeaderCell>เบอร์โทรศัพท์</DataTableHeaderCell>
          <SortableHeaderCell
            activeDirection={getActiveDirection("status")}
            label="สถานะ"
            onClick={() => handleTableSort("status")}
          />
          <SortableHeaderCell
            activeDirection={getActiveDirection("updatedAt")}
            label="อัปเดตล่าสุด"
            onClick={() => handleTableSort("updatedAt")}
          />
        </DataTableHead>
        <DataTableBody>
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((document) => (
              <DataTableRow key={document.id}>
                <DataTableCell className="whitespace-nowrap">
                  {document.projectCode}-{document.documentCode}
                </DataTableCell>
                <DataTableCell className="max-w-[250px] truncate">{document.projectName}</DataTableCell>
                <DataTableCell className="max-w-[250px] truncate">
                  {document.name || getDocumentTypeLabel(document.type, document.subType)}
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap">{ownerDisplayName}</DataTableCell>
                <DataTableCell className="whitespace-nowrap">-</DataTableCell>
                <DataTableCell className={`whitespace-nowrap ${getDocumentStatusClassName(document.status)}`}>
                  {getDocumentStatusLabel(document.status)}
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap text-gray-500">
                  {formatUpdatedAt(document.updatedAt)}
                </DataTableCell>
              </DataTableRow>
            ))
          ) : (
            <EmptyTableRow colSpan={7}>{emptyText}</EmptyTableRow>
          )}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
