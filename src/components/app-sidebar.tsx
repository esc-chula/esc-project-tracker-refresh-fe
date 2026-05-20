"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSearch, FolderOpen, Home, LogIn, LogOut } from "lucide-react";
import type { CurrentUser } from "@/lib/api";
import { cn } from "@/lib/utils";

type SidebarItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const primaryItems: SidebarItem[] = [
  { href: "/", label: "หน้าหลัก", icon: <Home size={18} strokeWidth={2.2} /> },
  { href: "/projects", label: "โครงการ", icon: <FolderOpen size={18} strokeWidth={2.2} /> },
  { href: "/documents", label: "เอกสาร", icon: <FileSearch size={18} strokeWidth={2.2} /> }
];

function getRoleLabel(role: string) {
  if (role === "admin") {
    return "แอดมิน";
  }

  if (role === "student") {
    return "ผู้จัดทำโครงการ";
  }

  return "ESC";
}

export function AppSidebar({ currentUser }: { currentUser: CurrentUser | null }) {
  const pathname = usePathname();
  const loginURL = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}/api/v1/auth/google/login`;
  const logoutURL = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}/api/v1/auth/logout`;

  return (
    <aside className="flex w-full flex-none rounded-[var(--content-radius)] bg-carmine px-5 py-7 text-white xl:min-h-[calc(100vh-(var(--shell-padding)*2))] xl:w-[var(--sidebar-width)] xl:px-7 xl:py-9">
      <div className="flex w-full flex-col">
        <div className="flex flex-col items-center gap-4 px-5">
          <Image alt="ESC" height={72} src="/icons/esc.svg" width={56} />
          <div className="text-center text-base font-semibold">Document System</div>
          <div className="mt-3 h-px w-full bg-white/70" />
        </div>

        <nav className="mt-9 flex flex-col gap-2 xl:mt-11">
          {primaryItems.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`) ||
              (item.href === "/projects" && pathname.startsWith("/project/"));

            return (
              <Link className="block" href={item.href} key={item.label}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-[14px] px-4 py-3 text-base font-medium leading-none transition-colors",
                    active ? "bg-white text-carmine" : "text-white hover:bg-white/10"
                  )}
                >
                  <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8">
          <div className="mb-5 h-px w-full bg-white/70" />

          {currentUser ? (
            <div className="space-y-4">
              <div className="px-4">
                <div className="truncate text-sm font-medium text-white">{currentUser.displayName || currentUser.email}</div>
                <div className="mt-1 text-xs text-white/70">{getRoleLabel(currentUser.role)}</div>
              </div>

              <Link
                className="flex items-center gap-3 rounded-[14px] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                href={logoutURL}
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  <LogOut size={16} strokeWidth={2.2} />
                </span>
                <span>ออกจากระบบ</span>
              </Link>
            </div>
          ) : (
            <Link
              className="flex items-center gap-3 rounded-[14px] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              href={loginURL}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                <LogIn size={16} strokeWidth={2.2} />
              </span>
              <span>เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
