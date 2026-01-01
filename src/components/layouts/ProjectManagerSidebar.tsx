import { Briefcase, FolderKanban, Calendar, BarChart3 } from "lucide-react";
import { CollapsibleSidebar, useCollapsibleSidebar, type NavItem } from "./CollapsibleSidebar";

interface ProjectManagerSidebarProps {
  onLogout: () => void;
  children?: React.ReactNode;
}

const projectManagerNavItems: NavItem[] = [
  {
    path: "/dashboard/project-manager",
    label: "Overview",
    icon: BarChart3,
  },
  {
    path: "/dashboard/project-manager/projects",
    label: "Projects",
    icon: FolderKanban,
  },
  {
    path: "/dashboard/project-manager/timeline",
    label: "Timeline",
    icon: Calendar,
  },
  {
    path: "/dashboard/project-manager/reports",
    label: "Reports",
    icon: BarChart3,
  },
];

export const ProjectManagerSidebar = ({ onLogout, children }: ProjectManagerSidebarProps) => {
  return (
    <CollapsibleSidebar
      navItems={projectManagerNavItems}
      onLogout={onLogout}
      userRole="project-manager"
      userAvatar={
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
          <Briefcase className="h-5 w-5 text-primary-foreground" />
        </div>
      }
    >
      {children}
    </CollapsibleSidebar>
  );
};

// Re-export the hook for convenience
export const useProjectManagerSidebar = useCollapsibleSidebar;

