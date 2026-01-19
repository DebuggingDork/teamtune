import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Plus,
  ArrowRight,
  Activity,
  AlertCircle,
  Trash2,
  Search,
  Filter,
  Loader2,
  Calendar,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectManagerLayout } from "@/components/layouts/ProjectManagerLayout";
import { useProjects, useCreateProject, useDeleteProject, useBulkDeleteProjects, useUpdateProjectStatus } from "@/hooks/useProjectManager";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import type { CreateProjectRequest, ProjectStatus } from "@/api/types/index";

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { data: projectsData, isLoading, error } = useProjects();
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();
  const bulkDeleteMutation = useBulkDeleteProjects();
  const updateProjectStatusMutation = useUpdateProjectStatus();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newProject, setNewProject] = useState<CreateProjectRequest>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const projects = projectsData?.projects || [];

  // Filter projects
  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch =
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.project_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
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
    if (selectedProjects.size === filteredProjects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(filteredProjects.map((p: any) => p.project_code)));
    }
  };

  const stats = {
    total: projects.length,
    active: projects.filter((p: any) => p.status === "active").length,
    completed: projects.filter((p: any) => p.status === "completed").length,
    planning: projects.filter((p: any) => p.status === "planning").length,
  };

  return (
    <ProjectManagerLayout
      headerTitle="Projects"
      headerDescription="Manage and track all your projects"
      headerActions={
        <div className="flex items-center gap-3">
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
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Planning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.planning}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Error loading projects</p>
          </CardContent>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              {searchQuery || statusFilter !== "all"
                ? "No projects match your filters"
                : "No projects found"}
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="mt-4 gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Create First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProjects.length > 0 && (
            <div className="flex items-center gap-2 pb-2 border-b">
              <Checkbox
                checked={
                  selectedProjects.size === filteredProjects.length &&
                  filteredProjects.length > 0
                }
                onCheckedChange={selectAllProjects}
              />
              <span className="text-sm text-muted-foreground">
                Select all ({selectedProjects.size} selected)
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project: any) => (
              <motion.div
                key={project.id || project.project_code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={selectedProjects.has(project.project_code)}
                          onCheckedChange={() =>
                            toggleProjectSelection(project.project_code)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div
                          className="flex-1"
                          onClick={() =>
                            navigate(
                              `/dashboard/project-manager/projects/${project.project_code}`
                            )
                          }
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <FolderKanban className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">
                              {project.name || "Unnamed Project"}
                            </CardTitle>
                          </div>
                          <CardDescription>{project.project_code}</CardDescription>
                        </div>
                      </div>
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
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="space-y-4"
                      onClick={() =>
                        navigate(
                          `/dashboard/project-manager/projects/${project.project_code}`
                        )
                      }
                    >
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      <div 
                        className="flex items-center justify-between gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {project.status === "active" && (
                            <Activity className="h-4 w-4 text-emerald-500" />
                          )}
                          {(project.status === "paused" ||
                            project.status === "cancelled") && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
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
                            <SelectTrigger className="w-full sm:w-36 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planning">Planning</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {project.start_date &&
                            format(new Date(project.start_date), "MMM d, yyyy")}
                        </div>
                        <span>→</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {project.end_date &&
                            format(new Date(project.end_date), "MMM d, yyyy")}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full group-hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/dashboard/project-manager/projects/${project.project_code}`
                          );
                        }}
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

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
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter project description"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
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
                  onChange={(e) =>
                    setNewProject({ ...newProject, start_date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newProject.end_date}
                  onChange={(e) =>
                    setNewProject({ ...newProject, end_date: e.target.value })
                  }
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
              Are you sure you want to delete this project? This action cannot be
              undone and will permanently remove the project and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>
              Cancel
            </AlertDialogCancel>
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
      <AlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedProjects.size} Project(s)
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProjects.size} selected
              project(s)? This action cannot be undone and will permanently remove
              the projects and all associated data.
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
            <AlertDialogCancel onClick={() => setSelectedProjects(new Set())}>
              Cancel
            </AlertDialogCancel>
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

export default ProjectsPage;

