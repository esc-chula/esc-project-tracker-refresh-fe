import { AppContentSection } from "@/components/app-shell";
import { ProjectsPageContent } from "@/components/projects-page-content";
import { getAPIBaseURL } from "@/lib/api";

export default function ProjectsPage() {
  return (
    <AppContentSection>
      <ProjectsPageContent apiBaseURL={getAPIBaseURL()} />
    </AppContentSection>
  );
}
