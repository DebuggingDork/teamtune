import { useState } from "react";
import { motion } from "framer-motion";
import { useCollapsibleSidebar } from "../CollapsibleSidebar";
import NotificationPanel from "@/components/common/NotificationPanel";
import { BaseLayoutProps, UserRole } from "./types";
import { LayoutHeader, LayoutPageContent, MobileNavigation } from "./components";
import { getNavItemsForRole } from "./config";

interface BaseLayoutContentProps extends BaseLayoutProps {
  role: UserRole;
  onLogout: () => void;
}

/**
 * BaseLayout Component
 *
 * Core reusable layout component that provides consistent structure
 * for all role-based dashboards (Admin, Member, Team Lead, Project Manager).
 *
 * Features:
 * - Responsive sidebar integration (CollapsibleSidebar)
 * - Sticky header with theme toggle, notifications, and profile
 * - Mobile navigation drawer
 * - Notification panel
 * - Consistent page content wrapper with optional title/description/actions
 *
 * This component follows the same pattern as CollapsibleSidebar:
 * - Fully reusable core component
 * - Role-specific configuration passed via props
 * - Single source of truth for layout structure
 *
 * @example
 * ```tsx
 * <BaseLayout
 *   role="admin"
 *   onLogout={handleLogout}
 *   headerTitle="Dashboard"
 *   headerDescription="Welcome to your dashboard"
 * >
 *   <DashboardContent />
 * </BaseLayout>
 * ```
 */
export const BaseLayout = ({
  role,
  onLogout,
  children,
  headerTitle,
  headerDescription,
  headerActions,
}: BaseLayoutContentProps) => {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSidebarExpanded, isDesktop } = useCollapsibleSidebar();

  const navItems = getNavItemsForRole(role);

  return (
    <>
      <div className="min-h-screen bg-background relative">
        {/* Main Content */}
        <motion.main
          className="lg:ml-[64px]"
          animate={{
            marginLeft: isDesktop ? (isSidebarExpanded ? 256 : 64) : 0,
          }}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
        >
          {/* Header */}
          <LayoutHeader
            onNotificationClick={() => setIsNotificationPanelOpen(true)}
            onMobileMenuClick={() => setIsMobileMenuOpen(true)}
          />

          {/* Page Content */}
          <LayoutPageContent
            headerTitle={headerTitle}
            headerDescription={headerDescription}
            headerActions={headerActions}
          >
            {children}
          </LayoutPageContent>
        </motion.main>

        {/* Notification Panel */}
        <NotificationPanel
          isOpen={isNotificationPanelOpen}
          onClose={() => setIsNotificationPanelOpen(false)}
        />

        {/* Mobile Sidebar */}
        <MobileNavigation
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          navItems={navItems}
          onLogout={onLogout}
        />
      </div>
    </>
  );
};
