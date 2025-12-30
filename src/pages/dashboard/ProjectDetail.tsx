import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FolderKanban,
  Calendar,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Plus,
  Edit,
  UserPlus,
  UserMinus,
  Crown,
  TrendingUp,
  BarChart3,
  Settings,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeamTuneLogo from "@/components/TeamTuneLogo";
import { useAuth } from "@/hooks/useAuth";
import {
  useProject,
  useProjectTeams,
  useProjectHealth,
  useProjectMembers,
  useTeamMembers,
  useCreateTeam,
  useAssignTeamLead,
  useRemoveTeamLead,
  useAddTeamMembers,
  useRemoveTeamMember,
  useUpdateProject,
  useUpdateProjectStatus,
  useDeleteProject,
} from "@/hooks/useProjectManager";
import { useEmployees } from "@/hooks/useProjectManager";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import type {
  CreateTeamRequest,
  AssignTeamLeadRequest,
  RemoveTeamLeadRequest,
  AddTeamMembersRequest,
  UpdateProjectRequest,
} from "@/api/types";

const ProjectDetail = () => {
  const { projectCode } = useParams<{ projectCode: string }>();
  const navigate = useNavigate();
  const { user, updateUserRole } = useAuth();

  // Dialog states
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeamCode, setSelectedTeamCode] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  // Form states
  const [newTeam, setNewTeam] = useState<CreateTeamRequest>({
    name: "",
    lead_id: "",
    capacity_hours_per_sprint: 160,
  });
  const [editProject, setEditProject] = useState<UpdateProjectRequest>({});
  const [newMembers, setNewMembers] = useState<AddTeamMembersRequest>({
    user_ids: [],
    allocation_percentage: 100,
  });

  // Store project ID in state (from fetched project)
  const [projectId, setProjectId] = useState<string | null>(null);

  // Fetch project data
  const { data: project, isLoading: isLoadingProject } = useProject(projectCode || "");
  const { data: teamsData, isLoading: isLoadingTeams } = useProjectTeams(projectCode || "");
  const { data: healthData, isLoading: isLoadingHealth } = useProjectHealth(projectCode || "");
  const { data: projectMembersData, isLoading: isLoadingMembers } = useProjectMembers(projectCode || "");
  const { data: employeesData } = useEmployees();

  // Get current team members for the selected team (to exclude from member selection)
  const { data: selectedTeamMembersData } = useTeamMembers(selectedTeamCode || "");

  // Update projectId when project is loaded
  useEffect(() => {
    if (project?.id) {
      setProjectId(project.id);
    }
  }, [project]);



  // Mutations
  const createTeamMutation = useCreateTeam();
  const assignLeadMutation = useAssignTeamLead();
  const removeLeadMutation = useRemoveTeamLead();
  const addMembersMutation = useAddTeamMembers();
  const removeMemberMutation = useRemoveTeamMember();
  const updateProjectMutation = useUpdateProject();
  const updateProjectStatusMutation = useUpdateProjectStatus();
  const deleteProjectMutation = useDeleteProject();

  const teams = teamsData?.teams || [];
  const employees = employeesData?.employees || [];
  const projectMembers = projectMembersData?.teams || [];

  const handleCreateTeam = async () => {
    if (!newTeam.name || !newTeam.lead_id || !projectCode) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTeamMutation.mutateAsync({
        projectCode,
        data: newTeam,
      });
      toast({
        title: "Success",
        description: "Team created successfully",
      });
      setIsCreateTeamOpen(false);
      setNewTeam({
        name: "",
        lead_id: "",
        capacity_hours_per_sprint: 160,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    }
  };

  const handleAssignLead = async (teamCode: string, leadId: string) => {
    try {
      await assignLeadMutation.mutateAsync({
        code: teamCode,
        data: { lead_id: leadId },
      });

      // If the assigned lead is the current user, update their role in the UI
      const assignedEmployee = employees.find((emp: any) =>
        emp.user_code === leadId || emp.id === leadId
      );

      if (assignedEmployee && user &&
        (assignedEmployee.user_code === user.user_code || assignedEmployee.id === user.id)) {
        updateUserRole('team_lead');
      }

      toast({
        title: "Success",
        description: "Team lead assigned successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign team lead",
        variant: "destructive",
      });
    }
  };

  const handleRemoveLead = async (teamCode: string, newLeadId: string) => {
    try {
      await removeLeadMutation.mutateAsync({
        code: teamCode,
        data: { new_lead_id: newLeadId },
      });
      toast({
        title: "Success",
        description: "Team lead removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove team lead",
        variant: "destructive",
      });
    }
  };

  const handleAddMembers = async () => {
    if (!selectedTeamCode || newMembers.user_ids.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select team members",
        variant: "destructive",
      });
      return;
    }

    try {
      await addMembersMutation.mutateAsync({
        code: selectedTeamCode,
        data: newMembers,
      });
      toast({
        title: "Success",
        description: `Added ${newMembers.user_ids.length} member(s) successfully`,
      });
      setIsAddMembersOpen(false);
      setNewMembers({
        user_ids: [],
        allocation_percentage: 100,
      });
      setSelectedTeamCode(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add team members",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (teamCode: string, userId: string) => {
    try {
      await removeMemberMutation.mutateAsync({
        code: teamCode,
        userId,
      });
      toast({
        title: "Success",
        description: "Team member removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProject = async () => {
    if (!projectCode) return;

    try {
      await updateProjectMutation.mutateAsync({
        code: projectCode,
        data: editProject,
      });
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      setIsEditProjectOpen(false);
      setEditProject({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!projectCode) return;

    try {
      await deleteProjectMutation.mutateAsync(projectCode);
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      navigate("/dashboard/project-manager");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const openAddMembersDialog = (team: any) => {
    setSelectedTeamCode(team.team_code);
    setSelectedTeam(team);
    setIsAddMembersOpen(true);
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-emerald-500";
      case "warning":
        return "text-yellow-500";
      case "critical":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Project not found</p>
          <Button onClick={() => navigate("/dashboard/project-manager")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/project-manager")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.project_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={project.status}
              onValueChange={(value: string) => {
                if (projectCode) {
                  updateProjectStatusMutation.mutate(
                    {
                      code: projectCode,
                      status: value,
                    },
                    {
                      onSuccess: () => {
                        toast({
                          title: "Success",
                          description: "Project status updated successfully",
                        });
                      },
                      onError: () => {
                        toast({
                          title: "Error",
                          description: "Failed to update project status",
                          variant: "destructive",
                        });
                      },
                    }
                  );
                }
              }}
              disabled={updateProjectStatusMutation.isPending}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditProject({
                  name: project.name,
                  description: project.description,
                  start_date: project.start_date.split("T")[0],
                  end_date: project.end_date.split("T")[0],
                  status: project.status,
                });
                setIsEditProjectOpen(true);
              }}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Project Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm text-foreground">{project.description || "No description"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Manager</p>
                  <p className="text-sm text-foreground">{project.manager_name || "N/A"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="text-sm text-foreground">
                      {format(new Date(project.start_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="text-sm text-foreground">
                      {format(new Date(project.end_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Health */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Health Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingHealth ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : healthData ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Overall Status</span>
                      <Badge
                        variant={
                          healthData.health.overall_status === "healthy"
                            ? "default"
                            : healthData.health.overall_status === "warning"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {healthData.health.overall_status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tasks Completion</span>
                        <span className="font-medium">
                          {(healthData.health.indicators.tasks.completion_rate ?? 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Active Teams</span>
                        <span className="font-medium">
                          {healthData.health.indicators.teams.active} / {healthData.health.indicators.teams.total}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Resource Utilization</span>
                        <span className="font-medium">
                          {(healthData.health.indicators.resources.utilization_rate ?? 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No health data available</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Teams</span>
                  <span className="text-lg font-bold">{teams.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Members</span>
                  <span className="text-lg font-bold">
                    {projectMembersData?.pagination?.total_members || 0}
                  </span>
                </div>
                {healthData?.health?.indicators && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Completed Tasks</span>
                      <span className="text-lg font-bold">
                        {healthData.health.indicators.tasks?.completed ?? 0} / {healthData.health.indicators.tasks?.total ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Blocked Tasks</span>
                      <span className="text-lg font-bold text-destructive">
                        {healthData.health.indicators.risks?.blocked_tasks_count ?? 0}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="teams" className="space-y-4">
            <TabsList>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="members">All Members</TabsTrigger>
              <TabsTrigger value="health">Health Metrics</TabsTrigger>
            </TabsList>

            {/* Teams Tab */}
            <TabsContent value="teams" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Teams</h2>
                <Button
                  onClick={() => setIsCreateTeamOpen(true)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Team
                </Button>
              </div>

              {isLoadingTeams ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : teams.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No teams found</p>
                    <Button
                      onClick={() => setIsCreateTeamOpen(true)}
                      className="mt-4 gap-2"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                      Create First Team
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map((team: any) => (
                    <TeamCard
                      key={team.id || team.team_code}
                      team={team}
                      employees={employees}
                      onAssignLead={handleAssignLead}
                      onRemoveLead={handleRemoveLead}
                      onAddMembers={openAddMembersDialog}
                      onRemoveMember={handleRemoveMember}
                      projectCode={projectCode || ""}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* All Members Tab */}
            <TabsContent value="members" className="space-y-4">
              <h2 className="text-lg font-semibold">All Project Members</h2>
              {isLoadingMembers ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : projectMembers.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No members found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {projectMembers.map((teamData: any) => (
                    <Card key={teamData.team_id}>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">{teamData.team_name}</CardTitle>
                        <CardDescription>{teamData.member_count} members</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {teamData.members?.map((member: any) => (
                            <div
                              key={member.user_id}
                              className="flex items-center justify-between p-2 bg-accent/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <Users className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{member.full_name}</p>
                                  <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>
                              </div>
                              <Badge variant="outline">{member.allocation_percentage}%</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Health Metrics Tab */}
            <TabsContent value="health" className="space-y-4">
              <h2 className="text-lg font-semibold">Health Metrics</h2>
              {isLoadingHealth ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : healthData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Tasks Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total</span>
                        <span className="font-medium">{healthData.health.indicators.tasks?.total ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Completed</span>
                        <span className="font-medium text-emerald-500">
                          {healthData.health.indicators.tasks?.completed ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">In Progress</span>
                        <span className="font-medium">{healthData.health.indicators.tasks?.in_progress ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Blocked</span>
                        <span className="font-medium text-destructive">
                          {healthData.health.indicators.tasks?.blocked ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Overdue</span>
                        <span className="font-medium text-destructive">
                          {healthData.health.indicators.tasks?.overdue ?? 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Hours Logged</span>
                        <span className="font-medium">{healthData.health.indicators.resources?.total_hours_logged ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Estimated Hours</span>
                        <span className="font-medium">
                          {healthData.health.indicators.resources?.total_estimated_hours ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Utilization Rate</span>
                        <span className="font-medium">
                          {(healthData.health.indicators.resources.utilization_rate ?? 0).toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(healthData.health.teams || []).map((team: any) => (
                          <div key={team.team_id} className="flex items-center justify-between p-2 bg-accent/50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium">{team.team_name || "Unknown Team"}</p>
                              <p className="text-xs text-muted-foreground">
                                {team.tasks_completed ?? 0} / {team.tasks_total ?? 0} tasks
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{(team.performance_score ?? 0).toFixed(1)}%</p>
                              <Badge
                                variant={
                                  team.health_status === "healthy"
                                    ? "default"
                                    : team.health_status === "warning"
                                      ? "secondary"
                                      : "destructive"
                                }
                                className="text-xs"
                              >
                                {team.health_status || "unknown"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No health data available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Create Team Dialog */}
      <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>Create a new team for this project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="team-name">Team Name *</Label>
              <Input
                id="team-name"
                placeholder="Enter team name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="team-lead">Team Lead *</Label>
              <Select
                value={newTeam.lead_id}
                onValueChange={(value) => setNewTeam({ ...newTeam, lead_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team lead" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter((emp: any) => emp.role === "team_lead" || emp.role === "employee")
                    .map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.user_code}>
                        {emp.full_name} ({emp.user_code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity Hours per Sprint</Label>
              <Input
                id="capacity"
                type="number"
                value={newTeam.capacity_hours_per_sprint}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, capacity_hours_per_sprint: parseInt(e.target.value) || 160 })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeam} disabled={createTeamMutation.isPending}>
              {createTeamMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Team"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Project Name</Label>
              <Input
                id="edit-name"
                value={editProject.name || ""}
                onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editProject.description || ""}
                onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-start">Start Date</Label>
                <Input
                  id="edit-start"
                  type="date"
                  value={editProject.start_date || ""}
                  onChange={(e) => setEditProject({ ...editProject, start_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-end">End Date</Label>
                <Input
                  id="edit-end"
                  type="date"
                  value={editProject.end_date || ""}
                  onChange={(e) => setEditProject({ ...editProject, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editProject.status || project.status}
                onValueChange={(value: any) => setEditProject({ ...editProject, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProjectOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProject}
              disabled={updateProjectMutation.isPending || updateProjectStatusMutation.isPending}
            >
              {updateProjectMutation.isPending || updateProjectStatusMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Members Dialog */}
      <Dialog open={isAddMembersOpen} onOpenChange={setIsAddMembersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Members</DialogTitle>
            <DialogDescription>
              Add members to {selectedTeam?.name || "the team"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Select Members</Label>
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
                {(() => {
                  // Get current team member IDs to exclude them
                  const currentMemberIds = selectedTeamMembersData?.members?.map((m: any) => m.user_id) || [];
                  const currentMemberCodes = selectedTeamMembersData?.members?.map((m: any) => m.user_code) || [];

                  return employees
                    .filter((emp: any) => {
                      // Filter by role
                      if (emp.role !== "employee") return false;

                      // Exclude team lead (check both id and user_code to be safe)
                      if (selectedTeam?.lead_id &&
                        (emp.id === selectedTeam.lead_id || emp.user_code === selectedTeam.lead_id)) {
                        return false;
                      }

                      // Exclude already existing team members
                      if (currentMemberIds.includes(emp.id) || currentMemberIds.includes(emp.user_code) ||
                        currentMemberCodes.includes(emp.id) || currentMemberCodes.includes(emp.user_code)) {
                        return false;
                      }

                      return true;
                    })
                    .map((emp: any) => (
                      <label
                        key={emp.id}
                        className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newMembers.user_ids.includes(emp.user_code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewMembers({
                                ...newMembers,
                                user_ids: [...newMembers.user_ids, emp.user_code],
                              });
                            } else {
                              setNewMembers({
                                ...newMembers,
                                user_ids: newMembers.user_ids.filter((id) => id !== emp.user_code),
                              });
                            }
                          }}
                        />
                        <span className="text-sm">
                          {emp.full_name} ({emp.user_code})
                        </span>
                      </label>
                    ));
                })()}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="allocation">Allocation Percentage</Label>
              <Input
                id="allocation"
                type="number"
                min="0"
                max="100"
                value={newMembers.allocation_percentage}
                onChange={(e) =>
                  setNewMembers({
                    ...newMembers,
                    allocation_percentage: parseInt(e.target.value) || 100,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMembersOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMembers} disabled={addMembersMutation.isPending}>
              {addMembersMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Members"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project?.name}"? This action cannot be undone and will permanently remove the project and all associated data including teams, tasks, and members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Project"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Team Card Component
const TeamCard = ({
  team,
  employees,
  onAssignLead,
  onRemoveLead,
  onAddMembers,
  onRemoveMember,
  projectCode,
}: {
  team: any;
  employees: any[];
  onAssignLead: (teamCode: string, leadId: string) => void;
  onRemoveLead: (teamCode: string, newLeadId: string) => void;
  onAddMembers: (team: any) => void;
  onRemoveMember: (teamCode: string, userId: string) => void;
  projectCode: string;
}) => {
  const [isViewingMembers, setIsViewingMembers] = useState(false);
  const { data: membersData, isLoading: isLoadingMembers } = useTeamMembers(team.team_code);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [showAssignLead, setShowAssignLead] = useState(false);

  const members = membersData?.members || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{team.name}</CardTitle>
            <CardDescription>{team.team_code}</CardDescription>
          </div>
          <Badge variant="outline">{team.member_count || 0} members</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Team Lead</p>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">{team.lead_name || "Not assigned"}</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Capacity</p>
          <p className="text-sm">{team.capacity_hours_per_sprint} hours/sprint</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setIsViewingMembers(!isViewingMembers)}
          >
            {isViewingMembers ? "Hide" : "View"} Members
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onAddMembers(team)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {showAssignLead && (
          <div className="space-y-2 p-2 bg-accent rounded-lg">
            <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
              <SelectTrigger>
                <SelectValue placeholder="Select new lead" />
              </SelectTrigger>
              <SelectContent>
                {employees
                  .filter((emp: any) => emp.role === "team_lead" || emp.role === "employee")
                  .map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.user_code}>
                      {emp.full_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (selectedLeadId) {
                    onAssignLead(team.team_code, selectedLeadId);
                    setShowAssignLead(false);
                    setSelectedLeadId("");
                  }
                }}
              >
                Assign
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (selectedLeadId) {
                    onRemoveLead(team.team_code, selectedLeadId);
                    setShowAssignLead(false);
                    setSelectedLeadId("");
                  }
                }}
              >
                Replace
              </Button>
            </div>
          </div>
        )}

        {!showAssignLead && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setShowAssignLead(true)}
          >
            <Crown className="h-4 w-4 mr-1" />
            Manage Lead
          </Button>
        )}

        {isViewingMembers && (
          <div className="space-y-2 pt-2 border-t">
            {isLoadingMembers ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : members.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center">No members</p>
            ) : (
              members.map((member: any) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-2 bg-accent/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium">{member.full_name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {member.allocation_percentage}%
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onRemoveMember(team.team_code, member.user_id)}
                    >
                      <UserMinus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectDetail;

