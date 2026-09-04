"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesCombined, FileSearch, FolderOpen, Home } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const primaryItems: SidebarItem[] = [
  { href: "/", label: "หน้าหลัก", icon: <Home size={18} strokeWidth={2.2} /> },
  { href: "/projects", label: "โครงการ", icon: <FolderOpen size={18} strokeWidth={2.2} /> },
  { href: "/documents", label: "เอกสาร", icon: <FileSearch size={18} strokeWidth={2.2} /> },
  { href: "/finance-summary", label: "สรุปงบ", icon: <ChartNoAxesCombined size={18} strokeWidth={2.2} /> }
];

function isActivePath(pathname: string, href: string) {
  return (
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    (href === "/projects" && pathname.startsWith("/project/"))
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <nav className="rounded-[var(--content-radius)] bg-carmine px-3 py-3 text-white md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 px-2">
            <Image alt="ESC" height={34} src="/icons/esc.svg" width={26} />
          </div>

          <div className="flex items-center gap-2">
            {primaryItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link className="block" href={item.href} key={item.label}>
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                      active ? "bg-white text-carmine" : "text-white hover:bg-white/10"
                    )}
                  >
                    <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <aside className="hidden flex-none rounded-[var(--content-radius)] bg-carmine py-7 text-white md:flex md:min-h-[calc(100vh-(var(--shell-padding)*2))] md:w-[var(--sidebar-width-collapsed)] md:px-3 lg:w-[var(--sidebar-width)] lg:px-7 lg:py-8">
        <div className="flex w-full flex-col">
          <div className="flex flex-col items-center gap-3 md:px-1 lg:px-5">
            <Image
              alt="ESC"
              className="md:h-[52px] md:w-[40px] lg:h-[72px] lg:w-[56px]"
              height={72}
              src="/icons/esc.svg"
              width={56}
            />
            <div className="hidden text-center text-base font-semibold lg:block">Document System</div>
            <div className="mt-2 h-px w-full bg-white/70" />
          </div>

          <nav className="mt-7 flex flex-col gap-2 lg:mt-8">
            {primaryItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link className="block" href={item.href} key={item.label}>
                  <div
                    className={cn(
                      "flex items-center rounded-[14px] text-base font-medium leading-none transition-colors md:justify-center md:px-0 md:py-1 lg:justify-start lg:gap-3 lg:px-3 lg:py-1",
                      active ? "bg-white text-carmine" : "text-white hover:bg-white/10"
                    )}
                    title={item.label}
                  >
                    <span className="flex h-10 w-10 items-center justify-center">{item.icon}</span>
                    <span className="hidden lg:inline">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
