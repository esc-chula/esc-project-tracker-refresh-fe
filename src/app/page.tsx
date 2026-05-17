import { cookies } from "next/headers";
import { Home } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { HomePageClient } from "@/components/home-page-client";
import { getCurrentUser, getGoogleLoginURL, getProjects } from "@/lib/api";

export default async function HomePage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const currentUser = await getCurrentUser(cookieHeader);
  const projects = currentUser ? await getProjects(cookieHeader) : [];
  const googleLoginURL = getGoogleLoginURL();

  return (
    <AppShell currentUser={currentUser} title="หน้าหลัก" titleIcon={<Home size={40} strokeWidth={2.2} />}>
      <HomePageClient currentUser={currentUser} googleLoginURL={googleLoginURL} initialProjects={projects} />
    </AppShell>
  );
}
