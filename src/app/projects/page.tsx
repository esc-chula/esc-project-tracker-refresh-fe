import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProjectsPageContent } from "@/components/projects-page-content";
import { getAPIBaseURL, getCurrentUser, getGoogleLoginURL, getProjects } from "@/lib/api";

export default async function ProjectsPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const currentUser = await getCurrentUser(cookieHeader);

  if (!currentUser) {
    redirect(getGoogleLoginURL());
  }

  const projects = await getProjects(cookieHeader);
  const apiBaseURL = getAPIBaseURL();

  return (
    <AppShell currentUser={currentUser} navItems={[{ label: "โครงการ" }]}>
      <ProjectsPageContent apiBaseURL={apiBaseURL} projects={projects} />
    </AppShell>
  );
}
