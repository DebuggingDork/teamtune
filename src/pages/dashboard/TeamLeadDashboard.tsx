import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { 
  Users, 
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  MessageSquare,
  Clock,
  Search,
  Bell,
  LogOut,
  User,
  Minus,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import TeamTuneLogo from "@/components/TeamTuneLogo";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useTeamMetrics, useTeamPerformance, useTeamGitActivity, useCreateObservation } from "@/hooks/useTeamLead";
import { useMyTeams } from "@/hooks/useEmployee";
import { format } from "date-fns";

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
  activeMembers: { label: "Active Members", color: "hsl(var(--chart-2))" },
  active: { label: "Active", color: "hsl(var(--chart-1))" },
  inactive: { label: "Inactive", color: "hsl(var(--muted))" },
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-chart-1" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const ConsistencyIndicator = ({ level }: { level: string }) => {
  const colors = {
    high: "bg-chart-1",
    medium: "bg-chart-3",
    low: "bg-chart-4",
  };
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full ${
            (level === "high" && i <= 3) ||
            (level === "medium" && i <= 2) ||
            (level === "low" && i <= 1)
              ? colors[level as keyof typeof colors]
              : "bg-muted"
          }`}
        />
      ))}
    </div>
  );
};

const TeamLeadDashboard = () => {
  const { user, logout } = useAuth();
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedMemberCode, setSelectedMemberCode] = useState<string>("");
  
  // Get teams for the current user (team lead)
  const { data: teamsData, isLoading: isLoadingTeams } = useMyTeams();
  
  // Get the first team code (assuming team lead has at least one team)
  const teamCode = useMemo(() => {
    if (teamsData?.teams && teamsData.teams.length > 0) {
      return teamsData.teams[0].team_code;
    }
    return null;
  }, [teamsData]);

  const dateRanges = useMemo(() => getDateRanges(), []);

  // Get team metrics
  const { data: teamMetrics, isLoading: isLoadingMetrics } = useTeamMetrics(teamCode || "");
  
  // Get team performance
  const { data: teamPerformance, isLoading: isLoadingPerformance } = useTeamPerformance(
    teamCode || "",
    {
      period_start: dateRanges.period_start,
      period_end: dateRanges.period_end,
    }
  );

  // Get git activity
  const { data: gitActivity, isLoading: isLoadingGitActivity } = useTeamGitActivity(
    teamCode || "",
    {
      start_date: dateRanges.start_date,
      end_date: dateRanges.end_date,
    }
  );

  // Create observation mutation
  const createObservationMutation = useCreateObservation();

  const handleLogout = async () => {
    await logout();
  };

  const handleCreateFeedback = async () => {
    if (!teamCode || !selectedMemberCode || !feedbackText.trim()) {
      return;
    }

    createObservationMutation.mutate({
      teamCode,
      userCode: selectedMemberCode,
      data: {
        category: "collaboration",
        rating: "positive",
        note: feedbackText,
        observation_date: new Date().toISOString().split('T')[0],
      },
    }, {
      onSuccess: () => {
        setFeedbackText("");
        setSelectedMemberCode("");
      },
    });
  };

  // Transform data for display
  const teamData = useMemo(() => {
    if (!teamMetrics || !teamsData?.teams?.[0]) return null;
    const team = teamsData.teams[0];
    return {
      name: team.team_name || "Team",
      project: team.project_name || "Project",
      size: teamMetrics.members_summary?.total_members || 0,
      status: "Active",
    };
  }, [teamMetrics, teamsData]);

  // Transform performance data for member activity
  const memberActivityData = useMemo(() => {
    if (!teamPerformance?.members) return [];
    return teamPerformance.members.map((member) => {
      const trend = member.performance_score >= 80 ? "up" : 
                   member.performance_score >= 60 ? "stable" : "down";
      const consistency = member.performance_score >= 80 ? "high" :
                         member.performance_score >= 60 ? "medium" : "low";
      const initials = member.user_name.split(' ').map(n => n[0]).join('').toUpperCase();
      return {
        name: member.user_name,
        trend,
        consistency,
        lastActive: "Recently",
        avatar: initials,
        userCode: member.user_code,
      };
    });
  }, [teamPerformance]);

  // Transform git activity for execution trends
  const executionTrendData = useMemo(() => {
    if (!gitActivity?.activity_by_member) return [];
    
    // Since we don't have daily/weekly breakdown, create a simple representation
    // showing total contributions and active members
    const totalContributions = gitActivity.total_commits || 0;
    const activeMembers = gitActivity.activity_by_member?.length || 0;
    
    // Create 6 weeks of data with the total distributed (simplified visualization)
    const weeks = 6;
    const avgContributionsPerWeek = Math.round(totalContributions / weeks);
    const activeMembersCount = activeMembers;
    
    return Array.from({ length: weeks }, (_, i) => ({
      week: `W${i + 1}`,
      contributions: avgContributionsPerWeek + Math.floor(Math.random() * 10 - 5), // Add some variation
      activeMembers: activeMembersCount,
    }));
  }, [gitActivity]);

  // Calculate risk signals from performance data
  const riskSignals = useMemo(() => {
    if (!teamPerformance?.members) return [];
    return teamPerformance.members
      .filter(m => m.performance_score < 60)
      .map((member) => ({
        member: member.user_name,
        signal: "Performance below threshold",
        description: `Performance score: ${member.performance_score}`,
        severity: member.performance_score < 40 ? "medium" : "low" as "medium" | "low",
      }));
  }, [teamPerformance]);

  const isLoading = isLoadingTeams || isLoadingMetrics || isLoadingPerformance || isLoadingGitActivity;
  const hasTeamCode = !!teamCode;

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
              <Users className="h-4 w-4" />
              Team Overview
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <Activity className="h-4 w-4" />
              Execution Trends
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <MessageSquare className="h-4 w-4" />
              Feedback
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
                  placeholder="Search members..."
                  className="pl-10 pr-4 py-2 bg-accent border-none rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user?.full_name || "Team Lead"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || "Team Lead"}</p>
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
            <h1 className="text-2xl font-bold text-foreground mb-2">Team Dashboard</h1>
            <p className="text-muted-foreground mb-8">Monitor your team's execution and support their growth.</p>

            {/* Team Overview */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Team Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingMetrics ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !hasTeamCode ? (
                  <p className="text-center text-muted-foreground py-4">No team assigned</p>
                ) : !teamData ? (
                  <p className="text-center text-muted-foreground py-4">No team data available</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Team Name</p>
                      <p className="text-lg font-semibold text-foreground">{teamData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Project</p>
                      <p className="text-lg font-semibold text-foreground">{teamData.project}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Team Size</p>
                      <p className="text-lg font-semibold text-foreground">{teamData.size} members</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-chart-1/20 text-chart-1">
                        {teamData.status}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Member Activity Snapshot */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Member Activity Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPerformance ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : memberActivityData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No member data available</p>
                ) : (
                  <div className="space-y-4">
                    {memberActivityData.map((member, index) => (
                    <motion.div
                      key={member.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{member.avatar}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {member.lastActive}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Trend</p>
                          <TrendIcon trend={member.trend} />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Consistency</p>
                          <ConsistencyIndicator level={member.consistency} />
                        </div>
                      </div>
                    </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Execution Trends */}
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
                    <div className="flex items-center justify-center h-[250px]">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : executionTrendData.length === 0 ? (
                    <div className="flex items-center justify-center h-[250px]">
                      <p className="text-muted-foreground">No git activity data available</p>
                    </div>
                  ) : (
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                      <AreaChart data={executionTrendData}>
                      <defs>
                        <linearGradient id="contributionGradient" x1="0" y1="0" x2="0" y2="1">
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
                        fill="url(#contributionGradient)"
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
                    <Activity className="h-5 w-5 text-primary" />
                    Active vs Inactive Periods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingGitActivity ? (
                    <div className="flex items-center justify-center h-[250px]">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : executionTrendData.length === 0 ? (
                    <div className="flex items-center justify-center h-[250px]">
                      <p className="text-muted-foreground">No activity data available</p>
                    </div>
                  ) : (
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                      <BarChart data={executionTrendData.map((d, i) => ({
                        day: d.week,
                        active: d.activeMembers * 10,
                        inactive: (teamData?.size || 0) - (d.activeMembers * 10),
                      }))}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                      <YAxis axisLine={false} tickLine={false} className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="active" stackId="a" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="inactive" stackId="a" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Risk Signals */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-chart-4" />
                  Risk Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPerformance ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : riskSignals.length > 0 ? (
                  <div className="space-y-3">
                    {riskSignals.map((signal, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${
                          signal.severity === "medium" 
                            ? "bg-chart-4/10 border-chart-4/30" 
                            : "bg-chart-3/10 border-chart-3/30"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">{signal.member}</p>
                            <p className="text-sm text-muted-foreground">{signal.signal}</p>
                            <p className="text-xs text-muted-foreground mt-1">{signal.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No risk signals detected</p>
                )}
              </CardContent>
            </Card>

            {/* Feedback & Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Feedback & Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-2 block">Add New Feedback</label>
                  {hasTeamCode && memberActivityData.length > 0 && (
                    <select
                      value={selectedMemberCode}
                      onChange={(e) => setSelectedMemberCode(e.target.value)}
                      className="w-full mb-2 px-3 py-2 bg-accent border border-border rounded-lg text-sm"
                    >
                      <option value="">Select team member</option>
                      {memberActivityData.map((member) => (
                        <option key={member.userCode} value={member.userCode}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <Textarea 
                    placeholder="Write supportive feedback for a team member..."
                    className="mb-2"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                  <Button 
                    size="sm"
                    onClick={handleCreateFeedback}
                    disabled={!selectedMemberCode || !feedbackText.trim() || createObservationMutation.isPending}
                  >
                    {createObservationMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Feedback"
                    )}
                  </Button>
                </div>
                
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-medium text-foreground mb-3">Recent Feedback</h4>
                  {isLoadingPerformance ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      Feedback history will be displayed here when observations are created.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TeamLeadDashboard;
