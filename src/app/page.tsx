import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { HomePageClient } from "@/components/home-page-client";
import { getCurrentUser, getDocumentsByProject, getProjects } from "@/lib/api";
import type { DocumentExplorerRow } from "@/lib/document-view";

export default async function HomePage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const currentUser = await getCurrentUser(cookieHeader);
  const projects = currentUser ? await getProjects(cookieHeader) : [];

  const documentGroups = currentUser
    ? await Promise.all(
        projects.map(async (project) => {
          const documents = await getDocumentsByProject(cookieHeader, project.id);

          return documents.map<DocumentExplorerRow>((document) => ({
            ...document,
            projectName: project.name,
            projectType: project.type
          }));
        })
      )
    : [];

  const latestDocuments = documentGroups
    .flat()
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 4);

  return (
    <AppShell currentUser={currentUser}>
      <HomePageClient
        currentUser={currentUser}
        initialDocuments={latestDocuments}
        initialProjects={projects}
      />
    </AppShell>
  );
}
