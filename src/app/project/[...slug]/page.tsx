import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DocumentDetailContent } from "@/components/document-detail-content";
import { ProjectDetailContent } from "@/components/project-detail-content";
import {
  getAPIBaseURL,
  getCurrentUser,
  getDocumentById,
  getDocumentsByProject,
  getFilingsByDocument,
  getGoogleLoginURL,
  getProjects
} from "@/lib/api";

export default async function ProjectPage({
  params
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const currentUser = await getCurrentUser(cookieHeader);

  if (!currentUser) {
    redirect(getGoogleLoginURL());
  }

  const apiBaseURL = getAPIBaseURL();
  const projects = await getProjects(cookieHeader);

  if (slug.length === 2) {
    redirect(`/project/${encodeURIComponent(decodeURIComponent(slug[1]))}`);
  }

  if (slug.length !== 1) {
    notFound();
  }

  const decodedSlug = decodeURIComponent(slug[0]);

  if (decodedSlug.includes("-")) {
    let matchedDocumentId = "";
    let canonicalDocumentCode = "";

    for (const project of projects) {
      const documents = await getDocumentsByProject(cookieHeader, project.id);
      const matchedDocument = documents.find((candidate) => {
        const fullDocumentCode = `${candidate.projectCode}-${candidate.documentCode}`;
        return fullDocumentCode === decodedSlug || candidate.documentCode === decodedSlug || candidate.id === decodedSlug;
      });

      if (matchedDocument) {
        matchedDocumentId = matchedDocument.id;
        canonicalDocumentCode = `${matchedDocument.projectCode}-${matchedDocument.documentCode}`;
        break;
      }
    }

    if (!matchedDocumentId) {
      notFound();
    }

    if (decodedSlug !== canonicalDocumentCode) {
      redirect(`/project/${encodeURIComponent(canonicalDocumentCode)}`);
    }

    const resolvedDocument = await getDocumentById(cookieHeader, matchedDocumentId);
    if (!resolvedDocument) {
      notFound();
    }

    const filingFeed = await getFilingsByDocument(cookieHeader, resolvedDocument.id);

    return (
      <AppShell
        contentClassName="overflow-visible rounded-none bg-transparent p-0 md:p-0 xl:p-0"
        currentUser={currentUser}
        navItems={[
          { href: "/projects", label: "โครงการ" },
          {
            href: `/project/${encodeURIComponent(resolvedDocument.project.projectCode)}`,
            label: resolvedDocument.project.projectCode
          },
          { label: canonicalDocumentCode }
        ]}
      >
        <DocumentDetailContent
          apiBaseURL={apiBaseURL}
          currentUserName={currentUser.displayName}
          currentUserRole={currentUser.role}
          document={resolvedDocument}
          initialFilings={filingFeed.filings}
          initialTimeline={filingFeed.timeline}
          project={resolvedDocument.project}
        />
      </AppShell>
    );
  }

  const project =
    projects.find((currentProject) => currentProject.projectCode === decodedSlug) ??
    projects.find((currentProject) => currentProject.id === decodedSlug);

  if (!project) {
    notFound();
  }

  const documents = await getDocumentsByProject(cookieHeader, project.id);

  return (
    <AppShell
      currentUser={currentUser}
      navItems={[
        { href: "/projects", label: "โครงการ" },
        { label: project.projectCode }
      ]}
    >
      <ProjectDetailContent
        apiBaseURL={apiBaseURL}
        currentUser={currentUser}
        initialDocuments={documents}
        initialProject={project}
      />
    </AppShell>
  );
}
