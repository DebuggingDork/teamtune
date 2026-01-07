import {
  Users,
} from "lucide-react";
import { CollapsibleSidebar, useCollapsibleSidebar } from "./CollapsibleSidebar";
import { getNavItemsForRole } from "./BaseLayout/config";

interface TeamLeadSidebarProps {
  onLogout: () => void;
  children?: React.ReactNode;
}

export const TeamLeadSidebar = ({ onLogout, children }: TeamLeadSidebarProps) => {
  const teamLeadNavItems = getNavItemsForRole("team-lead");

  return (
    <CollapsibleSidebar
      navItems={teamLeadNavItems}
      onLogout={onLogout}
      userRole="team-lead"
      userAvatar={
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
          <Users className="h-5 w-5 text-primary-foreground" />
        </div>
      }
    >
      {children}
    </CollapsibleSidebar>
  );
};

// Re-export the hook for convenience
export const useTeamLeadSidebar = useCollapsibleSidebar;



