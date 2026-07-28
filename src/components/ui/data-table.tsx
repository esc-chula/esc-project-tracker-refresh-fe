import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function DataTable({
  children,
  className,
  tableClassName
}: {
  children: React.ReactNode;
  className?: string;
  tableClassName?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className={cn("w-full border-collapse text-left", tableClassName)}>{children}</table>
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
      <tr className="border-b border-gray-300 text-xs font-semibold text-black md:text-base">{children}</tr>
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
    <th className={cn("overflow-hidden whitespace-nowrap px-2 py-2.5 md:px-3 md:py-3", className)} {...props}>
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
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("border-b border-gray-300 text-xs text-black data-[selected=true]:bg-gray-50 md:text-base", className)} {...props}>
      {children}
    </tr>
  );
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
    <td className={cn("overflow-hidden px-2 py-3 md:px-3 md:py-4", className)} {...props}>
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
