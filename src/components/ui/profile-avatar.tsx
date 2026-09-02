"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  role?: string;
  className?: string;
};

export function ProfileAvatar({ role, className }: ProfileAvatarProps) {
  const usesStaffIcon = role === "secretary" || role === "finance";

  return (
    <div className={cn("relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full", className)}>
      <Image alt="" className="h-full w-full object-contain" fill sizes="56px" src={usesStaffIcon ? "/icons/admin-profile.svg" : "/icons/circle-user-round.svg"} />
    </div>
  );
}
