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
    <div className="mb-4 flex items-center justify-between md:mb-6">
      <div className="flex items-center gap-2 text-base font-semibold md:gap-3 md:text-xl text-black">
        <span className="text-black">{icon}</span>
        <span>{title}</span>
      </div>

      {href && linkLabel ? (
        <Link className="flex items-center gap-1.5 text-base text-black md:gap-2 md:text-lg" href={href}>
          {linkLabel}
          <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
        </Link>
      ) : null}
    </div>
  );
}
