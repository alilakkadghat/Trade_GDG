"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Globe2,
  Settings,
  LogOut,
  Bell,
  Search,
  User,
  CircleHelp,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notifications = [
  {
    id: 1,
    title: "HS Code mismatch on SHP-2024-001",
    desc: "Commercial Invoice vs Shipping Bill differ on heading 1006.",
    time: "12 min ago",
    severity: "critical" as const,
  },
  {
    id: 2,
    title: "Red Sea reroute advisory",
    desc: "3 of your shipments to EU may face 6–9 day delays.",
    time: "1 hr ago",
    severity: "warning" as const,
  },
  {
    id: 3,
    title: "EU CBAM quarterly report due",
    desc: "Filing window closes in 9 days for Q1 2025.",
    time: "Yesterday",
    severity: "info" as const,
  },
];

const navItems = [
  { to: "/overview", label: "Overview", icon: Home },
  { to: "/documents", label: "Document Intelligence", icon: FileText },
  { to: "/compliance", label: "Compliance Checker", icon: ShieldCheck },
  { to: "/delays", label: "Delay Resolution", icon: AlertTriangle },
  { to: "/signals", label: "Geopolitical Signals", icon: Globe2 },
] as const;

const titleMap: Record<string, string> = {
  "/overview": "Overview",
  "/documents": "Document Intelligence",
  "/compliance": "Compliance Checker",
  "/delays": "Delay Resolution",
  "/signals": "Geopolitical Signals",
  "/settings": "User Settings",
};

export function AppShell({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const title = titleMap[pathname] ?? "TradeBot";

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-surface-low flex flex-col">
        <div className="px-6 pt-7 pb-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground grid place-items-center font-semibold">
              T
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-foreground">
                TradeBot
              </div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Export Intelligence
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                href={to}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${active
                  ? "bg-surface-lowest text-foreground font-medium"
                  : "text-muted-foreground hover:bg-surface-container hover:text-foreground"
                  }`}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-secondary" />
                )}
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6 space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-surface-container hover:text-foreground"
          >
            <Settings className="h-4 w-4" strokeWidth={1.75} />
            User Settings
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-surface-container hover:text-foreground"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-8 flex items-center justify-between bg-surface">
          <h1 className="text-base font-semibold text-foreground">{title}</h1>
          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-low text-sm text-muted-foreground w-72">
              <Search className="h-3.5 w-3.5" />
              <input
                placeholder="Search shipments, HS codes, signals…"
                className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Notifications"
                  className="relative h-9 w-9 grid place-items-center rounded-md hover:bg-surface-low text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  <Bell className="h-4 w-4" strokeWidth={1.75} />
                  <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[360px] p-0">
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <div>
                    <div className="text-sm font-semibold text-foreground">Notifications</div>
                    <div className="text-[11px] text-muted-foreground">
                      {notifications.length} unread
                    </div>
                  </div>
                  <button className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
                    Mark all read
                  </button>
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 hover:bg-surface-low cursor-pointer">
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${n.severity === "critical"
                            ? "bg-destructive"
                            : n.severity === "warning"
                              ? "bg-amber-500"
                              : "bg-secondary"
                            }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-foreground font-medium truncate">
                            {n.title}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {n.desc}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1">{n.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <Link
                  href="/signals"
                  className="block px-4 py-2.5 text-xs text-center text-muted-foreground hover:text-foreground hover:bg-surface-low"
                >
                  View all alerts
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="User menu"
                  className="h-9 w-9 rounded-md bg-primary text-primary-foreground grid place-items-center text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  R
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-2 py-2">
                  <div className="text-sm font-semibold text-foreground">Rohan Mehta</div>
                  <div className="text-xs text-muted-foreground">rohan@kanchan-exports.in</div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    Kanchan Exports Pvt Ltd
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal">
                  Account
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <User className="h-4 w-4" />
                    Profile & settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Workspace
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <CircleHelp className="h-4 w-4" />
                  Help & docs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login" className="cursor-pointer text-on-destructive-container">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-8 pb-12 pt-2 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
