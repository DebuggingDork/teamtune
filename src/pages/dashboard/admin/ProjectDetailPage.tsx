import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FolderKanban,
  Calendar,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  User,
  Loader2,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { useAdminProjectDetails } from "@/hooks/useAdmin";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useAdminProjectDetails(projectId || "");

  const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
    active: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: <Activity className="h-3.5 w-3.5" /> },
    completed: { color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/30", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    planning: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", icon: <Clock className="h-3.5 w-3.5" /> },
    on_hold: { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", icon: <AlertCircle className="h-3.5 w-3.5" /> },
    cancelled: { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30", icon: <XCircle className="h-3.5 w-3.5" /> },
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!project) {
    return (
      <AdminLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <AlertCircle className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm mb-6">Project not found</p>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/admin/projects")}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </motion.div>
      </AdminLayout>
    );
  }

  const config = statusConfig[project.status] || statusConfig.active;
  const isOverdue = project.days.is_overdue;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/admin/projects")}
            className="h-9 px-3 rounded-xl text-muted-foreground hover:text-foreground -ml-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Projects
          </Button>
        </motion.div>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="relative bg-card border border-border rounded-3xl p-8 overflow-hidden"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="space-y-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                  {config.icon}
                  {project.status.replace("_", " ")}
                </span>
                <div>
                  <h1 className="text-3xl font-semibold text-card-foreground tracking-tight">
                    {project.name}
                  </h1>
                  <p className="text-muted-foreground font-mono text-sm mt-1">{project.project_code}</p>
                </div>
              </div>

              {/* Progress Circle */}
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="fill-none stroke-muted"
                      strokeWidth="6"
                    />
                    <motion.circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="fill-none stroke-primary"
                      strokeWidth="6"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 251" }}
                      animate={{ strokeDasharray: `${project.progress * 2.51} 251` }}
                      transition={{ duration: 1, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-semibold text-card-foreground">{project.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {[
            { label: "Teams", value: project.teams.length, icon: Users, color: "text-sky-500" },
            { label: "Total Tasks", value: project.task_stats.total, icon: FolderKanban, color: "text-violet-500" },
            { label: "Completed", value: project.task_stats.done, icon: CheckCircle2, color: "text-emerald-500" },
            { label: "Days Left", value: isOverdue ? "Overdue" : project.days.days_remaining, icon: Calendar, color: isOverdue ? "text-rose-500" : "text-amber-500" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05, duration: 0.35 }}
              className="bg-card rounded-2xl border border-border p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-semibold text-card-foreground">{stat.value}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1 font-medium">
                    {stat.label}
                  </p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color} opacity-60`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50 p-1 rounded-xl h-auto">
              <TabsTrigger value="overview" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="teams" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                Teams ({project.teams.length})
              </TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                Tasks
              </TabsTrigger>
              {project.recent_activity && project.recent_activity.length > 0 && (
                <TabsTrigger value="activity" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  Activity
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Manager Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-2xl border border-border p-6"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">Project Manager</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 ring-4 ring-muted">
                      <AvatarImage src={project.manager.avatar_url || undefined} />
                      <AvatarFallback className="text-sm font-medium bg-primary text-primary-foreground">
                        {getInitials(project.manager.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-card-foreground">{project.manager.full_name}</p>
                      <p className="text-sm text-muted-foreground">{project.manager.email}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{project.manager.user_code}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Timeline Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-card rounded-2xl border border-border p-6"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Start</span>
                      <span className="text-sm font-medium text-card-foreground">
                        {format(new Date(project.start_date), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">End</span>
                      <span className="text-sm font-medium text-card-foreground">
                        {format(new Date(project.end_date), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Time elapsed</span>
                        <span className="text-xs font-medium text-muted-foreground">{project.days.time_progress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.days.time_progress}%` }}
                          transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="teams" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.teams.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="bg-card rounded-2xl border border-border p-6 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-card-foreground">{team.name}</h4>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{team.team_code}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{team.lead.full_name}</p>
                        <p className="text-[11px] text-muted-foreground">Team Lead</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 py-4 border-t border-border">
                      <div>
                        <p className="text-lg font-semibold text-card-foreground">{team.member_count}</p>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Members</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-card-foreground">
                          {team.completed_tasks}<span className="text-muted-foreground">/{team.total_tasks}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Tasks</p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-semibold text-card-foreground">{team.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${team.progress}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { label: "Total", value: project.task_stats.total, color: "bg-primary" },
                  { label: "To Do", value: project.task_stats.todo, color: "bg-amber-500" },
                  { label: "In Progress", value: project.task_stats.in_progress, color: "bg-sky-500" },
                  { label: "Done", value: project.task_stats.done, color: "bg-emerald-500" },
                  { label: "Blocked", value: project.task_stats.blocked, color: "bg-rose-500" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="bg-card rounded-2xl border border-border p-5 text-center"
                  >
                    <div className={`w-2 h-2 ${stat.color} rounded-full mx-auto mb-3`} />
                    <p className="text-2xl font-semibold text-card-foreground">{stat.value}</p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1 font-medium">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {project.recent_activity && project.recent_activity.length > 0 && (
              <TabsContent value="activity" className="mt-6">
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">Recent Activity</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {project.recent_activity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="px-6 py-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{activity.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <span className="font-mono">{activity.task_code}</span>
                            <span className="mx-1.5">·</span>
                            {activity.assigned_to}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${
                          activity.status === 'done' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' :
                          activity.status === 'in_progress' ? 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {activity.status.replace("_", " ")}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default ProjectDetailPage;