import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, createContext, useContext, ReactNode } from "react";
import { LogOut, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import TeamTuneLogo from "@/components/TeamTuneLogo";
import { cn } from "@/lib/utils";
import { getProfileRouteForRole } from "./BaseLayout/config";
import { UserRole } from "./BaseLayout/types";

interface SidebarContextType {
  isSidebarExpanded: boolean;
  isDesktop: boolean;
  setIsSidebarExpanded: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CollapsibleSidebarProps {
  navItems: NavItem[];
  onLogout: () => void;
  children?: ReactNode;
  logoComponent?: ReactNode;
  userAvatar?: ReactNode;
  collapseDelay?: number;
  clickCollapseDelay?: number;
  userRole?: UserRole;
}

const CollapsibleSidebarContent = ({
  navItems,
  onLogout,
  logoComponent,
  userAvatar,
  collapseDelay = 300,
  clickCollapseDelay = 200,
  userRole,
}: Omit<CollapsibleSidebarProps, "children">) => {
  const location = useLocation();
  const { isSidebarExpanded, setIsSidebarExpanded } = useCollapsibleSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hoverZoneRef = useRef<HTMLDivElement>(null);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = (path: string) => {
    // Handle root dashboard paths specially
    const rootPaths = ["/dashboard/admin", "/dashboard/member", "/dashboard/team-lead", "/dashboard/project-manager"];
    if (rootPaths.includes(path)) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    // Clear any pending collapse
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
    setIsSidebarExpanded(true);
  };

  const handleMouseLeave = () => {
    // Add delay before collapsing to allow for clicks
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
    }
    collapseTimeoutRef.current = setTimeout(() => {
      setIsSidebarExpanded(false);
      collapseTimeoutRef.current = null;
    }, collapseDelay);
  };

  const handleLinkClick = () => {
    // Collapse sidebar after a short delay when clicking a link
    setTimeout(() => {
      setIsSidebarExpanded(false);
    }, clickCollapseDelay);
  };

  return (
    <>
      {/* Hover Zone - Invisible trigger area on the left */}
      <div
        ref={hoverZoneRef}
        className="fixed left-0 top-0 h-full w-[60px] z-40 hidden lg:block"
        onMouseEnter={handleMouseEnter}
      />

      {/* Collapsible Sidebar */}
      <motion.aside
        ref={sidebarRef}
        className="fixed left-0 top-0 h-full bg-[#0f0f0f] dark:bg-[#0a0a0a] border-r border-border/10 hidden lg:flex flex-col z-50 shadow-xl"
        initial={false}
        animate={{
          width: isSidebarExpanded ? 256 : 64,
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-4">
          {/* Logo/Icon at top */}
          <Link to="/" className="flex items-center justify-center">
            {isSidebarExpanded ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                {logoComponent || <TeamTuneLogo />}
              </motion.div>
            ) : (
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                {logoComponent ? (
                  <div className="h-8 w-8 flex items-center justify-center">
                    {logoComponent}
                  </div>
                ) : (
                  <TeamTuneLogo showText={false} />
                )}
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 px-3 mt-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg w-full transition-all",
                    active
                      ? "text-foreground bg-white/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <AnimatePresence>
                    {isSidebarExpanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          "whitespace-nowrap overflow-hidden",
                          active && "font-medium"
                        )}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-border/10 pt-4 pb-4 px-3">
          {/* Profile Link */}
          {userRole && (
            <div className="mb-4">
              <Link
                to={getProfileRouteForRole(userRole)}
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg w-full transition-all text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                <User className="h-5 w-5 shrink-0" />
                <AnimatePresence>
                  {isSidebarExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      Profile
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </div>
          )}

          {/* Sign Out Button */}
          <AnimatePresence>
            {isSidebarExpanded ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex justify-center"
              >
                {/* Sign Out Icon */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={onLogout}
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Avatar at bottom */}
          <div className="mt-4 flex justify-center">
            {userAvatar || (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 p-[1.5px] flex items-center justify-center">
                <div className="h-full w-full bg-background rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export const CollapsibleSidebar = ({
  navItems,
  onLogout,
  children,
  logoComponent,
  userAvatar,
  collapseDelay = 300,
  clickCollapseDelay = 200,
  userRole,
}: CollapsibleSidebarProps) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if desktop on mount and resize
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Handle mouse movement for hover zone detection
  useEffect(() => {
    if (!isDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      const hoverZoneWidth = 60; // Width of hover zone
      const isNearLeftEdge = e.clientX <= hoverZoneWidth;

      if (isNearLeftEdge && !isSidebarExpanded) {
        setIsSidebarExpanded(true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isSidebarExpanded, isDesktop]);

  return (
    <SidebarContext.Provider value={{ isSidebarExpanded, isDesktop, setIsSidebarExpanded }}>
      <CollapsibleSidebarContent
        navItems={navItems}
        onLogout={onLogout}
        logoComponent={logoComponent}
        userAvatar={userAvatar}
        collapseDelay={collapseDelay}
        clickCollapseDelay={clickCollapseDelay}
        userRole={userRole}
      />
      {children}
    </SidebarContext.Provider>
  );
};

export const useCollapsibleSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    // Fallback if used outside of sidebar context (shouldn't happen, but safe fallback)
    return {
      isSidebarExpanded: false,
      isDesktop: typeof window !== "undefined" && window.innerWidth >= 1024,
      setIsSidebarExpanded: () => {},
    };
  }
  return context;
};

