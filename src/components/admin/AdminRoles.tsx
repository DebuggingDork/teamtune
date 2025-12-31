import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Shield,
  FolderKanban,
  UsersRound,
  Users,
  ArrowUp,
  ArrowDown,
  Edit,
  Eye,
  MoreHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useRoleStats,
  useUsersByRole,
  usePromoteToProjectManager,
  usePromoteToTeamLead,
  useChangeUserRole,
  useManagedProjects,
  useLedTeams,
  useAllUsers
} from "@/hooks/useAdmin";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/api/types";

const AdminRoles = () => {
  const { data: roleStats, isLoading: isLoadingStats } = useRoleStats();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [isDemoteDialogOpen, setIsDemoteDialogOpen] = useState(false);
  const [isChangeRoleDialogOpen, setIsChangeRoleDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>("employee");
  const [replacementEmail, setReplacementEmail] = useState<string>("");
  const [promoteAction, setPromoteAction] = useState<"pm" | "tl" | null>(null);
  const [demoteAction, setDemoteAction] = useState<"pm" | "tl" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { data: usersData, isLoading: isLoadingUsers } = useUsersByRole(selectedRole, { page, limit });
  const users = usersData?.users || [];
  const pagination = usersData?.pagination;
  const { data: allUsersData } = useAllUsers({ limit: 1000 }); // Get all users for replacement selection
  const allUsers = allUsersData?.users || [];
  const promotePMMutation = usePromoteToProjectManager();
  const promoteTLMutation = usePromoteToTeamLead();
  const changeRoleMutation = useChangeUserRole();
  const { data: managedProjects } = useManagedProjects(selectedUser?.id || "");
  const { data: ledTeams } = useLedTeams(selectedUser?.id || "");

  useEffect(() => {
    setPage(1);
  }, [selectedRole]);

  const roleConfig = {
    admin: {
      name: "Administrator",
      icon: Shield,
      color: "from-orange-500 via-red-500 to-yellow-500",
      bgColor: "bg-gradient-to-br from-orange-500/10 via-red-500/10 to-yellow-500/10",
      borderColor: "border-orange-500/20",
      textColor: "text-orange-500",
    },
    project_manager: {
      name: "Project Manager",
      icon: FolderKanban,
      color: "from-blue-500 via-cyan-500 to-teal-500",
      bgColor: "bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10",
      borderColor: "border-blue-500/20",
      textColor: "text-blue-500",
    },
    team_lead: {
      name: "Team Lead",
      icon: UsersRound,
      color: "from-purple-500 via-pink-500 to-rose-500",
      bgColor: "bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10",
      borderColor: "border-purple-500/20",
      textColor: "text-purple-500",
    },
    employee: {
      name: "Employee",
      icon: Users,
      color: "from-gray-500 via-slate-500 to-zinc-500",
      bgColor: "bg-gradient-to-br from-gray-500/10 via-slate-500/10 to-zinc-500/10",
      borderColor: "border-gray-500/20",
      textColor: "text-gray-500",
    },
  };

  const handlePromote = async () => {
    if (!selectedUser) return;

    try {
      if (promoteAction === "pm") {
        await (promotePMMutation.mutateAsync as any)({
          id: selectedUser.id,
          data: {},
        });
        toast({
          title: "Success",
          description: `${selectedUser.full_name} has been promoted to Project Manager`,
        });
      } else if (promoteAction === "tl") {
        await (promoteTLMutation.mutateAsync as any)({
          id: selectedUser.id,
          data: {},
        });
        toast({
          title: "Success",
          description: `${selectedUser.full_name} has been promoted to Team Lead`,
        });
      }
      setIsPromoteDialogOpen(false);
      setSelectedUser(null);
      setPromoteAction(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.error?.message || "Failed to promote user",
        variant: "destructive",
      });
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;
    setErrorMessage("");

    try {
      // Find user by email
      let replacementId: string | undefined = undefined;
      if (replacementEmail) {
        const replacementUser = allUsers.find(u => u.email.toLowerCase() === replacementEmail.toLowerCase());
        if (!replacementUser) {
          setErrorMessage(`User with email "${replacementEmail}" not found. Please enter a valid email.`);
          return;
        }
        replacementId = replacementUser.id;
      }

      await (changeRoleMutation.mutateAsync as any)({
        id: selectedUser.id,
        data: {
          role: newRole,
          replacement_id: replacementId || undefined,
        },
      });
      toast({
        title: "Success",
        description: `${selectedUser.full_name} role changed to ${roleConfig[newRole].name}`,
      });
      setIsChangeRoleDialogOpen(false);
      setSelectedUser(null);
      setNewRole("employee");
      setReplacementEmail("");
      setErrorMessage("");
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to change role";
      setErrorMessage(errorMsg);
      toast({
        title: "Cannot Change Role",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const openPromoteDialog = (user: any, action: "pm" | "tl") => {
    setSelectedUser(user);
    setPromoteAction(action);
    setIsPromoteDialogOpen(true);
  };

  const openChangeRoleDialog = (user: any) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsChangeRoleDialogOpen(true);
  };

  const openViewDetailsDialog = (user: any) => {
    setSelectedUser(user);
    setIsViewDetailsDialogOpen(true);
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleStats = (role: UserRole) => {
    if (!roleStats) return { total: 0, active: 0, blocked: 0, pending: 0 };
    return roleStats.by_role[role] || { total: 0, active: 0, blocked: 0, pending: 0 };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>;
      case "blocked":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Blocked</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
        <h2 className="text-3xl font-bold text-foreground mb-2">Role Management</h2>
        <p className="text-muted-foreground">
          Manage user roles, promotions, and role assignments across your organization
        </p>
      </div>

      {/* Role Statistics Cards - Premium Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(["admin", "project_manager", "team_lead", "employee"] as UserRole[]).map((role, index) => {
          const config = roleConfig[role];
          const Icon = config.icon;
          const stats = getRoleStats(role);
          const isSelected = selectedRole === role;

          return (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setSelectedRole(role)}
              className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 cursor-pointer ${isSelected
                ? `border-primary/50 shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-card ring-1 ring-primary/20 scale-[1.02]`
                : `border-border/50 hover:border-primary/30 hover:shadow-xl bg-card/40 backdrop-blur-md`
                }`}
            >
              {/* Animated Glow Background */}
              <div className={`absolute -inset-24 bg-gradient-to-br ${config.color} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 blur-3xl`} />

              <div className="relative z-10 p-7">
                <div className="flex items-center justify-between mb-8">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${config.color} shadow-2xl shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <Icon className="h-6 w-6 text-white drop-shadow-md" />
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Focused</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-black text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                  {config.name}
                </h3>
                <p className="text-xs text-muted-foreground font-medium mb-6">Permission Tier {4 - index}</p>

                {isLoadingStats ? (
                  <div className="flex items-center gap-2 py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs font-bold text-muted-foreground animate-pulse">Calculating...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Total Population</p>
                        <p className="text-4xl font-black text-foreground tracking-tighter tabular-nums">{stats.total}</p>
                      </div>
                      <TrendingUp className={`h-8 w-8 opacity-10 group-hover:opacity-30 transition-opacity ${config.textColor}`} />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors">
                        <span className="text-sm font-black text-emerald-500">{stats.active}</span>
                        <span className="text-[8px] text-muted-foreground/60 uppercase font-black tracking-widest">Act</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-destructive/[0.03] border border-destructive/10 hover:bg-destructive/10 transition-colors">
                        <span className="text-sm font-black text-destructive">{stats.blocked}</span>
                        <span className="text-[8px] text-muted-foreground/60 uppercase font-black tracking-widest">Blk</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10 hover:bg-amber-500/10 transition-colors">
                        <span className="text-sm font-black text-amber-500">{stats.pending}</span>
                        <span className="text-[8px] text-muted-foreground/60 uppercase font-black tracking-widest">Pnd</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Accent */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${config.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            </motion.div>
          );
        })}
      </div>

      {/* Users List by Role - Elevated Design */}
      <div className="relative overflow-hidden bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2rem] p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
          <Shield className="h-64 w-64 -mr-20 -mt-20 rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${roleConfig[selectedRole].color} shadow-lg shadow-primary/20`}>
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-black text-foreground tracking-tight">
                {roleConfig[selectedRole].name} Directory
              </h3>
            </div>
            {pagination && (
              <p className="text-sm font-medium text-muted-foreground/70 pl-11">
                Registry volume: <span className="text-foreground font-black">{pagination.total}</span> entries identified
              </p>
            )}
          </div>

          <div className="w-full md:w-auto flex items-center gap-3">
            <div className="group relative flex-1 md:w-80">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Scan identity or credentials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-background/50 border-border/50 rounded-2xl text-sm shadow-inner transition-all w-full"
                />
              </div>
            </div>
            <Button variant="outline" className="h-12 w-12 rounded-2xl border-border/50 bg-background/50 p-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoadingUsers ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
              <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
            </div>
            <p className="text-sm font-black text-muted-foreground tracking-widest uppercase animate-pulse">Querying Access Grid</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-24 bg-muted/20 rounded-[2rem] border-2 border-dashed border-border/50">
            <div className="p-6 bg-muted/50 rounded-full w-fit mx-auto mb-6">
              <Search className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <h4 className="text-xl font-black text-foreground">Entry Not Found</h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2 font-medium">No results matches your criteria. Please refine your search parameters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 mb-10">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user, index) => {
                  const config = roleConfig[user.role];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={user.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: index * 0.03, ease: "circOut" }}
                      className="group relative flex items-center justify-between p-5 rounded-2xl border border-border/50 hover:border-primary/30 bg-card/30 hover:bg-card/80 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        <div className="relative">
                          <div className={`p-4 rounded-xl bg-gradient-to-br ${config.color} shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-500`}>
                            <Icon className="h-6 w-6 text-white drop-shadow-sm" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-lg border-2 border-background shadow-lg ${user.status === 'active' ? 'bg-emerald-500' :
                            user.status === 'blocked' ? 'bg-destructive' : 'bg-warning'
                            }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                            <p className="text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
                              {user.full_name}
                            </p>
                            <div className="flex gap-2">
                              <Badge variant="outline" className={`rounded-lg border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest px-2 shadow-sm`}>
                                {user.role === 'project_manager' ? 'PM' :
                                  user.role === 'team_lead' ? 'Lead' : user.role}
                              </Badge>
                              {getStatusBadge(user.status)}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-sm font-medium text-muted-foreground/70 truncate">{user.email}</p>
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-muted/30 border border-border/50">
                              <Clock className="h-3 w-3 text-muted-foreground/40" />
                              <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">
                                Engaged {user.created_at ? format(new Date(user.created_at), "MMM yyyy") : "Archive"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewDetailsDialog(user)}
                          className="hidden md:flex h-11 px-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all"
                        >
                          Intelligence
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-11 w-11 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted transition-all">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-border/50 overflow-hidden">
                            <DropdownMenuItem onClick={() => openViewDetailsDialog(user)} className="rounded-xl gap-3 py-3 font-bold">
                              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <Eye className="h-4 w-4" />
                              </div>
                              View Credentials
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-2" />
                            {user.role === "employee" && (
                              <>
                                <DropdownMenuItem onClick={() => openPromoteDialog(user, "pm")} className="rounded-xl gap-3 py-3 font-bold text-blue-500 hover:text-blue-600">
                                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                                    <ArrowUp className="h-4 w-4" />
                                  </div>
                                  Promote to Manager
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openPromoteDialog(user, "tl")} className="rounded-xl gap-3 py-3 font-bold text-purple-500 hover:text-purple-600">
                                  <div className="p-1.5 rounded-lg bg-purple-500/10">
                                    <ArrowUp className="h-4 w-4" />
                                  </div>
                                  Promote to Lead
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => openChangeRoleDialog(user)} className="rounded-xl gap-3 py-3 font-bold">
                              <div className="p-1.5 rounded-lg bg-foreground/5">
                                <Edit className="h-4 w-4" />
                              </div>
                              Rewrite Permissions
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Select value={limit.toString()} onValueChange={(value) => { setLimit(Number(value)); setPage(1); }}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">per page</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!pagination.has_prev || isLoadingUsers}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-3">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                    disabled={!pagination.has_next || isLoadingUsers}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Promote Dialog */}
      <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Promote to {promoteAction === "pm" ? "Project Manager" : "Team Lead"}
            </DialogTitle>
            <DialogDescription>
              Promote {selectedUser?.full_name} to {promoteAction === "pm" ? "Project Manager" : "Team Lead"} role.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPromoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePromote}
              disabled={promotePMMutation.isPending || promoteTLMutation.isPending}
              className={promoteAction === "pm" ? "bg-blue-600 hover:bg-blue-700" : "bg-purple-600 hover:bg-purple-700"}
            >
              {(promotePMMutation.isPending || promoteTLMutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Promoting...
                </>
              ) : (
                <>
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Promote
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={isChangeRoleDialogOpen} onOpenChange={(open) => {
        setIsChangeRoleDialogOpen(open);
        if (!open) {
          setErrorMessage("");
          setReplacementEmail("");
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change {selectedUser?.full_name}'s role. If the user manages projects or teams, select a replacement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {errorMessage && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive mb-1">Cannot Change Role</p>
                    <p className="text-sm text-foreground">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">New Role</label>
              <Select value={newRole} onValueChange={(value) => {
                setNewRole(value as UserRole);
                setErrorMessage("");
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="team_lead">Team Lead</SelectItem>
                  <SelectItem value="project_manager">Project Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(selectedUser?.role === "project_manager" || selectedUser?.role === "team_lead" || errorMessage?.includes("project") || errorMessage?.includes("team")) && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Replacement User Email {errorMessage && <span className="text-destructive">*</span>}
                </label>
                <Input
                  type="email"
                  placeholder="Enter replacement user email (e.g., user@example.com)"
                  value={replacementEmail}
                  onChange={(e) => {
                    setReplacementEmail(e.target.value);
                    setErrorMessage("");
                  }}
                  className={errorMessage ? "border-destructive" : ""}
                />
                <p className="text-xs text-muted-foreground">
                  {errorMessage ? "Required to reassign projects/teams" : "Enter the email of the user who will take over projects/teams"}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsChangeRoleDialogOpen(false);
              setErrorMessage("");
              setReplacementEmail("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleChangeRole} disabled={changeRoleMutation.isPending}>
              {changeRoleMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Changing...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Change Role
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View {selectedUser?.full_name}'s role details and assignments
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{selectedUser.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge>{roleConfig[selectedUser.role].name}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>

              {selectedUser.role === "project_manager" && managedProjects && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium mb-2">Managed Projects ({managedProjects.total})</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {managedProjects.projects.map((project) => (
                      <div key={project.id} className="p-2 bg-accent rounded-lg">
                        <p className="text-sm font-medium">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{project.project_code}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.role === "team_lead" && ledTeams && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium mb-2">Led Teams ({ledTeams.total})</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {ledTeams.teams.map((team) => (
                      <div key={team.id} className="p-2 bg-accent rounded-lg">
                        <p className="text-sm font-medium">{team.name}</p>
                        <p className="text-xs text-muted-foreground">{team.team_code} • {team.member_count || 0} members</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminRoles;
