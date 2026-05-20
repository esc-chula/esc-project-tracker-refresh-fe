"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { CurrentUser } from "@/lib/api";

function getRoleLabel(role: string) {
  if (role === "admin") {
    return "แอดมิน";
  }

  if (role === "student") {
    return "ผู้จัดทำโครงการ";
  }

  return "ESC";
}

export function ProfileMenu({ currentUser }: { currentUser: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const logoutURL = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}/api/v1/auth/logout`;

  const roleLabel = useMemo(() => getRoleLabel(currentUser.role), [currentUser.role]);

  return (
    <div className="relative">
      <button className="flex items-center gap-3" onClick={() => setOpen((current) => !current)} type="button">
        <div className="min-w-0 text-right">
          <div className="max-w-[220px] truncate text-base font-medium leading-tight text-black">
            {currentUser.displayName || currentUser.email}
          </div>
          <div className="mt-1 text-sm leading-tight text-gray-500">{roleLabel}</div>
        </div>
        <ChevronDown className="h-5 w-5 text-black" />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+12px)] z-20 min-w-[180px] rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
          <Link
            className="block rounded-xl px-4 py-3 text-sm font-medium text-black transition hover:bg-gray-100"
            href={logoutURL}
            onClick={() => setOpen(false)}
          >
            ออกจากระบบ
          </Link>
        </div>
      ) : null}
    </div>
  );
}
