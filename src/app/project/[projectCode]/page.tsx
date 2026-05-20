import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProjectDetailContent } from "@/components/project-detail-content";
import { getCurrentUser, getDocumentsByProject, getProjects } from "@/lib/api";

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ projectCode: string }>;
}) {
  const { projectCode } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const currentUser = await getCurrentUser(cookieHeader);

  if (!currentUser) {
    redirect("/");
  }

  const projects = await getProjects(cookieHeader);
  const decodedProjectCode = decodeURIComponent(projectCode);
  const project =
    projects.find((currentProject) => currentProject.projectCode === decodedProjectCode) ??
    projects.find((currentProject) => currentProject.id === decodedProjectCode);

  if (!project) {
    notFound();
  }

  const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
  const documents = await getDocumentsByProject(cookieHeader, project.id);

  return (
    <AppShell currentUser={currentUser}>
      <ProjectDetailContent
        apiBaseURL={apiBaseURL}
        currentUser={currentUser}
        initialDocuments={documents}
        initialProject={project}
      />
    </AppShell>
  );
}
