export const navLinks = [
  { href: "/app", label: "Nights" },
  { href: "/app/games", label: "Shelf" },
];

/** Tells whether a nav link belongs to the page at this path. */
export function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/app") {
    // Nights covers /app itself and each night's page, but not the other sections.
    return pathname === "/app" || pathname.startsWith("/app/nights/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
