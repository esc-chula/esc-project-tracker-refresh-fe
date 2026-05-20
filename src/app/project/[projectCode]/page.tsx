import { FolderOpen } from "lucide-react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProjectDetailContent } from "@/components/project-detail-content";
import { getCurrentUser, getProjects } from "@/lib/api";

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

  return (
    <AppShell currentUser={currentUser} title="โครงการ" titleIcon={<FolderOpen size={40} strokeWidth={2.2} />}>
      <ProjectDetailContent apiBaseURL={apiBaseURL} initialProject={project} />
    </AppShell>
  );
}
