import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import type { CurrentUser } from "@/lib/api";

export function AppShell({
  title,
  titleIcon,
  currentUser,
  children
}: {
  title: string;
  titleIcon: React.ReactNode;
  currentUser: CurrentUser | null;
  children: React.ReactNode;
}) {
  return (
    <main className="app-canvas min-h-screen p-[var(--shell-padding)]">
      <div className="flex flex-col gap-[var(--shell-gap)] xl:flex-row">
        <AppSidebar />
        <section className="min-h-[calc(100vh-(var(--shell-padding)*2))] flex-1 rounded-[var(--content-radius)] bg-white px-5 py-6 md:px-8 md:py-8 xl:px-9 xl:py-10">
          <AppHeader currentUser={currentUser} title={title} titleIcon={titleIcon} />
          <div className="mt-8 xl:mt-10">{children}</div>
        </section>
      </div>
    </main>
  );
}
