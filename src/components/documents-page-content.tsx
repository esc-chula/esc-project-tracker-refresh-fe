"use client";

import { useEffect, useMemo, useState } from "react";
import type { Document, Project } from "@/lib/api";
import { getDocumentsClient, getProjectsClient } from "@/lib/api";
import { DocumentsExplorer } from "@/components/documents-explorer";
import { NewDocumentModal } from "@/components/new-document-modal";
import { ActionSuccessPopup } from "@/components/ui/action-success-popup";
import type { DocumentExplorerRow } from "@/lib/document-view";
import { getRecentItems, type RecentItem } from "@/lib/recent-items";
import { buildGlobalSearchItems } from "@/lib/search-items";

const EMPTY_DOCUMENT_ROWS: DocumentExplorerRow[] = [];
const EMPTY_PROJECTS: Project[] = [];

export function DocumentsPageContent({
  apiBaseURL,
  documents,
  projects: initialProjectProp
}: {
  apiBaseURL: string;
  documents?: DocumentExplorerRow[];
  projects?: Project[];
}) {
  const initialDocuments = documents ?? EMPTY_DOCUMENT_ROWS;
  const initialProjects = initialProjectProp ?? EMPTY_PROJECTS;
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [documentRows, setDocumentRows] = useState(initialDocuments);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(initialDocuments.length === 0 && initialProjects.length === 0);
  const [successMessage, setSuccessMessage] = useState("");
  const [recentItems] = useState<RecentItem[]>(() => getRecentItems());

  useEffect(() => {
    if (initialDocuments.length > 0 || initialProjects.length > 0) {
      setDocumentRows(initialDocuments);
      setProjects(initialProjects);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    void Promise.all([getProjectsClient({ apiBaseURL }), getDocumentsClient({ apiBaseURL })]).then(
      ([nextProjects, nextDocuments]) => {
        if (cancelled) {
          return;
        }

        const projectById = new Map(nextProjects.map((project) => [project.id, project]));
        setProjects(nextProjects);
        setDocumentRows(
          nextDocuments.map<DocumentExplorerRow>((document) => {
            const project = projectById.get(document.projectId);
            return {
              ...document,
              projectName: project?.name ?? "เอกสารนอกโครงการ",
              projectType: project?.type ?? document.projectCode.slice(0, 2)
            };
          })
        );
        setIsLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [apiBaseURL, initialDocuments, initialProjects]);

  const projectById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);
  const searchItems = useMemo(
    () => buildGlobalSearchItems({ projects, documents: documentRows }),
    [documentRows, projects]
  );

  function handleDocumentCreated(document: Document) {
    const project = projectById.get(document.projectId);
    const inferredProjectType = document.projectCode.slice(0, 2);

    setDocumentRows((currentDocuments) => [
      {
        ...document,
        projectName: project?.name ?? "เอกสารนอกโครงการ",
        projectType: project?.type ?? inferredProjectType
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
        isLoading={isLoading}
        onCreateClick={() => setIsDocumentModalOpen(true)}
        pageSizeOptions={[10, 20, 50]}
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
