import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Megaphone,
    Gavel,
    Users,
    Plus,
    Search,
    Filter,
    X,
    Clock,
    Calendar,
    ChevronRight,
    Loader2,
    CheckCircle2,
    MessageSquare,
    Pin,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { TeamLeadLayout } from "@/components/layouts/TeamLeadLayout";
import {
    useMyTeams,
    useTeamPerformance,
    useCreateAnnouncement,
    useLogTeamDecision,
    useScheduleOneOnOne
} from "@/hooks/useTeamLead";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const CommunicationsPage = () => {
    const [activeTab, setActiveTab] = useState<'announcements' | 'decisions' | 'one-on-ones'>('announcements');
    const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);
    const [isLogDecisionOpen, setIsLogDecisionOpen] = useState(false);
    const [isSchedule1on1Open, setIsSchedule1on1Open] = useState(false);

    // Form states
    const [announcementForm, setAnnouncementForm] = useState<{
        title: string;
        message: string;
        priority: "low" | "medium" | "high" | "urgent";
        target_audience: string;
        is_pinned: boolean;
    }>({
        title: "",
        message: "",
        priority: "medium",
        target_audience: "all",
        is_pinned: false
    });

    const [decisionForm, setDecisionForm] = useState({
        title: "",
        description: "",
        decision_type: "technical",
        decision_made: "",
        rationale: ""
    });

    const [oneOnOneForm, setOneOnOneForm] = useState({
        userCode: "",
        scheduled_date: "",
        duration_minutes: 30,
        agenda: ["General Progress", "Blockers", "Career Development"]
    });

    // Data fetching
    const { data: teamsData } = useMyTeams();
    const teamCode = useMemo(() => teamsData?.teams?.[0]?.team_code || "", [teamsData]);

    const { data: teamPerformance } = useTeamPerformance(teamCode, {
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0]
    });

    const members = useMemo(() => teamPerformance?.members || [], [teamPerformance]);

    // Mutations
    const createAnnouncement = useCreateAnnouncement();
    const logDecision = useLogTeamDecision();
    const schedule1on1 = useScheduleOneOnOne();

    const handleCreateAnnouncement = async () => {
        if (!teamCode) return;
        try {
            await createAnnouncement.mutateAsync({
                teamCode,
                data: {
                    ...announcementForm,
                    channels: ['dashboard']
                }
            });
            toast({ title: "Success", description: "Announcement sent to team" });
            setIsCreateAnnouncementOpen(false);
            setAnnouncementForm({ title: "", message: "", priority: "medium", target_audience: "all", is_pinned: false });
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to create announcement", variant: "destructive" });
        }
    };

    const handleLogDecision = async () => {
        if (!teamCode) return;
        try {
            await logDecision.mutateAsync({
                teamCode,
                data: decisionForm
            });
            toast({ title: "Success", description: "Decision logged and archived" });
            setIsLogDecisionOpen(false);
            setDecisionForm({ title: "", description: "", decision_type: "technical", decision_made: "", rationale: "" });
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to log decision", variant: "destructive" });
        }
    };

    const handleSchedule1on1 = async () => {
        if (!oneOnOneForm.userCode) return;
        try {
            await schedule1on1.mutateAsync({
                userCode: oneOnOneForm.userCode,
                data: {
                    scheduled_date: oneOnOneForm.scheduled_date,
                    duration_minutes: oneOnOneForm.duration_minutes,
                    agenda: oneOnOneForm.agenda
                }
            });
            toast({ title: "Success", description: "One-on-one session scheduled" });
            setIsSchedule1on1Open(false);
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to schedule session", variant: "destructive" });
        }
    };

    return (
        <TeamLeadLayout
            headerTitle="Communication Center"
            headerDescription="Manage team announcements, decisions, and check-ins"
        >
            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex p-1 bg-accent/20 rounded-xl border border-border/50 w-full md:w-fit">
                    <Button
                        variant={activeTab === 'announcements' ? 'default' : 'ghost'}
                        className="rounded-lg px-6"
                        onClick={() => setActiveTab('announcements')}
                    >
                        <Megaphone className="h-4 w-4 mr-2" />
                        Announcements
                    </Button>
                    <Button
                        variant={activeTab === 'decisions' ? 'default' : 'ghost'}
                        className="rounded-lg px-6"
                        onClick={() => setActiveTab('decisions')}
                    >
                        <Gavel className="h-4 w-4 mr-2" />
                        Decisions
                    </Button>
                    <Button
                        variant={activeTab === 'one-on-ones' ? 'default' : 'ghost'}
                        className="rounded-lg px-6"
                        onClick={() => setActiveTab('one-on-ones')}
                    >
                        <Users className="h-4 w-4 mr-2" />
                        1-on-1s
                    </Button>
                </div>

                {activeTab === 'announcements' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Megaphone className="h-5 w-5 text-primary" />
                                Team Announcements
                            </h3>
                            <Button onClick={() => setIsCreateAnnouncementOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Announcement
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Placeholder for list */}
                            <Card className="bg-primary/5 border-primary/20">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Pinned</Badge>
                                        <span className="text-[10px] text-muted-foreground">2 hours ago</span>
                                    </div>
                                    <CardTitle className="text-base mt-2">Upcoming Sprint Planning</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        We will be having our next sprint planning session on Monday at 10 AM. Please ensure your tasks are up to date and you have reviewed the backlog.
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-primary">
                                        <CheckCircle2 className="h-3 w-3" />
                                        8/12 acknowledged
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'decisions' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Gavel className="h-5 w-5 text-primary" />
                                Team Decisions
                            </h3>
                            <Button onClick={() => setIsLogDecisionOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Log Decision
                            </Button>
                        </div>

                        <div className="bg-accent/10 border border-border rounded-xl shadow-sm">
                            <div className="p-4 border-b border-border bg-accent/20">
                                <div className="flex gap-4 items-center">
                                    <Search className="h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search decisions archive..." className="bg-transparent border-none shadow-none focus-visible:ring-0 h-8" />
                                </div>
                            </div>
                            <div className="divide-y divide-border">
                                {[1, 2].map(i => (
                                    <div key={i} className="p-4 hover:bg-accent/10 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Badge variant="outline" className="mb-2">Technical</Badge>
                                                <p className="font-semibold text-foreground">Migration to Shadcn/UI</p>
                                                <p className="text-sm text-muted-foreground">Standardizing on Shadcn for all dashboard components to improve maintainability.</p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">Dec 15, 2025</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'one-on-ones' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                One-on-One Sessions
                            </h3>
                            <Button onClick={() => setIsSchedule1on1Open(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Schedule Session
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {members.map((member, i) => (
                                <Card key={i} className="hover:border-primary/50 transition-colors">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                {member.user_name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{member.user_name}</p>
                                                <p className="text-xs text-muted-foreground">Last session: 2 weeks ago</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => {
                                            setOneOnOneForm(prev => ({ ...prev, userCode: member.user_code }));
                                            setIsSchedule1on1Open(true);
                                        }}>
                                            Schedule
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Announcements Dialog */}
            <Dialog open={isCreateAnnouncementOpen} onOpenChange={setIsCreateAnnouncementOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Team Announcement</DialogTitle>
                        <DialogDescription>Send a message to all team members.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={announcementForm.title}
                                onChange={e => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g. Schedule Change"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select
                                value={announcementForm.priority}
                                onValueChange={v => setAnnouncementForm(prev => ({ ...prev, priority: v as any }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea
                                value={announcementForm.message}
                                onChange={e => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Details of the announcement..."
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isPinned"
                                checked={announcementForm.is_pinned}
                                onChange={e => setAnnouncementForm(prev => ({ ...prev, is_pinned: e.target.checked }))}
                            />
                            <Label htmlFor="isPinned">Pin to top of dashboard</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateAnnouncementOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateAnnouncement} disabled={createAnnouncement.isPending}>
                            {createAnnouncement.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Send Announcement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Decision Dialog */}
            <Dialog open={isLogDecisionOpen} onOpenChange={setIsLogDecisionOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Log Team Decision</DialogTitle>
                        <DialogDescription>Record a decision for future reference.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Decision Title</Label>
                            <Input
                                value={decisionForm.title}
                                onChange={e => setDecisionForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g. Database Choice"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={decisionForm.decision_type}
                                onValueChange={v => setDecisionForm(prev => ({ ...prev, decision_type: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="architectural">Architectural</SelectItem>
                                    <SelectItem value="process">Process</SelectItem>
                                    <SelectItem value="resource">Resource</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Decision Made</Label>
                            <Input
                                value={decisionForm.decision_made}
                                onChange={e => setDecisionForm(prev => ({ ...prev, decision_made: e.target.value }))}
                                placeholder="Final outcome..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Rationale</Label>
                            <Textarea
                                value={decisionForm.rationale}
                                onChange={e => setDecisionForm(prev => ({ ...prev, rationale: e.target.value }))}
                                placeholder="Why was this decision made?"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLogDecisionOpen(false)}>Cancel</Button>
                        <Button onClick={handleLogDecision} disabled={logDecision.isPending}>
                            {logDecision.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Save Decision
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 1-on-1 Dialog */}
            <Dialog open={isSchedule1on1Open} onOpenChange={setIsSchedule1on1Open}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Schedule 1-on-1 Session</DialogTitle>
                        <DialogDescription>Set up a check-in with a team member.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Member</Label>
                            <Select
                                value={oneOnOneForm.userCode}
                                onValueChange={v => setOneOnOneForm(prev => ({ ...prev, userCode: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map(m => (
                                        <SelectItem key={m.user_code} value={m.user_code}>{m.user_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Date & Time</Label>
                            <Input
                                type="datetime-local"
                                value={oneOnOneForm.scheduled_date}
                                onChange={e => setOneOnOneForm(prev => ({ ...prev, scheduled_date: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Duration (Minutes)</Label>
                            <Select
                                value={oneOnOneForm.duration_minutes.toString()}
                                onValueChange={v => setOneOnOneForm(prev => ({ ...prev, duration_minutes: parseInt(v) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 Minutes</SelectItem>
                                    <SelectItem value="30">30 Minutes</SelectItem>
                                    <SelectItem value="45">45 Minutes</SelectItem>
                                    <SelectItem value="60">60 Minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSchedule1on1Open(false)}>Cancel</Button>
                        <Button onClick={handleSchedule1on1} disabled={schedule1on1.isPending || !oneOnOneForm.userCode || !oneOnOneForm.scheduled_date}>
                            {schedule1on1.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Schedule Session
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TeamLeadLayout>
    );
};

export default CommunicationsPage;
