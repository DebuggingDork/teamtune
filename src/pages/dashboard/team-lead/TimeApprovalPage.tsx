import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    Search,
    Filter,
    CheckSquare,
    Square,
    ChevronLeft,
    ChevronRight,
    Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TeamLeadLayout } from "@/components/layouts/TeamLeadLayout";
import {
    useMyTeams,
    usePendingTimeEntries,
    useApproveTimeEntry,
    useRejectTimeEntry,
    useBulkApproveTimeEntries,
} from "@/hooks/useTeamLead";
import { toast } from "@/hooks/use-toast";
import type { PendingTimeEntry } from "@/api/types/index";
import { format, startOfWeek, endOfWeek, addDays, subDays, isSameDay } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TimeApprovalPage = () => {
    const [selectedWeek, setSelectedWeek] = useState(new Date());
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<PendingTimeEntry | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const startDate = useMemo(() => format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd'), [selectedWeek]);
    const endDate = useMemo(() => format(endOfWeek(selectedWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd'), [selectedWeek]);

    // Get team
    const { data: teamsData, isLoading: isLoadingTeams } = useMyTeams();
    const teamCode = useMemo(() => teamsData?.teams?.[0]?.team_code || null, [teamsData]);

    // Get pending time entries
    const {
        data: pendingEntries,
        isLoading: isLoadingEntries,
        refetch: refetchEntries
    } = usePendingTimeEntries(teamCode || "", { start_date: startDate, end_date: endDate });

    // Mutations
    const approveMutation = useApproveTimeEntry();
    const rejectMutation = useRejectTimeEntry();
    const bulkApproveMutation = useBulkApproveTimeEntries();

    const filteredEntries = useMemo(() => {
        if (!pendingEntries) return [];
        return pendingEntries.filter(entry =>
            entry.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.task?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pendingEntries, searchTerm]);

    const totalHours = useMemo(() => {
        return filteredEntries.reduce((sum, entry) => sum + Number(entry.hours), 0);
    }, [filteredEntries]);

    const handleApprove = async (timeCode: string) => {
        if (!teamCode) return;
        try {
            await approveMutation.mutateAsync({ teamCode, timeCode });
            toast({ title: "Success", description: "Time entry approved" });
            refetchEntries();
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to approve", variant: "destructive" });
        }
    };

    const handleRejectClick = (entry: PendingTimeEntry) => {
        setSelectedEntry(entry);
        setRejectionReason("");
        setIsRejectDialogOpen(true);
    };

    const handleRejectConfirm = async () => {
        if (!teamCode || !selectedEntry || !rejectionReason.trim()) return;
        try {
            await rejectMutation.mutateAsync({
                teamCode,
                timeCode: selectedEntry.time_code,
                data: { rejection_reason: rejectionReason }
            });
            toast({ title: "Success", description: "Time entry rejected" });
            setIsRejectDialogOpen(false);
            refetchEntries();
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to reject", variant: "destructive" });
        }
    };

    const handleBulkApprove = async () => {
        if (!teamCode || selectedEntries.length === 0) return;
        try {
            const result = await bulkApproveMutation.mutateAsync({
                teamCode,
                data: { time_codes: selectedEntries }
            });
            toast({ title: "Success", description: `Approved ${result.approved} time entries` });
            setSelectedEntries([]);
            refetchEntries();
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Bulk approval failed", variant: "destructive" });
        }
    };

    const toggleSelectAll = () => {
        if (selectedEntries.length === filteredEntries.length) {
            setSelectedEntries([]);
        } else {
            setSelectedEntries(filteredEntries.map(e => e.time_code));
        }
    };

    const toggleSelectEntry = (timeCode: string) => {
        setSelectedEntries(prev =>
            prev.includes(timeCode)
                ? prev.filter(c => c !== timeCode)
                : [...prev, timeCode]
        );
    };

    const prevWeek = () => setSelectedWeek(subDays(selectedWeek, 7));
    const nextWeek = () => setSelectedWeek(addDays(selectedWeek, 7));

    const isLoading = isLoadingTeams || isLoadingEntries;

    return (
        <TeamLeadLayout
            headerTitle="Time Entry Approval"
            headerDescription="Review and approve hours logged by your team members"
        >
            <div className="space-y-6">
                {/* Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="h-4 w-4" /></Button>
                        <div className="text-center min-w-[200px]">
                            <p className="text-sm font-medium">
                                {format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(selectedWeek, { weekStartsOn: 1 }), 'MMM d, yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground">Weekly Review</p>
                        </div>
                        <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="h-4 w-4" /></Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Filter by member or task..."
                                className="pl-9 w-[250px]"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={selectedEntries.length === 0 || bulkApproveMutation.isPending}
                            onClick={handleBulkApprove}
                        >
                            {bulkApproveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Approve Selected ({selectedEntries.length})
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50/50 border-blue-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Pending Entries</p>
                                    <p className="text-2xl font-bold text-blue-900">{filteredEntries.length}</p>
                                </div>
                                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50/50 border-purple-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">Pending Hours</p>
                                    <p className="text-2xl font-bold text-purple-900">{totalHours.toFixed(1)} hrs</p>
                                </div>
                                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <CheckSquare className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50/50 border-green-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Weekly Utilization</p>
                                    <p className="text-2xl font-bold text-green-900">
                                        {pendingEntries ? Math.min(100, (totalHours / (pendingEntries.length * 8 || 1)) * 100).toFixed(0) : 0}%
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                                    %
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Approvals</CardTitle>
                        <CardDescription>Review time logs before they are finalized for payroll and billing.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Loading time entries...</p>
                            </div>
                        ) : filteredEntries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="h-12 w-12 bg-accent rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-lg font-medium">All caught up!</p>
                                <p className="text-sm text-muted-foreground mt-1">No pending time entries found for this period.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
                                        <tr>
                                            <th className="px-4 py-3 w-10">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5"
                                                    onClick={toggleSelectAll}
                                                >
                                                    {selectedEntries.length === filteredEntries.length ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                                </Button>
                                            </th>
                                            <th className="px-4 py-3">Member</th>
                                            <th className="px-4 py-3">Work Date</th>
                                            <th className="px-4 py-3">Task / Description</th>
                                            <th className="px-4 py-3 text-center">Hours</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredEntries.map((entry, index) => (
                                            <motion.tr
                                                key={entry.time_code}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className={`group hover:bg-accent/30 transition-colors ${selectedEntries.includes(entry.time_code) ? 'bg-primary/5' : ''}`}
                                            >
                                                <td className="px-4 py-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`h-5 w-5 ${selectedEntries.includes(entry.time_code) ? 'text-primary' : 'text-muted-foreground'}`}
                                                        onClick={() => toggleSelectEntry(entry.time_code)}
                                                    >
                                                        {selectedEntries.includes(entry.time_code) ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                                    </Button>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-foreground">{entry.user?.full_name}</div>
                                                    <div className="text-xs text-muted-foreground">{entry.user?.email}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {format(new Date(entry.work_date), 'EEE, MMM d')}
                                                </td>
                                                <td className="px-4 py-4 max-w-md">
                                                    <div className="font-medium truncate">{entry.task?.title || "Direct Logging"}</div>
                                                    <div className="text-xs text-muted-foreground italic line-clamp-1">{entry.description}</div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <Badge variant="outline" className="font-mono">{Number(entry.hours).toFixed(1)}h</Badge>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                        onClick={() => handleApprove(entry.time_code)}
                                                                        disabled={approveMutation.isPending}
                                                                    >
                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Approve</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                                        onClick={() => handleRejectClick(entry)}
                                                                        disabled={rejectMutation.isPending}
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Reject</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Time Entry</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this time entry from <strong>{selectedEntry?.user?.full_name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="bg-accent/50 p-3 rounded-lg text-sm">
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div><span className="text-muted-foreground">Date:</span> {selectedEntry && format(new Date(selectedEntry.work_date), 'MMM d, yyyy')}</div>
                                <div><span className="text-muted-foreground">Hours:</span> {selectedEntry?.hours}h</div>
                            </div>
                            <div><span className="text-muted-foreground">Description:</span> {selectedEntry?.description}</div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reject-reason">Rejection Reason</Label>
                            <Textarea
                                id="reject-reason"
                                placeholder="e.g., Please provide more detail about the hours logged for this task."
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                            />
                        </div>
                        <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                            <Info className="h-3 w-3 shrink-0 mt-0.5" />
                            This reason will be visible to the team member so they can correct and resubmit.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectConfirm}
                            disabled={!rejectionReason.trim() || rejectMutation.isPending}
                        >
                            {rejectMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TeamLeadLayout>
    );
};

export default TimeApprovalPage;
