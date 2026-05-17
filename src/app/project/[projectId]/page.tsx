import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProjectDetailContent } from "@/components/project-detail-content";
import { getCurrentUser, getProjectById } from "@/lib/api";

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const currentUser = await getCurrentUser(cookieHeader);

  if (!currentUser) {
    redirect("/");
  }

  const project = await getProjectById(cookieHeader, projectId);
  if (!project) {
    notFound();
  }

  const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

  return <AppShell currentUser={currentUser} title="โครงการ" titleIcon={<FolderOpen size={40} />}><ProjectDetailContent apiBaseURL={apiBaseURL} initialProject={project} /></AppShell>;
}
