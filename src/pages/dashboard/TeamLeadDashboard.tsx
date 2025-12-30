import { motion } from "framer-motion";
import { TeamLeadLayout } from "@/components/layouts/TeamLeadLayout";
import { useState, useMemo } from "react";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  MessageSquare,
  Clock,

  User,
  Minus,
  Loader2,
  Edit,
  Trash2,
  Filter,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import {
  useTeamMetrics,
  useTeamPerformance,
  useTeamGitActivity,
  useCreateObservation,
  useMemberObservations,
  useUpdateObservation,
  useDeleteObservation
} from "@/hooks/useTeamLead";
import { useMyTeams } from "@/hooks/useEmployee";
import { format } from "date-fns";
import type { ObservationCategory, ObservationRating, Observation } from "@/api/types";
import { toast } from "@/hooks/use-toast";

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
          className={`h-2 w-2 rounded-full ${(level === "high" && i <= 3) ||
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
  const { user, logout, isAuthenticated } = useAuth();
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedMemberCode, setSelectedMemberCode] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<ObservationCategory>("collaboration");
  const [selectedRating, setSelectedRating] = useState<ObservationRating>("positive");

  const [filterMemberCode, setFilterMemberCode] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [editingObservation, setEditingObservation] = useState<Observation | null>(null);
  const [deletingObservation, setDeletingObservation] = useState<Observation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Get teams for the current user (team lead) - only when authenticated
  const { data: teamsData, isLoading: isLoadingTeams, error: teamsError } = useMyTeams(undefined, isAuthenticated);

  // Get the first team code (assuming team lead has at least one team)
  const teamCode = useMemo(() => {
    if (teamsData?.teams && teamsData.teams.length > 0) {
      return teamsData.teams[0].team_code;
    }
    return null;
  }, [teamsData]);

  const dateRanges = useMemo(() => getDateRanges(), []);

  // Get team metrics (hook already handles enabled state based on teamCode)
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
  const updateObservationMutation = useUpdateObservation();
  const deleteObservationMutation = useDeleteObservation();

  // Fetch observations for all team members
  const allObservations = useMemo(() => {
    if (!teamPerformance?.members || !teamCode) return [];

    // We'll fetch observations for each member
    // For now, we'll use a simplified approach - fetch for the first member as example
    // In a real implementation, you might want to fetch all at once or use a different endpoint
    return [];
  }, [teamPerformance, teamCode]);




  const handleCreateFeedback = async () => {
    if (!teamCode || !selectedMemberCode || !feedbackText.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a team member and enter feedback text.",
        variant: "destructive",
      });
      return;
    }

    createObservationMutation.mutate({
      teamCode,
      userCode: selectedMemberCode,
      data: {
        category: selectedCategory,
        rating: selectedRating,
        note: feedbackText,
        observation_date: new Date().toISOString().split('T')[0],
      },
    }, {
      onSuccess: () => {
        setFeedbackText("");
        setSelectedMemberCode("");
        setSelectedCategory("collaboration");
        setSelectedRating("positive");
        toast({
          title: "Success",
          description: "Feedback created successfully.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to create feedback.",
          variant: "destructive",
        });
      },
    });
  };

  const handleEditObservation = (observation: Observation) => {
    setEditingObservation(observation);
    setFeedbackText(observation.note);
    setSelectedCategory(observation.category);
    setSelectedRating(observation.rating);
    setSelectedMemberCode(observation.user_code);
    setIsEditDialogOpen(true);
  };

  const handleUpdateObservation = async () => {
    if (!editingObservation || !feedbackText.trim()) {
      return;
    }

    updateObservationMutation.mutate({
      observationCode: editingObservation.observation_code,
      data: {
        category: selectedCategory,
        rating: selectedRating,
        note: feedbackText,
      },
    }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setEditingObservation(null);
        setFeedbackText("");
        setSelectedMemberCode("");
        setSelectedCategory("collaboration");
        setSelectedRating("positive");
        toast({
          title: "Success",
          description: "Feedback updated successfully.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to update feedback.",
          variant: "destructive",
        });
      },
    });
  };

  const handleDeleteObservation = (observation: Observation) => {
    setDeletingObservation(observation);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteObservation = async () => {
    if (!deletingObservation) return;

    deleteObservationMutation.mutate(deletingObservation.observation_code, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setDeletingObservation(null);
        toast({
          title: "Success",
          description: "Feedback deleted successfully.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to delete feedback.",
          variant: "destructive",
        });
      },
    });
  };

  // Transform data for display
  const teamData = useMemo(() => {
    if (!teamsData?.teams?.[0]) return null;
    const team = teamsData.teams[0];
    return {
      name: team.name || "Team",
      project: team.project_name || "Project",
      size: teamPerformance?.members_summary?.total_members || 0,
      status: "Active",
    };
  }, [teamsData, teamPerformance]);

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

  // Get observations for filtered member
  // If "all" is selected, use the first member's code or selectedMemberCode if available
  const memberCodeToFetch = filterMemberCode !== "all"
    ? filterMemberCode
    : (selectedMemberCode || (memberActivityData.length > 0 ? memberActivityData[0].userCode : ""));
  const { data: observationsData, isLoading: isLoadingObservations } = useMemberObservations(
    teamCode || "",
    memberCodeToFetch,
    { page: 1, limit: 50 }
  );

  // Filter observations
  const filteredObservations = useMemo(() => {
    if (!observationsData?.observations) return [];

    return observationsData.observations.filter((obs) => {
      if (filterCategory && filterCategory !== "all" && obs.category !== filterCategory) return false;
      if (filterMemberCode && filterMemberCode !== "all" && obs.user_code !== filterMemberCode) return false;
      return true;
    });
  }, [observationsData, filterCategory, filterMemberCode]);

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
      contributions: avgContributionsPerWeek,
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
    <TeamLeadLayout>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" data-section="trends">
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
                    className={`p-4 rounded-lg border ${signal.severity === "medium"
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
        <Card data-section="feedback">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Feedback & Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add New Feedback Form */}
            <div className="mb-6 p-4 bg-accent/30 rounded-lg border border-border">
              <label className="text-sm font-medium text-foreground mb-3 block">Add New Feedback</label>
              {hasTeamCode && memberActivityData.length > 0 && (
                <div className="space-y-3">
                  <Select
                    value={selectedMemberCode}
                    onValueChange={setSelectedMemberCode}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {memberActivityData.map((member) => (
                        <SelectItem key={member.userCode} value={member.userCode}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      value={selectedCategory}
                      onValueChange={(value) => setSelectedCategory(value as ObservationCategory)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="communication">Communication</SelectItem>
                        <SelectItem value="leadership">Leadership</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                        <SelectItem value="quality">Quality</SelectItem>
                        <SelectItem value="collaboration">Collaboration</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedRating}
                      onValueChange={(value) => setSelectedRating(value as ObservationRating)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Textarea
                    placeholder="Write supportive feedback for a team member..."
                    className="min-h-[100px]"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={handleCreateFeedback}
                    disabled={!selectedMemberCode || !feedbackText.trim() || createObservationMutation.isPending || !teamCode}
                    className="w-full"
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
              )}
            </div>

            {/* Feedback History */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-foreground">Feedback History</h4>
                <div className="flex items-center gap-2">
                  <Select
                    value={filterMemberCode}
                    onValueChange={setFilterMemberCode}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      {memberActivityData.map((member) => (
                        <SelectItem key={member.userCode} value={member.userCode}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                      <SelectItem value="collaboration">Collaboration</SelectItem>
                    </SelectContent>
                  </Select>
                  {(filterMemberCode !== "all" || filterCategory !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterMemberCode("all");
                        setFilterCategory("all");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {isLoadingObservations ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredObservations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  {filterMemberCode !== "all" || filterCategory !== "all"
                    ? "No feedback found matching the filters."
                    : "No feedback has been created yet. Start by adding feedback above."}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredObservations.map((observation) => (
                    <motion.div
                      key={observation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-accent/30 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-foreground">{observation.user_name}</span>
                            <Badge
                              variant={
                                observation.rating === "positive" ? "default" :
                                  observation.rating === "neutral" ? "secondary" : "destructive"
                              }
                              className="text-xs"
                            >
                              {observation.rating}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {observation.category}
                            </Badge>
                            {observation.related_task_title && (
                              <Badge variant="outline" className="text-xs">
                                Task: {observation.related_task_code}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground mb-2">{observation.note}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{format(new Date(observation.observation_date), "MMM d, yyyy")}</span>
                            <span>•</span>
                            <span>{format(new Date(observation.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditObservation(observation)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteObservation(observation)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Feedback Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Feedback</DialogTitle>
              <DialogDescription>
                Update the feedback details below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value as ObservationCategory)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="collaboration">Collaboration</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedRating}
                  onValueChange={(value) => setSelectedRating(value as ObservationRating)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                placeholder="Feedback note..."
                className="min-h-[100px]"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingObservation(null);
                  setFeedbackText("");
                  setSelectedMemberCode("");
                  setSelectedCategory("collaboration");
                  setSelectedRating("positive");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateObservation}
                disabled={!feedbackText.trim() || updateObservationMutation.isPending}
              >
                {updateObservationMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Feedback"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this feedback? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingObservation(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteObservation}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteObservationMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </TeamLeadLayout>
  );
};

export default TeamLeadDashboard;