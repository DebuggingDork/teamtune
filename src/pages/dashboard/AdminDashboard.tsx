import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  Shield, 
  Users, 
  Settings, 
  BarChart3, 
  Bell, 
  Search,
  LogOut,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  FolderKanban,
  UsersRound,
  Building2,
  UserCog,
  Layers,
  Loader2,
  Sun,
  Moon,
  Plug,
  ChevronDown,
  User,
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
import { useTheme } from "@/contexts/ThemeContext";
import { usePendingUsers, useAllUsers, useApproveUser, useRejectUser, useUnblockUser, useBulkApproveUsers, useBulkRejectUsers } from "@/hooks/useAdmin";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminRoles from "@/components/admin/AdminRoles";
import AdminDepartments from "@/components/admin/AdminDepartments";
import AdminSettings from "@/components/admin/AdminSettings";
import NotificationPanel from "@/components/admin/NotificationPanel";
import type { UserRole } from "@/api/types";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
  const [activeTab, setActiveTab] = useState("dashboard");
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
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg w-full text-left transition-colors ${
                activeTab === "dashboard" 
                  ? "text-foreground bg-accent" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${
                activeTab === "users" 
                  ? "font-medium text-foreground bg-accent" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Users className="h-4 w-4" />
              Users
            </button>
            <button 
              onClick={() => setActiveTab("roles")}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${
                activeTab === "roles" 
                  ? "font-medium text-foreground bg-accent" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <UserCog className="h-4 w-4" />
              Roles
            </button>
            <Link
              to="/dashboard/admin/departments"
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Building2 className="h-4 w-4" />
              Departments
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users, projects..."
                  className="pl-10 pr-4 py-2 bg-accent border-none rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* Notifications */}
              <button 
                onClick={() => setIsNotificationPanelOpen(true)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Users", value: totalUsers.toString(), icon: Users, color: "bg-primary/10 text-primary", isLoading: isLoadingAll },
                  { label: "Pending", value: pendingCount.toString(), icon: Clock, color: "bg-warning/10 text-warning", isLoading: isLoadingPending },
                  { label: "Active", value: activeUsers.toString(), icon: UserCheck, color: "bg-emerald-500/10 text-emerald-500", isLoading: isLoadingAll },
                  { label: "Blocked", value: blockedUsers.toString(), icon: UserX, color: "bg-destructive/10 text-destructive", isLoading: isLoadingAll },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-card border border-border rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        {stat.isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <stat.icon className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.isLoading ? "..." : stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Role Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card border border-border rounded-xl p-6 mb-8"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">Role Distribution</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { role: "Admins", count: roleDistribution.admin, icon: Shield },
                    { role: "Project Managers", count: roleDistribution.project_manager, icon: FolderKanban },
                    { role: "Team Leads", count: roleDistribution.team_lead, icon: UsersRound },
                    { role: "Members", count: roleDistribution.employee, icon: Users },
                  ].map((item) => (
                    <div key={item.role} className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-foreground">{item.count}</p>
                        <p className="text-xs text-muted-foreground">{item.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Pending Approvals - High Priority */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`bg-card border-2 border-warning/50 rounded-xl p-6 mb-8 transition-all ${isBulkMode ? 'ring-2 ring-primary' : ''}`}
              >
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
                        className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                          isSelected 
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
                              <Select
                                value={userRoles[pendingUser.id] || "employee"}
                                onValueChange={(value) => handleRoleChange(pendingUser.id, value as UserRole)}
                              >
                                <SelectTrigger className="w-[140px] h-8 text-xs">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="employee">Employee</SelectItem>
                                  <SelectItem value="team_lead">Team Lead</SelectItem>
                                  <SelectItem value="project_manager">Project Manager</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
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
              </motion.div>

              {/* Blocked Users Section */}
              {blockedUsersList.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-card border-2 border-destructive/50 rounded-xl p-6 mb-8"
                >
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
                </motion.div>
              )}

              {/* Administrative Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">Administrative Controls</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { 
                      title: "User Management", 
                      description: "View, edit, and manage all user accounts", 
                      icon: Users,
                      action: () => setActiveTab("users")
                    },
                    { 
                      title: "Role Management", 
                      description: "Configure roles and permissions", 
                      icon: UserCog,
                      action: () => setActiveTab("roles")
                    },
                    { 
                      title: "Department Management", 
                      description: "Organize teams and departments", 
                      icon: Layers,
                      action: () => setActiveTab("departments")
                    },
                  ].map((control) => (
                    <button
                      key={control.title}
                      onClick={control.action}
                      className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors text-left"
                    >
                      <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                        <control.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{control.title}</h3>
                      <p className="text-sm text-muted-foreground">{control.description}</p>
                    </button>
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
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg w-full text-left transition-colors ${
                  activeTab === "dashboard" 
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
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${
                  activeTab === "users" 
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
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${
                  activeTab === "roles" 
                    ? "font-medium text-foreground bg-accent" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <UserCog className="h-4 w-4" />
                Roles
              </button>
              <Link
                to="/dashboard/admin/departments"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Building2 className="h-4 w-4" />
                Departments
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
