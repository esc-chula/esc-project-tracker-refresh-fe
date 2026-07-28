"use client";

import Link from "next/link";

export function ProjectCard({
  href,
  code,
  title,
  subtitle,
  compact = false
}: {
  href: string;
  code: string;
  title: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <Link href={href}>
      <div className="rounded-2xl bg-gray-100 px-5 py-5 transition hover:bg-gray-200">
        <div className={compact ? "text-2xl font-bold leading-8 text-black" : "text-xl font-bold text-black"}>
          {code || "NEW"}
        </div>
        <div className={compact ? "mt-3 line-clamp-1 text-sm text-gray-700" : "mt-3 line-clamp-1 text-lg font-medium text-black"}>
          {title}
        </div>
        {subtitle ? <div className="mt-2 line-clamp-2 text-sm text-gray-500">{subtitle}</div> : null}
      </div>
    </Link>
  );
}
