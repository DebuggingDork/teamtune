import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Briefcase, 
  FolderKanban, 
  Calendar, 
  BarChart3, 
  Bell, 
  Search,
  LogOut,
  Loader2,
  Users,
  CheckCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TeamTuneLogo from "@/components/TeamTuneLogo";
import { useAuth } from "@/hooks/useAuth";
import { useProjects, useEmployees } from "@/hooks/useProjectManager";
import { format } from "date-fns";

const ProjectManagerDashboard = () => {
  const { user, logout } = useAuth();
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees();

  const handleLogout = async () => {
    await logout();
  };

  // Calculate stats from real data
  const activeProjects = projects.filter(p => p.status === "active").length;
  const totalProjects = projects.length;
  const onTrackProjects = projects.filter(p => p.status === "active" || p.status === "planning").length;
  const onTrackPercentage = totalProjects > 0 ? Math.round((onTrackProjects / totalProjects) * 100) : 0;
  
  // Get unique team members count from employees
  const teamMembersCount = employeesData?.employees?.length || 0;
  
  // Calculate upcoming deadlines (projects ending in next 7 days)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = projects.filter(p => {
    if (!p.end_date) return false;
    const endDate = new Date(p.end_date);
    return endDate >= today && endDate <= nextWeek && p.status === "active";
  }).length;

  const isLoading = isLoadingProjects || isLoadingEmployees;
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 hidden lg:flex flex-col">
        <Link to="/">
          <TeamTuneLogo />
        </Link>
        
        <nav className="mt-8 flex-1">
          <div className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground bg-accent rounded-lg">
              <BarChart3 className="h-4 w-4" />
              Overview
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <FolderKanban className="h-4 w-4" />
              Projects
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <Calendar className="h-4 w-4" />
              Timeline
            </a>
          </div>
        </nav>

        <div className="border-t border-border pt-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <TeamTuneLogo showText={false} />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="pl-10 pr-4 py-2 bg-accent border-none rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
              </button>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user?.full_name || "Project Manager"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || "Project Manager"}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-foreground mb-2">Project Manager Dashboard</h1>
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
                <Badge variant="secondary">{totalProjects} total</Badge>
              </div>
              
              {isLoadingProjects ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No projects found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.slice(0, 5).map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FolderKanban className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{project.name}</p>
                          <p className="text-xs text-muted-foreground">{project.project_code}</p>
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
                          {project.status}
                        </Badge>
                        {project.end_date && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(project.end_date), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {projects.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      Showing 5 of {projects.length} projects
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ProjectManagerDashboard;
