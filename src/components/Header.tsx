import Link from "next/link";
import { LogOutButton } from "@/features/account/components/LogOutButton";
import { GroupSwitcher } from "@/features/groups/components/GroupSwitcher";
import type { ActiveGroup } from "@/features/groups/queries";
import { AppNav } from "./AppNav";
import { DecorativeArt } from "./DecorativeArt";
import { focusRingClassName } from "./styles";

type HeaderProps = {
  activeGroup: ActiveGroup | null;
  myGroups: ActiveGroup[];
};

/** The top bar of every logged-in page: app name, group switcher, nav and Log out. */
export function Header({ activeGroup, myGroups }: HeaderProps) {
  return (
    <header className="border-b border-ink/15 bg-paper-light">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <Link href="/app" className={`font-bold ${focusRingClassName}`}>
            Game Night Planner
          </Link>
          {activeGroup && myGroups.length > 1 ? (
            <GroupSwitcher groups={myGroups} activeGroupId={activeGroup.id} />
          ) : null}
          {activeGroup && myGroups.length <= 1 ? (
            <p className="truncate text-sm">{activeGroup.name}</p>
          ) : null}
        </div>
        <AppNav variant="top" />
        <LogOutButton />
      </div>
      <DecorativeArt
        src="/art/horizon-strip.svg"
        width={2400}
        height={180}
        className="h-6 w-full object-cover sm:h-8"
      />
    </header>
  );
}
