import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
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
  CheckCircle,
  XCircle,
  FolderKanban,
  UsersRound,
  UserCog,
  Layers,
  Loader2,
  Plug,
  ChevronDown,
  User,
  CheckSquare,
  Square,
  X,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TeamTuneLogo from "@/components/TeamTuneLogo";
import { useAuth } from "@/hooks/useAuth";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useTabPersistence } from "@/hooks/useTabPersistence";
import { usePendingUsers, useAllUsers, useApproveUser, useRejectUser, useUnblockUser, useBulkApproveUsers, useBulkRejectUsers } from "@/hooks/useAdmin";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminRoles from "@/components/admin/AdminRoles";
import AdminSettings from "@/components/admin/AdminSettings";
import NotificationPanel from "@/components/shared/NotificationPanel";

import type { UserRole } from "@/api/types";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: pendingUsers = [], isLoading: isLoadingPending } = usePendingUsers();
  const { data: usersData, isLoading: isLoadingAll } = useAllUsers();
  const allUsers = usersData?.users || [];
  const approveUserMutation = useApproveUser();
  const rejectUserMutation = useRejectUser();
  const unblockUserMutation = useUnblockUser();
  const bulkApproveMutation = useBulkApproveUsers();
  const bulkRejectMutation = useBulkRejectUsers();
  const { activeTab, setActiveTab } = useTabPersistence({
    defaultTab: "dashboard",
    validTabs: ["dashboard", "users", "roles"]
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isBulkApproveDialogOpen, setIsBulkApproveDialogOpen] = useState(false);
  const [isBulkRejectDialogOpen, setIsBulkRejectDialogOpen] = useState(false);
  const [bulkApproveRole, setBulkApproveRole] = useState<UserRole>("employee");
  const [bulkApproveDepartmentId, setBulkApproveDepartmentId] = useState<string>("");
  const [bulkRejectReason, setBulkRejectReason] = useState<string>("");
  const [bulkOperationResult, setBulkOperationResult] = useState<any>(null);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  // Track selected role for each pending user
  const [userRoles, setUserRoles] = useState<Record<string, UserRole>>({});
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleRoleChange = (userId: string, role: UserRole) => {
    setUserRoles((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  const handleApprove = async (id: string) => {
    const selectedRole = userRoles[id] || "employee"; // Default to "employee"
    approveUserMutation.mutate({
      id,
      data: { role: selectedRole },
    });
  };

  const handleReject = async (id: string) => {
    rejectUserMutation.mutate({
      id,
      data: { reason: "Rejected by admin" },
    });
  };

  const handleUnblock = async (id: string) => {
    const userToUnblock = blockedUsersList.find(u => u.id === id);
    unblockUserMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "User Unblocked",
          description: `${userToUnblock?.full_name || 'User'} has been unblocked successfully`,
        });
      },
    });
  };

  // Bulk action handlers
  const handleToggleBulkMode = () => {
    setIsBulkMode(!isBulkMode);
    if (isBulkMode) {
      setSelectedUserIds(new Set());
    }
  };

  const handleSelectAll = () => {
    if (selectedUserIds.size === pendingUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(pendingUsers.map(u => u.id)));
    }
  };

  const handleToggleUser = (userId: string) => {
    if (!isBulkMode) return;
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleBulkApprove = async () => {
    if (selectedUserIds.size === 0) {
      toast({
        title: "No users selected",
        description: "Please select at least one user to approve",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await bulkApproveMutation.mutateAsync({
        user_ids: Array.from(selectedUserIds),
        role: bulkApproveRole,
        department_id: bulkApproveDepartmentId || undefined,
      });

      setBulkOperationResult(result);
      setIsBulkApproveDialogOpen(false);
      setIsResultDialogOpen(true);
      setSelectedUserIds(new Set());
      setBulkApproveRole("employee");
      setBulkApproveDepartmentId("");
      setIsBulkMode(false);

      toast({
        title: "Bulk Approval Complete",
        description: `Approved ${result.total_approved} of ${result.total_requested} users`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve users",
        variant: "destructive",
      });
    }
  };

  const handleBulkReject = async () => {
    if (selectedUserIds.size === 0) {
      toast({
        title: "No users selected",
        description: "Please select at least one user to reject",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await bulkRejectMutation.mutateAsync({
        user_ids: Array.from(selectedUserIds),
        reason: bulkRejectReason || "Rejected by admin",
      });

      setBulkOperationResult(result);
      setIsBulkRejectDialogOpen(false);
      setIsResultDialogOpen(true);
      setSelectedUserIds(new Set());
      setBulkRejectReason("");
      setIsBulkMode(false);

      toast({
        title: "Bulk Rejection Complete",
        description: `Rejected ${result.total_rejected} of ${result.total_requested} users`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject users",
        variant: "destructive",
      });
    }
  };

  // Calculate stats from real data
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter(u => u.status === "active").length;
  const blockedUsers = allUsers.filter(u => u.status === "blocked").length;
  const pendingCount = pendingUsers.length;
  const blockedUsersList = allUsers.filter(u => u.status === "blocked");

  // Role distribution
  const roleDistribution = {
    admin: allUsers.filter(u => u.role === "admin").length,
    project_manager: allUsers.filter(u => u.role === "project_manager").length,
    team_lead: allUsers.filter(u => u.role === "team_lead").length,
    employee: allUsers.filter(u => u.role === "employee").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 hidden lg:flex flex-col">
        <Link to="/">
          <TeamTuneLogo />
        </Link>

        <nav className="mt-8 flex-1">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg w-full text-left transition-colors ${activeTab === "dashboard"
                ? "text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${activeTab === "users"
                ? "font-medium text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
            >
              <Users className="h-4 w-4" />
              Users
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${activeTab === "roles"
                ? "font-medium text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
            >
              <UserCog className="h-4 w-4" />
              Roles
            </button>
            <Link
              to="/dashboard/admin/projects"
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <FolderKanban className="h-4 w-4" />
              Projects
            </Link>
            <Link
              to="/dashboard/admin/settings"
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <Link
              to="/dashboard/admin/plugins"
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Plug className="h-4 w-4" />
              Plugins
            </Link>
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
                      <p className="text-sm font-medium text-foreground">{user?.full_name || "Admin User"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || "System Administrator"}</p>
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

        {/* Dashboard Content */}
        <div className="p-8 space-y-10">
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto space-y-12"
            >
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground transition-all">
                  System Overview
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Monitor and manage your organization's health, user access, and system-wide configurations.
                </p>
              </div>

              {/* System Overview Stats - Glowing KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: "Total Users",
                    value: totalUsers,
                    icon: Users,
                    color: "primary",
                    isLoading: isLoadingAll,
                    glow: "rgba(59, 130, 246, 0.5)" // Blue
                  },
                  {
                    label: "Pending",
                    value: pendingCount,
                    icon: Clock,
                    color: "warning",
                    isLoading: isLoadingPending,
                    glow: "rgba(245, 158, 11, 0.5)" // Amber
                  },
                  {
                    label: "Active",
                    value: activeUsers,
                    icon: UserCheck,
                    color: "emerald",
                    isLoading: isLoadingAll,
                    glow: "rgba(16, 185, 129, 0.5)" // Emerald
                  },
                  {
                    label: "Blocked",
                    value: blockedUsers,
                    icon: UserX,
                    color: "destructive",
                    isLoading: isLoadingAll,
                    glow: "rgba(239, 68, 68, 0.5)" // Red
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="relative group cursor-default"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur-sm"></div>
                    <div className={`relative bg-card border border-border/50 rounded-2xl p-7 flex flex-col justify-between h-full transition-all duration-300 group-hover:border-${stat.color}/50 group-hover:shadow-[0_0_30px_-10px_${stat.glow}]`}>
                      <div className="flex items-center justify-between mb-6">
                        <div className={`p-3 rounded-xl bg-${stat.color}/10 text-${stat.color} ring-1 ring-${stat.color}/20 group-hover:ring-${stat.color}/40 transition-all duration-300`}>
                          {stat.isLoading ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <stat.icon className="h-6 w-6" />
                          )}
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-4xl font-black text-foreground tabular-nums">
                          {stat.isLoading ? "..." : stat.value}
                        </h3>
                        <div className="flex items-center gap-1.5 pt-2">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${stat.color} animate-pulse shadow-[0_0_8px_${stat.glow}]`} />
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Live Monitoring</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Middle Section: Role Distribution & Pending Approvals */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Role Distribution - Left Column (2/3) */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="xl:col-span-2 space-y-6"
                >
                  <div className="flex items-end justify-between px-2">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-foreground">Role Distribution</h2>
                      <p className="text-sm text-muted-foreground">User density across organizational roles</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { role: "Admins", count: roleDistribution.admin, icon: Shield, color: "orange", desc: "System-wide access" },
                      { role: "Project Managers", count: roleDistribution.project_manager, icon: FolderKanban, color: "blue", desc: "Overseeing initiatives" },
                      { role: "Team Leads", count: roleDistribution.team_lead, icon: UsersRound, color: "purple", desc: "Group coordination" },
                      { role: "Members", count: roleDistribution.employee, icon: Users, color: "emerald", desc: "Direct contributors" },
                    ].map((item, i) => (
                      <motion.div
                        key={item.role}
                        whileHover={{ scale: 1.01, x: 5 }}
                        className="group relative bg-card/40 backdrop-blur-md border border-border/50 rounded-xl p-5 hover:bg-card hover:border-border transition-all duration-300"
                      >
                        <div className={`absolute inset-y-0 left-0 w-1 bg-${item.color}-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-tl-xl rounded-bl-xl`} />
                        <div className="flex items-center gap-5">
                          <div className={`p-4 bg-${item.color}-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300 ring-1 ring-${item.color}-500/20`}>
                            <item.icon className={`h-6 w-6 text-${item.color}-500`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline justify-between">
                              <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{item.role}</h4>
                              <p className="text-2xl font-black text-foreground">{item.count}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* System Activity Sidebar? No, user asks for Pending Approvals and Administrative Controls in Role context */}
                {/* Actually let's group them as requested */}
              </div>

              {/* Pending Approvals Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className={`relative overflow-hidden bg-card/30 backdrop-blur-xl border-2 border-warning/20 rounded-2xl p-8 transition-all duration-500 ${isBulkMode ? 'ring-4 ring-primary/20 bg-card/50' : ''}`}
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Clock className="w-32 h-32 text-warning rotate-12" />
                </div>

                <div className="relative z-10 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-warning/10 rounded-2xl ring-2 ring-warning/30">
                        <Clock className="h-7 w-7 text-warning animate-pulse" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-foreground tracking-tight">Access Requests</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="bg-warning/10 text-warning hover:bg-warning/20 border-warning/30 transition-colors">
                            {pendingUsers.length} Pending Approval
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {pendingUsers.length > 0 && (
                        !isBulkMode ? (
                          <Button
                            variant="secondary"
                            onClick={handleToggleBulkMode}
                            className="bg-card hover:bg-accent border border-border px-6 py-6 rounded-xl hover:shadow-lg transition-all duration-300 font-bold"
                          >
                            <CheckSquare className="h-5 w-5 mr-2" />
                            Multi-Select
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            onClick={handleToggleBulkMode}
                            className="text-muted-foreground hover:text-foreground font-bold"
                          >
                            <X className="h-5 w-5 mr-1" />
                            Cancel
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Bulk Select Control Bar */}
                  <AnimatePresence>
                    {isBulkMode && pendingUsers.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-5 bg-accent/30 rounded-2xl border border-primary/20 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-5">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSelectAll}
                              className="bg-card/50 rounded-lg font-bold py-5"
                            >
                              {selectedUserIds.size === pendingUsers.length ? (
                                <CheckSquare className="h-5 w-5 mr-2 text-primary" />
                              ) : (
                                <Square className="h-5 w-5 mr-2" />
                              )}
                              {selectedUserIds.size === pendingUsers.length ? "Deselect All" : "Select All Requests"}
                            </Button>
                            {selectedUserIds.size > 0 && (
                              <Badge variant="default" className="text-sm font-black px-4 py-1.5 shadow-lg shadow-primary/20 animate-in zoom-in">
                                {selectedUserIds.size} User{selectedUserIds.size === 1 ? '' : 's'} Selected
                              </Badge>
                            )}
                          </div>
                          {selectedUserIds.size > 0 && (
                            <div className="flex items-center gap-3">
                              <Button
                                variant="default"
                                onClick={() => setIsBulkApproveDialogOpen(true)}
                                className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold rounded-xl px-6 py-5"
                              >
                                <UserCheck className="h-5 w-5 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => setIsBulkRejectDialogOpen(true)}
                                className="shadow-lg shadow-destructive/20 font-bold rounded-xl px-6 py-5"
                              >
                                <UserX className="h-5 w-5 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isLoadingPending ? (
                      <div className="col-span-full flex flex-col items-center justify-center p-20 space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground font-medium">Retrieving secure access requests...</p>
                      </div>
                    ) : pendingUsers.length === 0 ? (
                      <div className="col-span-full py-16 flex flex-col items-center justify-center bg-accent/20 rounded-2xl border border-dashed border-border">
                        <div className="p-4 bg-background rounded-full mb-4 shadow-inner">
                          <CheckCircle className="h-10 w-10 text-emerald-500" />
                        </div>
                        <h4 className="text-lg font-bold text-foreground">Inbox Zero</h4>
                        <p className="text-sm text-muted-foreground">All access requests have been processed.</p>
                      </div>
                    ) : (
                      pendingUsers.map((pendingUser, idx) => {
                        const isSelected = isBulkMode && selectedUserIds.has(pendingUser.id);
                        return (
                          <motion.div
                            key={pendingUser.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className={`group flex items-center justify-between p-5 rounded-2xl transition-all duration-300 ${isSelected
                              ? "bg-primary/5 border-2 border-primary shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                              : "bg-card/40 border border-border hover:border-warning/30 hover:bg-card/60"
                              }`}
                          >
                            <div className="flex items-center gap-5">
                              {isBulkMode && (
                                <Checkbox
                                  checked={selectedUserIds.has(pendingUser.id)}
                                  onCheckedChange={() => handleToggleUser(pendingUser.id)}
                                  className="w-5 h-5 rounded-md border-2"
                                />
                              )}
                              <div className="relative">
                                <Avatar className="h-12 w-12 ring-2 ring-background border-2 border-warning/20 shadow-lg">
                                  <AvatarFallback className="bg-gradient-to-br from-warning/20 to-warning/5 text-warning font-black">
                                    {pendingUser.full_name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-warning rounded-full border-2 border-background animate-pulse" />
                              </div>
                              <div>
                                <p className="font-bold text-foreground group-hover:text-primary transition-colors">{pendingUser.full_name}</p>
                                <p className="text-xs text-muted-foreground font-medium">{pendingUser.email}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {!isBulkMode && (
                                <div className="flex gap-2 items-center">
                                  <Select
                                    value={userRoles[pendingUser.id] || "employee"}
                                    onValueChange={(value) => handleRoleChange(pendingUser.id, value as UserRole)}
                                  >
                                    <SelectTrigger className="w-32 h-9 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-background/50">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="employee">Employee</SelectItem>
                                      <SelectItem value="team_lead">Team Lead</SelectItem>
                                      <SelectItem value="project_manager">PM</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                    onClick={() => handleReject(pendingUser.id)}
                                    disabled={rejectUserMutation.isPending}
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-9 w-9 p-0 bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 rounded-lg transition-all"
                                    onClick={() => handleApprove(pendingUser.id)}
                                    disabled={approveUserMutation.isPending}
                                  >
                                    <CheckSquare className="h-5 w-5" />
                                  </Button>
                                </div>
                              )}
                              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden lg:block">
                                {pendingUser.created_at ? format(new Date(pendingUser.created_at), "MMM d") : ""}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Administrative Controls */}
              <div className="space-y-6">
                <div className="px-2">
                  <h2 className="text-2xl font-bold text-foreground">Mission Control</h2>
                  <p className="text-sm text-muted-foreground">Strategic management tools for system administrators</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    {
                      title: "User Core",
                      description: "Edit identities and access levels across the organization.",
                      icon: Users,
                      color: "primary",
                      action: () => setActiveTab("users")
                    },
                    {
                      title: "Permission Hub",
                      description: "Configure systemic roles and granular permission sets.",
                      icon: UserCog,
                      color: "purple",
                      action: () => setActiveTab("roles")
                    },
                    {
                      title: "Portfolio",
                      description: "Strategic overview of all active and archived projects.",
                      icon: FolderKanban,
                      color: "blue",
                      action: () => navigate("/dashboard/admin/projects")
                    },
                  ].map((control, idx) => (
                    <motion.button
                      key={control.title}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={control.action}
                      className="group relative bg-card border border-border/50 rounded-2xl p-8 hover:border-primary/50 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 text-left overflow-hidden"
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-${control.color}/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />
                      <div className={`p-4 bg-${control.color}/10 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-all duration-300 ring-1 ring-${control.color}/20`}>
                        <control.icon className={`h-8 w-8 text-${control.color}`} />
                      </div>
                      <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">{control.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{control.description}</p>

                      <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/0 group-hover:text-primary/100 transition-all duration-500">
                        Launch System <ArrowRight className="h-3 w-3" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "users" && <AdminUsers />}
          {activeTab === "roles" && <AdminRoles />}
        </div>

        {/* Notification Panel */}
        <NotificationPanel
          isOpen={isNotificationPanelOpen}
          onClose={() => setIsNotificationPanelOpen(false)}
        />

        {/* Bulk Approve Dialog */}
        <Dialog open={isBulkApproveDialogOpen} onOpenChange={setIsBulkApproveDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Bulk Approve Users</DialogTitle>
              <DialogDescription>
                Approve {selectedUserIds.size} selected user(s). You can optionally set a role and department for all users.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Role (optional)</label>
                <Select value={bulkApproveRole} onValueChange={(value) => setBulkApproveRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="team_lead">Team Lead</SelectItem>
                    <SelectItem value="project_manager">Project Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Defaults to "employee" if not specified</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department ID (optional)</label>
                <Input
                  placeholder="Enter department ID"
                  value={bulkApproveDepartmentId}
                  onChange={(e) => setBulkApproveDepartmentId(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsBulkApproveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkApprove}
                disabled={bulkApproveMutation.isPending}
              >
                {bulkApproveMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Approving...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Approve {selectedUserIds.size} User(s)
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Reject Dialog */}
        <Dialog open={isBulkRejectDialogOpen} onOpenChange={setIsBulkRejectDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Bulk Reject Users</DialogTitle>
              <DialogDescription>
                Reject {selectedUserIds.size} selected user(s). You can optionally provide a reason for rejection.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason (optional)</label>
                <Textarea
                  placeholder="Enter rejection reason..."
                  value={bulkRejectReason}
                  onChange={(e) => setBulkRejectReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsBulkRejectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkReject}
                disabled={bulkRejectMutation.isPending}
              >
                {bulkRejectMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Reject {selectedUserIds.size} User(s)
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Operation Result Dialog */}
        <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Bulk Operation Results</DialogTitle>
              <DialogDescription>
                Summary of the bulk operation
              </DialogDescription>
            </DialogHeader>
            {bulkOperationResult && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Requested</p>
                    <p className="text-2xl font-bold">{bulkOperationResult.total_requested}</p>
                  </div>
                  <div className="bg-emerald-500/10 p-3 rounded-lg">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      {bulkOperationResult.total_approved !== undefined ? "Approved" : "Rejected"}
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {bulkOperationResult.total_approved ?? bulkOperationResult.total_rejected}
                    </p>
                  </div>
                </div>

                {bulkOperationResult.failed && bulkOperationResult.failed.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive">
                      Failed ({bulkOperationResult.total_failed})
                    </p>
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 max-h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {bulkOperationResult.failed.map((failure: any, index: number) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium text-destructive">User ID: {failure.user_id}</p>
                            <p className="text-muted-foreground">{failure.error}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {bulkOperationResult.approved && bulkOperationResult.approved.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      Approved ({bulkOperationResult.approved.length})
                    </p>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 max-h-48 overflow-y-auto">
                      <div className="space-y-1">
                        {bulkOperationResult.approved.map((userId: any, index: number) => {
                          const user = allUsers.find(u => u.id === userId);
                          const email = user?.email || 'Unknown';
                          return (
                            <p key={index} className="text-sm text-foreground">
                              {email}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {bulkOperationResult.rejected && bulkOperationResult.rejected.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      Rejected ({bulkOperationResult.rejected.length})
                    </p>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 max-h-48 overflow-y-auto">
                      <div className="space-y-1">
                        {bulkOperationResult.rejected.map((userId: any, index: number) => {
                          const user = allUsers.find(u => u.id === userId);
                          const email = user?.email || 'Unknown';
                          return (
                            <p key={index} className="text-sm text-foreground">
                              {email}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsResultDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg w-full text-left transition-colors ${activeTab === "dashboard"
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveTab("users");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${activeTab === "users"
                  ? "font-medium text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                <Users className="h-4 w-4" />
                Users
              </button>
              <button
                onClick={() => {
                  setActiveTab("roles");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${activeTab === "roles"
                  ? "font-medium text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                <UserCog className="h-4 w-4" />
                Roles
              </button>
              <Link
                to="/dashboard/admin/projects"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <FolderKanban className="h-4 w-4" />
                Projects
              </Link>
              <Link
                to="/dashboard/admin/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <Link
                to="/dashboard/admin/plugins"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Plug className="h-4 w-4" />
                Plugins
              </Link>
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

export default AdminDashboard;
