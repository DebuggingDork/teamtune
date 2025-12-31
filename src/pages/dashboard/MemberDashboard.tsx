import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useMyProfile, useMyPerformance, useMyObservations, useMyGitActivity, useMyMetrics } from "@/hooks/useEmployee";
import { format } from "date-fns";
import MyProgress from "@/components/employee/MyProgress";
import MyFeedback from "@/components/employee/MyFeedback";

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
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dateRanges = useMemo(() => getDateRanges(), []);
  
  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname === "/dashboard/member/progress") return "progress";
    if (location.pathname === "/dashboard/member/feedback") return "feedback";
    return "overview";
  };
  const [activeTab, setActiveTab] = useState(getActiveTab());
  
  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

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
      team: profile.teams?.[0]?.team_name || "Team",
      project: profile.projects?.[0]?.project_name || "Project",
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
            <Link
              to="/dashboard/member"
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${
                activeTab === "overview" 
                  ? "font-medium text-foreground bg-accent" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <User className="h-4 w-4" />
              My Overview
            </Link>
            <Link
              to="/dashboard/member/progress"
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${
                activeTab === "progress" 
                  ? "font-medium text-foreground bg-accent" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              My Progress
            </Link>
            <Link
              to="/dashboard/member/feedback"
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${
                activeTab === "feedback" 
                  ? "font-medium text-foreground bg-accent" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Feedback
            </Link>
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
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="lg:hidden cursor-pointer"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <TeamTuneLogo showText={false} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              
              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 p-2">
                    <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-foreground">
                        {personalData?.name || user?.full_name || "Member"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {personalData?.email || user?.email || "Member"}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem 
                    onClick={() => navigate("/dashboard/member/profile")}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Welcome, {personalData?.name?.split(' ')[0] || user?.full_name?.split(' ')[0] || "Member"}!
              </h1>
              <p className="text-muted-foreground mb-8">Your personal workspace and progress overview.</p>

            {/* Personal Overview */}
            <Card className="mb-6 bg-gradient-to-br from-card via-card to-card/80 border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  Personal Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProfile ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !personalData ? (
                  <p className="text-center text-muted-foreground py-4">No profile data available</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="text-lg font-semibold text-foreground">{personalData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Team</p>
                      <p className="text-lg font-semibold text-foreground">{personalData.team}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Project</p>
                      <p className="text-lg font-semibold text-foreground">{personalData.project}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-chart-1/20 text-chart-1">
                        <CheckCircle className="h-3 w-3" />
                        {personalData.status}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contribution Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
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

              <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
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
            <Card className="mb-6 bg-gradient-to-br from-card via-card to-card/80 border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
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
            <Card className="mb-6 bg-gradient-to-br from-card via-card to-card/80 border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
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
                      className="p-4 bg-gradient-to-r from-accent/30 to-accent/10 rounded-xl border border-border/30 hover:border-border/60 hover:shadow-sm transition-all duration-300"
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
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-primary/5 border-primary/30 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary text-xl font-bold">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Info className="h-5 w-5" />
                  </div>
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
              <Link
                to="/dashboard/member"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${
                  activeTab === "overview" 
                    ? "font-medium text-foreground bg-accent" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <User className="h-4 w-4" />
                My Overview
              </Link>
              <Link
                to="/dashboard/member/progress"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${
                  activeTab === "progress" 
                    ? "font-medium text-foreground bg-accent" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                My Progress
              </Link>
              <Link
                to="/dashboard/member/feedback"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors ${
                  activeTab === "feedback" 
                    ? "font-medium text-foreground bg-accent" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Feedback
              </Link>
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
