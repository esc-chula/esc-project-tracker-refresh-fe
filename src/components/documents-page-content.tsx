"use client";

import { useMemo, useState } from "react";
import type { CurrentUser, Document, Project } from "@/lib/api";
import { DocumentsExplorer } from "@/components/documents-explorer";
import { NewDocumentModal } from "@/components/new-document-modal";
import { ActionSuccessPopup } from "@/components/ui/action-success-popup";
import type { DocumentExplorerRow } from "@/lib/document-view";
import { getRecentItems, type RecentItem } from "@/lib/recent-items";
import { buildGlobalSearchItems } from "@/lib/search-items";

export function DocumentsPageContent({
  apiBaseURL,
  currentUser,
  documents,
  projects
}: {
  apiBaseURL: string;
  currentUser: CurrentUser;
  documents: DocumentExplorerRow[];
  projects: Project[];
}) {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [documentRows, setDocumentRows] = useState(documents);
  const [successMessage, setSuccessMessage] = useState("");
  const [recentItems] = useState<RecentItem[]>(() => getRecentItems());

  const projectById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);
  const searchItems = useMemo(
    () => buildGlobalSearchItems({ projects, documents: documentRows }),
    [documentRows, projects]
  );

  function handleDocumentCreated(document: Document) {
    const project = projectById.get(document.projectId);
    if (!project) {
      return;
    }

    setDocumentRows((currentDocuments) => [
      {
        ...document,
        projectName: project.name,
        projectType: project.type
      },
      ...currentDocuments
    ]);
  }

  return (
    <>
      <DocumentsExplorer
        createButtonLabel="สร้างเอกสารใหม่"
        documents={documentRows}
        emptyText="ไม่พบเอกสาร"
        onCreateClick={() => setIsDocumentModalOpen(true)}
        recentItems={recentItems}
        searchItems={searchItems}
        searchPlaceholder="ค้นหาโครงการหรือเอกสาร"
        searchScope="all"
      />

      <NewDocumentModal
        apiBaseURL={apiBaseURL}
        onClose={() => setIsDocumentModalOpen(false)}
        onCreated={handleDocumentCreated}
        onCreateSuccess={setSuccessMessage}
        open={isDocumentModalOpen}
        projects={projects}
      />

      <ActionSuccessPopup message={successMessage} onClose={() => setSuccessMessage("")} open={Boolean(successMessage)} />
    </>
  );
}
