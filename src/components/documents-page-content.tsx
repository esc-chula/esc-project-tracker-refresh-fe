"use client";

import { useMemo, useState } from "react";
import type { CurrentUser, Document, Project } from "@/lib/api";
import { DocumentsExplorer } from "@/components/documents-explorer";
import { NewDocumentModal } from "@/components/new-document-modal";
import type { DocumentExplorerRow } from "@/lib/document-view";
import { getRecentItems, type RecentItem } from "@/lib/recent-items";

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
  const [recentItems] = useState<RecentItem[]>(() => getRecentItems());

  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
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
        ownerDisplayName={currentUser.displayName}
        recentItems={recentItems}
        searchPlaceholder="ค้นหาเอกสาร"
        searchScope="documents"
      />

      <NewDocumentModal
        apiBaseURL={apiBaseURL}
        onClose={() => setIsDocumentModalOpen(false)}
        onCreated={handleDocumentCreated}
        open={isDocumentModalOpen}
        projects={projects}
      />
    </>
  );
}
