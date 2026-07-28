import { AppSidebar } from "@/components/app-sidebar";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppNavProfile } from "@/components/ui/app-nav-profile";
import { ProfileCompletionModal } from "@/components/profile-completion-modal";
import type { CurrentUser } from "@/lib/api";
import { cn } from "@/lib/utils";

export type AppNavItem = {
  label: string;
  href?: string;
  active?: boolean;
};

export function AppShell({
  children,
  contentClassName,
  currentUser,
  navItems
}: {
  currentUser: CurrentUser | null;
  children: React.ReactNode;
  contentClassName?: string;
  navItems?: AppNavItem[];
}) {
  return (
    <main className="app-canvas min-h-screen overflow-x-auto p-[var(--shell-padding)]">
      <div className="flex min-w-0 flex-col gap-[var(--shell-gap)] md:flex-row">
        <div className="md:sticky md:top-[var(--shell-padding)] md:self-start">
          <AppSidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[var(--shell-gap)] md:max-h-[calc(100vh-(var(--shell-padding)*2))] md:overflow-y-auto">
          {navItems?.length ? <AppNav currentUser={currentUser} items={navItems} /> : null}
          <section
            className={cn(
              "min-w-0 flex-1 overflow-x-auto rounded-[var(--content-radius)] bg-white px-4 pb-5 pt-4 sm:px-5 md:px-6 md:pb-7 md:pt-5 xl:px-9 xl:pb-10 xl:pt-6",
              contentClassName
            )}
          >
            {children}
          </section>
        </div>
      </div>
      <ProfileCompletionModal currentUser={currentUser} />
    </main>
  );
}

function AppNav({ currentUser, items }: { currentUser: CurrentUser | null; items: AppNavItem[] }) {
  return (
    <nav className="flex min-h-[64px] min-w-0 flex-wrap items-center justify-between gap-3 rounded-3xl bg-white px-4 py-3 text-lg font-medium leading-7 sm:px-5 md:min-h-[72px] md:flex-nowrap md:px-6 lg:px-9 lg:text-xl lg:leading-8">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto md:max-w-[70%] md:gap-3 md:overflow-visible">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;
          const contentClassName = cn(
            isLast ? "block min-w-0 truncate" : "block shrink-0 whitespace-nowrap",
            !isFirst && (item.active || isLast) ? "text-red-700" : "text-black",
            item.href && "hover:underline"
          );

          return (
            <div className={cn("flex items-center gap-3", isLast ? "min-w-0" : "shrink-0")} key={`${item.label}-${index}`}>
              {item.href ? (
                <Link className={contentClassName} href={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span className={contentClassName}>{item.label}</span>
              )}
              {!isLast ? <ChevronRight className="h-4 w-4 shrink-0 text-black" /> : null}
            </div>
          );
        })}
      </div>
      {currentUser ? <AppNavProfile currentUser={currentUser} /> : null}
    </nav>
  );
}
