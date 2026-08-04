import { AppContentSection } from "@/components/app-shell";

export function ContentRouteLoading() {
  return (
    <AppContentSection className="flex min-h-[70vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-500" />
    </AppContentSection>
  );
}
