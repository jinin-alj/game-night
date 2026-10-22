import Link from "next/link";
import { LogOutButton } from "@/features/account/components/LogOutButton";
import { focusRingClassName } from "./styles";

type HeaderProps = {
  groupName: string | null;
};

/** The top bar of every logged-in page: app name, active group and Log out. */
export function Header({ groupName }: HeaderProps) {
  return (
    <header className="border-b border-ink/15 bg-paper-light">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <Link href="/app" className={`font-bold ${focusRingClassName}`}>
            Game Night Planner
          </Link>
          {groupName ? <p className="truncate text-sm">{groupName}</p> : null}
        </div>
        <LogOutButton />
      </div>
    </header>
  );
}
