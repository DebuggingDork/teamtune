import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  X,
  Edit,
  Trash2,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { TeamLeadLayout } from "@/components/layouts/TeamLeadLayout";
import {
  useMyTeams,
  useTeamTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useAssignTask,
  useUpdateTaskStatus,
  useTeamInfo,
} from "@/hooks/useTeamLead";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TaskStatus, CreateTaskRequest, UpdateTaskRequest, TaskFilters } from "@/api/types/index";
import { format } from "date-fns";

const TasksPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [memberFilter, setMemberFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [newTask, setNewTask] = useState<CreateTaskRequest>({
    title: "",
    description: "",
    assigned_to: "",
    priority: 3,
    estimated_hours: 0,
    due_date: "",
  });

  // Get teams
  const { data: teamsData, isLoading: isLoadingTeams } = useMyTeams();
  const teamCode = useMemo(() => {
    if (teamsData?.teams && teamsData.teams.length > 0) {
      return teamsData.teams[0].team_code;
    }
    return null;
  }, [teamsData]);

  const { data: teamInfo } = useTeamInfo(teamCode || "");

  // Get tasks
  const filters: TaskFilters = useMemo(() => {
    const f: TaskFilters = { page: 1, limit: 100 };
    if (statusFilter !== "all") {
      f.status = statusFilter as TaskStatus;
    }
    return f;
  }, [statusFilter]);

  const { data: tasksData, isLoading: isLoadingTasksData } = useTeamTasks(teamCode || "", filters);
  const tasks = tasksData?.tasks || [];

  // Mutations
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const assignTaskMutation = useAssignTask();
  const updateStatusMutation = useUpdateTaskStatus();

  // Get members for filters and assignment
  const members = useMemo(() => {
    if (!teamInfo?.members) return [];
    return teamInfo.members.map((m) => ({
      user_code: m.user_code,
      name: m.full_name,
      avatar_url: m.avatar_url,
    }));
  }, [teamInfo]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.task_code.toLowerCase().includes(query)
      );
    }

    // Status filter (already applied in API call, but keep for UI consistency)
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      const priority = parseInt(priorityFilter);
      filtered = filtered.filter((task) => task.priority === priority);
    }

    // Member filter
    if (memberFilter !== "all") {
      filtered = filtered.filter((task) => task.assigned_to === memberFilter);
    }

    return filtered;
  }, [tasks, searchQuery, statusFilter, priorityFilter, memberFilter]);

  const handleCreateTask = async () => {
    if (!teamCode || !newTask.title || !newTask.assigned_to) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTaskMutation.mutateAsync({ teamCode, data: newTask });
      toast({
        title: "Success",
        description: "Task created successfully.",
      });
      setIsCreateDialogOpen(false);
      setNewTask({
        title: "",
        description: "",
        assigned_to: "",
        priority: 3,
        estimated_hours: 0,
        due_date: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create task.",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = async () => {
    if (!selectedTask || !newTask.title) {
      return;
    }

    try {
      const updateData: UpdateTaskRequest = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        estimated_hours: newTask.estimated_hours,
        due_date: newTask.due_date,
      };
      await updateTaskMutation.mutateAsync({ taskCode: selectedTask.task_code, data: updateData });
      toast({
        title: "Success",
        description: "Task updated successfully.",
      });
      setIsEditDialogOpen(false);
      setSelectedTask(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update task.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      await deleteTaskMutation.mutateAsync(selectedTask.task_code);
      toast({
        title: "Success",
        description: "Task deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedTask(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  const handleAssignTask = async () => {
    if (!selectedTask || !newTask.assigned_to) {
      return;
    }

    try {
      await assignTaskMutation.mutateAsync({
        taskCode: selectedTask.task_code,
        data: { assigned_to: newTask.assigned_to },
      });
      toast({
        title: "Success",
        description: "Task assigned successfully.",
      });
      setIsAssignDialogOpen(false);
      setSelectedTask(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to assign task.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (taskCode: string, status: TaskStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        taskCode,
        data: { status },
      });
      toast({
        title: "Success",
        description: "Task status updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update task status.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (task: any) => {
    setSelectedTask(task);
    setNewTask({
      title: task.title,
      description: task.description || "",
      assigned_to: task.assigned_to,
      priority: task.priority,
      estimated_hours: task.estimated_hours,
      due_date: task.due_date ? task.due_date.split('T')[0] : "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (task: any) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const openAssignDialog = (task: any) => {
    setSelectedTask(task);
    setNewTask((prev) => ({ ...prev, assigned_to: task.assigned_to }));
    setIsAssignDialogOpen(true);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "done":
        return "bg-emerald-500/10 text-emerald-500";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500";
      case "blocked":
        return "bg-red-500/10 text-red-500";
      case "in_review":
        return "bg-yellow-500/10 text-yellow-500";
      case "cancelled":
        return "bg-gray-500/10 text-gray-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "bg-red-500/10 text-red-500";
    if (priority >= 3) return "bg-yellow-500/10 text-yellow-500";
    return "bg-blue-500/10 text-blue-500";
  };

  return (
    <TeamLeadLayout
      headerTitle="Tasks Management"
      headerDescription="Create, assign, and manage team tasks"
      headerActions={
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card className="bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-background/50 transition-all duration-500 group">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 backdrop-blur-sm border-white/20"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="5">Critical (5)</SelectItem>
                  <SelectItem value="4">High (4)</SelectItem>
                  <SelectItem value="3">Medium (3)</SelectItem>
                  <SelectItem value="2">Low (2)</SelectItem>
                  <SelectItem value="1">Very Low (1)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={memberFilter} onValueChange={setMemberFilter}>
                <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20">
                  <SelectValue placeholder="Member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.user_code} value={member.user_code}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar_url || ""} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || memberFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                    setMemberFilter("all");
                  }}
                  className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card className="bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-background/50 transition-all duration-500 group">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              Tasks ({filteredTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoadingTasksData || isLoadingTeams ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !teamCode ? (
              <p className="text-center text-muted-foreground py-8">No team assigned</p>
            ) : filteredTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No tasks found</p>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-medium text-foreground">{task.title}</h3>
                          <Badge className={`${getStatusColor(task.status)} bg-white/10 backdrop-blur-sm`}>{task.status}</Badge>
                          <Badge className={`${getPriorityColor(task.priority)} bg-white/10 backdrop-blur-sm`}>
                            Priority {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-6 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                            <User className="h-3 w-3" />
                            {task.assigned_to_name || "Unassigned"}
                          </div>
                          {task.due_date && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(task.due_date), "MMM d, yyyy")}
                            </div>
                          )}
                          {task.estimated_hours > 0 && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                              <Clock className="h-3 w-3" />
                              {task.estimated_hours}h
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(task)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAssignDialog(task)}>
                              <User className="h-4 w-4 mr-2" />
                              Assign
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(task.task_code, "done")}
                              disabled={task.status === "done"}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark Done
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(task)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Create a new task for your team.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assigned_to">Assign To *</Label>
                <Select
                  value={newTask.assigned_to}
                  onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select a team member" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50 max-h-60">
                    {members.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No team members available
                      </div>
                    ) : (
                      members.map((member) => (
                        <SelectItem
                          key={member.user_code}
                          value={member.user_code}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{member.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTask.priority.toString()}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Very Low (1)</SelectItem>
                    <SelectItem value="2">Low (2)</SelectItem>
                    <SelectItem value="3">Medium (3)</SelectItem>
                    <SelectItem value="4">High (4)</SelectItem>
                    <SelectItem value="5">Critical (5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="estimated_hours">Estimated Hours</Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  min="0"
                  value={newTask.estimated_hours}
                  onChange={(e) =>
                    setNewTask({ ...newTask, estimated_hours: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={createTaskMutation.isPending}>
              {createTaskMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={newTask.priority.toString()}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Very Low (1)</SelectItem>
                    <SelectItem value="2">Low (2)</SelectItem>
                    <SelectItem value="3">Medium (3)</SelectItem>
                    <SelectItem value="4">High (4)</SelectItem>
                    <SelectItem value="5">Critical (5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-estimated_hours">Estimated Hours</Label>
                <Input
                  id="edit-estimated_hours"
                  type="number"
                  min="0"
                  value={newTask.estimated_hours}
                  onChange={(e) =>
                    setNewTask({ ...newTask, estimated_hours: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-due_date">Due Date</Label>
              <Input
                id="edit-due_date"
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask} disabled={updateTaskMutation.isPending}>
              {updateTaskMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Task"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <DialogDescription>Assign this task to a team member.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="assign-to">Assign To</Label>
              <Select
                value={newTask.assigned_to}
                onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.user_code} value={member.user_code}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar_url || ""} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignTask} disabled={assignTaskMutation.isPending}>
              {assignTaskMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Task"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTask?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedTask(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteTaskMutation.isPending}
            >
              {deleteTaskMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TeamLeadLayout>
  );
};

export default TasksPage;

