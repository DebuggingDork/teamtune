import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Filter,
  X,
  Edit,
  Trash2,
  Loader2,
  Plus,
  Eye,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  FileText,
  Star,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamLeadLayout } from "@/components/layouts/TeamLeadLayout";
import {
  useMyTeams,
  useTeamInfo,
  useTeamPerformance,
  useAllFeedbackRequests,
  useTeamFeedbackRequests,
  useCreateFeedbackRequestForMember,
  useUpdateFeedbackRequest,
  useDeleteFeedbackRequest,
  useFeedbackRequest,
  useFeedbackSummary,
  useFeedbackResponses,
  useMemberObservations,
  useTeamObservations,
  useCreateObservation,
  useUpdateObservation,
  useDeleteObservation,
} from "@/hooks/useTeamLead";
import { toast } from "@/hooks/use-toast";
import type {
  FeedbackType,
  FeedbackStatus,
  ReviewerRelationship,
  QuestionType,
  FeedbackRequestListItem,
  FeedbackQuestion,
  CreateFeedbackRequestData,
  ObservationCategory,
  ObservationRating,
  Observation,
} from "@/api/types/index";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const FeedbackPage = () => {
  const [activeTab, setActiveTab] = useState<"quick-feedback" | "360-requests" | "view-requests">("quick-feedback");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<FeedbackRequestListItem | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<FeedbackRequestListItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Quick Feedback (Observations) state
  const [quickFeedbackMemberCode, setQuickFeedbackMemberCode] = useState<string>("");
  const [quickFeedbackText, setQuickFeedbackText] = useState("");
  const [quickFeedbackCategory, setQuickFeedbackCategory] = useState<ObservationCategory>("collaboration");
  const [quickFeedbackRating, setQuickFeedbackRating] = useState<ObservationRating>("positive");
  const [filterMemberCode, setFilterMemberCode] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<string>("all");

  // 360° Feedback Request state
  const [selectedMemberCode, setSelectedMemberCode] = useState<string>("");
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackDescription, setFeedbackDescription] = useState("");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("360");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [deadline, setDeadline] = useState("");
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([
    { id: 1, text: "How would you rate this person's collaboration skills?", type: "rating", scale: 5 },
    { id: 2, text: "What are their key strengths?", type: "text" },
  ]);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);

  // Get teams
  const { data: teamsData, isLoading: isLoadingTeams } = useMyTeams();
  const teamCode = useMemo(() => {
    if (teamsData?.teams && teamsData.teams.length > 0) {
      return teamsData.teams[0].team_code;
    }
    return null;
  }, [teamsData]);

  // Get team info to get member list
  const { data: teamInfo, isLoading: isLoadingTeamInfo } = useTeamInfo(teamCode || "");

  // Get member activity data from team info
  const memberActivityData = useMemo(() => {
    if (!teamInfo?.members) return [];
    return teamInfo.members.map((member) => ({
      name: member.full_name,
      userCode: member.user_code,
      userId: member.user_id,
    }));
  }, [teamInfo]);

  // Get all team observations with filters
  const observationFilters = useMemo(() => {
    const filters: { page?: number; limit?: number; category?: string; rating?: string } = {
      page: 1,
      limit: 100,
    };

    if (filterCategory !== "all") {
      filters.category = filterCategory;
    }

    if (filterRating !== "all") {
      filters.rating = filterRating;
    }

    return filters;
  }, [filterCategory, filterRating]);

  const { data: observationsData, isLoading: isLoadingObservations } = useTeamObservations(
    teamCode || "",
    observationFilters
  );

  // Get feedback requests
  const { data: allRequests, isLoading: isLoadingAll } = useAllFeedbackRequests();
  const { data: teamRequests, isLoading: isLoadingTeam } = useTeamFeedbackRequests(teamCode || "");

  // Mutations
  const createRequestMutation = useCreateFeedbackRequestForMember();
  const updateRequestMutation = useUpdateFeedbackRequest();
  const deleteRequestMutation = useDeleteFeedbackRequest();
  const createObservationMutation = useCreateObservation();
  const updateObservationMutation = useUpdateObservation();
  const deleteObservationMutation = useDeleteObservation();

  // Filter observations (category and rating are handled by backend)
  const filteredObservations = useMemo(() => {
    if (!observationsData?.observations) return [];

    let filtered = observationsData.observations;

    // Search filter (frontend only)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (obs) =>
          obs.note.toLowerCase().includes(query) ||
          obs.user_name.toLowerCase().includes(query) ||
          obs.category.toLowerCase().includes(query)
      );
    }

    // Member filter (frontend only)
    if (filterMemberCode !== "all") {
      filtered = filtered.filter((obs) => obs.user_code === filterMemberCode);
    }

    return filtered;
  }, [observationsData, searchQuery, filterMemberCode]);

  // Filter feedback requests
  const filteredRequests = useMemo(() => {
    const requests = allRequests || [];
    let filtered = [...requests];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.title.toLowerCase().includes(query) ||
          req.subject_name.toLowerCase().includes(query) ||
          req.request_code.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((req) => req.status === filterStatus);
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((req) => req.feedback_type === filterType);
    }

    return filtered;
  }, [allRequests, searchQuery, filterStatus, filterType]);

  const handleQuickFeedback = async () => {
    if (!teamCode || !quickFeedbackMemberCode || !quickFeedbackText.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a team member and enter feedback text.",
        variant: "destructive",
      });
      return;
    }

    createObservationMutation.mutate(
      {
        teamCode,
        userCode: quickFeedbackMemberCode,
        data: {
          category: quickFeedbackCategory,
          rating: quickFeedbackRating,
          note: quickFeedbackText,
          observation_date: new Date().toISOString().split('T')[0],
        },
      },
      {
        onSuccess: () => {
          setQuickFeedbackText("");
          setQuickFeedbackMemberCode("");
          setQuickFeedbackCategory("collaboration");
          setQuickFeedbackRating("positive");
          toast({
            title: "Success",
            description: "Feedback submitted successfully.",
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error?.response?.data?.message || "Failed to submit feedback.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleCreate360Feedback = async () => {
    if (!selectedMemberCode || !feedbackTitle.trim() || !deadline || selectedReviewers.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select at least one reviewer.",
        variant: "destructive",
      });
      return;
    }

    const data: CreateFeedbackRequestData = {
      title: feedbackTitle,
      description: feedbackDescription,
      feedback_type: feedbackType,
      reviewers: selectedReviewers.map(userId => ({
        user_id: userId,
        relationship: "peer" as ReviewerRelationship,
        status: "pending" as const,
      })),
      questions: questions,
      anonymous: isAnonymous,
      deadline: deadline,
    };

    createRequestMutation.mutate(
      { userCode: selectedMemberCode, data },
      {
        onSuccess: () => {
          // Reset form
          setSelectedMemberCode("");
          setFeedbackTitle("");
          setFeedbackDescription("");
          setFeedbackType("360");
          setIsAnonymous(true);
          setDeadline("");
          setQuestions([
            { id: 1, text: "How would you rate this person's collaboration skills?", type: "rating", scale: 5 },
            { id: 2, text: "What are their key strengths?", type: "text" },
          ]);
          setSelectedReviewers([]);
          setActiveTab("view-requests");
          toast({
            title: "Success",
            description: "360° Feedback request created successfully.",
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error?.response?.data?.message || "Failed to create feedback request.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDeleteRequest = (request: FeedbackRequestListItem) => {
    setDeletingRequest(request);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRequest = async () => {
    if (!deletingRequest) return;

    deleteRequestMutation.mutate(deletingRequest.request_code, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setDeletingRequest(null);
        toast({
          title: "Success",
          description: "Feedback request deleted successfully.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to delete feedback request.",
          variant: "destructive",
        });
      },
    });
  };

  const handleViewRequest = (request: FeedbackRequestListItem) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    const variants: Record<FeedbackStatus, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      draft: { variant: "secondary", icon: FileText },
      active: { variant: "default", icon: Clock },
      completed: { variant: "outline", icon: CheckCircle2 },
      cancelled: { variant: "destructive", icon: AlertCircle },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: FeedbackType) => {
    return (
      <Badge variant="outline" className="gap-1">
        <Users className="h-3 w-3" />
        {type}
      </Badge>
    );
  };

  const addQuestion = () => {
    const newId = Math.max(...questions.map(q => q.id), 0) + 1;
    setQuestions([...questions, { id: newId, text: "", type: "text" }]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, updates: Partial<FeedbackQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  return (
    <TeamLeadLayout
      headerTitle="Feedback Management"
      headerDescription="Give quick feedback or create comprehensive 360° feedback requests"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quick Feedback</p>
                  <h3 className="text-2xl font-bold mt-1">{filteredObservations.length}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">360° Requests</p>
                  <h3 className="text-2xl font-bold mt-1">{allRequests?.length || 0}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Requests</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {allRequests?.filter(r => r.status === "active").length || 0}
                  </h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                  <h3 className="text-2xl font-bold mt-1">{memberActivityData.length}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick-feedback" className="gap-2">
              <Star className="h-4 w-4" />
              Quick Feedback
            </TabsTrigger>
            <TabsTrigger value="360-requests" className="gap-2">
              <Plus className="h-4 w-4" />
              Create 360° Request
            </TabsTrigger>
            <TabsTrigger value="view-requests" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              View All Requests
            </TabsTrigger>
          </TabsList>

          {/* Quick Feedback Tab */}
          <TabsContent value="quick-feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Give Quick Feedback
                </CardTitle>
                <CardDescription>
                  Provide immediate feedback or observations for your team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!teamCode ? (
                  <p className="text-center text-muted-foreground py-4">No team assigned</p>
                ) : memberActivityData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No team members available</p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-medium text-foreground">Team Member *</Label>
                      <Select value={quickFeedbackMemberCode} onValueChange={setQuickFeedbackMemberCode}>
                        <SelectTrigger>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-sm font-medium text-foreground">Category</Label>
                        <Select
                          value={quickFeedbackCategory}
                          onValueChange={(value) => setQuickFeedbackCategory(value as ObservationCategory)}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                      </div>

                      <div className="grid gap-2">
                        <Label className="text-sm font-medium text-foreground">Rating</Label>
                        <Select
                          value={quickFeedbackRating}
                          onValueChange={(value) => setQuickFeedbackRating(value as ObservationRating)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-sm font-medium text-foreground">Feedback Note *</Label>
                      <Textarea
                        placeholder="Write your feedback or observation..."
                        className="min-h-[120px]"
                        value={quickFeedbackText}
                        onChange={(e) => setQuickFeedbackText(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={handleQuickFeedback}
                      disabled={!quickFeedbackMemberCode || !quickFeedbackText.trim() || createObservationMutation.isPending}
                      className="w-full"
                      size="lg"
                    >
                      {createObservationMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filters for Feedback History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Feedback History Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={filterMemberCode} onValueChange={setFilterMemberCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Members" />
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

                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
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

                  <Select value={filterRating} onValueChange={setFilterRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Ratings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Recent Feedback History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Feedback ({filteredObservations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingObservations ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredObservations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No feedback has been created yet. Start by adding feedback above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredObservations.slice(0, 5).map((observation) => (
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
                                  observation.rating === "positive"
                                    ? "default"
                                    : observation.rating === "neutral"
                                      ? "secondary"
                                      : "destructive"
                                }
                                className="text-xs"
                              >
                                {observation.rating}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {observation.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground mb-2">{observation.note}</p>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(observation.observation_date), "MMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 360° Request Creation Tab */}
          <TabsContent value="360-requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create 360° Feedback Request
                </CardTitle>
                <CardDescription>
                  Set up a comprehensive feedback request with multiple reviewers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!teamCode ? (
                  <p className="text-center text-muted-foreground py-4">No team assigned</p>
                ) : memberActivityData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No team members available</p>
                ) : (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Information</h3>

                      <div className="grid gap-2">
                        <Label>Team Member *</Label>
                        <Select value={selectedMemberCode} onValueChange={setSelectedMemberCode}>
                          <SelectTrigger>
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
                      </div>

                      <div className="grid gap-2">
                        <Label>Title *</Label>
                        <Input
                          placeholder="e.g., Q1 2026 Performance Feedback"
                          value={feedbackTitle}
                          onChange={(e) => setFeedbackTitle(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Provide context for this feedback request..."
                          value={feedbackDescription}
                          onChange={(e) => setFeedbackDescription(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Feedback Type</Label>
                          <Select value={feedbackType} onValueChange={(v) => setFeedbackType(v as FeedbackType)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="360">360° (All directions)</SelectItem>
                              <SelectItem value="peer">Peer Feedback</SelectItem>
                              <SelectItem value="upward">Upward Feedback</SelectItem>
                              <SelectItem value="self">Self Assessment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label>Deadline *</Label>
                          <Input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="anonymous"
                          checked={isAnonymous}
                          onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                        />
                        <Label htmlFor="anonymous" className="cursor-pointer">
                          Anonymous feedback (reviewer identities will be hidden)
                        </Label>
                      </div>
                    </div>

                    {/* Reviewers */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Select Reviewers *</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {memberActivityData
                          .filter(m => m.userCode !== selectedMemberCode)
                          .map((member) => (
                            <div key={member.userId} className="flex items-center space-x-2">
                              <Checkbox
                                id={member.userId}
                                checked={selectedReviewers.includes(member.userId)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedReviewers([...selectedReviewers, member.userId]);
                                  } else {
                                    setSelectedReviewers(selectedReviewers.filter(id => id !== member.userId));
                                  }
                                }}
                              />
                              <Label htmlFor={member.userId} className="cursor-pointer">
                                {member.name}
                              </Label>
                            </div>
                          ))}
                      </div>
                      {selectedReviewers.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {selectedReviewers.length} reviewer(s) selected
                        </p>
                      )}
                    </div>

                    {/* Questions */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Feedback Questions</h3>
                        <Button variant="outline" size="sm" onClick={addQuestion}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Question
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {questions.map((question, index) => (
                          <div key={question.id} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-medium">Question {index + 1}</span>
                              {questions.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeQuestion(question.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <Input
                              placeholder="Enter question text..."
                              value={question.text}
                              onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Select
                                value={question.type}
                                onValueChange={(v) => updateQuestion(question.id, { type: v as QuestionType })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="rating">Rating</SelectItem>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                </SelectContent>
                              </Select>
                              {question.type === "rating" && (
                                <Select
                                  value={question.scale?.toString() || "5"}
                                  onValueChange={(v) => updateQuestion(question.id, { scale: parseInt(v) })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="5">1-5 Scale</SelectItem>
                                    <SelectItem value="10">1-10 Scale</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleCreate360Feedback}
                      disabled={
                        !selectedMemberCode ||
                        !feedbackTitle.trim() ||
                        !deadline ||
                        selectedReviewers.length === 0 ||
                        createRequestMutation.isPending
                      }
                      className="w-full"
                      size="lg"
                    >
                      {createRequestMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create 360° Request
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* View Requests Tab */}
          <TabsContent value="view-requests" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="360">360°</SelectItem>
                      <SelectItem value="peer">Peer</SelectItem>
                      <SelectItem value="upward">Upward</SelectItem>
                      <SelectItem value="self">Self</SelectItem>
                    </SelectContent>
                  </Select>
                  {(searchQuery || filterStatus !== "all" || filterType !== "all") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setFilterStatus("all");
                        setFilterType("all");
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  360° Feedback Requests ({filteredRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAll || isLoadingTeam ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery || filterStatus !== "all" || filterType !== "all"
                        ? "No feedback requests found matching the filters."
                        : "No 360° feedback requests yet. Create your first one!"}
                    </p>
                    {!searchQuery && filterStatus === "all" && filterType === "all" && (
                      <Button className="mt-4" onClick={() => setActiveTab("360-requests")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create 360° Request
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-accent/30 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-foreground">{request.title}</h4>
                              {getStatusBadge(request.status)}
                              {getTypeBadge(request.feedback_type)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {request.subject_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Due: {format(new Date(request.deadline), "MMM d, yyyy")}
                              </span>
                              {request.total_reviewers && (
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  {request.completed_responses || 0}/{request.total_reviewers} responses
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Created: {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRequest(request)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRequest(request)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              disabled={request.status === "completed"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feedback Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feedback request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingRequest(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRequestMutation.isPending ? (
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feedback Request Details</DialogTitle>
            <DialogDescription>
              View comprehensive details about this feedback request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Request Code</p>
                  <p className="text-sm">{selectedRequest.request_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subject</p>
                  <p className="text-sm">{selectedRequest.subject_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <div className="mt-1">{getTypeBadge(selectedRequest.feedback_type)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deadline</p>
                  <p className="text-sm">{format(new Date(selectedRequest.deadline), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Progress</p>
                  <p className="text-sm">
                    {selectedRequest.completed_responses || 0} / {selectedRequest.total_reviewers || 0} responses
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="text-sm mt-1">{selectedRequest.title}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TeamLeadLayout>
  );
};

export default FeedbackPage;
