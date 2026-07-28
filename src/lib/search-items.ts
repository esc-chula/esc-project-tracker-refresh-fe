import { getDocumentRoute, getProjectRoute, type Document, type Project } from "@/lib/api";
import type { DocumentExplorerRow } from "@/lib/document-view";
import type { RecentItem } from "@/lib/recent-items";

type SearchableDocument = Pick<Document, "id" | "projectCode" | "documentCode" | "name" | "type" | "subType"> & {
  projectName?: string;
};

export function buildProjectSearchItems(projects: Project[]): RecentItem[] {
  return projects.map((project) => ({
    kind: "project",
    id: project.id,
    title: `${project.projectCode} ${project.name}`.trim(),
    subtitle: "โครงการ",
    href: getProjectRoute(project),
    viewedAt: 0
  }));
}

export function buildDocumentSearchItems(documents: SearchableDocument[]): RecentItem[] {
  return documents.map((document) => ({
    kind: "document",
    id: document.id,
    title: `${document.projectCode}-${document.documentCode} ${document.name}`.trim(),
    subtitle: document.projectName || "เอกสาร",
    href: getDocumentRoute(document),
    viewedAt: 0
  }));
}

export function buildGlobalSearchItems(input: {
  projects?: Project[];
  documents?: Array<DocumentExplorerRow | SearchableDocument>;
}): RecentItem[] {
  const projectItems = buildProjectSearchItems(input.projects ?? []);
  const documentItems = buildDocumentSearchItems(input.documents ?? []);

  return [...projectItems, ...documentItems];
}
