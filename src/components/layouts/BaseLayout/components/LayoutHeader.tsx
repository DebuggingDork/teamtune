import { useNavigate } from "react-router-dom";
import { Bell, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TeamTuneLogo from "@/components/TeamTuneLogo";
import { useAuth } from "@/hooks/useAuth";
import { ThemeSelector } from "@/components/ThemeSelector";
import { LayoutHeaderProps } from "../types";
import { UserAvatar } from "./UserAvatar";
import { getUserNameFromEmail } from "../hooks";
import { getProfileRouteForRole, getRoleDisplayName } from "../config";

/**
 * LayoutHeader Component
 *
 * Sticky header that appears at the top of all layouts.
 * Contains mobile menu trigger, theme toggle, notifications, and profile dropdown.
 *
 * @example
 * ```tsx
 * <LayoutHeader
 *   role="admin"
 *   onNotificationClick={() => setNotificationPanelOpen(true)}
 *   onMobileMenuClick={() => setMobileMenuOpen(true)}
 * />
 * ```
 */
export const LayoutHeader = ({
  role,
  onNotificationClick,
  onMobileMenuClick,
}: LayoutHeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.full_name || getUserNameFromEmail(user?.email || "");
  const roleLabel = user?.email || getRoleDisplayName(role);
  const profileRoute = getProfileRouteForRole(role);

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Mobile Logo/Menu Trigger */}
        <div className="flex items-center gap-4">
          <div
            className="lg:hidden cursor-pointer"
            onClick={onMobileMenuClick}
          >
            <TeamTuneLogo showText={false} />
          </div>
        </div>

        {/* Right Section: Theme Toggle, Notifications, Profile */}
        <div className="flex items-center gap-4">

          {/* Theme Selector */}
          <ThemeSelector />

          {/* Notifications */}
          <button
            onClick={onNotificationClick}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
          </button>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 p-2">
                <UserAvatar role={role} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-foreground">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {roleLabel}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => navigate(profileRoute)}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
