"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSearch, FolderOpen, Home } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarItem = {
  href: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
};

const primaryItems: SidebarItem[] = [
  { href: "/", label: "หน้าหลัก", icon: <Home size={18} strokeWidth={2.2} /> },
  { href: "/projects", label: "โครงการ", icon: <FolderOpen size={18} strokeWidth={2.2} /> },
  { href: "#", label: "เอกสาร", icon: <FileSearch size={18} strokeWidth={2.2} />, disabled: true }
];

export function AppSidebar() {
  const pathname = usePathname();

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
            const active = item.href !== "#" && (pathname === item.href || pathname.startsWith(`${item.href}/`));
            const content = (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-[14px] px-4 py-3 text-base font-medium leading-none transition-colors",
                  active ? "bg-white text-red-700" : "text-white",
                  !active && !item.disabled && "hover:bg-white/10",
                  item.disabled && "cursor-not-allowed opacity-45"
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            );

            return item.disabled ? (
              <div className="block" key={item.label}>
                {content}
              </div>
            ) : (
              <Link className="block" href={item.href} key={item.label}>
                {content}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
