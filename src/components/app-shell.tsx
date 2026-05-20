import { AppSidebar } from "@/components/app-sidebar";
import type { CurrentUser } from "@/lib/api";

export function AppShell({
  currentUser,
  children
}: {
  currentUser: CurrentUser | null;
  children: React.ReactNode;
}) {
  return (
    <main className="app-canvas min-h-screen p-[var(--shell-padding)]">
      <div className="flex min-w-0 flex-col gap-[var(--shell-gap)] xl:flex-row">
        <AppSidebar currentUser={currentUser} />
        <section className="min-w-0 flex-1 overflow-x-hidden rounded-[var(--content-radius)] bg-white px-5 pb-6 pt-4 md:px-8 md:pb-8 md:pt-5 xl:min-h-[calc(100vh-(var(--shell-padding)*2))] xl:px-9 xl:pb-10 xl:pt-6">
          {children}
        </section>
      </div>
    </main>
  );
}
