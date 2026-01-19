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
import type { ProjectStatus } from "@/api/types/index";
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
      <div className="space-y-8">
        {/* Stats Row - Minimal horizontal cards */}
        {!isLoadingStats && stats && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex gap-1 p-1 bg-muted/50 rounded-2xl"
          >
            {[
              { label: "Total", value: stats.total, accent: "zinc" },
              { label: "Active", value: stats.active, accent: "emerald" },
              { label: "Planning", value: stats.planning, accent: "amber" },
              { label: "Completed", value: stats.completed, accent: "sky" },
              { label: "On Hold", value: stats.on_hold, accent: "orange" },
              { label: "Cancelled", value: stats.cancelled, accent: "rose" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex-1 bg-card rounded-xl p-4 text-center cursor-default hover:bg-accent/50 transition-colors border border-border"
              >
                <p className={`text-2xl font-semibold tracking-tight ${
                  stat.accent === 'zinc' ? 'text-foreground' :
                  stat.accent === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                  stat.accent === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                  stat.accent === 'sky' ? 'text-sky-600 dark:text-sky-400' :
                  stat.accent === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                  'text-rose-600 dark:text-rose-400'
                }`}>
                  {stat.value}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1 font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Search & Filter - Clean inline design */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-card border-border rounded-xl text-sm placeholder:text-muted-foreground"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectStatus | "all")}>
            <SelectTrigger className="w-44 h-12 bg-card border-border rounded-xl text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Layers className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No projects found</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
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
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: index * 0.03, ease: [0.23, 1, 0.32, 1] }}
                    onClick={() => navigate(`/dashboard/admin/projects/${project.id}`)}
                    className="group relative bg-card rounded-2xl border border-border p-5 cursor-pointer hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0 pr-3">
                        <h3 className="font-semibold text-card-foreground truncate text-[15px] leading-tight">
                          {project.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {project.project_code}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${config.bg} ${config.color}`}>
                        {config.icon}
                        {project.status.replace("_", " ")}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-5 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Manager */}
                    <div className="flex items-center gap-3 mb-5">
                      <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
                        <AvatarImage src={project.manager.avatar_url || undefined} />
                        <AvatarFallback className="text-[11px] font-medium bg-primary text-primary-foreground">
                          {getInitials(project.manager.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">
                          {project.manager.full_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Manager</p>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 py-4 border-y border-border">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{project.stats.team_count} teams</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {project.stats.completed_tasks}/{project.stats.total_tasks}
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-semibold text-card-foreground">{project.stats.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.stats.progress}%` }}
                          transition={{ duration: 0.8, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(project.start_date), "MMM d")}
                      </div>
                      <span className={`text-xs font-medium ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {isOverdue ? 'Overdue' : `${daysRemaining}d left`}
                      </span>
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
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