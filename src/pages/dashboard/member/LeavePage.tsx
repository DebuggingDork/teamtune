import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    FileText,
    CalendarDays,
    TrendingUp,
    Filter,
    ChevronDown,
    Trash2,
} from 'lucide-react';
import { format, parseISO, differenceInDays, isFuture } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { MemberLayout } from '@/components/layouts/MemberLayout';
import {
    useLeaveTypes,
    useLeaveBalances,
    useMyLeaveRequests,
    useSubmitLeaveRequest,
    useCancelLeaveRequest,
    useHolidays,
} from '@/hooks/useEmployee';
import type { LeaveRequestStatus, SubmitLeaveRequest } from '@/api/types/index';

// Status styling
const statusConfig: Record<LeaveRequestStatus, { color: string; icon: typeof CheckCircle2; label: string }> = {
    pending: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock, label: 'Pending' },
    approved: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2, label: 'Approved' },
    rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Rejected' },
    cancelled: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Trash2, label: 'Cancelled' },
};

export default function LeavePage() {
    const { toast } = useToast();
    const currentYear = new Date().getFullYear();
    const [statusFilter, setStatusFilter] = useState<LeaveRequestStatus | 'all'>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<SubmitLeaveRequest>>({
        leave_type_code: '',
        start_date: '',
        end_date: '',
        reason: '',
        is_half_day: false,
        half_day_type: null,
    });

    // Queries
    const { data: leaveTypes, isLoading: typesLoading } = useLeaveTypes();
    const { data: balances, isLoading: balancesLoading } = useLeaveBalances();
    const { data: leaveRequests, isLoading: requestsLoading, refetch: refetchRequests } = useMyLeaveRequests(
        statusFilter === 'all' ? undefined : { status: statusFilter }
    );
    const { data: holidays } = useHolidays(currentYear);

    // Mutations
    const submitMutation = useSubmitLeaveRequest();
    const cancelMutation = useCancelLeaveRequest();

    // Calculate form days
    const calculatedDays = useMemo(() => {
        if (!formData.start_date || !formData.end_date) return 0;
        const days = differenceInDays(parseISO(formData.end_date), parseISO(formData.start_date)) + 1;
        return formData.is_half_day ? 0.5 : days;
    }, [formData.start_date, formData.end_date, formData.is_half_day]);

    // Handle form submission
    const handleSubmit = async () => {
        if (!formData.leave_type_code || !formData.start_date || !formData.end_date || !formData.reason) {
            toast({
                title: 'Missing Fields',
                description: 'Please fill in all required fields.',
                variant: 'destructive',
            });
            return;
        }

        // Find selected leave type requirements
        const selectedType = leaveTypes?.find(t => t.code === formData.leave_type_code);
        const selectedBalance = balances?.balances?.find(b => b.leave_type.code === formData.leave_type_code);

        if (selectedType) {
            const startStr = formData.start_date || '';
            const endStr = formData.end_date || '';
            const start = parseISO(startStr);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Advance Notice Check
            const daysUntilStart = differenceInDays(start, today);
            if (daysUntilStart < selectedType.min_advance_notice_days) {
                toast({
                    title: 'Insufficient Advance Notice',
                    description: `${selectedType.name} requires at least ${selectedType.min_advance_notice_days} days notice. You are requesting for ${daysUntilStart === 0 ? 'today' : `${daysUntilStart} days from now`}.`,
                    variant: 'destructive',
                });
                return;
            }

            // 2. Max Consecutive Days Check
            if (selectedType.max_consecutive_days > 0 && calculatedDays > selectedType.max_consecutive_days) {
                toast({
                    title: 'Duration Exceeded',
                    description: `${selectedType.name} allows a maximum of ${selectedType.max_consecutive_days} consecutive days. You requested ${calculatedDays} days.`,
                    variant: 'destructive',
                });
                return;
            }

            // 3. Balance Check
            const remaining = selectedBalance?.remaining_days ??
                (selectedBalance ? (selectedBalance.total_days - selectedBalance.used_days - selectedBalance.pending_days) : 0);

            if (selectedBalance && calculatedDays > remaining) {
                toast({
                    title: 'Insufficient Balance',
                    description: `You have ${remaining} days remaining for ${selectedType.name}, but requested ${calculatedDays} days.`,
                    variant: 'destructive',
                });
                return;
            }

            // 4. Document Check (User's rule: Sick Leave only if > 3 days)
            // Note: The backend will also enforce document requirements. This is a client-side helper.
            const needsDocument = selectedType.requires_document &&
                (formData.leave_type_code === 'SICK' ? calculatedDays > 3 : true);

            if (needsDocument && !formData.supporting_document_url) {
                toast({
                    title: 'Document Required',
                    description: `${selectedType.name} requested for ${calculatedDays} days requires a supporting document. (Required for > 3 days for Sick Leave).`,
                    variant: 'destructive',
                });
                return;
            }
        }

        try {
            await submitMutation.mutateAsync(formData as SubmitLeaveRequest);
            toast({
                title: 'Leave Request Submitted',
                description: 'Your leave request has been submitted for approval.',
            });
            setIsDialogOpen(false);
            setFormData({
                leave_type_code: '',
                start_date: '',
                end_date: '',
                reason: '',
                is_half_day: false,
                half_day_type: null,
            });
            refetchRequests();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message || 'Unable to submit leave request. Please try again.';
            toast({
                title: 'Submission Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    };

    // Handle cancel request
    const handleCancel = async (code: string) => {
        try {
            await cancelMutation.mutateAsync(code);
            toast({
                title: 'Request Cancelled',
                description: 'Your leave request has been cancelled.',
            });
            refetchRequests();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message || 'Unable to cancel request. Please try again.';
            toast({
                title: 'Cancellation Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    };

    return (
        <MemberLayout
            headerTitle="Leave Management"
            headerDescription="Manage your leave requests and view balances"
        >
            <div className="space-y-6">
                {/* Header with Request Button */}
                <div className="flex justify-end">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Request Leave
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700">
                            <DialogHeader>
                                <DialogTitle className="text-xl">New Leave Request</DialogTitle>
                                <DialogDescription>
                                    Fill in the details below to submit a new leave request.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {/* Leave Type */}
                                <div className="space-y-2">
                                    <Label>Leave Type *</Label>
                                    <Select
                                        value={formData.leave_type_code}
                                        onValueChange={(value) => setFormData((prev) => ({ ...prev, leave_type_code: value }))}
                                    >
                                        <SelectTrigger className="bg-slate-800 border-slate-700">
                                            <SelectValue placeholder="Select leave type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leaveTypes?.map((type) => (
                                                <SelectItem key={type.code} value={type.code}>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: type.color_code }}
                                                        />
                                                        <span>{type.name}</span>
                                                        <span className="text-[10px] text-muted-foreground ml-1">
                                                            ({type.min_advance_notice_days}d notice)
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formData.leave_type_code && leaveTypes?.find(t => t.code === formData.leave_type_code) && (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {(() => {
                                                const type = leaveTypes.find(t => t.code === formData.leave_type_code);
                                                if (!type) return null;
                                                return (
                                                    <>
                                                        <Badge variant="outline" className="text-[10px] bg-blue-500/5 py-0">
                                                            Notice: {type.min_advance_notice_days} days
                                                        </Badge>
                                                        {type.max_consecutive_days > 0 && (
                                                            <Badge variant="outline" className="text-[10px] bg-blue-500/5 py-0">
                                                                Max: {type.max_consecutive_days} days
                                                            </Badge>
                                                        )}
                                                        {type.requires_document && (
                                                            <Badge variant="outline" className="text-[10px] bg-amber-500/5 text-amber-500 border-amber-500/20 py-0">
                                                                Requires Document
                                                            </Badge>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date *</Label>
                                        <Input
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                                            className="bg-slate-800 border-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date *</Label>
                                        <Input
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                                            className="bg-slate-800 border-slate-700"
                                        />
                                    </div>
                                </div>

                                {/* Half Day Option */}
                                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <div>
                                        <Label className="text-base">Half Day</Label>
                                        <p className="text-sm text-muted-foreground">Request for half day leave</p>
                                    </div>
                                    <Switch
                                        checked={formData.is_half_day}
                                        onCheckedChange={(checked) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                is_half_day: checked,
                                                half_day_type: checked ? 'first_half' : null,
                                            }))
                                        }
                                    />
                                </div>

                                {formData.is_half_day && (
                                    <div className="space-y-2">
                                        <Label>Half Day Type</Label>
                                        <Select
                                            value={formData.half_day_type || ''}
                                            onValueChange={(value) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    half_day_type: value as 'first_half' | 'second_half',
                                                }))
                                            }
                                        >
                                            <SelectTrigger className="bg-slate-800 border-slate-700">
                                                <SelectValue placeholder="Select half" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="first_half">First Half (Morning)</SelectItem>
                                                <SelectItem value="second_half">Second Half (Afternoon)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Reason *</Label>
                                    <Textarea
                                        value={formData.reason}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                                        placeholder="Enter reason for leave..."
                                        className="bg-slate-800 border-slate-700 min-h-[100px]"
                                    />
                                </div>

                                {/* Supporting Document */}
                                {(() => {
                                    const selectedType = leaveTypes?.find(t => t.code === formData.leave_type_code);
                                    if (!selectedType?.requires_document) return null;

                                    // For Sick Leave, only show if > 3 days
                                    if (formData.leave_type_code === 'SICK' && calculatedDays <= 3) return null;

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-2"
                                        >
                                            <Label className="flex items-center gap-2">
                                                Supporting Document URL
                                                <span className="text-red-400">*</span>
                                            </Label>
                                            <Input
                                                value={formData.supporting_document_url || ''}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, supporting_document_url: e.target.value }))}
                                                placeholder="Upload to cloud and paste link (e.g. Google Drive, Dropbox)"
                                                className="bg-slate-800 border-slate-700"
                                            />
                                            <p className="text-[10px] text-muted-foreground">
                                                Please provide a link to your medical certificate or supporting proof.
                                            </p>
                                        </motion.div>
                                    );
                                })()}

                                {/* Calculated Days */}
                                {calculatedDays > 0 && (
                                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                        <p className="text-sm text-blue-400">
                                            <Calendar className="h-4 w-4 inline mr-2" />
                                            Total Days: <strong>{calculatedDays}</strong>
                                        </p>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitMutation.isPending}
                                    className="bg-gradient-to-r from-blue-500 to-cyan-600"
                                >
                                    {submitMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Submit Request
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Leave Balances */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {balancesLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i} className="border-slate-700/50 bg-slate-800/30 animate-pulse">
                                <CardContent className="p-4">
                                    <div className="h-20" />
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        balances?.balances?.map((balance, index) => (
                            <motion.div
                                key={balance.leave_type.code}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm overflow-hidden">
                                    <div
                                        className="h-1"
                                        style={{ backgroundColor: balance.leave_type.color }}
                                    />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {balance.leave_type.name}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {balance.remaining_days} left
                                            </Badge>
                                        </div>
                                        <div className="flex items-end gap-2 mb-3">
                                            <span className="text-3xl font-bold" style={{ color: balance.leave_type.color }}>
                                                {balance.remaining_days ?? (balance.total_days - balance.used_days - balance.pending_days)}
                                            </span>
                                            <span className="text-muted-foreground text-sm mb-1">/ {balance.total_days}</span>
                                        </div>
                                        <Progress
                                            value={(balance.remaining_days / balance.total_days) * 100}
                                            className="h-1.5"
                                            style={
                                                {
                                                    '--progress-color': balance.leave_type.color,
                                                } as React.CSSProperties
                                            }
                                        />
                                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                            <span>Used: {balance.used_days}</span>
                                            <span>Pending: {balance.pending_days}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Summary Card */}
                {balances?.summary && (
                    <Card className="border-slate-700/50 bg-slate-800/30">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-6 items-center justify-center md:justify-start">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-emerald-400">{balances.summary.total_leaves_available}</p>
                                    <p className="text-xs text-muted-foreground">Total Available</p>
                                </div>
                                <div className="h-8 w-px bg-slate-700 hidden md:block" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-400">{balances.summary.total_leaves_used}</p>
                                    <p className="text-xs text-muted-foreground">Used</p>
                                </div>
                                <div className="h-8 w-px bg-slate-700 hidden md:block" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-amber-400">{balances.summary.total_leaves_pending}</p>
                                    <p className="text-xs text-muted-foreground">Pending</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabs: Requests / Holidays */}
                <Tabs defaultValue="requests" className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <TabsList className="bg-slate-800/50 border border-slate-700/50">
                            <TabsTrigger value="requests" className="data-[state=active]:bg-slate-700">
                                <FileText className="h-4 w-4 mr-2" />
                                My Requests
                            </TabsTrigger>
                            <TabsTrigger value="holidays" className="data-[state=active]:bg-slate-700">
                                <CalendarDays className="h-4 w-4 mr-2" />
                                Holidays
                            </TabsTrigger>
                        </TabsList>

                        {/* Filter */}
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
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Requests Tab */}
                    <TabsContent value="requests">
                        <Card className="border-slate-700/50 bg-slate-800/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Leave Requests
                                </CardTitle>
                                <CardDescription>
                                    Your leave request history
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {requestsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : leaveRequests?.requests?.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No leave requests found.</p>
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => setIsDialogOpen(true)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Request Leave
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {leaveRequests?.requests?.map((request) => {
                                            const StatusIcon = statusConfig[request.status].icon;
                                            const canCancel = request.status === 'pending' && isFuture(parseISO(request.start_date));

                                            return (
                                                <motion.div
                                                    key={request.request_code}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="p-4 rounded-lg bg-slate-900/50 hover:bg-slate-900/70 transition-colors border border-slate-700/50"
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                                                style={{ backgroundColor: `${request.leave_type.color}20` }}
                                                            >
                                                                <Calendar className="h-5 w-5" style={{ color: request.leave_type.color }} />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">{request.leave_type.name}</span>
                                                                    <Badge variant="outline" className={statusConfig[request.status].color}>
                                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                                        {statusConfig[request.status].label}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {format(parseISO(request.start_date), 'MMM d, yyyy')}
                                                                    {request.start_date !== request.end_date && (
                                                                        <> - {format(parseISO(request.end_date), 'MMM d, yyyy')}</>
                                                                    )}
                                                                    {request.is_half_day && (
                                                                        <span className="ml-2 text-xs">
                                                                            ({request.half_day_type === 'first_half' ? 'Morning' : 'Afternoon'})
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                                                    {request.reason}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="text-lg font-bold">{request.total_days}</p>
                                                                <p className="text-xs text-muted-foreground">day{request.total_days !== 1 ? 's' : ''}</p>
                                                            </div>
                                                            {canCancel && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleCancel(request.request_code)}
                                                                    disabled={cancelMutation.isPending}
                                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                                >
                                                                    {cancelMutation.isPending ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <XCircle className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {request.reviewer_comments && (
                                                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                                                            <p className="text-sm text-muted-foreground">
                                                                <strong>Reviewer:</strong> {request.reviewer_comments}
                                                            </p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Holidays Tab */}
                    <TabsContent value="holidays">
                        <Card className="border-slate-700/50 bg-slate-800/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5 text-amber-400" />
                                    Public Holidays {currentYear}
                                </CardTitle>
                                <CardDescription>
                                    {holidays?.total || 0} holidays this year
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {holidays?.holidays?.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No holidays found for this year.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {holidays?.holidays?.map((holiday) => {
                                            const isPast = !isFuture(parseISO(holiday.date));
                                            return (
                                                <motion.div
                                                    key={holiday.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={`p-4 rounded-lg border ${isPast
                                                        ? 'bg-slate-900/30 border-slate-700/30 opacity-60'
                                                        : 'bg-amber-500/5 border-amber-500/20'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className={`font-medium ${isPast ? 'text-muted-foreground' : 'text-amber-400'}`}>
                                                                {holiday.name}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {format(parseISO(holiday.date), 'EEEE, MMMM d')}
                                                            </p>
                                                        </div>
                                                        {holiday.is_optional && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Optional
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MemberLayout>
    );
}
