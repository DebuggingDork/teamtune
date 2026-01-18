import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    Users,
    CalendarDays,
    Filter,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    UserX,
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TeamLeadLayout } from '@/components/layouts/TeamLeadLayout';
import {
    useTeamLeaveRequests,
    useApproveLeaveRequest,
    useRejectLeaveRequest,
    useTeamLeaveCalendar,
    useMyTeams,
} from '@/hooks/useTeamLead';
import type { LeaveRequestStatus } from '@/api/types';

// Status styling
const statusConfig: Record<LeaveRequestStatus, { color: string; icon: typeof CheckCircle2; label: string }> = {
    pending: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock, label: 'Pending' },
    approved: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2, label: 'Approved' },
    rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Rejected' },
    cancelled: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: XCircle, label: 'Cancelled' },
};

// Helper to get initials from full name
const getInitials = (fullName?: string): string => {
    if (!fullName) return '??';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
};

export default function TeamLeaveManagementPage() {
    const { toast } = useToast();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [statusFilter, setStatusFilter] = useState<LeaveRequestStatus | 'all'>('all');
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [comments, setComments] = useState('');

    // Get teams
    const { data: teamsData } = useMyTeams();
    const selectedTeam = teamsData?.teams?.[0]; // Use first team for now

    // Queries - Use same data source for all tabs for reliability
    const { data: allRequestsData, isLoading: allLoading, refetch: refetchAll } = useTeamLeaveRequests(
        selectedTeam?.team_code || '',
        undefined // Get all statuses
    );
    const { data: calendarData } = useTeamLeaveCalendar(
        selectedTeam?.team_code || '',
        currentMonth.getMonth() + 1,
        currentMonth.getFullYear()
    );

    // Mutations
    const approveMutation = useApproveLeaveRequest();
    const rejectMutation = useRejectLeaveRequest();

    // Calendar days
    const calendarDays = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    // Handle approve
    const handleApprove = async () => {
        if (!selectedRequest || !selectedTeam) return;

        try {
            await approveMutation.mutateAsync({
                teamCode: selectedTeam.team_code,
                requestCode: selectedRequest.request_code,
                data: comments ? { comments } : undefined,
            });
            toast({
                title: 'Leave Approved',
                description: `Leave request has been approved.`,
            });
            setSelectedRequest(null);
            setActionType(null);
            setComments('');
            refetchAll();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message || 'Failed to approve leave request.';
            toast({
                title: 'Approval Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    };

    // Handle reject
    const handleReject = async () => {
        if (!selectedRequest || !selectedTeam || !comments.trim()) {
            toast({
                title: 'Comments Required',
                description: 'Please provide a reason for rejection.',
                variant: 'destructive',
            });
            return;
        }

        try {
            await rejectMutation.mutateAsync({
                teamCode: selectedTeam.team_code,
                requestCode: selectedRequest.request_code,
                data: { comments },
            });
            toast({
                title: 'Leave Rejected',
                description: `Leave request has been rejected.`,
            });
            setSelectedRequest(null);
            setActionType(null);
            setComments('');
            refetchAll();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message || 'Failed to reject leave request.';
            toast({
                title: 'Rejection Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    };

    // Get leaves for a specific day from calendar data
    const getLeavesForDay = (day: Date) => {
        if (!calendarData?.entries) return [];
        return calendarData.entries.filter((entry) => isSameDay(parseISO(entry.date), day));
    };

    // All requests and derived pending/filtered lists
    const allRequests = allRequestsData?.requests || [];
    const pendingRequests = allRequests.filter((r) => r.status === 'pending');
    const filteredRequests = statusFilter === 'all' ? allRequests : allRequests.filter((r) => r.status === statusFilter);

    return (
        <TeamLeadLayout
            headerTitle="Team Leave Management"
            headerDescription="Review and manage your team's leave requests"
        >
            <div className="space-y-6">
                {/* Pending Requests Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pending Requests</p>
                                        <p className="text-3xl font-bold text-amber-400">{pendingRequests.length}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-amber-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Approved This Month</p>
                                        <p className="text-3xl font-bold text-emerald-400">
                                            {allRequests.filter((r) => r.status === 'approved').length}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">On Leave Today</p>
                                        <p className="text-3xl font-bold text-blue-400">
                                            {getLeavesForDay(new Date()).length}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Users className="h-6 w-6 text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="pending" className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <TabsList className="bg-slate-800/50 border border-slate-700/50">
                            <TabsTrigger value="pending" className="data-[state=active]:bg-slate-700">
                                <Clock className="h-4 w-4 mr-2" />
                                Pending ({pendingRequests.length})
                            </TabsTrigger>
                            <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">
                                <Calendar className="h-4 w-4 mr-2" />
                                All Requests
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="data-[state=active]:bg-slate-700">
                                <CalendarDays className="h-4 w-4 mr-2" />
                                Calendar
                            </TabsTrigger>
                        </TabsList>

                        {/* Status Filter (for All Requests tab) */}
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Pending Requests Tab */}
                    <TabsContent value="pending">
                        <Card className="border-slate-700/50 bg-slate-800/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-400" />
                                    Pending Leave Requests
                                </CardTitle>
                                <CardDescription>
                                    Review and take action on pending leave requests
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {allLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : pendingRequests.length === 0 ? (
                                    <div className="text-center py-12">
                                        <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
                                        <p className="text-muted-foreground">No pending leave requests.</p>
                                        <p className="text-sm text-muted-foreground mt-1">All caught up!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingRequests.map((request) => (
                                            <motion.div
                                                key={request.request_code}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="p-4 rounded-lg bg-slate-900/50 border border-amber-500/20 hover:border-amber-500/40 transition-colors"
                                            >
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                                                {getInitials(request.employee?.full_name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">
                                                                    {request.employee?.full_name || 'Unknown Employee'}
                                                                </span>
                                                                <Badge variant="outline" className={statusConfig.pending.color}>
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    Pending
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                <span
                                                                    className="inline-block w-2 h-2 rounded-full mr-2"
                                                                    style={{ backgroundColor: request.leave_type?.color }}
                                                                />
                                                                {request.leave_type?.name} • {format(parseISO(request.start_date), 'MMM d')}
                                                                {request.start_date !== request.end_date && (
                                                                    <> - {format(parseISO(request.end_date), 'MMM d, yyyy')}</>
                                                                )}
                                                                {request.is_half_day && ' (Half Day)'}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                <strong>Reason:</strong> {request.reason}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-right mr-4">
                                                            <p className="text-lg font-bold">{request.total_days}</p>
                                                            <p className="text-xs text-muted-foreground">day{request.total_days !== 1 ? 's' : ''}</p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setActionType('approve');
                                                            }}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        >
                                                            <UserCheck className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setActionType('reject');
                                                            }}
                                                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                                        >
                                                            <UserX className="h-4 w-4 mr-1" />
                                                            Reject
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

                    {/* All Requests Tab */}
                    <TabsContent value="all">
                        <Card className="border-slate-700/50 bg-slate-800/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    All Leave Requests
                                </CardTitle>
                                <CardDescription>
                                    View all leave requests from your team
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {allLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : filteredRequests.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No leave requests found.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredRequests.map((request) => {
                                            const StatusIcon = statusConfig[request.status].icon;
                                            return (
                                                <motion.div
                                                    key={request.request_code}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="p-4 rounded-lg bg-slate-900/50 hover:bg-slate-900/70 transition-colors border border-slate-700/50"
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="flex items-start gap-4">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                                                    {getInitials(request.employee?.full_name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">
                                                                        {request.employee?.full_name || 'Unknown Employee'}
                                                                    </span>
                                                                    <Badge variant="outline" className={statusConfig[request.status].color}>
                                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                                        {statusConfig[request.status].label}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    <span
                                                                        className="inline-block w-2 h-2 rounded-full mr-2"
                                                                        style={{ backgroundColor: request.leave_type?.color }}
                                                                    />
                                                                    {request.leave_type?.name} • {format(parseISO(request.start_date), 'MMM d, yyyy')}
                                                                    {request.start_date !== request.end_date && (
                                                                        <> - {format(parseISO(request.end_date), 'MMM d, yyyy')}</>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="text-lg font-bold">{request.total_days}</p>
                                                                <p className="text-xs text-muted-foreground">day{request.total_days !== 1 ? 's' : ''}</p>
                                                            </div>
                                                            {request.status === 'pending' && (
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setSelectedRequest(request);
                                                                            setActionType('approve');
                                                                        }}
                                                                        className="bg-emerald-600 hover:bg-emerald-700"
                                                                    >
                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            setSelectedRequest(request);
                                                                            setActionType('reject');
                                                                        }}
                                                                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Calendar Tab */}
                    <TabsContent value="calendar">
                        <Card className="border-slate-700/50 bg-slate-800/30">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
                                    <CardDescription>Team leave calendar</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Weekday headers */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                        <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar days */}
                                <div className="grid grid-cols-7 gap-1">
                                    {/* Empty cells for days before the month starts */}
                                    {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => (
                                        <div key={`empty-${i}`} className="aspect-square" />
                                    ))}

                                    {calendarDays.map((day) => {
                                        const leaves = getLeavesForDay(day);
                                        const isTodayDay = isToday(day);

                                        return (
                                            <motion.div
                                                key={day.toISOString()}
                                                whileHover={{ scale: 1.02 }}
                                                className={`
                          min-h-[80px] p-1 rounded-lg flex flex-col text-sm
                          ${isTodayDay ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''}
                          ${leaves.length > 0 ? 'bg-blue-500/10' : 'bg-slate-800/50'}
                        `}
                                            >
                                                <span className={`font-medium text-center ${isTodayDay ? 'text-blue-400' : ''}`}>
                                                    {format(day, 'd')}
                                                </span>
                                                <div className="flex-1 overflow-hidden">
                                                    {leaves.slice(0, 2).map((leave, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="text-[10px] px-1 py-0.5 rounded truncate mb-0.5"
                                                            style={{ backgroundColor: `${leave.leave_type?.color || '#666'}30` }}
                                                        >
                                                            {leave.user?.first_name}
                                                        </div>
                                                    ))}
                                                    {leaves.length > 2 && (
                                                        <div className="text-[10px] text-muted-foreground text-center">
                                                            +{leaves.length - 2} more
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Action Dialog */}
                <Dialog open={!!actionType} onOpenChange={() => { setActionType(null); setSelectedRequest(null); setComments(''); }}>
                    <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
                        <DialogHeader>
                            <DialogTitle className={actionType === 'approve' ? 'text-emerald-400' : 'text-red-400'}>
                                {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedRequest && (
                                    <>
                                        {selectedRequest.employee?.full_name || 'Employee'} requested {selectedRequest.total_days} day(s) of {selectedRequest.leave_type?.name}.
                                    </>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>{actionType === 'reject' ? 'Reason for Rejection *' : 'Comments (Optional)'}</Label>
                                <Textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder={actionType === 'reject' ? 'Please provide a reason...' : 'Add any comments...'}
                                    className="bg-slate-800 border-slate-700 min-h-[100px]"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => { setActionType(null); setSelectedRequest(null); setComments(''); }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={actionType === 'approve' ? handleApprove : handleReject}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                                className={actionType === 'approve'
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-red-600 hover:bg-red-700'}
                            >
                                {(approveMutation.isPending || rejectMutation.isPending) && (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                {actionType === 'approve' ? 'Approve' : 'Reject'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TeamLeadLayout>
    );
}
