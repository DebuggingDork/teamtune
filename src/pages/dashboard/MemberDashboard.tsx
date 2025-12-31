import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  User,
  TrendingUp,
  Calendar,
  Clock,
  MessageSquare,
  Info,

  Bell,
  LogOut,
  CheckCircle,
  Loader2,
  ChevronDown,
  AlertTriangle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TeamTuneLogo from "@/components/TeamTuneLogo";
import { ThemeSelector } from "@/components/ThemeSelector";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useMyProfile, useMyPerformance, useMyObservations, useMyGitActivity, useMyMetrics } from "@/hooks/useEmployee";
import { useTabPersistence } from "@/hooks/useTabPersistence";
import { format } from "date-fns";
import MyProgress from "@/components/employee/MyProgress";
import MyFeedback from "@/components/employee/MyFeedback";
import NotificationPanel from "@/components/shared/NotificationPanel";

// Helper function to calculate date ranges
const getDateRanges = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 42); // 6 weeks ago

  return {
    period_start: startDate.toISOString().split('T')[0],
    period_end: endDate.toISOString().split('T')[0],
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
  };
};

const chartConfig = {
  contributions: { label: "Contributions", color: "hsl(var(--primary))" },
  days: { label: "Active Days", color: "hsl(var(--chart-2))" },
  hours: { label: "Hours", color: "hsl(var(--chart-3))" },
};

const MemberDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useTabPersistence({
    defaultTab: "overview",
    validTabs: ["overview", "progress", "feedback"]
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const dateRanges = useMemo(() => getDateRanges(), []);

  // Get profile data
  const { data: profile, isLoading: isLoadingProfile } = useMyProfile();

  // Get performance data
  const { data: performance, isLoading: isLoadingPerformance } = useMyPerformance({
    period_start: dateRanges.period_start,
    period_end: dateRanges.period_end,
  });

  // Get observations/feedback
  const { data: observationsData, isLoading: isLoadingObservations } = useMyObservations();

  // Get git activity
  const { data: gitActivity, isLoading: isLoadingGitActivity } = useMyGitActivity({
    start_date: dateRanges.start_date,
    end_date: dateRanges.end_date,
  });

  // Get metrics
  const { data: metrics, isLoading: isLoadingMetrics } = useMyMetrics();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Transform profile data
  const personalData = useMemo(() => {
    if (!profile) return null;
    return {
      name: profile.full_name || user?.full_name || "Member",
      email: profile.email || user?.email || "",
      team: profile.teams?.[0]?.team_name || "Unassigned Team",
      project: profile.projects?.[0]?.project_name || "No Active Project",
      status: profile.status === "active" ? "Active" : profile.status || "Active",
      joinedDate: profile.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "N/A",
    };
  }, [profile, user]);

  // Transform git activity for contribution trends
  const contributionTrendData = useMemo(() => {
    if (!gitActivity?.activity_by_date) return [];

    // Group by week
    const weeklyData: Record<string, number> = {};

    gitActivity.activity_by_date.forEach((activity) => {
      const date = new Date(activity.date);
      const weekNum = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
      const weekKey = `W${weekNum}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = 0;
      }
      weeklyData[weekKey] += activity.commits || 0;
    });

    return Object.entries(weeklyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([week, contributions]) => ({
        week,
        contributions,
      }));
  }, [gitActivity]);

  // Calculate active days from git activity
  const activeDaysData = useMemo(() => {
    if (!gitActivity?.activity_by_date) return [];

    const weeklyData: Record<string, Set<string>> = {};

    gitActivity.activity_by_date.forEach((activity) => {
      const date = new Date(activity.date);
      const weekNum = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
      const weekKey = `W${weekNum}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = new Set();
      }
      weeklyData[weekKey].add(activity.date);
    });

    return Object.entries(weeklyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([week, dates]) => ({
        week,
        days: dates.size,
      }));
  }, [gitActivity]);

  // Transform metrics for time log data
  const timeLogData = useMemo(() => {
    if (!metrics?.time_tracking) return [];

    // Since we don't have weekly breakdown, create a simplified representation
    const totalHours = metrics.time_tracking.total_hours_logged || 0;
    const weeks = 6;
    const avgHoursPerWeek = Math.round(totalHours / weeks);

    return Array.from({ length: weeks }, (_, i) => ({
      week: `W${i + 1}`,
      hours: avgHoursPerWeek,
    }));
  }, [metrics]);

  // Transform observations to feedback history
  const feedbackHistory = useMemo(() => {
    if (!observationsData?.observations) return [];

    return observationsData.observations
      .slice(0, 10)
      .map((obs) => ({
        date: format(new Date(obs.observation_date), "MMM d, yyyy"),
        from: `${obs.evaluator_name || "Team Lead"} (${obs.evaluator_role || "Team Lead"})`,
        note: obs.note,
        context: obs.related_task_title || obs.category || "General",
      }));
  }, [observationsData]);

  const isLoading = isLoadingProfile || isLoadingPerformance || isLoadingObservations || isLoadingGitActivity || isLoadingMetrics;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 hidden lg:flex flex-col">
        <Link to="/">
          <TeamTuneLogo />
        </Link>

        <nav className="mt-8 flex-1">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${activeTab === "overview"
                ? "font-medium text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
            >
              <User className="h-4 w-4" />
              My Overview
            </button>
            <button
              onClick={() => setActiveTab("progress")}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${activeTab === "progress"
                ? "font-medium text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
            >
              <TrendingUp className="h-4 w-4" />
              My Progress
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${activeTab === "feedback"
                ? "font-medium text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
            >
              <MessageSquare className="h-4 w-4" />
              Feedback
            </button>
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
      <main className="lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/60 backdrop-blur-xl border-b border-border/50 px-8 py-5">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4">
              <div
                className="lg:hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <TeamTuneLogo showText={false} />
              </div>
              <div className="hidden lg:block">
                <h2 className="text-sm font-medium text-muted-foreground/80 uppercase tracking-wider">Workspace</h2>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <ThemeSelector />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsNotificationPanelOpen(true)}
                className="relative p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-all border border-transparent hover:border-border/50"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
              </motion.button>

              <div className="h-8 w-px bg-border/50 mx-1" />

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-3 py-1.5 h-auto hover:bg-accent rounded-full border border-transparent hover:border-border/50 transition-all">
                    <div className="relative">
                      <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {personalData?.name || user?.full_name || "Member"}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">
                        {personalData?.status || "Active"}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl border-border/50">
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard/member/profile")}
                    className="flex items-center gap-2.5 cursor-pointer rounded-md py-2.5"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1.5 opacity-50" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 text-destructive focus:text-destructive cursor-pointer rounded-md py-2.5 focus:bg-destructive/5"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Logout session</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto p-8 space-y-8">
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <motion.h1
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
                    >
                      Welcome back, <span className="text-primary">{personalData?.name?.split(' ')[0] || "Member"}</span>!
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-3 text-lg text-muted-foreground font-medium"
                    >
                      Here's what's happening in your workspace today.
                    </motion.p>
                  </div>
                </div>

                {/* Personal Overview Details */}
                <Card className="overflow-hidden border-border/50 shadow-lg shadow-primary/5 bg-gradient-to-br from-card to-accent/20">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <User size={160} />
                  </div>
                  <CardHeader className="pb-2 border-b border-border/10">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-bold uppercase tracking-wider text-muted-foreground/80">
                      <User className="h-5 w-5 text-primary" />
                      Profile Identity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isLoadingProfile ? (
                      <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                      </div>
                    ) : !personalData ? (
                      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <User className="h-10 w-10 mb-3 opacity-20" />
                        <p>No profile identity available</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-1.5 p-4 rounded-2xl bg-background/40 border border-border/20 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Full Name</p>
                          <p className="text-xl font-bold text-foreground truncate">{personalData.name}</p>
                        </div>
                        <div className="space-y-1.5 p-4 rounded-2xl bg-background/40 border border-border/20 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Organization Unit</p>
                          <p className="text-xl font-bold text-foreground truncate">{personalData.team}</p>
                        </div>
                        <div className="space-y-1.5 p-4 rounded-2xl bg-background/40 border border-border/20 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Project</p>
                          <p className="text-xl font-bold text-foreground truncate">{personalData.project}</p>
                        </div>
                        <div className="space-y-1.5 p-4 rounded-2xl bg-background/40 border border-border/20 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">System Status</p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xl font-bold text-emerald-500">
                              {personalData.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contribution Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Contribution Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingGitActivity ? (
                        <div className="flex items-center justify-center h-[200px]">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : contributionTrendData.length === 0 ? (
                        <div className="flex items-center justify-center h-[200px]">
                          <p className="text-muted-foreground">No contribution data available</p>
                        </div>
                      ) : (
                        <ChartContainer config={chartConfig} className="h-[200px] w-full">
                          <AreaChart data={contributionTrendData}>
                            <defs>
                              <linearGradient id="memberContributionGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="week" axisLine={false} tickLine={false} className="text-xs" />
                            <YAxis axisLine={false} tickLine={false} className="text-xs" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                              type="monotone"
                              dataKey="contributions"
                              stroke="hsl(var(--primary))"
                              fill="url(#memberContributionGradient)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ChartContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Active Days Pattern
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingGitActivity ? (
                        <div className="flex items-center justify-center h-[200px]">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : activeDaysData.length === 0 ? (
                        <div className="flex items-center justify-center h-[200px]">
                          <p className="text-muted-foreground">No active days data available</p>
                        </div>
                      ) : (
                        <ChartContainer config={chartConfig} className="h-[200px] w-full">
                          <BarChart data={activeDaysData}>
                            <XAxis dataKey="week" axisLine={false} tickLine={false} className="text-xs" />
                            <YAxis axisLine={false} tickLine={false} className="text-xs" domain={[0, 7]} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="days" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Time & Effort Summary */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Time & Effort Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMetrics ? (
                      <div className="flex items-center justify-center h-[200px]">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : timeLogData.length === 0 ? (
                      <div className="flex items-center justify-center h-[200px]">
                        <p className="text-muted-foreground">No time tracking data available</p>
                      </div>
                    ) : (
                      <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <AreaChart data={timeLogData}>
                          <defs>
                            <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="week" axisLine={false} tickLine={false} className="text-xs" />
                          <YAxis axisLine={false} tickLine={false} className="text-xs" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area
                            type="monotone"
                            dataKey="hours"
                            stroke="hsl(var(--chart-3))"
                            fill="url(#timeGradient)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ChartContainer>
                    )}
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      This shows your logged hours pattern over time, not a productivity measure.
                    </p>
                  </CardContent>
                </Card>

                {/* Feedback View */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Feedback from Your Team Lead
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingObservations ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : feedbackHistory.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">No feedback available yet</p>
                    ) : (
                      <div className="space-y-4">
                        {feedbackHistory.map((feedback, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-accent/50 rounded-lg border border-border"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-foreground text-sm">{feedback.from}</p>
                                <p className="text-xs text-muted-foreground">{feedback.context}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">{feedback.date}</p>
                            </div>
                            <p className="text-sm text-foreground">{feedback.note}</p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Guidance Panel */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Info className="h-5 w-5" />
                      About Your Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-foreground">
                      <p>
                        <strong>This dashboard shows trends, not ratings.</strong> The data here helps you understand
                        your work patterns and provides visibility into your contributions.
                      </p>
                      <p>
                        <strong>Data is used for visibility and support.</strong> Your team lead uses this information
                        to understand workload distribution and provide timely support when needed.
                      </p>
                      <p>
                        <strong>You are not being compared to others.</strong> This is your personal space.
                        There are no rankings, scores, or comparisons with your teammates.
                      </p>
                      <p className="text-muted-foreground text-xs mt-4">
                        If you have questions about any data shown here, please reach out to your team lead.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "progress" && <MyProgress />}
            {activeTab === "feedback" && <MyFeedback />}
          </div>
        </div>

        {/* Notification Panel */}
        <NotificationPanel
          isOpen={isNotificationPanelOpen}
          onClose={() => setIsNotificationPanelOpen(false)}
        />
      </main>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-6 border-b border-border">
            <SheetTitle className="text-left">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                <TeamTuneLogo />
              </Link>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex-1 p-6">
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab("overview");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${activeTab === "overview"
                  ? "font-medium text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                <User className="h-4 w-4" />
                My Overview
              </button>
              <button
                onClick={() => {
                  setActiveTab("progress");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${activeTab === "progress"
                  ? "font-medium text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                <TrendingUp className="h-4 w-4" />
                My Progress
              </button>
              <button
                onClick={() => {
                  setActiveTab("feedback");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${activeTab === "feedback"
                  ? "font-medium text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                <MessageSquare className="h-4 w-4" />
                Feedback
              </button>
            </div>
          </nav>
          <div className="border-t border-border p-6">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={async () => {
                await handleLogout();
                setIsMobileMenuOpen(false);
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MemberDashboard;
