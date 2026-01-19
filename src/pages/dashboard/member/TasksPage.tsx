import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  MoreVertical,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MemberLayout } from "@/components/layouts/MemberLayout";
import { useMyTasks, useUpdateMyTaskStatus } from "@/hooks/useEmployee";
import { toast } from "@/hooks/use-toast";
import type { TaskStatus, TaskFilters } from "@/api/types/index";
import { format } from "date-fns";

const TasksPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  // Get tasks
  const filters: TaskFilters = useMemo(() => {
    const f: TaskFilters = { page: 1, limit: 100 };
    if (statusFilter !== "all") {
      f.status = statusFilter as TaskStatus;
    }
    return f;
  }, [statusFilter]);

  const { data: tasksData, isLoading: isLoadingTasks } = useMyTasks(filters);
  const tasks = tasksData?.tasks || [];
  const updateStatusMutation = useUpdateMyTaskStatus();

  // Get unique projects for filter
  const projects = useMemo(() => {
    const projectSet = new Set<string>();
    tasks.forEach((task) => {
      if (task.team_name) {
        projectSet.add(task.team_name);
      }
    });
    return Array.from(projectSet);
  }, [tasks]);

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

    // Project filter
    if (projectFilter !== "all") {
      filtered = filtered.filter((task) => task.team_name === projectFilter);
    }

    return filtered;
  }, [tasks, searchQuery, statusFilter, projectFilter]);

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

  return (
    <MemberLayout
      headerTitle="My Tasks"
      headerDescription="View and manage your assigned tasks"
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Project/Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchQuery || statusFilter !== "all" || projectFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setProjectFilter("all");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTasks ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No tasks found</p>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-accent/50 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-foreground">{task.title}</h3>
                          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {task.team_name && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {task.team_name}
                            </div>
                          )}
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(task.due_date), "MMM d, yyyy")}
                            </div>
                          )}
                          {task.estimated_hours > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.estimated_hours}h
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(task.task_code, "in_progress")}
                              disabled={task.status === "in_progress"}
                            >
                              Start Work
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(task.task_code, "in_review")}
                              disabled={task.status === "in_review" || task.status === "done"}
                            >
                              Mark for Review
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(task.task_code, "done")}
                              disabled={task.status === "done"}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark Done
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(task.task_code, "blocked")}
                              disabled={task.status === "blocked"}
                            >
                              Mark Blocked
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
    </MemberLayout>
  );
};

export default TasksPage;







