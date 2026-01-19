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
  Filter
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
import { useRoleStats, useUsersByRole, usePromoteToProjectManager, usePromoteToTeamLead, useChangeUserRole, useManagedProjects, useLedTeams, useAllUsers } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { UserRole } from "@/api/types/index";

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
        await promotePMMutation.mutateAsync({
          id: selectedUser.id,
          data: {},
        });
        toast({
          title: "Success",
          description: `${selectedUser.full_name} has been promoted to Project Manager`,
        });
      } else if (promoteAction === "tl") {
        await promoteTLMutation.mutateAsync({
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

      await changeRoleMutation.mutateAsync({
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

      {/* Role Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => setSelectedRole(role)}
              className={`relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                isSelected
                  ? "border-primary shadow-xl ring-2 ring-primary/20 scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:shadow-lg"
              } ${config.bgColor} p-6 group backdrop-blur-sm`}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                   style={{ background: `linear-gradient(to bottom right, var(--${config.textColor.split('-')[1]}-500), transparent)` }} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${config.color} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <Icon className="h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-3 h-3 rounded-full bg-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-lg"
                    />
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">{config.name}</h3>
                
                {isLoadingStats ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="text-2xl font-bold text-foreground">{stats.total}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-all duration-200 group/stat">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 group-hover/stat:animate-pulse" />
                          <span className="text-sm font-bold text-emerald-500">{stats.active}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Active</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 hover:bg-destructive/15 hover:border-destructive/30 transition-all duration-200 group/stat">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-destructive shadow-sm shadow-destructive/50" />
                          <span className="text-sm font-bold text-destructive">{stats.blocked}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Blocked</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 hover:border-amber-500/30 transition-all duration-200 group/stat">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50 group-hover/stat:animate-pulse" />
                          <span className="text-sm font-bold text-amber-500">{stats.pending}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Pending</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Users List by Role */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {roleConfig[selectedRole].name} Users
            </h3>
            {pagination && (
              <p className="text-sm text-muted-foreground mt-1">
                Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {filteredUsers.map((user, index) => {
                const config = roleConfig[user.role];
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 bg-accent/30 hover:bg-accent/50 transition-all group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color} shadow-md`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground">{user.full_name}</p>
                          {getStatusBadge(user.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.created_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Joined {format(new Date(user.created_at), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDetailsDialog(user)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.role === "employee" && (
                            <>
                              <DropdownMenuItem onClick={() => openPromoteDialog(user, "pm")}>
                                <ArrowUp className="h-4 w-4 mr-2 text-blue-500" />
                                Promote to PM
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openPromoteDialog(user, "tl")}>
                                <ArrowUp className="h-4 w-4 mr-2 text-purple-500" />
                                Promote to TL
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => openChangeRoleDialog(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                );
              })}
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
