"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActiveLink, navLinks } from "./nav-links";
import { focusRingClassName } from "./styles";

type AppNavProps = {
  variant: "top" | "bottom";
};

/** The main navigation: links in the header on desktop, a tab bar at the bottom on phones. */
export function AppNav({ variant }: AppNavProps) {
  const pathname = usePathname();

  if (variant === "top") {
    return (
      <nav aria-label="Main" className="hidden gap-1 sm:flex">
        {navLinks.map((link) => {
          const isActive = isActiveLink(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full px-4 py-2 font-semibold ${
                isActive ? "bg-pine text-paper" : "hover:bg-paper"
              } ${focusRingClassName}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-ink/15 bg-paper-light pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <ul className="flex">
        {navLinks.map((link) => {
          const isActive = isActiveLink(pathname, link.href);
          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-14 items-center justify-center border-t-4 ${
                  isActive
                    ? "border-pine font-bold text-pine"
                    : "border-transparent font-medium"
                } ${focusRingClassName}`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
