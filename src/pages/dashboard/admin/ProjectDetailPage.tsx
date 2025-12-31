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
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { useAdminProjectDetails } from "@/hooks/useAdmin";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useAdminProjectDetails(projectId || "");

  const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; glow: string }> = {
    active: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      icon: <Activity className="h-4 w-4" />,
      glow: "rgba(16, 185, 129, 0.5)"
    },
    completed: {
      color: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
      icon: <CheckCircle2 className="h-4 w-4" />,
      glow: "rgba(14, 165, 233, 0.5)"
    },
    planning: {
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      icon: <Clock className="h-4 w-4" />,
      glow: "rgba(245, 158, 11, 0.5)"
    },
    on_hold: {
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
      icon: <AlertCircle className="h-4 w-4" />,
      glow: "rgba(249, 115, 22, 0.5)"
    },
    cancelled: {
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
      icon: <XCircle className="h-4 w-4" />,
      glow: "rgba(244, 63, 94, 0.5)"
    },
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
            <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Analysing Project Ecosystem...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!project) {
    return (
      <AdminLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-card/40 border border-border/50 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl">
            <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Project Not Found</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-xs">The project you are looking for might have been archived or deleted.</p>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/admin/projects")}
            className="rounded-2xl px-8 h-12 bg-background/50 backdrop-blur-md border-border/50 hover:bg-accent transition-all font-bold"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            BACK TO PORTFOLIO
          </Button>
        </motion.div>
      </AdminLayout>
    );
  }

  const config = statusConfig[project.status] || statusConfig.active;
  const isOverdue = project.days.is_overdue;

  return (
    <AdminLayout>
      <div className="space-y-10 max-w-7xl mx-auto px-4 pb-20">
        {/* Back Button & Breadcrumbs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/admin/projects")}
            className="h-12 w-12 rounded-2xl bg-card/40 backdrop-blur-md border border-border/50 hover:bg-accent hover:scale-105 transition-all group"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
          </Button>
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Project Operations</p>
            <h2 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
              Portfolio <span className="w-1 h-1 rounded-full bg-border" /> <span className="text-foreground">{project.project_code}</span>
            </h2>
          </div>
        </motion.div>

        {/* Hero Header - The "Enterprise" Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="relative bg-card/40 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-10 lg:p-14 overflow-hidden shadow-2xl group"
        >
          {/* Advanced Glow Effects */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-primary/10" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] -ml-24 -mb-24" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
              <div className="space-y-6 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all duration-500 shadow-lg ${config.bg} ${config.color} group-hover:shadow-[0_0_20px_${config.glow}]`}>
                    {config.icon}
                    {project.status.replace("_", " ")}
                  </span>
                  {isOverdue && (
                    <span className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-lg animate-pulse">
                      <Clock className="h-4 w-4" />
                      CRITICAL OVERDUE
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl lg:text-6xl font-black text-foreground tracking-tighter leading-none transition-all">
                    {project.name}
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl font-medium leading-relaxed">
                    Orchestrating system resources and organizational milestones for sustained operational excellence.
                  </p>
                </div>

                <div className="flex items-center gap-8 pt-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Reference Code</p>
                    <p className="text-xl font-mono font-bold text-foreground/80">{project.project_code}</p>
                  </div>
                  <div className="w-px h-10 bg-border/50" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Launch Date</p>
                    <p className="text-xl font-bold text-foreground/80">{format(new Date(project.start_date), "MMM yyyy")}</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Circular Progress */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-48 h-48 lg:w-56 lg:h-56 group/progress">
                  <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl group-hover/progress:bg-primary/10 transition-all duration-500" />
                  <svg className="w-full h-full -rotate-90 relative z-10 transition-transform duration-700 group-hover/progress:scale-110">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="42%"
                      className="fill-none stroke-background/50"
                      strokeWidth="12"
                    />
                    <motion.circle
                      cx="50%"
                      cy="50%"
                      r="42%"
                      className="fill-none stroke-primary"
                      strokeWidth="12"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 283" }}
                      animate={{ strokeDasharray: `${project.progress * 2.83} 283` }}
                      transition={{ duration: 1.5, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
                      style={{ filter: "drop-shadow(0 0 12px rgba(59, 130, 246, 0.6))" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center relative z-10">
                    <span className="text-4xl lg:text-5xl font-black text-foreground">{project.progress}%</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mt-1">COMPLETED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Active Units", value: project.teams.length, icon: Users, color: "primary", glow: "rgba(59, 130, 246, 0.4)" },
            { label: "Workload Units", value: project.task_stats.total, icon: Activity, color: "violet", glow: "rgba(139, 92, 246, 0.4)" },
            { label: "Success Rate", value: `${Math.round((project.task_stats.done / (project.task_stats.total || 1)) * 100)}%`, icon: CheckCircle2, color: "emerald", glow: "rgba(16, 185, 129, 0.4)" },
            { label: "Sprint Remaining", value: isOverdue ? "0 Days" : `${project.days.days_remaining}d`, icon: Calendar, color: isOverdue ? "destructive" : "amber", glow: isOverdue ? "rgba(239, 68, 68, 0.4)" : "rgba(245, 158, 11, 0.4)" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-8 group cursor-default hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between pointer-events-none">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{stat.label}</p>
                  <h4 className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">{stat.value}</h4>
                </div>
                <div className={`p-4 rounded-2xl bg-${stat.color === 'destructive' ? 'rose' : stat.color}-500/10 text-${stat.color === 'destructive' ? 'rose' : stat.color}-500 group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Tabbed Interface */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="space-y-8"
        >
          <Tabs defaultValue="overview" className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-6">
              <TabsList className="bg-card/40 backdrop-blur-lg p-1.5 rounded-[1.5rem] border border-border/30 h-auto flex flex-wrap gap-1">
                <TabsTrigger value="overview" className="rounded-xl px-8 py-3 text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_10px_20px_-5px_rgba(59,130,246,0.3)] transition-all duration-300">
                  OVERVIEW
                </TabsTrigger>
                <TabsTrigger value="teams" className="rounded-xl px-8 py-3 text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_10px_20px_-5px_rgba(59,130,246,0.3)] transition-all duration-300">
                  TEAMS — {project.teams.length}
                </TabsTrigger>
                <TabsTrigger value="tasks" className="rounded-xl px-8 py-3 text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_10px_20px_-5px_rgba(59,130,246,0.3)] transition-all duration-300">
                  METRICS
                </TabsTrigger>
                {project.recent_activity && project.recent_activity.length > 0 && (
                  <TabsTrigger value="activity" className="rounded-xl px-8 py-3 text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_10px_20px_-5px_rgba(59,130,246,0.3)] transition-all duration-300">
                    LIVE LOGS
                  </TabsTrigger>
                )}
              </TabsList>

              <div className="flex items-center gap-3">
                <Button className="rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest py-6 px-10 shadow-xl shadow-primary/20">
                  Edit Portfolio
                </Button>
              </div>
            </div>

            <TabsContent value="overview" className="space-y-10 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Manager Card - Elevated Glass */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-10 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Project Leadership</h3>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="relative group/avatar">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-[10px] opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                        <Avatar className="h-20 w-20 lg:h-24 lg:w-24 ring-4 ring-background shadow-2xl relative z-10 transition-transform duration-500 group-hover/avatar:scale-105">
                          <AvatarImage src={project.manager.avatar_url || undefined} />
                          <AvatarFallback className="text-lg font-black bg-gradient-to-br from-primary to-blue-600 text-white leading-none">
                            {getInitials(project.manager.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="space-y-1.5 pt-2">
                        <p className="text-2xl font-black text-foreground leading-tight group-hover:text-primary transition-colors">{project.manager.full_name}</p>
                        <p className="text-sm font-medium text-muted-foreground">{project.manager.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-3 py-1 bg-muted rounded-lg text-[10px] font-black uppercase tracking-tighter text-muted-foreground/80 border border-border/50">ID: {project.manager.user_code}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Active Overseer</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Timeline Card - Elevated Glass */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 }}
                  className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-10 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-500/10 rounded-xl">
                        <Calendar className="h-5 w-5 text-amber-500" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Phase Schedule</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Deployment</p>
                        <p className="text-xl font-bold text-foreground">{format(new Date(project.start_date), "MMM d, yyyy")}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Estimated Close</p>
                        <p className="text-xl font-bold text-foreground">{format(new Date(project.end_date), "MMM d, yyyy")}</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Operational Velocity</span>
                        <span className="text-xs font-black font-mono text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">{project.days.time_progress}%</span>
                      </div>
                      <div className="h-4 bg-background/50 rounded-full border border-white/5 overflow-hidden p-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.days.time_progress}%` }}
                          transition={{ duration: 1.2, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
                          className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="teams" className="mt-6 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {project.teams.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                    whileHover={{ y: -10 }}
                    className="group bg-card/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 hover:bg-card/60 transition-all duration-500 cursor-pointer relative overflow-hidden shadow-xl"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform duration-1000 group-hover:scale-[3]`} />

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-8">
                        <div className="space-y-1">
                          <h4 className="text-xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{team.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-muted/50 px-2 py-0.5 rounded border border-border/50">{team.team_code}</span>
                          </div>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                          <ArrowUpRight className="h-6 w-6" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-8">
                        <div className="relative">
                          <Avatar className="h-12 w-12 ring-2 ring-background border border-border shadow-md">
                            <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-black">TL</AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground">{team.lead.full_name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mission Lead</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-10 py-6 border-t border-border/30 mt-auto">
                        <div className="space-y-1">
                          <p className="text-2xl font-black text-foreground">{team.member_count}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Operators</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-black text-foreground">
                            {team.completed_tasks}<span className="text-muted-foreground/50 text-lg">/{team.total_tasks}</span>
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Objectives</p>
                        </div>
                      </div>

                      <div className="pt-6">
                        <div className="flex items-center justify-between mb-3 px-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Execution Flow</span>
                          <span className="text-xs font-black text-primary font-mono">{team.progress}%</span>
                        </div>
                        <div className="h-3 bg-background/50 rounded-full border border-white/5 overflow-hidden p-0.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${team.progress}%` }}
                            transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                            className="h-full bg-primary/80 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-6 outline-none">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                  { label: "Total Units", value: project.task_stats.total, color: "primary", icon: Activity },
                  { label: "Queued", value: project.task_stats.todo, color: "amber", icon: Clock },
                  { label: "Operating", value: project.task_stats.in_progress, color: "sky", icon: Activity },
                  { label: "Deployed", value: project.task_stats.done, color: "emerald", icon: CheckCircle2 },
                  { label: "Stalled", value: project.task_stats.blocked, color: "rose", icon: XCircle },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2rem] p-8 text-center group cursor-default"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-all duration-300 ring-1 ring-${stat.color}-500/20`}>
                      <stat.icon className="h-7 w-7" />
                    </div>
                    <p className="text-4xl font-black text-foreground tracking-tight">{stat.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-2">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {project.recent_activity && project.recent_activity.length > 0 && (
              <TabsContent value="activity" className="mt-6 outline-none">
                <div className="bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[3rem] overflow-hidden shadow-2xl">
                  <div className="px-10 py-8 border-b border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">System Activity Logs</h3>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-xl border-border/50">REAL-TIME SYNC</Badge>
                  </div>
                  <div className="divide-y divide-border/30">
                    {project.recent_activity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                        className="px-10 py-6 flex items-center justify-between transition-colors group cursor-default"
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-3 h-3 rounded-full ${activity.status === 'done' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                            activity.status === 'in_progress' ? 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]' :
                              'bg-muted shadow-lg'
                            }`} />
                          <div>
                            <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{activity.title}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 font-mono">{activity.task_code}</span>
                              <span className="w-1 h-1 rounded-full bg-border/50" />
                              <span className="text-xs font-medium text-muted-foreground/80">{activity.assigned_to}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activity.status === 'done' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                          activity.status === 'in_progress' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:shadow-[0_0_15px_rgba(14,165,233,0.2)]' :
                            'bg-muted/50 text-muted-foreground border border-border/50'
                          }`}>
                          {activity.status.replace("_", " ")}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-8 bg-muted/5 flex justify-center border-t border-border/30">
                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">Load Historical Archive</Button>
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