"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CurrentUser, Document, Project } from "@/lib/api";
import { deleteProject } from "@/lib/api";
import { ConfirmDeleteModal } from "@/components/confirm-delete-modal";
import { DocumentsExplorer } from "@/components/documents-explorer";
import { NewDocumentModal } from "@/components/new-document-modal";
import { NewProjectModal } from "@/components/new-project-modal";
import { ActionSuccessPopup } from "@/components/ui/action-success-popup";
import { SelectedActionBar } from "@/components/ui/selected-action-bar";
import { ProjectIcon } from "@/components/ui/document-action-icons";
import type { DocumentExplorerRow } from "@/lib/document-view";
import { getRecentItems, saveRecentItem, type RecentItem } from "@/lib/recent-items";
import { buildGlobalSearchItems } from "@/lib/search-items";

export function ProjectDetailContent({
  apiBaseURL,
  currentUser,
  initialDocuments,
  initialProject
}: {
  apiBaseURL: string;
  currentUser: CurrentUser;
  initialDocuments: Document[];
  initialProject: Project;
}) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [documents, setDocuments] = useState(initialDocuments);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isProjectEditOpen, setIsProjectEditOpen] = useState(false);
  const [isProjectDeleteOpen, setIsProjectDeleteOpen] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [recentItems] = useState<RecentItem[]>(() => getRecentItems());

  useEffect(() => {
    saveRecentItem({
      kind: "project",
      id: project.id,
      title: `${project.projectCode} ${project.name}`,
      subtitle: "โครงการ",
      href: `/project/${encodeURIComponent(project.projectCode || project.id)}`
    });
  }, [project.id, project.name, project.projectCode]);

  const documentRows = useMemo<DocumentExplorerRow[]>(
    () =>
      documents.map((document) => ({
        ...document,
        projectName: project.name,
        projectType: project.type
      })),
    [documents, project.name, project.type]
  );

  const searchItems = useMemo(
    () => buildGlobalSearchItems({ projects: [project], documents: documentRows }),
    [documentRows, project]
  );

  return (
    <>
      <DocumentsExplorer
        afterFiltersContent={
          <SelectedActionBar
            icon={<ProjectIcon className="h-6 w-6" />}
            onDelete={() => {
              setDeleteErrorMessage("");
              setIsProjectDeleteOpen(true);
            }}
            onEdit={() => setIsProjectEditOpen(true)}
            title={`${project.projectCode} ${project.name}`}
          />
        }
        createButtonLabel="สร้างเอกสารใหม่"
        documents={documentRows}
        emptyText="ไม่พบเอกสาร"
        hideProjectTypeFilter
        onCreateClick={() => setIsDocumentModalOpen(true)}
        ownerDisplayName={currentUser.displayName}
        ownerPhone={currentUser.phone}
        recentItems={recentItems}
        searchItems={searchItems}
        searchPlaceholder="ค้นหาโครงการหรือเอกสาร"
        searchScope="all"
      />

      <NewDocumentModal
        apiBaseURL={apiBaseURL}
        onClose={() => setIsDocumentModalOpen(false)}
        onCreated={(document) => {
          setDocuments((currentDocuments) => [document, ...currentDocuments]);
        }}
        onCreateSuccess={setSuccessMessage}
        open={isDocumentModalOpen}
        projectCode={project.projectCode}
        projectId={project.id}
      />

      <NewProjectModal
        apiBaseURL={apiBaseURL}
        onClose={() => setIsProjectEditOpen(false)}
        onUpdated={(updatedProject) => setProject(updatedProject)}
        open={isProjectEditOpen}
        project={project}
      />

      <ConfirmDeleteModal
        description="ยืนยันว่าต้องการลบโครงการนี้"
        errorMessage={deleteErrorMessage}
        onClose={() => setIsProjectDeleteOpen(false)}
        onConfirm={async () => {
          const result = await deleteProject({ apiBaseURL, id: project.id });
          if (result.error) {
            setDeleteErrorMessage(result.error);
            return;
          }
          setIsProjectDeleteOpen(false);
          router.push("/projects");
          router.refresh();
        }}
        open={isProjectDeleteOpen}
        title="ลบโครงการ"
      />

      <ActionSuccessPopup message={successMessage} onClose={() => setSuccessMessage("")} open={Boolean(successMessage)} />
    </>
  );
}
