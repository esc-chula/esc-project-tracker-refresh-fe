import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProjectsPageContent } from "@/components/projects-page-content";
import { getCurrentUser, getProjects } from "@/lib/api";

export default async function ProjectsPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const currentUser = await getCurrentUser(cookieHeader);

  if (!currentUser) {
    redirect("/");
  }

  const projects = await getProjects(cookieHeader);

  return (
    <AppShell currentUser={currentUser} title="โครงการ" titleIcon={<FolderOpen size={40} strokeWidth={2.2} />}>
      <ProjectsPageContent projects={projects} />
    </AppShell>
  );
}
