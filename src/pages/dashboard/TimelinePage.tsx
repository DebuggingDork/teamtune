import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Activity,
  AlertCircle,
  Loader2,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectManagerLayout } from "@/components/layouts/ProjectManagerLayout";
import { useProjects } from "@/hooks/useProjectManager";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import type { Project } from "@/api/types/index";

const TimelinePage = () => {
  const navigate = useNavigate();
  const { data: projectsData, isLoading, error } = useProjects();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");

  const projects = projectsData?.projects || [];

  // Get projects for the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group projects by date with better date handling
  const projectsByDate = useMemo(() => {
    const grouped: Record<string, Project[]> = {};
    const today = new Date();
    
    projects.forEach((project: Project) => {
      const startDate = new Date(project.start_date);
      const endDate = new Date(project.end_date);
      
      // Ensure dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return;
      }
      
      daysInMonth.forEach((day) => {
        const dayStr = format(day, "yyyy-MM-dd");
        const dayDate = new Date(day);
        
        // Check if this day falls within the project timeline
        if (dayDate >= startDate && dayDate <= endDate) {
          if (!grouped[dayStr]) {
            grouped[dayStr] = [];
          }
          if (!grouped[dayStr].find((p) => p.id === project.id)) {
            // Add project status based on current date
            const projectWithStatus = {
              ...project,
              timelineStatus: dayDate < today ? 'past' : dayDate.toDateString() === today.toDateString() ? 'current' : 'future'
            };
            grouped[dayStr].push(projectWithStatus);
          }
        }
      });
    });
    
    return grouped;
  }, [projects, daysInMonth]);

  // Get upcoming deadlines with better date handling
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    
    return projects
      .filter((project: Project) => {
        const endDate = new Date(project.end_date);
        // Only include active projects with valid end dates
        return !isNaN(endDate.getTime()) && 
               endDate >= today && 
               endDate <= nextMonth && 
               project.status === "active";
      })
      .sort((a: Project, b: Project) => 
        new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
      )
      .slice(0, 10);
  }, [projects]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) =>
      direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const getStatusColor = (status: string, timelineStatus?: string) => {
    // If project is overdue (past end date and still active), show red
    if (status === "active" && timelineStatus === "past") {
      return "bg-red-600";
    }
    
    switch (status) {
      case "active":
        return "bg-emerald-500";
      case "completed":
        return "bg-blue-500";
      case "planning":
        return "bg-yellow-500";
      case "on_hold":
        return "bg-orange-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  if (isLoading) {
    return (
      <ProjectManagerLayout headerTitle="Timeline" headerDescription="View project timelines and deadlines">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ProjectManagerLayout>
    );
  }

  if (error) {
    return (
      <ProjectManagerLayout headerTitle="Timeline" headerDescription="View project timelines and deadlines">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Error loading projects</p>
          </CardContent>
        </Card>
      </ProjectManagerLayout>
    );
  }

  return (
    <ProjectManagerLayout
      headerTitle="Timeline"
      headerDescription="View project timelines and deadlines"
      headerActions={
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Calendar View */}
        {viewMode === "month" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {format(currentDate, "MMMM yyyy")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground p-2"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map((day, index) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const dayProjects = projectsByDate[dayStr] || [];
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isCurrentDay = isToday(day);

                  return (
                    <motion.div
                      key={dayStr}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className={`
                        min-h-[100px] border rounded-lg p-2
                        ${isCurrentMonth ? "bg-card" : "bg-muted/30"}
                        ${isCurrentDay ? "ring-2 ring-primary" : ""}
                      `}
                    >
                      <div
                        className={`text-sm font-medium mb-1 ${
                          isCurrentDay
                            ? "text-primary"
                            : isCurrentMonth
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {format(day, "d")}
                      </div>
                      <div className="space-y-1">
                        {dayProjects.slice(0, 3).map((project: any) => {
                          const today = new Date();
                          const endDate = new Date(project.end_date);
                          const isOverdue = project.status === "active" && endDate < today;
                          
                          return (
                            <div
                              key={project.id}
                              onClick={() =>
                                navigate(
                                  `/dashboard/project-manager/projects/${project.project_code}`
                                )
                              }
                              className={`
                                text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity
                                ${getStatusColor(project.status, project.timelineStatus)} text-white truncate
                                ${isOverdue ? "animate-pulse" : ""}
                              `}
                              title={`${project.name}${isOverdue ? " (OVERDUE)" : ""}`}
                            >
                              {project.name}
                              {isOverdue && " ⚠️"}
                            </div>
                          );
                        })}
                        {dayProjects.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayProjects.length - 3} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Projects Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects
                    .sort(
                      (a: Project, b: Project) =>
                        new Date(a.start_date).getTime() -
                        new Date(b.start_date).getTime()
                    )
                    .map((project: Project) => {
                      const startDate = new Date(project.start_date);
                      const endDate = new Date(project.end_date);
                      const today = new Date();
                      const hasStarted = startDate <= today;
                      const isOverdue = project.status === "active" && endDate < today;
                      
                      const duration =
                        Math.ceil(
                          (endDate.getTime() - startDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) || 1;

                      return (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer ${
                            isOverdue ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""
                          }`}
                          onClick={() =>
                            navigate(
                              `/dashboard/project-manager/projects/${project.project_code}`
                            )
                          }
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FolderKanban className="h-4 w-4 text-primary" />
                              <h3 className="font-medium">
                                {project.name}
                                {isOverdue && <span className="text-red-500 ml-2">⚠️ OVERDUE</span>}
                                {!hasStarted && <span className="text-blue-500 ml-2">📅 Not Started</span>}
                              </h3>
                              <Badge
                                variant={
                                  isOverdue ? "destructive" :
                                  project.status === "active"
                                    ? "default"
                                    : project.status === "completed"
                                    ? "secondary"
                                    : project.status === "on_hold"
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                {project.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>
                                Start: {format(startDate, "MMM d, yyyy")}
                              </span>
                              <span>→</span>
                              <span>End: {format(endDate, "MMM d, yyyy")}</span>
                              <span>•</span>
                              <span>{duration} days</span>
                              {isOverdue && (
                                <>
                                  <span>•</span>
                                  <span className="text-red-500 font-medium">
                                    {Math.ceil((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))} days overdue
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Upcoming Deadlines (Next 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming deadlines
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((project: Project) => {
                  const endDate = new Date(project.end_date);
                  const daysUntil = Math.ceil(
                    (endDate.getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/dashboard/project-manager/projects/${project.project_code}`
                        )
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            daysUntil <= 7
                              ? "bg-destructive"
                              : daysUntil <= 14
                              ? "bg-yellow-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm">{project.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(endDate, "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            daysUntil <= 7
                              ? "destructive"
                              : daysUntil <= 14
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {daysUntil === 0
                            ? "Due today"
                            : daysUntil === 1
                            ? "Due tomorrow"
                            : `${daysUntil} days left`}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProjectManagerLayout>
  );
};

export default TimelinePage;

