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

    return (
      <AppContentSection className="overflow-visible rounded-none bg-transparent p-0 md:p-0 xl:p-0">
        <DocumentDetailContent
          apiBaseURL={apiBaseURL}
          currentUserName={currentUser.displayName}
          currentUserRole={currentUser.role}
          document={resolvedDocument}
          initialFilings={[]}
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

  const project =
    projects.find((currentProject) => currentProject.projectCode === decodedSlug) ??
    projects.find((currentProject) => currentProject.id === decodedSlug);

  if (!project) {
    notFound();
  }

  return (
    <AppContentSection>
      <ProjectDetailContent
        apiBaseURL={apiBaseURL}
        currentUser={currentUser}
        initialDocuments={[]}
        initialProject={project}
      />
    </AppContentSection>
  );
}
