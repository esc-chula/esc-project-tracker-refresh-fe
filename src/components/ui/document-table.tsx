"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { getDocumentRoute } from "@/lib/api";
import {
  formatUpdatedAt,
  getDocumentStatusClassName,
  getDocumentDisplayStatusLabel,
  getDocumentTypeLabel,
  type DocumentExplorerRow
} from "@/lib/document-view";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
  EmptyTableRow
} from "@/components/ui/data-table";

type DocumentTableProps = {
  documents: DocumentExplorerRow[];
  emptyText: string;
  isLoading?: boolean;
};

const documentColumnWidths = ["10%", "15%", "15%", "15%", "15%", "12.5%", "12.5%"] as const;

function TruncatedText({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={`block w-full min-w-0 truncate text-xs md:text-sm ${className ?? ""}`}>{children}</span>;
}

function maskPhone(phone?: string) {
  if (!phone) {
    return "-";
  }
  return `*${phone.slice(-4)}`;
}

export function DocumentTable({
  documents,
  emptyText,
  isLoading = false
}: DocumentTableProps) {
  const router = useRouter();
  const [visiblePhoneRows, setVisiblePhoneRows] = useState<Record<string, boolean>>({});

  return (
    <>
      <div className="space-y-3 md:hidden">
        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-500" />
          </div>
        ) : documents.length > 0 ? (
          documents.map((document) => (
            <button
              className="block w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
              key={document.id}
              onClick={() => router.push(getDocumentRoute(document))}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-semibold text-black">
                  {document.projectCode}-{document.documentCode}
                </span>
                <span className={`shrink-0 text-xs font-medium ${getDocumentStatusClassName(document.displayStatus ?? document.status)}`}>
                  {getDocumentDisplayStatusLabel(document.displayStatus ?? document.status)}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium text-black">
                {document.name || getDocumentTypeLabel(document.type, document.subType)}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500">
                <span className="min-w-0 truncate">{document.owner?.displayName || "-"}</span>
                <span className="shrink-0">{formatUpdatedAt(document.updatedAt)}</span>
              </div>
            </button>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">{emptyText}</div>
        )}
      </div>

      <DataTable className="hidden md:block" tableClassName="table-fixed">
      <colgroup>
        {documentColumnWidths.map((width, index) => (
          <col key={`document-column-${index}`} style={{ width }} />
        ))}
      </colgroup>
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
        {isLoading ? (
          <DataTableRow>
            <DataTableCell className="py-16" colSpan={7}>
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-500" />
              </div>
            </DataTableCell>
          </DataTableRow>
        ) : documents.length > 0 ? (
          documents.map((document) => (
            <DataTableRow
              className="cursor-pointer transition hover:bg-gray-50/80"
              key={document.id}
              onClick={() => router.push(getDocumentRoute(document))}
            >
              <DataTableCell>
                <TruncatedText className="font-medium">{document.projectCode}-{document.documentCode}</TruncatedText>
              </DataTableCell>
              <DataTableCell>
                <TruncatedText>{document.projectName}</TruncatedText>
              </DataTableCell>
              <DataTableCell>
                <TruncatedText>{document.name || getDocumentTypeLabel(document.type, document.subType)}</TruncatedText>
              </DataTableCell>
              <DataTableCell>
                <TruncatedText>{document.owner?.displayName || "-"}</TruncatedText>
              </DataTableCell>
              <DataTableCell>
                <div className="inline-flex max-w-full min-w-0 items-center gap-1">
                  <span className="min-w-0 truncate text-xs md:text-sm">
                    {visiblePhoneRows[document.id] ? document.owner?.phone || "-" : maskPhone(document.owner?.phone)}
                  </span>
                  {document.owner?.phone ? (
                    <button
                      aria-label={visiblePhoneRows[document.id] ? "ซ่อนเบอร์โทรศัพท์" : "แสดงเบอร์โทรศัพท์"}
                      className="shrink-0 rounded-full text-gray-500 transition hover:text-black"
                      onClick={(event) => {
                        event.stopPropagation();
                        setVisiblePhoneRows((currentRows) => ({
                          ...currentRows,
                          [document.id]: !currentRows[document.id]
                        }));
                      }}
                      type="button"
                    >
                      {visiblePhoneRows[document.id] ? (
                        <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2.2} />
                      ) : (
                        <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2.2} />
                      )}
                    </button>
                  ) : null}
                </div>
              </DataTableCell>
              <DataTableCell>
                <TruncatedText className={getDocumentStatusClassName(document.displayStatus ?? document.status)}>{getDocumentDisplayStatusLabel(document.displayStatus ?? document.status)}</TruncatedText>
              </DataTableCell>
              <DataTableCell>
                <TruncatedText className="text-gray-500">{formatUpdatedAt(document.updatedAt)}</TruncatedText>
              </DataTableCell>
            </DataTableRow>
          ))
        ) : (
          <EmptyTableRow colSpan={7}>{emptyText}</EmptyTableRow>
        )}
      </DataTableBody>
      </DataTable>
    </>
  );
}
