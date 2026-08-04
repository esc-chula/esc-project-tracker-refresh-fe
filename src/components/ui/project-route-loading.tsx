"use client";

import { usePathname } from "next/navigation";
import { AppContentSection } from "@/components/app-shell";
import { DocumentsExplorer } from "@/components/documents-explorer";
import type { DocumentExplorerRow } from "@/lib/document-view";

const EMPTY_DOCUMENTS: DocumentExplorerRow[] = [];

function Spinner() {
  return <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-500" />;
}

export function ProjectRouteLoading() {
  const pathname = usePathname();
  const slug = decodeURIComponent(pathname.slice("/project/".length));

  if (slug.includes("-")) {
    return (
      <AppContentSection className="overflow-visible rounded-none bg-transparent p-0 md:p-0 xl:p-0">
        <div className="flex min-h-full flex-col">
          <section className="flex min-h-full flex-1 flex-col rounded-[20px] bg-white px-8 pb-10 pt-8">
            <div className="flex min-h-[420px] items-center justify-center">
              <Spinner />
            </div>
          </section>
        </div>
      </AppContentSection>
    );
  }

  return (
    <AppContentSection>
      <DocumentsExplorer
        createButtonLabel="สร้างเอกสารใหม่"
        documents={EMPTY_DOCUMENTS}
        emptyText="ไม่พบเอกสาร"
        hideProjectTypeFilter
        isLoading
        pageSizeOptions={[10, 20, 50]}
        searchPlaceholder="ค้นหาโครงการหรือเอกสาร"
        searchScope="all"
      />
    </AppContentSection>
  );
}
