import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppContentSection } from "@/components/app-shell";
import { HomePageClient } from "@/components/home-page-client";
import { getDocuments, getProjects } from "@/lib/api";
import type { DocumentExplorerRow } from "@/lib/document-view";
import { isLocalMockMode } from "@/lib/mock-mode";

export default async function HomePage() {
  if (isLocalMockMode) {
    redirect("/project/mock-project");
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const projects = await getProjects(cookieHeader);
  const latestDocuments = (await getDocuments(cookieHeader))
    .map<DocumentExplorerRow>((document) => {
      const project = projects.find((candidate) => candidate.id === document.projectId);
      return {
        ...document,
        projectName: project?.name ?? "เอกสารนอกโครงการ",
        projectType: project?.type ?? document.projectCode.slice(0, 2)
      };
    })
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 4);

  return (
    <AppContentSection>
      <HomePageClient
        initialDocuments={latestDocuments}
        initialProjects={projects}
      />
    </AppContentSection>
  );
}
