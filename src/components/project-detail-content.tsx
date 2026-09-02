"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Document, Project } from "@/lib/api";
import {
  createProjectDeadline,
  deleteProject,
  deleteProjectDeadline,
  getDocumentsByProjectClient,
  updateProjectDeadline
} from "@/lib/api";
import { ConfirmDeleteModal } from "@/components/confirm-delete-modal";
import { DocumentsExplorer } from "@/components/documents-explorer";
import { ManageProjectMembersModal } from "@/components/manage-project-members-modal";
import { NewDocumentModal } from "@/components/new-document-modal";
import { NewProjectModal } from "@/components/new-project-modal";
import { ProjectPopupModal, type ProjectBudgetValues } from "@/components/project-popup-modal";
import { DeadlineModal } from "@/components/deadline-modal";
import { ProjectDeadlinesPanel } from "@/components/project-deadlines-panel";
import { ActionSuccessPopup } from "@/components/ui/action-success-popup";
import { Button } from "@/components/ui/button";
import { ProjectIcon } from "@/components/ui/document-action-icons";
import { SelectedActionBar } from "@/components/ui/selected-action-bar";
import type { DocumentExplorerRow } from "@/lib/document-view";
import { getRecentItems, saveRecentItem, type RecentItem } from "@/lib/recent-items";
import { buildGlobalSearchItems } from "@/lib/search-items";
import type { DeadlineFormValues, DeadlinePermissions, ProjectDeadline } from "@/lib/deadline";

function getProjectBudgetValues(project: Project): ProjectBudgetValues {
  return {
    escSatang: project.escSatang ?? 0,
    otherSatang: project.otherSatang ?? 0,
    sponsorSatang: project.sponsorSatang ?? 0
  };
}

export function ProjectDetailContent({
  apiBaseURL,
  initialDeadlinePermissions,
  initialDeadlines,
  initialDocuments,
  initialProject
}: {
  apiBaseURL: string;
  initialDeadlinePermissions: DeadlinePermissions;
  initialDeadlines: ProjectDeadline[];
  initialDocuments: Document[];
  initialProject: Project;
}) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [projectBudget, setProjectBudget] = useState<ProjectBudgetValues>(() => getProjectBudgetValues(initialProject));
  const [documents, setDocuments] = useState(initialDocuments);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(initialDocuments.length === 0);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isProjectEditOpen, setIsProjectEditOpen] = useState(false);
  const [isProjectDeleteOpen, setIsProjectDeleteOpen] = useState(false);
  const [isProjectPopupOpen, setIsProjectPopupOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [deadlines, setDeadlines] = useState<ProjectDeadline[]>(initialDeadlines);
  const [editingDeadline, setEditingDeadline] = useState<ProjectDeadline | null>(null);
  const [deadlineToDelete, setDeadlineToDelete] = useState<ProjectDeadline | null>(null);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [recentItems] = useState<RecentItem[]>(() => getRecentItems());

  const permissions = project.permissions;
  const canEdit = permissions?.canEdit ?? false;
  const canDelete = permissions?.canDelete ?? false;
  const canCreateDocument = permissions?.canCreateDocument ?? false;
  const canManageMembers = permissions?.canManageMembers ?? false;
  const deadlinePermissions = initialDeadlinePermissions;

  function closeDeadlineModal() {
    setEditingDeadline(null);
    setIsDeadlineModalOpen(false);
  }

  async function saveDeadline(values: DeadlineFormValues): Promise<string | undefined> {
    if (editingDeadline) {
      const result = await updateProjectDeadline({
        apiBaseURL,
        deadlineId: editingDeadline.id,
        dueDate: values.dueDate,
        projectId: project.id,
        title: values.title
      });
      if (result.error || !result.deadline) {
        return result.error ?? "ไม่สามารถแก้ไข Deadline ได้";
      }
      setDeadlines((current) => current.map((deadline) => deadline.id === editingDeadline.id ? result.deadline! : deadline));
      setSuccessMessage("บันทึก Deadline สำเร็จ");
    } else {
      const result = await createProjectDeadline({
        apiBaseURL,
        dueDate: values.dueDate,
        projectId: project.id,
        title: values.title
      });
      if (result.error || !result.deadline) {
        return result.error ?? "ไม่สามารถเพิ่ม Deadline ได้";
      }
      setDeadlines((current) => [...current, result.deadline!]);
      setSuccessMessage("เพิ่ม Deadline สำเร็จ");
    }
    closeDeadlineModal();
    return undefined;
  }

  async function deleteDeadline() {
    if (!deadlineToDelete) return;

    const result = await deleteProjectDeadline({
      apiBaseURL,
      deadlineId: deadlineToDelete.id,
      projectId: project.id
    });
    if (result.error) {
      setDeleteErrorMessage(result.error);
      return;
    }
    setDeadlines((current) => current.filter((deadline) => deadline.id !== deadlineToDelete.id));

    setDeadlineToDelete(null);
    setDeleteErrorMessage("");
    setSuccessMessage("ลบ Deadline สำเร็จ");
  }

  useEffect(() => {
    saveRecentItem({
      kind: "project",
      id: project.id,
      title: `${project.projectCode} ${project.name}`,
      subtitle: "โครงการ",
      href: `/project/${encodeURIComponent(project.projectCode || project.id)}`
    });
  }, [project.id, project.name, project.projectCode]);

  useEffect(() => {
    if (initialDocuments.length > 0) {
      setDocuments(initialDocuments);
      setIsDocumentsLoading(false);
      return;
    }

    let cancelled = false;

    void getDocumentsByProjectClient(project.id, { apiBaseURL }).then((nextDocuments) => {
      if (!cancelled) {
        setDocuments(nextDocuments);
        setIsDocumentsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [apiBaseURL, initialDocuments, project.id]);

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
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SelectedActionBar
                hideDelete={!canDelete}
                hideEdit={!canEdit}
                icon={<ProjectIcon className="h-6 w-6" />}
                onDelete={() => {
                  setDeleteErrorMessage("");
                  setIsProjectDeleteOpen(true);
                }}
                onEdit={() => setIsProjectEditOpen(true)}
                title={`${project.projectCode} ${project.name}`}
              />
              {canManageMembers ? (
                <Button onClick={() => setIsManageMembersOpen(true)} type="button" variant="outline">
                  จัดการผู้เข้าถึง
                </Button>
              ) : null}
            </div>
            <ProjectDeadlinesPanel
              deadlines={deadlines}
              onAdd={() => {
                setEditingDeadline(null);
                setIsDeadlineModalOpen(true);
              }}
              onDelete={setDeadlineToDelete}
              onEdit={(deadline) => {
                setEditingDeadline(deadline);
                setIsDeadlineModalOpen(true);
              }}
              permissions={deadlinePermissions}
            />
            {canManageMembers ? (
              <Button onClick={() => setIsManageMembersOpen(true)} type="button" variant="outline">
                จัดการผู้เข้าถึง
              </Button>
            ) : null}
            <Button onClick={() => setIsProjectPopupOpen(true)} type="button" variant="outline">
              เปิด Popup
            </Button>
          </div>
        }
        createButtonLabel="สร้างเอกสารใหม่"
        documents={documentRows}
        emptyText="ไม่พบเอกสาร"
        hideProjectTypeFilter
        isLoading={isDocumentsLoading}
        onCreateClick={canCreateDocument ? () => setIsDocumentModalOpen(true) : undefined}
        pageSizeOptions={[10, 20, 50]}
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

      <DeadlineModal deadline={editingDeadline ?? undefined} key={editingDeadline?.id ?? "create-deadline"} onClose={closeDeadlineModal} onSave={saveDeadline} open={isDeadlineModalOpen} />

      <ConfirmDeleteModal
        description={deadlineToDelete ? `ต้องการลบ Deadline “${deadlineToDelete.title}” นี้หรือไม่? เมื่อลบแล้วจะไม่สามารถย้อนกลับได้` : ""}
        errorMessage={deadlineToDelete ? deleteErrorMessage : ""}
        onClose={() => {
          setDeadlineToDelete(null);
          setDeleteErrorMessage("");
        }}
        onConfirm={deleteDeadline}
        open={Boolean(deadlineToDelete)}
        title="ยืนยันการลบ Deadline"
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

      <ManageProjectMembersModal
        apiBaseURL={apiBaseURL}
        onClose={() => setIsManageMembersOpen(false)}
        open={isManageMembersOpen}
        projectId={project.id}
      />

      <ProjectPopupModal
        apiBaseURL={apiBaseURL}
        budget={projectBudget}
        onBudgetUpdated={(budget) => {
          setProjectBudget(budget);
          setProject((currentProject) => ({
            ...currentProject,
            ...budget
          }));
          setSuccessMessage("บันทึกงบประมาณสำเร็จ");
          router.refresh();
        }}
        onClose={() => setIsProjectPopupOpen(false)}
        open={isProjectPopupOpen}
        projectId={project.id}
        projectName={project.name}
      />

      <ActionSuccessPopup message={successMessage} onClose={() => setSuccessMessage("")} open={Boolean(successMessage)} />
    </>
  );
}
