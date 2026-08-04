"use client";

import { usePathname } from "next/navigation";
import { AppContentSection } from "@/components/app-shell";
import { DocumentsExplorer } from "@/components/documents-explorer";
import type { DocumentExplorerRow } from "@/lib/document-view";

const EMPTY_DOCUMENTS: DocumentExplorerRow[] = [];

export function ProjectRouteLoading() {
  const pathname = usePathname();
  const slug = decodeURIComponent(pathname.slice("/project/".length));

  if (slug.includes("-")) {
    return null;
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
