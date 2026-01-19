import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Loader2,
  Link as LinkIcon,
  ExternalLink,
  Settings,
  Github,
  XCircle,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TeamLeadLayout } from "@/components/layouts/TeamLeadLayout";
import {
  useMyTeams,
  useTeamMetrics,
  useTeamPerformance,
  useTeamGitActivity,
  useLinkRepository,
  useAvailableMembers,
  useAddTeamMember,
  useRemoveTeamMember,
  useUpdateTeamMemberAllocation,
} from "@/hooks/useTeamLead";
import { toast } from "@/hooks/use-toast";
import type { LinkRepositoryRequest, AddTeamMemberRequest, UpdateTeamMemberAllocationRequest } from "@/api/types/index";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-chart-1" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const ConsistencyIndicator = ({ level }: { level: string }) => {
  const colors = {
    high: "bg-chart-1",
    medium: "bg-chart-3",
    low: "bg-chart-4",
  };
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full ${(level === "high" && i <= 3) ||
            (level === "medium" && i <= 2) ||
            (level === "low" && i <= 1)
            ? colors[level as keyof typeof colors]
            : "bg-muted"
            }`}
        />
      ))}
    </div>
  );
};

const TeamManagementPage = () => {
  const [isLinkRepoDialogOpen, setIsLinkRepoDialogOpen] = useState(false);
  const [repositoryUrl, setRepositoryUrl] = useState("");

  // Member Management States
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isEditAllocationDialogOpen, setIsEditAllocationDialogOpen] = useState(false);
  const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [addMemberData, setAddMemberData] = useState<AddTeamMemberRequest>({ user_code: '', allocation_percentage: 100 });
  const [editAllocationData, setEditAllocationData] = useState<UpdateTeamMemberAllocationRequest>({ allocation_percentage: 100 });

  // Add Member Dialog Filters
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");

  // Get teams
  const { data: teamsData, isLoading: isLoadingTeams, refetch: refetchTeams } = useMyTeams();
  const teamCode = useMemo(() => {
    if (teamsData?.teams && teamsData.teams.length > 0) {
      return teamsData.teams[0].team_code;
    }
    return null;
  }, [teamsData]);

  // Get team data
  const team = useMemo(() => {
    if (teamsData?.teams && teamsData.teams.length > 0) {
      return teamsData.teams[0];
    }
    return null;
  }, [teamsData]);

  // Get team metrics
  const { data: teamMetrics, isLoading: isLoadingMetrics } = useTeamMetrics(teamCode || "");

  // Get team performance
  const dateRanges = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 42); // 6 weeks ago
    return {
      period_start: startDate.toISOString().split('T')[0],
      period_end: endDate.toISOString().split('T')[0],
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    };
  }, []);

  const { data: teamPerformance, isLoading: isLoadingPerformance } = useTeamPerformance(
    teamCode || "",
    dateRanges
  );

  // Get git activity
  const { data: gitActivity, isLoading: isLoadingGitActivity } = useTeamGitActivity(
    teamCode || "",
    dateRanges
  );

  // Link repository mutation
  const linkRepositoryMutation = useLinkRepository();
  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();
  const updateAllocationMutation = useUpdateTeamMemberAllocation();

  // Get available members
  const { data: availableMembers, isLoading: isLoadingAvailableMembers } = useAvailableMembers(teamCode || "");

  // Filter available members based on search and role
  const filteredAvailableMembers = useMemo(() => {
    if (!availableMembers) return [];

    let filtered = [...availableMembers];

    // Role filter
    if (selectedRoleFilter !== "all") {
      filtered = filtered.filter(user => user.role === selectedRoleFilter);
    }

    // Search filter (name or email)
    if (memberSearchQuery.trim()) {
      const query = memberSearchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [availableMembers, selectedRoleFilter, memberSearchQuery]);

  // Transform team data
  const teamData = useMemo(() => {
    if (!team) return null;
    return {
      name: team.name || "Team",
      project: team.project_name || "Project",
      size: team.member_count || team.members?.length || teamPerformance?.members_summary?.total_members || 0,
      status: "Active",
      repository: team.github_repository || teamMetrics?.github_repository || null,
    };
  }, [team, teamPerformance, teamMetrics]);

  // Transform member activity data
  const memberActivityData = useMemo(() => {
    if (!teamPerformance?.members) return [];
    return teamPerformance.members.map((member) => {
      const trend =
        member.performance_score >= 80
          ? "up"
          : member.performance_score >= 60
            ? "stable"
            : "down";
      const consistency =
        member.performance_score >= 80
          ? "high"
          : member.performance_score >= 60
            ? "medium"
            : "low";
      const initials = member.user_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      return {
        name: member.user_name,
        trend,
        consistency,
        lastActive: "Recently",
        avatar: initials,
        userCode: member.user_code,
        performanceScore: member.performance_score,
      };
    });
  }, [teamPerformance]);

  const handleAddMember = async () => {
    if (!teamCode || !addMemberData.user_code) return;
    try {
      await addMemberMutation.mutateAsync({ teamCode, data: addMemberData });
      toast({ title: "Success", description: "Member added successfully" });
      setIsAddMemberDialogOpen(false);
      setAddMemberData({ user_code: '', allocation_percentage: 100 });
      refetchTeams();
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to add member", variant: "destructive" });
    }
  };

  const handleUpdateAllocation = async () => {
    if (!teamCode || !selectedMember) return;
    try {
      await updateAllocationMutation.mutateAsync({
        teamCode,
        userCode: selectedMember.user_code,
        data: editAllocationData
      });
      toast({ title: "Success", description: "Allocation updated successfully" });
      setIsEditAllocationDialogOpen(false);
      refetchTeams();
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to update allocation", variant: "destructive" });
    }
  };

  const handleRemoveMember = async () => {
    if (!teamCode || !selectedMember) return;
    try {
      await removeMemberMutation.mutateAsync({ teamCode, userCode: selectedMember.user_code });
      toast({ title: "Success", description: "Member removed successfully" });
      setIsRemoveMemberDialogOpen(false);
      refetchTeams();
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to remove member", variant: "destructive" });
    }
  };

  const handleLinkRepository = async () => {
    if (!teamCode || !repositoryUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a repository URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      const data: LinkRepositoryRequest = {
        repository_url: repositoryUrl,
      };
      await linkRepositoryMutation.mutateAsync({ teamCode, data });
      toast({
        title: "Success",
        description: "Repository linked successfully.",
      });
      setIsLinkRepoDialogOpen(false);
      setRepositoryUrl("");
    } catch (error: any) {
      // Extract error message from various possible error structures
      let errorMessage = "Failed to link repository.";

      if (error?.response?.data?.error?.message) {
        // Backend error format: { error: { message: "..." } }
        errorMessage = error.response.data.error.message;
      } else if (error?.response?.data?.message) {
        // Backend error format: { message: "..." }
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        // Direct error message
        errorMessage = error.message;
      }

      toast({
        title: "Failed to Link Repository",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const isLoading = isLoadingTeams || isLoadingMetrics || isLoadingPerformance || isLoadingGitActivity;

  return (
    <TeamLeadLayout
      headerTitle="Team Management"
      headerDescription="Manage your team members, performance, and settings"
    >
      <div className="space-y-6">
        {/* Team Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !teamCode ? (
              <p className="text-center text-muted-foreground py-4">No team assigned</p>
            ) : !teamData ? (
              <p className="text-center text-muted-foreground py-4">No team data available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Team Name</p>
                  <p className="text-lg font-semibold text-foreground">{teamData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="text-lg font-semibold text-foreground">{teamData.project}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Team Size</p>
                  <p className="text-lg font-semibold text-foreground">{teamData.size} members</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-chart-1/20 text-chart-1">
                    {teamData.status}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GitHub Repository */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5 text-primary" />
                GitHub Repository
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLinkRepoDialogOpen(true)}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                {teamData?.repository ? "Update Repository" : "Link Repository"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {teamData?.repository ? (
              <div className="flex items-center gap-2">
                <a
                  href={teamData.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  {teamData.repository}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <p className="text-muted-foreground">No repository linked</p>
            )}
          </CardContent>
        </Card>

        {/* Team Metrics */}
        {teamMetrics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Team Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Commits</p>
                  <p className="text-2xl font-bold text-foreground">
                    {gitActivity?.total_commits || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-2xl font-bold text-foreground">
                    {gitActivity?.activity_by_member?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Performance</p>
                  <p className="text-2xl font-bold text-foreground">
                    {teamPerformance?.members_summary?.average_performance_score
                      ? Math.round(teamPerformance.members_summary.average_performance_score)
                      : 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold text-foreground">
                    {teamPerformance?.members_summary?.total_members || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team Members
              </CardTitle>
              <Button size="sm" onClick={() => setIsAddMemberDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
            <CardDescription>Manage your team roster and their time allocations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTeams ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !team?.members || team.members.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                No members in this team yet. Use the "Add Member" button to invite people.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Member</th>
                      <th className="px-4 py-3 text-center">Allocation</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {team.members.map((member) => (
                      <tr key={member.user_id} className="group hover:bg-accent/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                              {member.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-medium">{member.full_name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge variant={member.allocation_percentage === 100 ? "default" : "secondary"}>
                            {member.allocation_percentage}%
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {format(new Date(member.joined_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary"
                              onClick={() => {
                                setSelectedMember(member);
                                setEditAllocationData({ allocation_percentage: member.allocation_percentage || 100 });
                                setIsEditAllocationDialogOpen(true);
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => {
                                setSelectedMember(member);
                                setIsRemoveMemberDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Performance Overview section remains as is */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Member Performance Overview (Last 6 Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPerformance ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : memberActivityData.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No member data available</p>
            ) : (
              <div className="space-y-4">
                {memberActivityData.map((member, index) => (
                  <motion.div
                    key={member.userCode}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{member.avatar}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {member.lastActive}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Performance</p>
                        <p className="text-sm font-semibold text-foreground">
                          {member.performanceScore}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Trend</p>
                        <TrendIcon trend={member.trend} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Consistency</p>
                        <ConsistencyIndicator level={member.consistency} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={(open) => {
        setIsAddMemberDialogOpen(open);
        if (!open) {
          // Reset filters when closing
          setMemberSearchQuery("");
          setSelectedRoleFilter("all");
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to your team. Only users not already on a team can be added.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Search and Filter Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Search Members</Label>
                <Input
                  placeholder="Search by name or email..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Filter by Role</Label>
                <Select value={selectedRoleFilter} onValueChange={setSelectedRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="team_lead">Team Lead</SelectItem>
                    <SelectItem value="project_manager">Project Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Member Selection */}
            <div className="space-y-2">
              <Label>Select Member</Label>
              <Select
                onValueChange={(val) => setAddMemberData(prev => ({ ...prev, user_code: val }))}
                value={addMemberData.user_code}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingAvailableMembers ? (
                    <div className="p-2 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
                    </div>
                  ) : !filteredAvailableMembers || filteredAvailableMembers.length === 0 ? (
                    <div className="p-2 text-sm text-center text-muted-foreground">
                      {memberSearchQuery || selectedRoleFilter !== "all"
                        ? "No users match your filters"
                        : "No available users found"}
                    </div>
                  ) : (
                    filteredAvailableMembers.map((user) => (
                      <SelectItem key={user.user_code} value={user.user_code}>
                        <div className="flex items-center justify-between w-full gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{user.full_name}</div>
                            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                          </div>
                          <Badge
                            variant={
                              user.role === "admin" ? "default" :
                                user.role === "team_lead" ? "secondary" :
                                  user.role === "project_manager" ? "outline" :
                                    "secondary"
                            }
                            className="shrink-0 text-xs"
                          >
                            {user.role === "team_lead" ? "Team Lead" :
                              user.role === "project_manager" ? "PM" :
                                user.role === "admin" ? "Admin" :
                                  "Employee"}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {filteredAvailableMembers && filteredAvailableMembers.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Showing {filteredAvailableMembers.length} of {availableMembers?.length || 0} available users
                </p>
              )}
            </div>

            {/* Allocation Percentage */}
            <div className="space-y-2">
              <Label htmlFor="allocation">Allocation Percentage (%)</Label>
              <Input
                id="allocation"
                type="number"
                min="1"
                max="100"
                value={addMemberData.allocation_percentage}
                onChange={(e) => setAddMemberData(prev => ({ ...prev, allocation_percentage: parseInt(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground">
                Percentage of their time allocated to this team (1-100%)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddMember}
              disabled={addMemberMutation.isPending || !addMemberData.user_code}
            >
              {addMemberMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add to Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Allocation Dialog */}
      <Dialog open={isEditAllocationDialogOpen} onOpenChange={setIsEditAllocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Allocation</DialogTitle>
            <DialogDescription>
              Update {selectedMember?.full_name}'s time allocation for this team.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-allocation">Allocation Percentage (%)</Label>
              <Input
                id="edit-allocation"
                type="number"
                min="1"
                max="100"
                value={editAllocationData.allocation_percentage}
                onChange={(e) => setEditAllocationData({ allocation_percentage: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAllocationDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleUpdateAllocation}
              disabled={updateAllocationMutation.isPending}
            >
              {updateAllocationMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Alert Dialog */}
      <AlertDialog open={isRemoveMemberDialogOpen} onOpenChange={setIsRemoveMemberDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{selectedMember?.full_name}</strong> from your team. They will no longer have access to team resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMemberMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Link Repository Dialog */}
      <Dialog open={isLinkRepoDialogOpen} onOpenChange={setIsLinkRepoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link GitHub Repository</DialogTitle>
            <DialogDescription>
              Link a GitHub repository to track your team's git activity.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="repository-url">Repository URL</Label>
              <Input
                id="repository-url"
                placeholder="https://github.com/username/repository"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Expected format: <code className="bg-muted px-1 py-0.5 rounded">https://github.com/org/repo</code>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkRepoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkRepository} disabled={linkRepositoryMutation.isPending}>
              {linkRepositoryMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Linking...
                </>
              ) : (
                "Link Repository"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TeamLeadLayout>
  );
};

export default TeamManagementPage;



