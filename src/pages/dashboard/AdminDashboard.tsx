import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Settings,
  BarChart3,
  Bell,
  UserCheck,
  UserX,
  Clock,
  LogOut,
  CheckCircle,
  XCircle,
  FolderKanban,
  UsersRound,
  UserCog,
  Layers,
  Loader2,
  Plug,
  CheckSquare,
  Square,
  X
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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
import { AdminSidebar } from "@/components/layouts/AdminSidebar";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useCollapsibleSidebar } from "@/components/layouts/CollapsibleSidebar";
import { usePendingUsers, useAllUsers, useApproveUser, useRejectUser, useUnblockUser, useBulkApproveUsers, useBulkRejectUsers } from "@/hooks/useAdmin";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminRoles from "@/components/admin/AdminRoles";
import AdminSettings from "@/components/admin/AdminSettings";
import NotificationPanel from "@/components/common/NotificationPanel";
import type { UserRole } from "@/api/types";
// Import new shared components
import { StatCard, RoleSelect } from "@/components/shared";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { data: pendingUsers = [], isLoading: isLoadingPending } = usePendingUsers();
  const { data: usersData, isLoading: isLoadingAll } = useAllUsers();
  const allUsers = usersData?.users || [];
  const approveUserMutation = useApproveUser();
  const rejectUserMutation = useRejectUser();
  const unblockUserMutation = useUnblockUser();
  const bulkApproveMutation = useBulkApproveUsers();
  const bulkRejectMutation = useBulkRejectUsers();

  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname === "/dashboard/admin/users") return "users";
    if (location.pathname === "/dashboard/admin/roles") return "roles";
    return "dashboard";
  };
  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
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
        reason: bulkRejectReason || undefined,
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
    <AdminSidebar onLogout={handleLogout}>
      <AdminDashboardContent
        user={user}

        navigate={navigate}
        location={location}
        toast={toast}
        pendingUsers={pendingUsers}
        isLoadingPending={isLoadingPending}
        usersData={usersData}
        isLoadingAll={isLoadingAll}
        allUsers={allUsers}
        approveUserMutation={approveUserMutation}
        rejectUserMutation={rejectUserMutation}
        unblockUserMutation={unblockUserMutation}
        bulkApproveMutation={bulkApproveMutation}
        bulkRejectMutation={bulkRejectMutation}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isNotificationPanelOpen={isNotificationPanelOpen}
        setIsNotificationPanelOpen={setIsNotificationPanelOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isBulkMode={isBulkMode}
        setIsBulkMode={setIsBulkMode}
        selectedUserIds={selectedUserIds}
        setSelectedUserIds={setSelectedUserIds}
        isBulkApproveDialogOpen={isBulkApproveDialogOpen}
        setIsBulkApproveDialogOpen={setIsBulkApproveDialogOpen}
        isBulkRejectDialogOpen={isBulkRejectDialogOpen}
        setIsBulkRejectDialogOpen={setIsBulkRejectDialogOpen}
        bulkApproveRole={bulkApproveRole}
        setBulkApproveRole={setBulkApproveRole}
        bulkApproveDepartmentId={bulkApproveDepartmentId}
        setBulkApproveDepartmentId={setBulkApproveDepartmentId}
        bulkRejectReason={bulkRejectReason}
        setBulkRejectReason={setBulkRejectReason}
        bulkOperationResult={bulkOperationResult}
        setBulkOperationResult={setBulkOperationResult}
        isResultDialogOpen={isResultDialogOpen}
        setIsResultDialogOpen={setIsResultDialogOpen}
        userRoles={userRoles}
        setUserRoles={setUserRoles}
        handleRoleChange={handleRoleChange}
        handleApprove={handleApprove}
        handleReject={handleReject}
        handleUnblock={handleUnblock}
        handleToggleBulkMode={handleToggleBulkMode}
        handleSelectAll={handleSelectAll}
        handleToggleUser={handleToggleUser}
        handleBulkApprove={handleBulkApprove}
        handleBulkReject={handleBulkReject}
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        blockedUsers={blockedUsers}
        pendingCount={pendingCount}
        blockedUsersList={blockedUsersList}
        roleDistribution={roleDistribution}
        handleLogout={handleLogout}
      />
    </AdminSidebar>
  );
};

// Inner component that has access to the sidebar context
const AdminDashboardContent = (props: any) => {
  const {
    user,

    navigate,
    location,
    toast,
    pendingUsers,
    isLoadingPending,
    usersData,
    isLoadingAll,
    allUsers,
    approveUserMutation,
    rejectUserMutation,
    unblockUserMutation,
    bulkApproveMutation,
    bulkRejectMutation,
    activeTab,
    setActiveTab,
    isNotificationPanelOpen,
    setIsNotificationPanelOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isBulkMode,
    setIsBulkMode,
    selectedUserIds,
    setSelectedUserIds,
    isBulkApproveDialogOpen,
    setIsBulkApproveDialogOpen,
    isBulkRejectDialogOpen,
    setIsBulkRejectDialogOpen,
    bulkApproveRole,
    setBulkApproveRole,
    bulkApproveDepartmentId,
    setBulkApproveDepartmentId,
    bulkRejectReason,
    setBulkRejectReason,
    bulkOperationResult,
    setBulkOperationResult,
    isResultDialogOpen,
    setIsResultDialogOpen,
    userRoles,
    setUserRoles,
    handleRoleChange,
    handleApprove,
    handleReject,
    handleUnblock,
    handleToggleBulkMode,
    handleSelectAll,
    handleToggleUser,
    handleBulkApprove,
    handleBulkReject,
    totalUsers,
    activeUsers,
    blockedUsers,
    pendingCount,
    blockedUsersList,
    roleDistribution,
    handleLogout,
  } = props;

  // Sidebar state - now called inside the context provider
  const { isSidebarExpanded, isDesktop } = useCollapsibleSidebar();

  return (
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
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 px-6 py-4 shadow-sm">
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
              {/* Theme Selector */}
              <ThemeSelector />

              {/* Notifications */}
              <button
                onClick={() => setIsNotificationPanelOpen(true)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold text-foreground mb-2">System Overview</h1>
              <p className="text-muted-foreground mb-8">Monitor and manage your organization's health and access.</p>

              {/* System Overview Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  label="Total Users"
                  value={totalUsers}
                  icon={Users}
                  gradient="from-blue-500/20 to-blue-600/10"
                  iconColor="text-blue-500"
                  isLoading={isLoadingAll}
                  index={0}
                />
                <StatCard
                  label="Pending"
                  value={pendingCount}
                  icon={Clock}
                  gradient="from-amber-500/20 to-amber-600/10"
                  iconColor="text-amber-500"
                  isLoading={isLoadingPending}
                  index={1}
                />
                <StatCard
                  label="Active"
                  value={activeUsers}
                  icon={UserCheck}
                  gradient="from-emerald-500/20 to-emerald-600/10"
                  iconColor="text-emerald-500"
                  isLoading={isLoadingAll}
                  index={2}
                />
                <StatCard
                  label="Blocked"
                  value={blockedUsers}
                  icon={UserX}
                  gradient="from-red-500/20 to-red-600/10"
                  iconColor="text-red-500"
                  isLoading={isLoadingAll}
                  index={3}
                />
              </div>

              {/* Role Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-card via-card to-card/80 border border-border/50 rounded-2xl p-6 mb-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                  Role Distribution
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { role: "Admins", count: roleDistribution.admin, icon: Shield, gradient: "from-orange-500/20 to-orange-600/10", iconColor: "text-orange-500" },
                    { role: "Project Managers", count: roleDistribution.project_manager, icon: FolderKanban, gradient: "from-purple-500/20 to-purple-600/10", iconColor: "text-purple-500" },
                    { role: "Team Leads", count: roleDistribution.team_lead, icon: UsersRound, gradient: "from-blue-500/20 to-blue-600/10", iconColor: "text-blue-500" },
                    { role: "Members", count: roleDistribution.employee, icon: Users, gradient: "from-emerald-500/20 to-emerald-600/10", iconColor: "text-emerald-500" },
                  ].map((item) => (
                    <motion.div
                      key={item.role}
                      whileHover={{ scale: 1.05 }}
                      className="group flex items-center gap-3 p-4 bg-gradient-to-br from-accent/30 to-accent/10 rounded-xl border border-border/30 hover:border-border/60 transition-all duration-300"
                    >
                      <div className={`p-3 bg-gradient-to-br ${item.gradient} rounded-xl shadow-sm`}>
                        <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{item.count}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">{item.role}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Pending Approvals - High Priority */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`relative bg-gradient-to-br from-card via-card to-amber-500/5 border-2 border-amber-500/30 rounded-2xl p-6 mb-8 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${isBulkMode ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-warning/10 rounded-lg">
                        <Clock className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">Pending Approvals</h2>
                        <p className="text-sm text-muted-foreground">Users awaiting your approval</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                        {pendingUsers.length} pending
                      </Badge>
                      {pendingUsers.length > 0 && (
                        !isBulkMode ? (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleToggleBulkMode}
                            className="flex items-center gap-2"
                          >
                            <CheckSquare className="h-4 w-4" />
                            Select Users
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleBulkMode}
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Bulk Actions Bar */}
                  {isBulkMode && pendingUsers.length > 0 && (
                    <div className="mb-4 p-4 bg-accent/50 rounded-lg border border-border">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                            className="flex items-center gap-2"
                          >
                            {selectedUserIds.size === pendingUsers.length ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                            {selectedUserIds.size === pendingUsers.length ? "Deselect All" : "Select All"}
                          </Button>
                          {selectedUserIds.size > 0 && (
                            <Badge variant="default" className="text-sm">
                              {selectedUserIds.size} {selectedUserIds.size === 1 ? 'user' : 'users'} selected
                            </Badge>
                          )}
                        </div>
                        {selectedUserIds.size > 0 && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setIsBulkApproveDialogOpen(true)}
                              className="flex items-center gap-2"
                              disabled={bulkApproveMutation.isPending}
                            >
                              <UserCheck className="h-4 w-4" />
                              Approve ({selectedUserIds.size})
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setIsBulkRejectDialogOpen(true)}
                              className="flex items-center gap-2"
                              disabled={bulkRejectMutation.isPending}
                            >
                              <UserX className="h-4 w-4" />
                              Reject ({selectedUserIds.size})
                            </Button>
                          </div>
                        )}
                      </div>
                      {selectedUserIds.size === 0 && (
                        <p className="text-sm text-muted-foreground mt-3">
                          Select users from the list below to perform bulk actions
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {isLoadingPending ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : pendingUsers.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">No pending approvals</p>
                    ) : (
                      pendingUsers.map((pendingUser) => {
                        const isSelected = isBulkMode && selectedUserIds.has(pendingUser.id);
                        return (
                          <div
                            key={pendingUser.id}
                            className={`flex items-center justify-between p-4 rounded-lg transition-colors ${isSelected
                              ? "bg-primary/10 border-2 border-primary"
                              : "bg-accent/50"
                              }`}
                          >
                            <div className="flex items-center gap-4">
                              {isBulkMode && (
                                <Checkbox
                                  checked={selectedUserIds.has(pendingUser.id)}
                                  onCheckedChange={() => handleToggleUser(pendingUser.id)}
                                />
                              )}
                              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {pendingUser.full_name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{pendingUser.full_name}</p>
                                <p className="text-xs text-muted-foreground">{pendingUser.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground hidden sm:block">
                                Requested {pendingUser.created_at ? format(new Date(pendingUser.created_at), "MMM d, yyyy") : "N/A"}
                              </span>
                              {!isBulkMode && (
                                <div className="flex gap-2 items-center">
                                  <RoleSelect
                                    value={userRoles[pendingUser.id] || "employee"}
                                    onChange={(value) => handleRoleChange(pendingUser.id, value)}
                                    size="sm"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleReject(pendingUser.id)}
                                    disabled={rejectUserMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90"
                                    onClick={() => handleApprove(pendingUser.id)}
                                    disabled={approveUserMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Blocked Users Section */}
              {blockedUsersList.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="relative bg-gradient-to-br from-card via-card to-red-500/5 border-2 border-red-500/30 rounded-2xl p-6 mb-8 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-destructive/10 rounded-lg">
                          <UserX className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-foreground">Blocked Users</h2>
                          <p className="text-sm text-muted-foreground">Users who have been blocked from accessing the system</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
                        {blockedUsersList.length} blocked
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {blockedUsersList.map((blockedUser) => (
                        <div
                          key={blockedUser.id}
                          className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-destructive/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-destructive">
                                {blockedUser.full_name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{blockedUser.full_name}</p>
                              <p className="text-xs text-muted-foreground">{blockedUser.email}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Role: <span className="capitalize">{blockedUser.role.replace('_', ' ')}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground hidden sm:block">
                              {blockedUser.updated_at ? format(new Date(blockedUser.updated_at), "MMM d, yyyy") : "N/A"}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                              onClick={() => handleUnblock(blockedUser.id)}
                              disabled={unblockUserMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Unblock
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Administrative Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                  Administrative Controls
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    {
                      title: "User Management",
                      description: "View, edit, and manage all user accounts",
                      icon: Users,
                      action: () => navigate("/dashboard/admin/users"),
                      gradient: "from-blue-500/20 to-blue-600/10",
                      iconColor: "text-blue-500"
                    },
                    {
                      title: "Role Management",
                      description: "Configure roles and permissions",
                      icon: UserCog,
                      action: () => navigate("/dashboard/admin/roles"),
                      gradient: "from-purple-500/20 to-purple-600/10",
                      iconColor: "text-purple-500"
                    },
                    {
                      title: "Project Management",
                      description: "View and manage all projects",
                      icon: FolderKanban,
                      action: () => navigate("/dashboard/admin/projects"),
                      gradient: "from-emerald-500/20 to-emerald-600/10",
                      iconColor: "text-emerald-500"
                    },
                  ].map((control) => (
                    <motion.button
                      key={control.title}
                      onClick={control.action}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="group relative bg-gradient-to-br from-card via-card to-card/80 border border-border/50 rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, ${control.gradient.split(' ')[1]}, ${control.gradient.split(' ')[3]})` }} />
                      <div className="relative z-10">
                        <div className={`p-3 bg-gradient-to-br ${control.gradient} rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                          <control.icon className={`h-6 w-6 ${control.iconColor}`} />
                        </div>
                        <h3 className="font-bold text-foreground mb-2 text-lg">{control.title}</h3>
                        <p className="text-sm text-muted-foreground">{control.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
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
                <RoleSelect
                  value={bulkApproveRole}
                  onChange={(value) => setBulkApproveRole(value)}
                  size="md"
                />
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
      </motion.main>

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
              <Link
                to="/dashboard/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg w-full text-left transition-colors ${activeTab === "dashboard"
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/dashboard/admin/users"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${activeTab === "users"
                  ? "font-medium text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                <Users className="h-4 w-4" />
                Users
              </Link>
              <Link
                to="/dashboard/admin/roles"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${activeTab === "roles"
                  ? "font-medium text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                <UserCog className="h-4 w-4" />
                Roles
              </Link>
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
