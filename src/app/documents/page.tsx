import { AppContentSection } from "@/components/app-shell";
import { DocumentsPageContent } from "@/components/documents-page-content";
import { getAPIBaseURL } from "@/lib/api";

export default function DocumentsPage() {
  return (
    <AppContentSection>
      <DocumentsPageContent apiBaseURL={getAPIBaseURL()} />
    </AppContentSection>
  );
}
