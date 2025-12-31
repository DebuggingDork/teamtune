import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  Loader2,
  FolderKanban,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar } from "recharts";
import { useMyTasks, useMyTimeEntries, useMyProjects } from "@/hooks/useEmployee";
import { format, subDays, startOfWeek, endOfWeek, eachWeekOfInterval } from "date-fns";
import type { Task } from "@/api/types";

const chartConfig = {
  completed: { label: "Completed", color: "hsl(var(--chart-1))" },
  hours: { label: "Hours", color: "hsl(var(--chart-2))" },
  tasks: { label: "Tasks", color: "hsl(var(--chart-3))" },
};

const MyProgress = () => {
  // Get data
  const { data: tasksData, isLoading: isLoadingTasks } = useMyTasks();
  const { data: timeEntriesData, isLoading: isLoadingTimeEntries } = useMyTimeEntries({
    start_date: format(subDays(new Date(), 42), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
  });
  const { data: projectsData, isLoading: isLoadingProjects } = useMyProjects();

  const tasks = tasksData?.tasks || [];
  const timeEntries = timeEntriesData?.time_entries || [];
  const projects = projectsData?.projects || [];

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const upcoming = tasks.filter((task: Task) => task.status === 'todo');
    const inProgress = tasks.filter((task: Task) => task.status === 'in_progress');
    const completed = tasks.filter((task: Task) => task.status === 'done');

    return { upcoming, inProgress, completed };
  }, [tasks]);

  // Group tasks by project
  const tasksByProject = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    tasks.forEach((task: Task) => {
      const projectKey = task.team_name || 'Unassigned';
      if (!grouped[projectKey]) {
        grouped[projectKey] = [];
      }
      grouped[projectKey].push(task);
    });

    return grouped;
  }, [tasks]);

  // Create weekly progress data
  const weeklyProgress = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 42); // 6 weeks
    const weeks = eachWeekOfInterval({ start: startDate, end: endDate });

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart);
      const weekTasks = tasks.filter((task: Task) => {
        if (!task.completed_at) return false;
        const completedDate = new Date(task.completed_at);
        return completedDate >= weekStart && completedDate <= weekEnd;
      });

      const weekHours = timeEntries
        .filter((entry) => {
          const entryDate = new Date(entry.work_date);
          return entryDate >= weekStart && entryDate <= weekEnd;
        })
        .reduce((sum, entry) => sum + entry.hours, 0);

      return {
        week: format(weekStart, 'MMM d'),
        completed: weekTasks.length,
        hours: Math.round(weekHours * 10) / 10,
      };
    });
  }, [tasks, timeEntries]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'done': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-blue-500/10 text-blue-500';
      case 'in_progress': return 'bg-yellow-500/10 text-yellow-500';
      case 'done': return 'bg-emerald-500/10 text-emerald-500';
      default: return 'bg-muted-foreground/10 text-muted-foreground';
    }
  };

  const isLoading = isLoadingTasks || isLoadingTimeEntries || isLoadingProjects;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Progress Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            label: "Pending Tasks",
            value: tasksByStatus.upcoming.length,
            icon: Clock,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/20"
          },
          {
            label: "In Active Work",
            value: tasksByStatus.inProgress.length,
            icon: AlertCircle,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
            borderColor: "border-amber-500/20"
          },
          {
            label: "Successfully Done",
            value: tasksByStatus.completed.length,
            icon: CheckCircle,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
            borderColor: "border-emerald-500/20"
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`overflow-hidden border-2 ${stat.borderColor} hover:shadow-lg transition-all duration-300 group`}>
              <CardContent className="p-6 relative">
                <div className={`absolute -right-4 -top-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity`}>
                  <stat.icon size={80} />
                </div>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${stat.bgColor} ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-black text-foreground mt-1">
                      {isLoading ? (
                        <span className="flex items-center gap-2 text-muted-foreground/30">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </span>
                      ) : stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Weekly Progress Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : weeklyProgress.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">No progress data available</p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={weeklyProgress}>
                <defs>
                  <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(var(--chart-1))"
                  fill="url(#completedGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Tasks by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(tasksByStatus).map(([status, statusTasks], idx) => (
          <motion.div
            key={status}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
          >
            <Card className="h-full border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-base font-bold uppercase tracking-tight">
                    {getStatusIcon(status)}
                    {status === 'upcoming' ? 'Upcoming' :
                      status === 'inProgress' ? 'Active' : 'Completed'}
                  </div>
                  <Badge variant="secondary" className="font-bold opacity-70">
                    {statusTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
                  </div>
                ) : statusTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-40">
                    <CheckCircle className="h-10 w-10 mb-2" />
                    <p className="text-sm font-medium">Clear for now</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {statusTasks.slice(0, 5).map((task: Task) => (
                      <motion.div
                        key={task.id}
                        whileHover={{ x: 4 }}
                        className="p-3.5 bg-accent/30 hover:bg-accent/60 rounded-xl border border-border/40 transition-all cursor-default group"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                            {task.title}
                          </p>
                          <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-tighter ${task.priority > 3 ? 'border-destructive/30 text-destructive bg-destructive/5' : ''}`}>
                            P{task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground/70">
                          <span className="flex items-center gap-1">
                            <FolderKanban className="h-3 w-3" />
                            {task.team_name}
                          </span>
                          {task.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(task.due_date), 'MMM d')}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {statusTasks.length > 5 && (
                      <div className="text-center pt-2">
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary font-bold uppercase tracking-widest h-8">
                          +{statusTasks.length - 5} More items
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Project Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            Tasks by Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : Object.keys(tasksByProject).length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No project data available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(tasksByProject).map(([projectName, projectTasks]) => {
                const completedTasks = projectTasks.filter(t => t.status === 'done').length;
                const totalTasks = projectTasks.length;
                const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <motion.div
                    key={projectName}
                    whileHover={{ y: -2 }}
                    className="p-5 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/40 border border-border/50 transition-all hover:bg-accent/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <FolderKanban className="h-4 w-4" />
                        </div>
                        <h4 className="font-bold text-foreground text-lg tracking-tight">{projectName}</h4>
                      </div>
                      <Badge variant="secondary" className="font-bold px-2.5">{totalTasks} tasks</Badge>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Efficiency</span>
                        <span className="text-xl font-black text-primary">{completionRate}%</span>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden border border-border/10">
                        <motion.div
                          className="bg-primary h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${completionRate}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-tighter">
                        <div className="p-2 bg-emerald-500/5 text-emerald-500 rounded-lg border border-emerald-500/10 text-center">
                          {completedTasks} Fixed
                        </div>
                        <div className="p-2 bg-amber-500/5 text-amber-500 rounded-lg border border-amber-500/10 text-center">
                          {totalTasks - completedTasks} Open
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MyProgress;