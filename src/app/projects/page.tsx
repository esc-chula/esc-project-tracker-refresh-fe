import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
  const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

  return (
    <AppShell currentUser={currentUser}>
      <ProjectsPageContent apiBaseURL={apiBaseURL} projects={projects} />
    </AppShell>
  );
}
