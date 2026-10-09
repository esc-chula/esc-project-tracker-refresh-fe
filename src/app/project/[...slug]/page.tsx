import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AppContentSection } from "@/components/app-shell";
import { DocumentDetailContent } from "@/components/document-detail-content";
import { ProjectDetailContent } from "@/components/project-detail-content";
import {
  getAPIBaseURL,
  getCurrentUser,
  getDocumentByCode,
  getGoogleLoginURL,
  listDocumentReceipts,
  getProjectById,
  getProjectDeadlines,
  getProjects
} from "@/lib/api";

function normalizeSlug(slug: string[]) {
  if (slug.length === 2) {
    const redirectedSlug = slug[1];

    if (!redirectedSlug) {
      return {
        invalid: true
      } as const;
    }

    return {
      redirectTo: `/project/${encodeURIComponent(decodeURIComponent(redirectedSlug))}`
    } as const;
  }

  if (slug.length !== 1) {
    return {
      invalid: true
    } as const;
  }

  return {
    decodedSlug: decodeURIComponent(slug[0])
  } as const;
}

export default async function ProjectPage({
  params
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const normalizedSlug = normalizeSlug(slug);

  if ("redirectTo" in normalizedSlug && normalizedSlug.redirectTo) {
    redirect(normalizedSlug.redirectTo);
  }

  if ("invalid" in normalizedSlug) {
    notFound();
  }

  const decodedSlug = normalizedSlug.decodedSlug;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const apiBaseURL = getAPIBaseURL();

  if (decodedSlug.includes("-")) {
    const [currentUser, resolvedDocument] = await Promise.all([
      getCurrentUser(cookieHeader),
      getDocumentByCode(cookieHeader, decodedSlug)
    ]);

    if (!currentUser) {
      redirect(getGoogleLoginURL());
    }

    if (!resolvedDocument) {
      notFound();
    }

    const canonicalDocumentCode = `${resolvedDocument.projectCode}-${resolvedDocument.documentCode}`;

    if (decodedSlug !== canonicalDocumentCode) {
      redirect(`/project/${encodeURIComponent(canonicalDocumentCode)}`);
    }

    const initialReceipts =
      resolvedDocument.type === "7" ? await listDocumentReceipts(cookieHeader, resolvedDocument.id) : [];

    return (
      <AppContentSection className="overflow-visible rounded-none bg-transparent p-0 md:p-0 xl:p-0">
        <DocumentDetailContent
          apiBaseURL={apiBaseURL}
          currentUserName={currentUser.displayName}
          document={resolvedDocument}
          initialFilings={[]}
          initialReceipts={initialReceipts}
          initialTimeline={[]}
          project={resolvedDocument.project}
        />
      </AppContentSection>
    );
  }

  const [currentUser, projects] = await Promise.all([
    getCurrentUser(cookieHeader),
    getProjects(cookieHeader)
  ]);

  if (!currentUser) {
    redirect(getGoogleLoginURL());
  }

  const listedProject =
    projects.find((currentProject) => currentProject.projectCode === decodedSlug) ??
    projects.find((currentProject) => currentProject.id === decodedSlug);

  if (!listedProject) {
    notFound();
  }

  // The project list response does not currently populate budget details, while
  // the project detail endpoint does. Always hydrate the selected project before
  // rendering so persisted budget values survive a page reload.
  const [detailedProject, deadlineResult] = await Promise.all([
    getProjectById(cookieHeader, listedProject.id),
    getProjectDeadlines(cookieHeader, listedProject.id)
  ]);
  const project = detailedProject ?? listedProject;

  return (
    <AppContentSection>
      <ProjectDetailContent
        apiBaseURL={apiBaseURL}
        initialDeadlinePermissions={deadlineResult.permissions}
        initialDeadlines={deadlineResult.deadlines}
        initialDocuments={[]}
        initialProject={project}
      />
    </AppContentSection>
  );
}
