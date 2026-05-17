import { FolderOpen } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProjectDetailContent } from "@/components/project-detail-content";
import { getCurrentUser } from "@/lib/api";

export default async function NewProjectPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const currentUser = await getCurrentUser(cookieHeader);

  if (!currentUser) {
    redirect("/");
  }

  const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

  return (
    <AppShell currentUser={currentUser} title="โครงการ" titleIcon={<FolderOpen size={40} strokeWidth={2.2} />}>
      <ProjectDetailContent
        apiBaseURL={apiBaseURL}
        initialProject={{
          id: "new",
          ownerUserId: currentUser.id,
          projectCode: "",
          name: "",
          type: "",
          status: "draft",
          reserveDate: "",
          detail: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }}
        mode="create"
      />
    </AppShell>
  );
}
