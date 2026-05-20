import { cn } from "@/lib/utils";

export function EmptyState({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-[260px] items-center justify-center text-center text-lg text-gray-500", className)}>
      {children}
    </div>
  );
}
