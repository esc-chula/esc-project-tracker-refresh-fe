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
};

const documentColumnWidths = ["10%", "17.5%", "17.5%", "15%", "15%", "7.5%", "12.5%"] as const;

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
  emptyText
}: DocumentTableProps) {
  const router = useRouter();
  const [visiblePhoneRows, setVisiblePhoneRows] = useState<Record<string, boolean>>({});

  return (
    <DataTable tableClassName="table-fixed">
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
        {documents.length > 0 ? (
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
                <TruncatedText className={getDocumentStatusClassName(document.status)}>{getDocumentDisplayStatusLabel(document.status)}</TruncatedText>
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
  );
}
