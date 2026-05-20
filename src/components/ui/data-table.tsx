import type { TdHTMLAttributes, ThHTMLAttributes } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function DataTable({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full border-collapse text-left">{children}</table>
    </div>
  );
}

export function DataTableHead({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <thead>
      <tr className="border-b border-gray-300 text-base font-semibold text-black">{children}</tr>
    </thead>
  );
}

export function DataTableHeaderCell({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("whitespace-nowrap px-3 py-3", className)} {...props}>
      {children}
    </th>
  );
}

export function SortableHeaderCell({
  label,
  activeDirection,
  onClick,
  className
}: {
  label: string;
  activeDirection?: "asc" | "desc";
  onClick: () => void;
  className?: string;
}) {
  return (
    <DataTableHeaderCell className={className}>
      <button className="inline-flex items-center gap-2" onClick={onClick} type="button">
        <span>{label}</span>
        {activeDirection === "asc" ? <ArrowUp className="h-4 w-4" strokeWidth={2.2} /> : null}
        {activeDirection === "desc" ? <ArrowDown className="h-4 w-4" strokeWidth={2.2} /> : null}
      </button>
    </DataTableHeaderCell>
  );
}

export function DataTableBody({
  children
}: {
  children: React.ReactNode;
}) {
  return <tbody>{children}</tbody>;
}

export function DataTableRow({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tr className={cn("border-b border-gray-300 text-base text-black", className)}>{children}</tr>;
}

export function DataTableCell({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-3 py-4", className)} {...props}>
      {children}
    </td>
  );
}

export function EmptyTableRow({
  colSpan,
  children
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <DataTableRow className="text-gray-500">
      <DataTableCell className="px-3 py-10 text-center" colSpan={colSpan}>
        {children}
      </DataTableCell>
    </DataTableRow>
  );
}
