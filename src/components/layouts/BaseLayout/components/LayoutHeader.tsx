import { Bell } from "lucide-react";
import TeamTuneLogo from "@/components/TeamTuneLogo";
import { ThemeSelector } from "@/components/ThemeSelector";
import { LayoutHeaderProps } from "../types";

/**
 * LayoutHeader Component
 * 
 * Clean header with only theme toggle and notifications.
 * Profile functionality has been moved to sidebar.
 */
export const LayoutHeader = ({
  onNotificationClick,
  onMobileMenuClick,
}: LayoutHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 px-6 py-4 shadow-sm">
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

        {/* Right Section: Only Theme Toggle and Notifications */}
        <div className="flex items-center gap-4">
          <ThemeSelector />
          
          <button
            onClick={onNotificationClick}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
};