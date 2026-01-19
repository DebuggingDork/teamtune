import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Loader2,
  Users,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
  Activity,
  AlertCircle,
  Trash2,
  FolderKanban,
  Briefcase,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectManagerLayout } from "@/components/layouts/ProjectManagerLayout";
import { useProjects, useEmployees, useCreateProject, useDeleteProject, useBulkDeleteProjects, useUpdateProjectStatus } from "@/hooks/useProjectManager";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import type { CreateProjectRequest } from "@/api/types/index";
import { StatCard } from "@/components/shared";
import { getUserNameFromEmail } from "@/components/layouts/BaseLayout/hooks";

const ProjectManagerDashboard = () => {
  const navigate = useNavigate();
  const { data: projectsData, isLoading: isLoadingProjects, error: projectsError } = useProjects();
  const { data: employeesData, isLoading: isLoadingEmployees, error: employeesError } = useEmployees();
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();
  const bulkDeleteMutation = useBulkDeleteProjects();
  const updateProjectStatusMutation = useUpdateProjectStatus();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<CreateProjectRequest>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.start_date || !newProject.end_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const startDate = new Date(newProject.start_date);
    const endDate = new Date(newProject.end_date);

    // Check if start date is in the past
    if (startDate < today) {
      toast({
        title: "Invalid Start Date",
        description: "Start date cannot be in the past",
        variant: "destructive",
      });
      return;
    }

    // Check if end date is before start date
    if (endDate <= startDate) {
      toast({
        title: "Invalid End Date",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    try {
      await createProjectMutation.mutateAsync(newProject);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewProject({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const handleProjectClick = (projectCode: string) => {
    navigate(`/dashboard/project-manager/projects/${projectCode}`);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProjectMutation.mutateAsync(projectToDelete);
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProjects.size === 0) return;

    try {
      const result = await bulkDeleteMutation.mutateAsync({
        project_codes: Array.from(selectedProjects),
      });

      toast({
        title: "Bulk Delete Complete",
        description: `${result.total_deleted} project(s) deleted, ${result.total_failed} failed`,
      });

      if (result.failed.length > 0) {
        result.failed.forEach((failure) => {
          toast({
            title: "Delete Failed",
            description: `${failure.project_code}: ${failure.error}`,
            variant: "destructive",
          });
        });
      }

      setIsBulkDeleteDialogOpen(false);
      setSelectedProjects(new Set());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete projects",
        variant: "destructive",
      });
    }
  };

  const toggleProjectSelection = (projectCode: string) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectCode)) {
      newSelected.delete(projectCode);
    } else {
      newSelected.add(projectCode);
    }
    setSelectedProjects(newSelected);
  };

  const selectAllProjects = () => {
    if (selectedProjects.size === projects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(projects.map((p: any) => p.project_code)));
    }
  };

  // Extract projects from response (ProjectsResponse has a projects property)
  const projects = projectsData?.projects || [];

  // Extract employees from response
  const employees = employeesData?.employees || [];

  // Calculate stats from real data
  const activeProjects = projects.filter((p: any) => p?.status === "active").length;
  const totalProjects = projects.length;
  const onTrackProjects = projects.filter((p: any) => p?.status === "active" || p?.status === "planning").length;
  const onTrackPercentage = totalProjects > 0 ? Math.round((onTrackProjects / totalProjects) * 100) : 0;

  // Get unique team members count from employees
  const teamMembersCount = employees.length;

  // Calculate upcoming deadlines (projects ending in next 7 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for correct comparison
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = projects.filter(p => {
    if (!p.end_date) return false;
    const endDate = new Date(p.end_date);
    return endDate >= today && endDate <= nextWeek && p.status === "active";
  }).length;

  const isLoading = isLoadingProjects || isLoadingEmployees;

  const { user } = useAuth();
  const displayName = user?.full_name || getUserNameFromEmail(user?.email || "");

  return (
    <ProjectManagerLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back, {displayName}</h1>
        <p className="text-muted-foreground mb-8">Track project progress and manage team assignments.</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Active Projects"
            value={activeProjects}
            icon={FolderKanban}
            gradient="from-primary/20 to-primary/10"
            iconColor="text-primary"
            isLoading={isLoadingProjects}
            index={0}
          />
          <StatCard
            label="Team Members"
            value={teamMembersCount}
            icon={Users}
            gradient="from-blue-500/20 to-blue-600/10"
            iconColor="text-blue-500"
            isLoading={isLoadingEmployees}
            index={1}
          />
          <StatCard
            label="On Track"
            value={`${onTrackPercentage}%`}
            icon={CheckCircle}
            gradient="from-emerald-500/20 to-emerald-600/10"
            iconColor="text-emerald-500"
            isLoading={isLoadingProjects}
            index={2}
          />
          <StatCard
            label="Deadlines"
            value={upcomingDeadlines}
            icon={Clock}
            gradient="from-amber-500/20 to-amber-600/10"
            iconColor="text-amber-500"
            isLoading={isLoadingProjects}
            index={3}
          />
        </div>

        {/* Projects List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-background/50 transition-all duration-500 rounded-2xl p-8 group"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
              <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                <FolderKanban className="h-5 w-5 text-primary" />
              </div>
              Projects
            </h2>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/10 backdrop-blur-sm">{totalProjects} total</Badge>
              {selectedProjects.size > 0 && (
                <Button
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                  size="sm"
                  variant="destructive"
                  className="gap-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 hover:bg-red-500/30"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete ({selectedProjects.size})
                </Button>
              )}
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                size="sm"
                className="gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 hover:bg-primary/30"
              >
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </div>
          </div>

          {isLoadingProjects ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : projectsError ? (
            <div className="text-center py-12">
              <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl inline-block mb-4">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto" />
              </div>
              <p className="text-muted-foreground">Error loading projects</p>
              <p className="text-xs text-muted-foreground mt-2">Please try refreshing the page</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl inline-block mb-4">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto" />
              </div>
              <p className="text-muted-foreground">No projects found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.length > 0 && (
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <Checkbox
                    checked={selectedProjects.size === projects.length && projects.length > 0}
                    onCheckedChange={selectAllProjects}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white/10 backdrop-blur-sm border-white/20"
                  />
                  <span className="text-sm text-muted-foreground">
                    Select all ({selectedProjects.size} selected)
                  </span>
                </div>
              )}
              {projects.map((project: any) => (
                <motion.div
                  key={project.id || project.project_code || Math.random()}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedProjects.has(project.project_code)}
                      onCheckedChange={() => toggleProjectSelection(project.project_code)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white/10 backdrop-blur-sm border-white/20"
                    />
                    <div
                      onClick={() => handleProjectClick(project.project_code)}
                      className="flex items-center gap-5 flex-1 cursor-pointer"
                    >
                      <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                        <FolderKanban className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-sm font-medium text-foreground">{project.name || "Unnamed Project"}</p>
                          {project.status === "active" && (
                            <div className="p-1 bg-emerald-500/20 backdrop-blur-sm rounded-lg border border-emerald-500/30">
                              <Activity className="h-3 w-3 text-emerald-500" />
                            </div>
                          )}
                          {(project.status === "paused" || project.status === "cancelled") && (
                            <div className="p-1 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-500/30">
                              <AlertCircle className="h-3 w-3 text-destructive" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{project.project_code || project.code || ""}</p>
                        {project.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <Select
                      value={project.status}
                      onValueChange={(value: string) => {
                        updateProjectStatusMutation.mutate(
                          {
                            code: project.project_code,
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
                      }}
                      disabled={updateProjectStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-32 h-8 bg-white/10 backdrop-blur-sm border-white/20" onClick={(e) => e.stopPropagation()}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent onClick={(e) => e.stopPropagation()}>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    {project.end_date && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(project.end_date), "MMM d, yyyy")}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/20 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(project.project_code);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-white/10 transition-all duration-300">
                      <ArrowRight
                        className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer"
                        onClick={() => handleProjectClick(project.project_code)}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Employees Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-background/50 transition-all duration-500 rounded-2xl p-8 mt-8 group"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
              <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Employees
            </h2>
            <Badge variant="secondary" className="bg-white/10 backdrop-blur-sm">{teamMembersCount} total</Badge>
          </div>

          {isLoadingEmployees ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : employeesError ? (
            <div className="text-center py-12">
              <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl inline-block mb-4">
                <Users className="h-12 w-12 text-muted-foreground mx-auto" />
              </div>
              <p className="text-muted-foreground">Error loading employees</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl inline-block mb-4">
                <Users className="h-12 w-12 text-muted-foreground mx-auto" />
              </div>
              <p className="text-muted-foreground">No employees found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.slice(0, 6).map((employee: any) => (
                <motion.div
                  key={employee.id || employee.user_code || Math.random()}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 hover:shadow-lg transition-all duration-300"
                >
                  <div className="h-12 w-12 bg-primary/20 backdrop-blur-sm border border-primary/20 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {employee.full_name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {employee.email || employee.user_code || ""}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs bg-white/10 backdrop-blur-sm">
                    {employee.role || "employee"}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
          {employees.length > 6 && (
            <p className="text-xs text-muted-foreground text-center pt-6">
              Showing 6 of {employees.length} employees
            </p>
          )}
        </motion.div>
      </motion.div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize your teams and track progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="Enter project name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter project description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newProject.start_date}
                  min={format(new Date(), 'yyyy-MM-dd')} // Prevent past dates
                  onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newProject.end_date}
                  min={newProject.start_date || format(new Date(), 'yyyy-MM-dd')} // Must be after start date
                  onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={createProjectMutation.isPending}
            >
              {createProjectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Project"
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
              Are you sure you want to delete this project? This action cannot be undone and will permanently remove the project and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
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
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedProjects.size} Project(s)</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProjects.size} selected project(s)? This action cannot be undone and will permanently remove the projects and all associated data.
            </AlertDialogDescription>
            <div className="mt-4 max-h-40 overflow-y-auto space-y-1">
              {Array.from(selectedProjects).map((code) => {
                const project = projects.find((p: any) => p.project_code === code);
                return (
                  <div key={code} className="text-sm text-muted-foreground">
                    • {project?.name || code}
                  </div>
                );
              })}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProjects(new Set())}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedProjects.size} Project(s)`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProjectManagerLayout>
  );
};

export default ProjectManagerDashboard;
