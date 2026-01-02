import {
  Shield,
  Users,
  Settings,
  BarChart3,
  UserCog,
  FolderKanban,
  Plug,
} from "lucide-react";
import { CollapsibleSidebar, useCollapsibleSidebar, type NavItem } from "./CollapsibleSidebar";

interface AdminSidebarProps {
  onLogout: () => void;
  children?: React.ReactNode;
}

const adminNavItems: NavItem[] = [
  {
    path: "/dashboard/admin",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    path: "/dashboard/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    path: "/dashboard/admin/roles",
    label: "Roles",
    icon: UserCog,
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

export const AdminSidebar = ({ onLogout, children }: AdminSidebarProps) => {
  return (
    <CollapsibleSidebar
      navItems={adminNavItems}
      onLogout={onLogout}
      userRole="admin"
      userAvatar={
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 p-[1.5px] flex items-center justify-center">
          <div className="h-full w-full bg-background rounded-full flex items-center justify-center">
            <Shield className="h-5 w-5 text-orange-500" />
          </div>
        </div>
      }
    >
      {children}
    </CollapsibleSidebar>
  );
};

// Re-export the hook for backward compatibility
export const useAdminSidebar = useCollapsibleSidebar;
