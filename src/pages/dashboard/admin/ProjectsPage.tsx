import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban,
  ArrowRight,
  Activity,
  AlertCircle,
  Search,
  Loader2,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
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
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { useAdminProjects, useAdminProjectStats } from "@/hooks/useAdmin";
import { format, differenceInDays } from "date-fns";
import type { ProjectStatus } from "@/api/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: projectsData, isLoading } = useAdminProjects({
    page,
    limit,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: stats, isLoading: isLoadingStats } = useAdminProjectStats();

  const statusConfig: Record<ProjectStatus, { color: string; bg: string; icon: React.ReactNode }> = {
    active: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: <Activity className="h-3 w-3" /> },
    completed: { color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/30", icon: <CheckCircle2 className="h-3 w-3" /> },
    planning: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", icon: <Clock className="h-3 w-3" /> },
    on_hold: { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", icon: <AlertCircle className="h-3 w-3" /> },
    cancelled: { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30", icon: <XCircle className="h-3 w-3" /> },
  };

  const filteredProjects = projectsData?.projects.filter((project) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(query) ||
      project.project_code.toLowerCase().includes(query) ||
      project.manager.full_name.toLowerCase().includes(query)
    );
  }) || [];

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getDaysRemaining = (endDate: string) => {
    return differenceInDays(new Date(endDate), new Date());
  };

  return (
    <AdminLayout
      headerTitle="Projects"
      headerDescription="View and manage all projects across your organization"
    >
      <div className="space-y-10">
        {/* Stats Row - Premium Glass Cards */}
        {!isLoadingStats && stats && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "circOut" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {[
              { label: "Registry", value: stats.total, color: "zinc" },
              { label: "Active", value: stats.active, color: "emerald" },
              { label: "Planning", value: stats.planning, color: "amber" },
              { label: "Finalized", value: stats.completed, color: "sky" },
              { label: "Suspended", value: stats.on_hold, color: "orange" },
              { label: "Terminated", value: stats.cancelled, color: "rose" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="group relative bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-12 h-12 bg-primary opacity-[0.03] group-hover:opacity-[0.1] blur-2xl transition-opacity rounded-full" />
                <p className={`text-3xl font-black tracking-tighter tabular-nums ${stat.color === 'zinc' ? 'text-foreground' :
                    stat.color === 'emerald' ? 'text-emerald-500' :
                      stat.color === 'amber' ? 'text-amber-500' :
                        stat.color === 'sky' ? 'text-sky-500' :
                          stat.color === 'orange' ? 'text-orange-500' :
                            'text-rose-500'
                  }`}>
                  {stat.value}
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-2">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Search & Filter - Floating Control Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-border/50 shadow-xl"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Query project database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-transparent border-none rounded-xl text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
            />
          </div>
          <div className="h-8 w-px bg-border/50 hidden sm:block self-center" />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectStatus | "all")}>
            <SelectTrigger className="w-full sm:w-48 h-12 bg-transparent border-none rounded-xl text-sm font-bold shadow-none focus:ring-0">
              <SelectValue placeholder="All Clusters" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/50 shadow-2xl backdrop-blur-xl bg-card/90">
              <SelectItem value="all" className="rounded-xl">All Clusters</SelectItem>
              <SelectItem value="active" className="rounded-xl">Active</SelectItem>
              <SelectItem value="planning" className="rounded-xl">Planning</SelectItem>
              <SelectItem value="completed" className="rounded-xl">Completed</SelectItem>
              <SelectItem value="on_hold" className="rounded-xl">On Hold</SelectItem>
              <SelectItem value="cancelled" className="rounded-xl">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Projects Grid - Elevated Cards */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse" />
              <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
            </div>
            <p className="text-sm font-black text-muted-foreground tracking-[0.3em] uppercase animate-pulse">Synchronizing Data</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-muted/30 border border-border/50 flex items-center justify-center mb-6 shadow-inner">
              <Layers className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <h4 className="text-xl font-black text-foreground mb-2">Cluster Empty</h4>
            <p className="text-muted-foreground text-sm font-medium max-w-xs mx-auto">No project identities match your current filter parameters.</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => {
                const daysRemaining = getDaysRemaining(project.end_date);
                const isOverdue = daysRemaining < 0;
                const config = statusConfig[project.status];

                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: index * 0.04, ease: "circOut" }}
                    onClick={() => navigate(`/dashboard/admin/projects/${project.id}`)}
                    className="group relative bg-card/60 backdrop-blur-xl rounded-[2rem] border border-border/50 p-6 cursor-pointer hover:border-primary/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 overflow-hidden"
                  >
                    {/* Shadow Accent */}
                    <div className="absolute -inset-20 bg-primary opacity-0 group-hover:opacity-[0.02] blur-[100px] pointer-events-none transition-opacity duration-700" />

                    {/* Header */}
                    <div className="flex items-start justify-between mb-6 relative z-10">
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-lg font-black text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors duration-300 truncate">
                          {project.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-border" />
                          {project.project_code}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm border ${config.bg} ${config.color} border-current/10`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {project.status.replace("_", " ")}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm font-medium text-muted-foreground/80 line-clamp-2 mb-8 leading-relaxed relative z-10">
                      {project.description}
                    </p>

                    {/* Mid Section - Manager & Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/50">
                        <Avatar className="h-10 w-10 ring-2 ring-primary/20 shadow-md">
                          <AvatarImage src={project.manager.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px] font-black bg-primary text-primary-foreground">
                            {getInitials(project.manager.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-foreground truncate">{project.manager.full_name}</p>
                          <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60">Supervising</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/50">
                        <div className="p-2 rounded-xl bg-background shadow-sm">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-foreground">{project.stats.team_count}</p>
                          <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60">Units</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer - Progress & Meta */}
                    <div className="space-y-6 relative z-10">
                      <div>
                        <div className="flex items-center justify-between mb-3 px-1">
                          <div className="flex items-center gap-1.5">
                            <Activity className="h-3 w-3 text-muted-foreground/40" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Efficiency Grid</span>
                          </div>
                          <span className="text-xs font-black text-primary">{project.stats.progress}%</span>
                        </div>
                        <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden p-0.5 border border-border/30">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${project.stats.progress}%` }}
                            transition={{ duration: 1.2, delay: index * 0.1, ease: "circOut" }}
                            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 group/date">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/40 group-hover/date:text-primary transition-colors" />
                          <span className="text-[11px] font-bold text-muted-foreground">
                            {format(new Date(project.start_date), "MMM d")}
                          </span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-primary/5 text-primary border border-primary/20 shadow-sm'
                          }`}>
                          <Clock className="h-3 w-3" />
                          {isOverdue ? 'Overdue Status' : `${daysRemaining} Cycles Remaining`}
                        </div>
                      </div>
                    </div>

                    {/* Hover Glow Corner */}
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px] pointer-events-none" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination - Minimal */}
        {projectsData && projectsData.pagination.total_pages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between pt-4"
          >
            <p className="text-sm text-muted-foreground">
              {((page - 1) * limit) + 1}–{Math.min(page * limit, projectsData.pagination.total)} of {projectsData.pagination.total}
            </p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 w-9 p-0 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(projectsData.pagination.total_pages, p + 1))}
                disabled={page === projectsData.pagination.total_pages}
                className="h-9 w-9 p-0 rounded-xl"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProjectsPage;