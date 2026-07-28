"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { getLogoutURL, type CurrentUser } from "@/lib/api";
import { cn } from "@/lib/utils";

export function AppNavProfile({ currentUser }: { currentUser: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        className="flex items-center gap-2 text-black outline-none sm:gap-3 md:gap-4"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <ProfileAvatar className="h-9 w-9 md:h-10 md:w-10 xl:h-[50px] xl:w-[50px]" role={currentUser.role} />
        <span className="hidden max-w-[120px] truncate text-sm font-medium leading-6 sm:inline md:max-w-[140px] md:text-base md:leading-7 xl:max-w-[160px] xl:leading-8">
          {currentUser.displayName}
        </span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform md:h-6 md:w-6 xl:h-7 xl:w-7", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-48 overflow-hidden rounded-2xl border border-gray-200 bg-white py-2 text-sm font-normal shadow-lg">
          <button
            className="block w-full px-4 py-2 text-left text-black hover:bg-gray-50"
            onClick={() => {
              window.dispatchEvent(new Event("open-profile-modal"));
              setOpen(false);
            }}
            type="button"
          >
            แก้ไขโปรไฟล์
          </button>
          <a className="block px-4 py-2 text-black hover:bg-gray-50" href={getLogoutURL()}>
            ออกจากระบบ
          </a>
        </div>
      ) : null}
    </div>
  );
}
