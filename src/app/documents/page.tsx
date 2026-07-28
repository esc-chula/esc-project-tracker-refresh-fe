import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DocumentsPageContent } from "@/components/documents-page-content";
import { getAPIBaseURL, getCurrentUser, getDocumentsByProject, getGoogleLoginURL, getProjects } from "@/lib/api";
import type { DocumentExplorerRow } from "@/lib/document-view";

export default async function DocumentsPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const currentUser = await getCurrentUser(cookieHeader);

  if (!currentUser) {
    redirect(getGoogleLoginURL());
  }

  const projects = await getProjects(cookieHeader);
  const documentGroups = await Promise.all(
    projects.map(async (project) => {
      const documents = await getDocumentsByProject(cookieHeader, project.id);

      return documents.map<DocumentExplorerRow>((document) => ({
        ...document,
        projectName: project.name,
        projectType: project.type
      }));
    })
  );

  const documents = documentGroups.flat();

  return (
    <AppShell currentUser={currentUser} navItems={[{ label: "เอกสาร" }]}>
      <DocumentsPageContent
        apiBaseURL={getAPIBaseURL()}
        currentUser={currentUser}
        documents={documents}
        projects={projects}
      />
    </AppShell>
  );
}
