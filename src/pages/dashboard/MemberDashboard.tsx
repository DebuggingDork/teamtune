import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import {
  User,
  TrendingUp,
  Calendar,
  Clock,
  MessageSquare,
  Info,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
// Import shared hooks
import { useDateRanges } from "@/hooks/useDateRanges";
import { ChartWrapper } from "@/components/shared";
import { MemberLayout } from "@/components/layouts/MemberLayout";

const chartConfig = {
  contributions: { label: "Contributions", color: "hsl(var(--primary))" },
  days: { label: "Active Days", color: "hsl(var(--chart-2))" },
  hours: { label: "Hours", color: "hsl(var(--chart-3))" },
};

const MemberDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const dateRanges = useDateRanges(42); // Last 6 weeks
  
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


  // Transform profile data
  const personalData = useMemo(() => {
    if (!profile) return null;
    const profileAny = profile as unknown as Record<string, unknown>;
    return {
      name: profile.full_name || user?.full_name || "Member",
      email: profile.email || user?.email || "",
      team: (profileAny.teams as Array<{team_name: string}> | undefined)?.[0]?.team_name || "Team",
      project: (profileAny.projects as Array<{project_name: string}> | undefined)?.[0]?.project_name || "Project",
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
    const metricsAny = metrics as unknown as Record<string, unknown> | undefined;
    const timeTracking = metricsAny?.time_tracking as { total_hours_logged?: number } | undefined;
    if (!timeTracking) return [];
    
    // Since we don't have weekly breakdown, create a simplified representation
    const totalHours = timeTracking.total_hours_logged || 0;
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

  // Determine header title based on active tab
  const headerTitle = activeTab === "overview" ? "My Overview" 
    : activeTab === "progress" ? "My Progress" 
    : "Feedback";

  return (
    <MemberLayout headerTitle={headerTitle}>
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
            <Card className="mb-8 bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-background/50 transition-all duration-500 group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  Personal Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {isLoadingProfile ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !personalData ? (
                  <p className="text-center text-muted-foreground py-8">No profile data available</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <p className="text-sm text-muted-foreground mb-2">Name</p>
                      <p className="text-lg font-semibold text-foreground">{personalData.name}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <p className="text-sm text-muted-foreground mb-2">Team</p>
                      <p className="text-lg font-semibold text-foreground">{personalData.team}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <p className="text-sm text-muted-foreground mb-2">Project</p>
                      <p className="text-lg font-semibold text-foreground">{personalData.project}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <p className="text-sm text-muted-foreground mb-2">Status</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-background/50 transition-all duration-500 group">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold">
                    <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    Contribution Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {isLoadingGitActivity ? (
                    <div className="flex items-center justify-center h-[220px]">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : contributionTrendData.length === 0 ? (
                    <div className="flex items-center justify-center h-[220px]">
                      <p className="text-muted-foreground">No contribution data available</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
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
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-background/50 transition-all duration-500 group">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold">
                    <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    Active Days Pattern
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {isLoadingGitActivity ? (
                    <div className="flex items-center justify-center h-[220px]">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : activeDaysData.length === 0 ? (
                    <div className="flex items-center justify-center h-[220px]">
                      <p className="text-muted-foreground">No active days data available</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                      <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <BarChart data={activeDaysData}>
                        <XAxis dataKey="week" axisLine={false} tickLine={false} className="text-xs" />
                        <YAxis axisLine={false} tickLine={false} className="text-xs" domain={[0, 7]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="days" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Time & Effort Summary */}
            <Card className="mb-8 bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-background/50 transition-all duration-500 group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  Time & Effort Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {isLoadingMetrics ? (
                  <div className="flex items-center justify-center h-[220px]">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : timeLogData.length === 0 ? (
                  <div className="flex items-center justify-center h-[220px]">
                    <p className="text-muted-foreground">No time tracking data available</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
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
                    </div>
                  )}
                <p className="text-xs text-muted-foreground mt-4 text-center px-4">
                  This shows your logged hours pattern over time, not a productivity measure.
                </p>
              </CardContent>
            </Card>

            {/* Feedback View */}
            <Card className="mb-8 bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-background/50 transition-all duration-500 group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  Feedback from Your Team Lead
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {isLoadingObservations ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : feedbackHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No feedback available yet</p>
                ) : (
                  <div className="space-y-4">
                    {feedbackHistory.map((feedback, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
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
            <Card className="bg-primary/10 backdrop-blur-xl border border-primary/20 shadow-2xl hover:shadow-3xl hover:bg-primary/15 transition-all duration-500 group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-primary text-xl font-bold">
                  <div className="p-3 bg-primary/30 backdrop-blur-sm rounded-xl border border-primary/30 group-hover:bg-primary/40 transition-all duration-300">
                    <Info className="h-5 w-5" />
                  </div>
                  About Your Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-4 text-sm text-foreground">
                  <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <p>
                      <strong>This dashboard shows trends, not ratings.</strong> The data here helps you understand 
                      your work patterns and provides visibility into your contributions.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <p>
                      <strong>Data is used for visibility and support.</strong> Your team lead uses this information 
                      to understand workload distribution and provide timely support when needed.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <p>
                      <strong>You are not being compared to others.</strong> This is your personal space. 
                      There are no rankings, scores, or comparisons with your teammates.
                    </p>
                  </div>
                  <p className="text-muted-foreground text-xs mt-6 text-center px-4">
                    If you have questions about any data shown here, please reach out to your team lead.
                  </p>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          )}

      {activeTab === "progress" && <MyProgress />}
      {activeTab === "feedback" && <MyFeedback />}
    </MemberLayout>
  );
};

export default MemberDashboard;
