import { Button } from "@/components/ui/button";
import { InfoIcon } from "@/components/ui/document-action-icons";

const PROJECT_DRIVE_URL =
  "https://drive.google.com/drive/folders/1gGlGOrF3il1geaFgNT79kPgWeU3cQGEh?usp=drive_link";

export function DocumentProcessLink() {
  return (
    <Button asChild type="button" variant="outline">
      <a
        className="h-10 gap-2 rounded-2xl px-4 text-sm font-medium text-gray-600 hover:text-black md:h-12 md:px-6 md:text-base"
        href={PROJECT_DRIVE_URL}
        rel="noreferrer"
        target="_blank"
      >
        <InfoIcon className="h-5 w-5 md:h-6 md:w-6" />
        การดำเนินเอกสาร
      </a>
    </Button>
  );
}
