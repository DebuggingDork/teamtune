import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  Settings,
  BarChart3,
  Bell,

  LogOut,
  UserCheck,
  UserX,
  Clock,
  UserCog,
  FolderKanban,
  Plug,
  User,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import TeamTuneLogo from "@/components/TeamTuneLogo";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import NotificationPanel from "@/components/shared/NotificationPanel";
import { ThemeSelector } from "@/components/ThemeSelector";

interface AdminLayoutProps {
  children: ReactNode;
  headerTitle?: string;
  headerDescription?: string;
  headerActions?: ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isButton?: boolean;
  onClick?: () => void;
}

export const AdminLayout = ({
  children,
  headerTitle,
  headerDescription,
  headerActions,
}: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/dashboard/admin") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const navItems: NavItem[] = [
    {
      path: "/dashboard/admin",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      path: "/dashboard/admin/users",
      label: "Users",
      icon: Users,
      isButton: true,
      onClick: () => navigate("/dashboard/admin"),
    },
    {
      path: "/dashboard/admin/roles",
      label: "Roles",
      icon: UserCog,
      isButton: true,
      onClick: () => navigate("/dashboard/admin"),
    },
    {
      path: "/dashboard/admin/projects",
      label: "Projects",
      icon: FolderKanban,
    },
    {
      path: "/dashboard/admin/settings",
      label: "Settings",
      icon: Settings,
    },
    {
      path: "/dashboard/admin/plugins",
      label: "Plugins",
      icon: Plug,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 hidden lg:flex flex-col">
        <div onClick={handleLogoClick} className="cursor-pointer">
          <TeamTuneLogo />
        </div>

        <nav className="mt-8 flex-1">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              if (item.isButton && item.onClick) {
                return (
                  <button
                    key={item.path}
                    onClick={item.onClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors",
                      active
                        ? "font-medium text-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors",
                    active
                      ? "font-medium text-foreground bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-border pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="lg:hidden cursor-pointer"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <TeamTuneLogo showText={false} />
              </div>

            </div>
            <div className="flex items-center gap-4">
              <ThemeSelector />

              {/* Notifications */}
              <button
                onClick={() => setIsNotificationPanelOpen(true)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bell className="h-5 w-5" />

              </button>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 p-2">
                    <div className="relative h-8 w-8 rounded-full flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 rounded-full opacity-70 blur-[3px]"></div>
                      <div className="relative h-8 w-8 bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center p-[1.5px]">
                        <div className="h-full w-full bg-background rounded-full flex items-center justify-center">
                          <Shield className="h-4 w-4 text-orange-500 drop-shadow-[0_0_3px_rgba(251,146,60,0.6)]" />
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-foreground">
                        {user?.full_name || "Admin User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email || "System Administrator"}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard/admin/profile")}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {(headerTitle || headerDescription || headerActions) && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                {headerTitle && (
                  <h1 className="text-2xl font-bold text-foreground">
                    {headerTitle}
                  </h1>
                )}
                {headerActions && <div>{headerActions}</div>}
              </div>
              {headerDescription && (
                <p className="text-muted-foreground">{headerDescription}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-6 border-b border-border">
            <SheetTitle className="text-left">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                <TeamTuneLogo />
              </Link>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex-1 p-6">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                if (item.isButton && item.onClick) {
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        item.onClick?.();
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors",
                        active
                          ? "font-medium text-foreground bg-accent"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors",
                      active
                        ? "font-medium text-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
          <div className="border-t border-border p-6">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={async () => {
                await handleLogout();
                setIsMobileMenuOpen(false);
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

