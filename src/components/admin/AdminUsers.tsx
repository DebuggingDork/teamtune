import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Clock,
  Shield,
  FolderKanban,
  UsersRound,
  Loader2,
  MoreHorizontal,
  Ban,
  CheckCircle,
  CheckSquare,
  Square,
  X,
  Trash2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowDown,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { UserRole, UserStatus } from "@/api/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAllUsers,
  useBlockUser,
  useUnblockUser,
  useBulkApproveUsers,
  useBulkRejectUsers,
  useDeleteUser,
  useBulkDeleteUsers,
  useManagedProjects,
  useLedTeams,
  useDemoteProjectManager,
  useDemoteTeamLead
} from "@/hooks/useAdmin";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

// Component to show user details (projects/teams)
const UserDetailsSection = ({ userId, role }: { userId: string; role: UserRole }) => {
  const { data: managedProjects, isLoading: isLoadingProjects } = useManagedProjects(userId);
  const { data: ledTeams, isLoading: isLoadingTeams } = useLedTeams(userId);

  if (role === "project_manager") {
    return (
      <div className="border-t border-border bg-muted/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FolderKanban className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">Managed Projects</h4>
          {managedProjects && (
            <Badge variant="secondary" className="text-xs">
              {managedProjects.total}
            </Badge>
          )}
        </div>
        {isLoadingProjects ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : managedProjects && managedProjects.projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {managedProjects.projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.project_code}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {project.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-2">No projects managed</p>
        )}
      </div>
    );
  }

  if (role === "team_lead") {
    return (
      <div className="border-t border-border bg-muted/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <UsersRound className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">Led Teams</h4>
          {ledTeams && (
            <Badge variant="secondary" className="text-xs">
              {ledTeams.total}
            </Badge>
          )}
        </div>
        {isLoadingTeams ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : ledTeams && ledTeams.teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ledTeams.teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{team.name}</p>
                  <p className="text-xs text-muted-foreground">{team.team_code}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {team.member_count || 0} members
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-2">No teams led</p>
        )}
      </div>
    );
  }

  return null;
};

const AdminUsers = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");

  const { data: usersData, isLoading } = useAllUsers({
    page,
    limit,
    status: statusFilter !== "all" ? statusFilter : undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
  });

  const allUsers = usersData?.users || [];
  const pagination = usersData?.pagination;

  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();
  const bulkApproveMutation = useBulkApproveUsers();
  const bulkRejectMutation = useBulkRejectUsers();
  const deleteUserMutation = useDeleteUser();
  const bulkDeleteMutation = useBulkDeleteUsers();
  const demotePMMutation = useDemoteProjectManager();
  const demoteTLMutation = useDemoteTeamLead();
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isBulkApproveDialogOpen, setIsBulkApproveDialogOpen] = useState(false);
  const [isBulkRejectDialogOpen, setIsBulkRejectDialogOpen] = useState(false);
  const [bulkApproveRole, setBulkApproveRole] = useState<UserRole>("employee");
  const [bulkApproveDepartmentId, setBulkApproveDepartmentId] = useState<string>("");
  const [bulkRejectReason, setBulkRejectReason] = useState<string>("");
  const [bulkOperationResult, setBulkOperationResult] = useState<any>(null);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [selectedUserForDemote, setSelectedUserForDemote] = useState<any>(null);
  const [isDemotePMDialogOpen, setIsDemotePMDialogOpen] = useState(false);
  const [isDemoteTLDialogOpen, setIsDemoteTLDialogOpen] = useState(false);
  const [replacementManagerId, setReplacementManagerId] = useState<string>("");
  const [replacementLeadId, setReplacementLeadId] = useState<string>("");

  const handleBlockUser = async () => {
    if (!selectedUser) return;

    try {
      await blockUserMutation.mutateAsync(selectedUser.id);
      toast({
        title: "User Blocked",
        description: `${selectedUser.full_name} has been blocked successfully`,
      });
      setIsBlockDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
    }
  };

  const handleUnblockUser = async () => {
    if (!selectedUser) return;

    try {
      await unblockUserMutation.mutateAsync(selectedUser.id);
      toast({
        title: "User Unblocked",
        description: `${selectedUser.full_name} has been unblocked successfully`,
      });
      setIsUnblockDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUserMutation.mutateAsync(selectedUser.id);
      toast({
        title: "User Deleted",
        description: `${selectedUser.full_name} has been deleted successfully`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      // Extract error message from API response
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete user";

      toast({
        title: "Cannot Delete User",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.size === 0) {
      toast({
        title: "No users selected",
        description: "Please select at least one user to delete",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await (bulkDeleteMutation.mutateAsync as any)({
        user_ids: Array.from(selectedUserIds),
      });

      setBulkOperationResult(result);
      setIsBulkDeleteDialogOpen(false);
      setIsResultDialogOpen(true);
      setSelectedUserIds(new Set());
      setIsBulkMode(false);

      toast({
        title: "Bulk Deletion Complete",
        description: `Deleted ${result.total_deleted} of ${result.total_requested} users`,
      });
    } catch (error: any) {
      // Extract error message from API response - check nested error structure
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete users";

      toast({
        title: "Cannot Delete Users",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openBlockDialog = (user: any) => {
    setSelectedUser(user);
    setIsBlockDialogOpen(true);
  };

  const openUnblockDialog = (user: any) => {
    setSelectedUser(user);
    setIsUnblockDialogOpen(true);
  };

  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const openDemotePMDialog = (user: any) => {
    setSelectedUserForDemote(user);
    setIsDemotePMDialogOpen(true);
    setReplacementManagerId("");
  };

  const openDemoteTLDialog = (user: any) => {
    setSelectedUserForDemote(user);
    setIsDemoteTLDialogOpen(true);
    setReplacementLeadId("");
  };

  const handleDemotePM = async () => {
    if (!selectedUserForDemote || !replacementManagerId) {
      toast({
        title: "Validation Error",
        description: "Please select a replacement manager",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await (demotePMMutation.mutateAsync as any)({
        id: selectedUserForDemote.id,
        data: { replacement_manager_id: replacementManagerId },
      });

      toast({
        title: "Success",
        description: `${selectedUserForDemote.full_name} has been demoted. ${result.projects_reassigned} project(s) reassigned.`,
      });
      setIsDemotePMDialogOpen(false);
      setSelectedUserForDemote(null);
      setReplacementManagerId("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to demote project manager",
        variant: "destructive",
      });
    }
  };

  const handleDemoteTL = async () => {
    if (!selectedUserForDemote || !replacementLeadId) {
      toast({
        title: "Validation Error",
        description: "Please select a replacement team lead",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await (demoteTLMutation.mutateAsync as any)({
        id: selectedUserForDemote.id,
        data: { replacement_lead_id: replacementLeadId },
      });

      toast({
        title: "Success",
        description: `${selectedUserForDemote.full_name} has been demoted. ${result.teams_reassigned} team(s) reassigned.`,
      });
      setIsDemoteTLDialogOpen(false);
      setSelectedUserForDemote(null);
      setReplacementLeadId("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to demote team lead",
        variant: "destructive",
      });
    }
  };

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter]);

  // Filter users based on search (client-side search, server-side handles role/status)
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get pending users for bulk operations
  const pendingUsers = useMemo(() => {
    return filteredUsers.filter(user => user.status === "pending");
  }, [filteredUsers]);

  // Get deletable users (all except admins)
  const deletableUsers = useMemo(() => {
    return filteredUsers.filter(user => user.role !== "admin");
  }, [filteredUsers]);

  // Toggle bulk mode
  const handleToggleBulkMode = () => {
    setIsBulkMode(!isBulkMode);
    if (isBulkMode) {
      // Clear selections when exiting bulk mode
      setSelectedUserIds(new Set());
    }
  };

  // Select all pending users
  const handleSelectAll = () => {
    if (selectedUserIds.size === pendingUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(pendingUsers.map(u => u.id)));
    }
  };

  // Select all deletable users (for delete)
  const handleSelectAllDeletable = () => {
    if (selectedUserIds.size === deletableUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(deletableUsers.map(u => u.id)));
    }
  };

  // Toggle individual user selection
  const handleToggleUser = (userId: string, userRole?: string) => {
    if (!isBulkMode) return; // Only allow selection in bulk mode
    // Don't allow selecting admin users
    if (userRole === "admin") return;

    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  // Handle bulk approve
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
      const result = await (bulkApproveMutation.mutateAsync as any)({
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
      setIsBulkMode(false); // Exit bulk mode after operation

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

  // Handle bulk reject
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
      const result = await (bulkRejectMutation.mutateAsync as any)({
        user_ids: Array.from(selectedUserIds),
        reason: bulkRejectReason || undefined,
      });

      setBulkOperationResult(result);
      setIsBulkRejectDialogOpen(false);
      setIsResultDialogOpen(true);
      setSelectedUserIds(new Set());
      setBulkRejectReason("");
      setIsBulkMode(false); // Exit bulk mode after operation

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <UserCheck className="h-4 w-4 text-emerald-500" />;
      case "blocked": return <UserX className="h-4 w-4 text-destructive" />;
      case "pending": return <Clock className="h-4 w-4 text-warning" />;
      default: return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/40 via-red-500/40 to-yellow-500/40 rounded-full blur-[3px]"></div>
            <Shield className="h-4 w-4 text-orange-500 relative z-10 drop-shadow-[0_0_2px_rgba(251,146,60,0.5)]" />
          </div>
        );
      case "project_manager": return <FolderKanban className="h-4 w-4 text-blue-500" />;
      case "team_lead": return <UsersRound className="h-4 w-4 text-purple-500" />;
      default: return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "blocked": return "destructive";
      case "pending": return "secondary";
      default: return "outline";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">User Management</h2>
        <p className="text-muted-foreground">View and manage all user accounts in your organization.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by identity, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-card/50 backdrop-blur-xl border-border/50 rounded-xl text-base shadow-inner focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | "all")}>
            <SelectTrigger className="w-full sm:w-48 h-14 bg-card/50 backdrop-blur-xl border-border/50 rounded-xl">
              <SelectValue placeholder="Filter Role" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Administrators</SelectItem>
              <SelectItem value="project_manager">Project Managers</SelectItem>
              <SelectItem value="team_lead">Team Leaders</SelectItem>
              <SelectItem value="employee">Members</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as UserStatus | "all")}>
            <SelectTrigger className="w-full sm:w-48 h-14 bg-card/50 backdrop-blur-xl border-border/50 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Accounts</SelectItem>
              <SelectItem value="pending">Awaiting Approval</SelectItem>
              <SelectItem value="blocked">Restrictions Applied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats - Refined */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Population", value: allUsers.length, icon: Users, color: "primary", glow: "blue" },
          { label: "Active Access", value: allUsers.filter(u => u.status === "active").length, icon: UserCheck, color: "emerald", glow: "emerald" },
          { label: "Requests", value: allUsers.filter(u => u.status === "pending").length, icon: Clock, color: "warning", glow: "amber" },
          { label: "Restricted", value: allUsers.filter(u => u.status === "blocked").length, icon: Ban, color: "destructive", glow: "red" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -2 }}
            className="group relative bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 transition-all duration-300 hover:border-primary/30"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:bg-${stat.color}-500/20 transition-colors`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground tabular-nums">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-black">{stat.label}</p>
              </div>
            </div>
            <div className={`absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-${stat.color}-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
          </motion.div>
        ))}
      </div>

      {/* Bulk Actions - Premium Bar */}
      {(pendingUsers.length > 0 || deletableUsers.length > 0) && (
        <motion.div
          layout
          className={`relative overflow-hidden bg-card/60 backdrop-blur-2xl border border-border/50 rounded-2xl p-5 shadow-2xl transition-all duration-500 ${isBulkMode ? 'ring-2 ring-primary/40 scale-[1.01]' : ''}`}
        >
          <div className="relative z-10">
            {!isBulkMode ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Secure Multi-Operation Mode</p>
                    <p className="text-xs text-muted-foreground">Select multiple accounts for batch processing</p>
                  </div>
                </div>
                <Button
                  onClick={handleToggleBulkMode}
                  className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl px-6 py-5 font-bold"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Activate Batch Mode
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-muted/50 rounded-xl flex gap-1">
                      {pendingUsers.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSelectAll}
                          className={`rounded-lg h-9 px-4 font-bold text-xs ${selectedUserIds.size === pendingUsers.length ? 'bg-background shadow-sm' : ''}`}
                        >
                          Select Pending
                        </Button>
                      )}
                      {deletableUsers.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSelectAllDeletable}
                          className={`rounded-lg h-9 px-4 font-bold text-xs ${selectedUserIds.size === deletableUsers.length ? 'bg-background shadow-sm' : ''}`}
                        >
                          Select All
                        </Button>
                      )}
                    </div>
                    {selectedUserIds.size > 0 && (
                      <Badge variant="default" className="rounded-lg px-4 py-1.5 font-black animate-in zoom-in">
                        {selectedUserIds.size} Selected
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleBulkMode}
                      className="text-muted-foreground hover:text-foreground font-bold"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Exit Batch
                    </Button>
                  </div>

                  {selectedUserIds.size > 0 && (
                    <div className="flex items-center gap-2">
                      {Array.from(selectedUserIds).some(id => filteredUsers.find(u => u.id === id)?.status === "pending") && (
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            onClick={() => setIsBulkApproveDialogOpen(true)}
                            className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 font-bold rounded-xl"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Batch Approve
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsBulkRejectDialogOpen(true)}
                            className="border-warning/30 hover:bg-warning/5 text-warning font-bold rounded-xl"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Batch Reject
                          </Button>
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        onClick={() => setIsBulkDeleteDialogOpen(true)}
                        className="shadow-lg shadow-destructive/20 font-bold rounded-xl"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Teardown Accounts
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Users List - Elevated Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              Directory
            </h3>
          </div>
          {pagination && (
            <Badge variant="secondary" className="bg-muted/50 text-[10px] font-black uppercase tracking-widest px-3">
              Vol. {pagination.total}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-24 space-y-4 bg-card/20 rounded-3xl border border-dashed border-border">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full"></div>
              <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
            </div>
            <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing Registry...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-24 bg-card/20 rounded-3xl border border-dashed border-border">
            <div className="p-6 bg-muted/50 rounded-full w-fit mx-auto mb-6">
              <Search className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <h4 className="text-lg font-bold text-foreground">Zero Results</h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">No users found matching your current filter criteria. Try adjusting your search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredUsers.map((user, idx) => {
                const isExpanded = expandedUsers.has(user.id);
                const isSelected = isBulkMode && selectedUserIds.has(user.id);
                const isDeletable = user.role !== "admin";

                return (
                  <motion.div
                    key={user.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: idx * 0.03 }}
                    className={`group relative overflow-hidden bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl transition-all duration-300 ${isSelected
                      ? "ring-2 ring-primary bg-primary/[0.03] shadow-2xl"
                      : "hover:bg-card hover:border-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                      }`}
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                          {isBulkMode && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleUser(user.id, user.role)}
                              disabled={user.role === "admin"}
                              className="w-5 h-5 rounded-md border-2"
                            />
                          )}

                          <div className="relative flex-shrink-0">
                            <div className="h-14 w-14 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                              <span className="text-lg font-black text-primary">
                                {user.full_name.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg border-2 border-background shadow-lg ${user.status === 'active' ? 'bg-emerald-500' :
                              user.status === 'blocked' ? 'bg-destructive' : 'bg-warning'
                              }`}>
                              {getStatusIcon(user.status)}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                              <h4 className="text-base font-black text-foreground group-hover:text-primary transition-colors truncate">
                                {user.full_name}
                              </h4>
                              <div className="flex gap-2">
                                <Badge variant="outline" className={`rounded-lg border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest px-2 shadow-sm`}>
                                  {user.role === 'project_manager' ? 'PM' :
                                    user.role === 'team_lead' ? 'Leads' : user.role}
                                </Badge>
                                <Badge className={`rounded-lg text-[10px] font-black uppercase tracking-widest px-2 shadow-sm transition-all duration-300 group-hover:scale-105 ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10' :
                                  user.status === 'blocked' ? 'bg-destructive/10 text-destructive shadow-destructive/50' :
                                    'bg-warning/10 text-warning shadow-warning/10'
                                  }`}>
                                  {user.status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground/80 font-medium truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="hidden sm:flex flex-col items-end text-right">
                            <p className="text-[10px] uppercase font-black tracking-tighter text-muted-foreground/50">Engagement Date</p>
                            <p className="text-xs font-bold text-foreground/80 mt-0.5 whitespace-nowrap">
                              {user.created_at ? format(new Date(user.created_at), "MMM d, yyyy") : "Archive Entry"}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            {(user.role === "project_manager" || user.role === "team_lead") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleUserExpansion(user.id)}
                                className={`h-10 w-10 p-0 rounded-xl transition-all duration-500 ${isExpanded ? 'bg-primary/20 text-primary rotate-180' : 'hover:bg-primary/10'}`}
                              >
                                <ChevronDown className="h-5 w-5" />
                              </Button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-muted">
                                  <MoreHorizontal className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-2xl border-border/50">
                                <DropdownMenuItem className="rounded-lg gap-2 font-medium">
                                  <Eye className="h-4 w-4 text-primary" /> View Intelligence
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.role === "project_manager" && (
                                  <DropdownMenuItem onClick={() => openDemotePMDialog(user)} className="rounded-lg gap-2 font-medium text-warning">
                                    <ArrowDown className="h-4 w-4" /> Reassign Projects
                                  </DropdownMenuItem>
                                )}
                                {user.role === "team_lead" && (
                                  <DropdownMenuItem onClick={() => openDemoteTLDialog(user)} className="rounded-lg gap-2 font-medium text-warning">
                                    <ArrowDown className="h-4 w-4" /> Reassign Teams
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {user.status === "active" ? (
                                  <DropdownMenuItem onClick={() => openBlockDialog(user)} className="rounded-lg gap-2 font-medium text-destructive">
                                    <Ban className="h-4 w-4" /> Apply Restriction
                                  </DropdownMenuItem>
                                ) : user.status === "blocked" ? (
                                  <DropdownMenuItem onClick={() => openUnblockDialog(user)} className="rounded-lg gap-2 font-medium text-emerald-500">
                                    <CheckCircle className="h-4 w-4" /> Lift Restriction
                                  </DropdownMenuItem>
                                ) : null}
                                {isDeletable && (
                                  <DropdownMenuItem onClick={() => openDeleteDialog(user)} className="rounded-lg gap-2 font-medium text-destructive">
                                    <Trash2 className="h-4 w-4" /> Teardown Account
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Section with glass effect */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pt-6 mt-5 border-t border-border/50">
                              <UserDetailsSection userId={user.id} role={user.role} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination - Premium */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-border/50">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">Registry Limit</span>
              <Select value={limit.toString()} onValueChange={(value) => { setLimit(Number(value)); setPage(1); }}>
                <SelectTrigger className="w-24 h-10 bg-card/40 border-border/50 rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="10">10 / Page</SelectItem>
                  <SelectItem value="25">25 / Page</SelectItem>
                  <SelectItem value="50">50 / Page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.has_prev || isLoading}
                className="h-10 px-4 rounded-xl font-bold hover:bg-primary/10 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-accent/30 border border-border/50">
                <span className="text-xs font-black text-foreground">{pagination.page}</span>
                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">of</span>
                <span className="text-xs font-black text-muted-foreground">{pagination.total_pages}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                disabled={!pagination.has_next || isLoading}
                className="h-10 px-4 rounded-xl font-bold hover:bg-primary/10 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Block User Dialog */}
      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block {selectedUser?.full_name}? This will prevent them from logging in and accessing the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={blockUserMutation.isPending}
            >
              {blockUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Blocking...
                </>
              ) : (
                "Block User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unblock User Dialog */}
      <AlertDialog open={isUnblockDialogOpen} onOpenChange={setIsUnblockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unblock {selectedUser?.full_name}? This will restore their login access and system permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnblockUser}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={unblockUserMutation.isPending}
            >
              {unblockUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Unblocking...
                </>
              ) : (
                "Unblock User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {selectedUser?.full_name}? This action cannot be undone and will also remove the user from Neon Auth.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      {/* Bulk Delete Dialog */}
      <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Delete Users</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {selectedUserIds.size} selected user(s)? This action cannot be undone and will also remove users from Neon Auth. Admin users cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBulkDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {selectedUserIds.size} User(s)
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
                    {bulkOperationResult.total_approved !== undefined ? "Approved" :
                      bulkOperationResult.total_rejected !== undefined ? "Rejected" :
                        bulkOperationResult.total_deleted !== undefined ? "Deleted" : "Processed"}
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {bulkOperationResult.total_approved ??
                      bulkOperationResult.total_rejected ??
                      bulkOperationResult.total_deleted ?? 0}
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

              {bulkOperationResult.deleted && bulkOperationResult.deleted.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Deleted ({bulkOperationResult.deleted.length})
                  </p>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <div className="space-y-1">
                      {bulkOperationResult.deleted.map((userId: any, index: number) => {
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

      {/* Demote Project Manager Dialog */}
      <Dialog open={isDemotePMDialogOpen} onOpenChange={setIsDemotePMDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Demote Project Manager</DialogTitle>
            <DialogDescription>
              Demote {selectedUserForDemote?.full_name} from Project Manager to Employee. You must select a replacement manager to take over their projects.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Replacement Manager *</label>
              <Select value={replacementManagerId} onValueChange={setReplacementManagerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a replacement manager" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers
                    .filter(u => u.id !== selectedUserForDemote?.id && u.role === "employee" && u.status === "active")
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select an active employee to become the new project manager
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDemotePMDialogOpen(false);
                setSelectedUserForDemote(null);
                setReplacementManagerId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDemotePM}
              disabled={demotePMMutation.isPending || !replacementManagerId}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {demotePMMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Demoting...
                </>
              ) : (
                <>
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Demote to Employee
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demote Team Lead Dialog */}
      <Dialog open={isDemoteTLDialogOpen} onOpenChange={setIsDemoteTLDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Demote Team Lead</DialogTitle>
            <DialogDescription>
              Demote {selectedUserForDemote?.full_name} from Team Lead to Employee. You must select a replacement lead to take over their teams.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Replacement Team Lead *</label>
              <Select value={replacementLeadId} onValueChange={setReplacementLeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a replacement team lead" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers
                    .filter(u => u.id !== selectedUserForDemote?.id && u.role === "employee" && u.status === "active")
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select an active employee to become the new team lead
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDemoteTLDialogOpen(false);
                setSelectedUserForDemote(null);
                setReplacementLeadId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDemoteTL}
              disabled={demoteTLMutation.isPending || !replacementLeadId}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {demoteTLMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Demoting...
                </>
              ) : (
                <>
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Demote to Employee
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div >
  );
};

export default AdminUsers;