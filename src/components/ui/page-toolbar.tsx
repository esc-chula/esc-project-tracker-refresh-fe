import { cn } from "@/lib/utils";

export function PageToolbar({
  search,
  action,
  controls,
  trailing,
  className
}: {
  search: React.ReactNode;
  action?: React.ReactNode;
  controls?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">{search}</div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {controls || trailing ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">{controls}</div>
          {trailing ? <div className="flex items-center gap-3">{trailing}</div> : null}
        </div>
      ) : null}
    </section>
  );
}
