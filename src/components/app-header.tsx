import type { CurrentUser } from "@/lib/api";
import { ProfileMenu } from "@/components/profile-menu";
import { Button } from "@/components/ui/button";

export function AppHeader({
  title,
  titleIcon,
  currentUser
}: {
  title: string;
  titleIcon: React.ReactNode;
  currentUser: CurrentUser | null;
}) {
  const loginURL = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}/api/v1/auth/google/login`;

  return (
    <header className="flex flex-col gap-5 xl:min-h-[56px] xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center gap-4 text-[32px] font-bold text-carmine md:text-[40px]">
        <span className="text-carmine">{titleIcon}</span>
        <h1>{title}</h1>
      </div>

      <div className="flex items-center justify-end gap-4">
        {currentUser ? (
          <ProfileMenu currentUser={currentUser} />
        ) : (
          <Button asChild className="h-[46px] rounded-2xl bg-red-700 px-6 text-[16px] font-semibold text-white hover:bg-red-800">
            <a href={loginURL}>เข้าสู่ระบบ</a>
          </Button>
        )}
      </div>
    </header>
  );
}
