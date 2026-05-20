import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PageSectionHeader({
  icon,
  title,
  href,
  linkLabel
}: {
  icon: React.ReactNode;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3 text-xl font-semibold text-black">
        <span className="text-black">{icon}</span>
        <span>{title}</span>
      </div>

      {href && linkLabel ? (
        <Link className="flex items-center gap-2 text-lg text-black" href={href}>
          {linkLabel}
          <ArrowRight className="h-6 w-6" />
        </Link>
      ) : null}
    </div>
  );
}
