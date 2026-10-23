import { cn } from "@/lib/utils";

export function EmptyState({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-[260px] items-center justify-center text-center text-base text-gray-500 md:text-lg", className)}>
      {children}
    </div>
  );
}
