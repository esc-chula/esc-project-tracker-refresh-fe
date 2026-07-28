"use client";

import { Trash2 } from "lucide-react";
import { DefaultFileIcon, FileBadgeIcon, WordBadgeIcon } from "@/components/ui/document-action-icons";
import { cn } from "@/lib/utils";

type FilePreviewChipProps = {
  className?: string;
  fileName: string;
  href?: string;
  mimeType?: string;
  onDelete?: () => void;
};

function normalizeFileHref(rawValue?: string) {
  const trimmedValue = rawValue?.trim();
  if (!trimmedValue) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue.replace(/^\/+/, "")}`;
}

function getFileIcon(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "pdf") {
    return <FileBadgeIcon className="h-5 w-5 shrink-0" />;
  }

  if (extension === "docx") {
    return <WordBadgeIcon className="h-5 w-5 shrink-0" />;
  }

  return <DefaultFileIcon className="h-5 w-5 shrink-0" />;
}

export function FilePreviewChip({ className, fileName, href, mimeType, onDelete }: FilePreviewChipProps) {
  const isPDF = (mimeType ?? fileName).toLowerCase().includes("pdf");
  const normalizedHref = normalizeFileHref(href);

  const content = (
    <>
      {getFileIcon(fileName)}
      <div className="max-w-[260px] truncate text-sm leading-6 text-black">{fileName}</div>
    </>
  );

  const chipClassName = cn(
    "inline-flex h-11 max-w-full items-center gap-3 rounded-2xl border border-black bg-white px-4",
    normalizedHref && "cursor-pointer hover:bg-gray-50",
    className
  );

  return (
    <div className={chipClassName}>
      {normalizedHref ? (
        <a
          className="inline-flex min-w-0 max-w-full cursor-pointer items-center gap-3 text-left"
          href={normalizedHref}
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          target={isPDF ? "_blank" : undefined}
          download={isPDF ? undefined : fileName}
        >
          {content}
        </a>
      ) : (
        <div className="inline-flex min-w-0 flex-1 items-center gap-3">{content}</div>
      )}

      {onDelete ? (
        <button
          aria-label="ลบไฟล์"
          className="ml-1 shrink-0 text-gray-500 transition hover:text-red-700"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          type="button"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2.2} />
        </button>
      ) : null}
    </div>
  );
}
