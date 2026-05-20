"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CurrentUser, Document, Project } from "@/lib/api";
import { DocumentsExplorer } from "@/components/documents-explorer";
import { NewDocumentModal } from "@/components/new-document-modal";
import type { DocumentExplorerRow } from "@/lib/document-view";
import { getRecentItems, saveRecentItem, type RecentItem } from "@/lib/recent-items";

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
  const [documents, setDocuments] = useState(initialDocuments);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [recentItems] = useState<RecentItem[]>(() => getRecentItems());

  useEffect(() => {
    saveRecentItem({
      kind: "project",
      id: initialProject.id,
      title: `${initialProject.projectCode} ${initialProject.name}`,
      subtitle: "โครงการ",
      href: `/project/${encodeURIComponent(initialProject.projectCode || initialProject.id)}`
    });
  }, [initialProject.id, initialProject.name, initialProject.projectCode]);

  const documentRows = useMemo<DocumentExplorerRow[]>(
    () =>
      documents.map((document) => ({
        ...document,
        projectName: initialProject.name,
        projectType: initialProject.type
      })),
    [documents, initialProject.name, initialProject.type]
  );

  const navigation = (
    <div className="text-base font-normal text-gray-500">
      <Link className="hover:underline" href="/projects">
        โครงการ
      </Link>
      <span> / {initialProject.projectCode} {initialProject.name}</span>
    </div>
  );

  return (
    <>
      <DocumentsExplorer
        afterFiltersContent={navigation}
        createButtonLabel="สร้างเอกสารใหม่"
        documents={documentRows}
        emptyText="ไม่พบเอกสาร"
        onCreateClick={() => setIsDocumentModalOpen(true)}
        ownerDisplayName={currentUser.displayName}
        recentItems={recentItems}
        searchPlaceholder="ค้นหาเอกสารของฉัน"
        searchScope="project-documents"
      />

      <NewDocumentModal
        apiBaseURL={apiBaseURL}
        onClose={() => setIsDocumentModalOpen(false)}
        onCreated={(document) => {
          setDocuments((currentDocuments) => [document, ...currentDocuments]);
        }}
        open={isDocumentModalOpen}
        projectCode={initialProject.projectCode}
        projectId={initialProject.id}
      />
    </>
  );
}
