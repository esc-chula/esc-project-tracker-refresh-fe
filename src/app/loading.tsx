import { AppContentSection } from "@/components/app-shell";
import { PageSearchBar } from "@/components/ui/page-search-bar";
import { PageSectionHeader } from "@/components/ui/page-section-header";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow
} from "@/components/ui/data-table";

const documentColumnWidths = ["10%", "17.5%", "17.5%", "15%", "15%", "7.5%", "12.5%"] as const;

function SpinnerRow({ colSpan }: { colSpan: number }) {
  return (
    <DataTableRow>
      <DataTableCell className="py-16" colSpan={colSpan}>
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-500" />
        </div>
      </DataTableCell>
    </DataTableRow>
  );
}

export default function Loading() {
  return (
    <AppContentSection>
      <div className="space-y-8">
        <PageSearchBar placeholder="ค้นหาโครงการหรือเอกสาร" readOnly searchScope="all" value="" />

        <section>
          <PageSectionHeader
            href="/projects"
            icon={<span className="h-6 w-6 rounded bg-gray-200" />}
            linkLabel="ดูโครงการทั้งหมด"
            title="โครงการล่าสุด"
          />

          <div className="rounded-2xl bg-white">
            <div className="flex min-h-[180px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-500" />
            </div>
          </div>
        </section>

        <section>
          <PageSectionHeader
            href="/documents"
            icon={<span className="h-6 w-6 rounded bg-gray-200" />}
            linkLabel="ดูเอกสารทั้งหมด"
            title="เอกสารล่าสุด"
          />

          <DataTable tableClassName="table-fixed">
            <colgroup>
              {documentColumnWidths.map((width, index) => (
                <col key={`home-loading-document-column-${index}`} style={{ width }} />
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
              <SpinnerRow colSpan={7} />
            </DataTableBody>
          </DataTable>
        </section>
      </div>
    </AppContentSection>
  );
}
