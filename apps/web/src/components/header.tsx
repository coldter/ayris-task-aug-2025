import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: session } = authClient.useSession();
  const isSuperAdmin = session?.user.role === "superadmin";
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    ...(isSuperAdmin
      ? [
          { to: "/testers", label: "Testers" },
          { to: "/supporters", label: "Supporters" },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-border/40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <nav className="flex items-center space-x-1">
          {links.map(({ to, label }) => {
            return (
              <Link
                key={to}
                to={to}
                className="relative inline-flex h-10 items-center justify-center rounded-md px-4 py-2 font-medium text-foreground/70 text-sm transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&.active]:bg-accent [&.active]:text-accent-foreground [&.active]:shadow-sm"
                activeProps={{
                  className:
                    "bg-accent text-accent-foreground shadow-sm font-semibold",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center space-x-3">
          <ModeToggle />
          <div className="h-6 w-px bg-border" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
