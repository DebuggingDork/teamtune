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
import { ProjectManagerLayout } from "@/components/layouts/ProjectManagerLayout";
import { useProjects, useEmployees, useCreateProject, useDeleteProject, useBulkDeleteProjects } from "@/hooks/useProjectManager";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import type { CreateProjectRequest } from "@/api/types";

const ProjectManagerDashboard = () => {
  const navigate = useNavigate();
  const { data: projectsData, isLoading: isLoadingProjects, error: projectsError } = useProjects();
  const { data: employeesData, isLoading: isLoadingEmployees, error: employeesError } = useEmployees();
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();
  const bulkDeleteMutation = useBulkDeleteProjects();

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
  // Extract user name from email for personalized greeting
  const getUserNameFromEmail = (email: string) => {
    if (!email) return "User";

    // Extract name part before @ symbol
    const namePart = email.split('@')[0];

    // Split by dots, underscores, or hyphens and capitalize each part
    const nameParts = namePart.split(/[._-]/).map(part =>
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    );

    return nameParts.join(' ');
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Active Projects",
              value: activeProjects.toString(),
              change: `${totalProjects} total`,
              icon: FolderKanban,
              color: "bg-primary/10 text-primary",
              isLoading: isLoadingProjects
            },
            {
              label: "Team Members",
              value: teamMembersCount.toString(),
              change: "Across projects",
              icon: Users,
              color: "bg-blue-500/10 text-blue-500",
              isLoading: isLoadingEmployees
            },
            {
              label: "On Track",
              value: `${onTrackPercentage}%`,
              change: "Projects",
              icon: CheckCircle,
              color: "bg-emerald-500/10 text-emerald-500",
              isLoading: isLoadingProjects
            },
            {
              label: "Deadlines",
              value: upcomingDeadlines.toString(),
              change: "This week",
              icon: Clock,
              color: "bg-warning/10 text-warning",
              isLoading: isLoadingProjects
            },
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
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </motion.div>
          ))}
        </div>

        {/* Projects List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Projects</h2>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{totalProjects} total</Badge>
              {selectedProjects.size > 0 && (
                <Button
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                  size="sm"
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete ({selectedProjects.size})
                </Button>
              )}
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </div>
          </div>

          {isLoadingProjects ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : projectsError ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Error loading projects</p>
              <p className="text-xs text-muted-foreground mt-2">Please try refreshing the page</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No projects found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.length > 0 && (
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    checked={selectedProjects.size === projects.length && projects.length > 0}
                    onCheckedChange={selectAllProjects}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm text-muted-foreground">
                    Select all ({selectedProjects.size} selected)
                  </span>
                </div>
              )}
              {projects.map((project: any) => (
                <div
                  key={project.id || project.project_code || Math.random()}
                  className="flex items-center justify-between p-4 bg-accent/50 rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedProjects.has(project.project_code)}
                      onCheckedChange={() => toggleProjectSelection(project.project_code)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div
                      onClick={() => handleProjectClick(project.project_code)}
                      className="flex items-center gap-4 flex-1 cursor-pointer"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FolderKanban className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{project.name || "Unnamed Project"}</p>
                          {project.status === "active" && (
                            <Activity className="h-3 w-3 text-emerald-500" />
                          )}
                          {(project.status === "on_hold" || project.status === "cancelled") && (
                            <AlertCircle className="h-3 w-3 text-destructive" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{project.project_code || project.code || ""}</p>
                        {project.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        project.status === "active" ? "default" :
                          project.status === "completed" ? "secondary" :
                            project.status === "on_hold" ? "destructive" : "outline"
                      }
                    >
                      {project.status || "unknown"}
                    </Badge>
                    {project.end_date && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(project.end_date), "MMM d, yyyy")}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(project.project_code);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer"
                      onClick={() => handleProjectClick(project.project_code)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Employees Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6 mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Employees</h2>
            <Badge variant="secondary">{teamMembersCount} total</Badge>
          </div>

          {isLoadingEmployees ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : employeesError ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Error loading employees</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No employees found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {employees.slice(0, 6).map((employee: any) => (
                <div
                  key={employee.id || employee.user_code || Math.random()}
                  className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg"
                >
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
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
                  <Badge variant="outline" className="text-xs">
                    {employee.role || "employee"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
          {employees.length > 6 && (
            <p className="text-xs text-muted-foreground text-center pt-4">
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
