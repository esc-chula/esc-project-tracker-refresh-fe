import { Plus } from "lucide-react";
import { AppContentSection } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DocumentProcessLink } from "@/components/ui/document-process-link";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow
} from "@/components/ui/data-table";
import { PageSearchBar } from "@/components/ui/page-search-bar";
import { PageToolbar } from "@/components/ui/page-toolbar";

const documentColumnWidths = ["10%", "17.5%", "17.5%", "15%", "15%", "7.5%", "12.5%"] as const;

function FilterPill({ label }: { label: string }) {
  return (
    <div className="inline-flex h-9 min-w-[72px] items-center rounded-full bg-gray-100 px-4 text-sm text-black md:h-10 md:min-w-[88px] md:px-5 md:text-base">
      {label}
    </div>
  );
}

export default function Loading() {
  return (
    <AppContentSection>
      <div className="space-y-8">
        <PageToolbar
          action={
            <div className="flex shrink-0 items-center gap-3">
              <DocumentProcessLink />
              <Button type="button" variant="appRed">
                <Plus className="h-5 w-5" strokeWidth={2.5} />
                สร้างเอกสารใหม่
              </Button>
            </div>
          }
          controls={
            <>
              <FilterPill label="ประเภทโครงการ" />
              <FilterPill label="ประเภทเอกสาร" />
              <FilterPill label="สถานะเอกสาร" />
              <FilterPill label="เวลา" />
            </>
          }
          search={
            <PageSearchBar
              placeholder="ค้นหาโครงการหรือเอกสาร"
              readOnly
              searchScope="all"
              value=""
            />
          }
        />

        <DataTable tableClassName="table-fixed">
          <colgroup>
            {documentColumnWidths.map((width, index) => (
              <col key={`document-loading-column-${index}`} style={{ width }} />
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
            <DataTableRow>
              <DataTableCell className="py-16" colSpan={7}>
                <div className="flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-500" />
                </div>
              </DataTableCell>
            </DataTableRow>
          </DataTableBody>
        </DataTable>
      </div>
    </AppContentSection>
  );
}
