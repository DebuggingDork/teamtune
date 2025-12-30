import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMyTeams } from "@/hooks/useEmployee";
import { useTeamTasks } from "@/hooks/useTeamLead";
import {
  Users,
  MessageSquare,
  CheckSquare,
  User,
  Bell,
  Search,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  BarChart3,
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
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface TeamLeadLayoutProps {
  children: ReactNode;
  headerTitle?: string;
  headerDescription?: string;
  headerActions?: ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    path: "/dashboard/team-lead",
    label: "Overview",
    icon: BarChart3,
  },
  {
    path: "/dashboard/team-lead/tasks",
    label: "Tasks",
    icon: CheckSquare,
  },
  {
    path: "/dashboard/team-lead/feedback",
    label: "Feedback",
    icon: MessageSquare,
  },
  {
    path: "/dashboard/team-lead/team",
    label: "Team",
    icon: Users,
  },
];

export const TeamLeadLayout = ({
  children,
  headerTitle,
  headerDescription,
  headerActions,
}: TeamLeadLayoutProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch notifications (tasks needing review)
  const { data: teamsData } = useMyTeams(undefined, !!user);
  const teamCode = teamsData?.teams?.[0]?.team_code;

  // Use a stable filter object
  const taskFilters = { status: 'in_review' as const };
  const { data: tasksData } = useTeamTasks(teamCode || "", taskFilters);
  const notifications = tasksData?.tasks || [];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // On mobile, open menu; on desktop, navigate to home
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(true);
    } else {
      navigate("/");
    }
  };

  // Extract user name from email for display
  const getUserNameFromEmail = (email: string) => {
    if (!email) return "User";

    const namePart = email.split('@')[0];
    const nameParts = namePart.split(/[._-]/).map(part =>
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    );

    return nameParts.join(' ');
  };

  const displayName = user?.full_name || getUserNameFromEmail(user?.email || "");

  const isActive = (path: string) => {
    if (path === "/dashboard/team-lead") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search members..."
                  className="pl-10 pr-4 py-2 bg-accent border-none rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <p className="font-semibold">Notifications</p>
                    {notifications.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {notifications.length} pending reviews
                      </span>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((task: any) => (
                        <DropdownMenuItem
                          key={task.task_code}
                          className="flex flex-col items-start p-4 gap-1 cursor-pointer"
                          onClick={() => navigate("/dashboard/team-lead/tasks")}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span className="font-medium truncate flex-1">{task.title}</span>
                            <span className="text-xs text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">
                              Review
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {task.description || "No description"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Assigned to: {task.assigned_to_name || "Unknown"}
                          </p>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 p-2">
                    <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-foreground">
                        {displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email || "Team Lead"}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard/team-lead/profile")}
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
