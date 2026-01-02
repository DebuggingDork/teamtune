import { ReactNode } from "react";

export type UserRole = "admin" | "member" | "team-lead" | "project-manager";

export interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isButton?: boolean;
  onClick?: () => void;
}

export interface BaseLayoutProps {
  children: ReactNode;
  headerTitle?: string;
  headerDescription?: string;
  headerActions?: ReactNode;
}

export interface LayoutHeaderProps {
  onNotificationClick: () => void;
  onMobileMenuClick: () => void;
}

export interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  onLogout: () => void;
}

export interface LayoutPageContentProps {
  headerTitle?: string;
  headerDescription?: string;
  headerActions?: ReactNode;
  children: ReactNode;
}

export interface UserAvatarProps {
  role: UserRole;
  size?: "sm" | "md" | "lg";
  className?: string;
}
