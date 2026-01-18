import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    LogIn,
    LogOut,
    Calendar,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Timer,
    Coffee,
    Sun,
    Moon,
    Loader2,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    BarChart3,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { MemberLayout } from '@/components/layouts/MemberLayout';
import {
    useTodayAttendance,
    useCheckIn,
    useCheckOut,
    useMyAttendance,
    useAttendanceSummary,
    useHolidays,
} from '@/hooks/useEmployee';
import type { AttendanceStatus } from '@/api/types';

// Status color mapping
const statusColors: Record<AttendanceStatus, string> = {
    present: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    absent: 'bg-red-500/20 text-red-400 border-red-500/30',
    on_leave: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    wfh: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    holiday: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    half_day: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const statusLabels: Record<AttendanceStatus, string> = {
    present: 'Present',
    absent: 'Absent',
    on_leave: 'On Leave',
    wfh: 'Work From Home',
    holiday: 'Holiday',
    half_day: 'Half Day',
};

export default function AttendancePage() {
    const { toast } = useToast();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const currentYear = currentMonth.getFullYear();
    const currentMonthNum = currentMonth.getMonth() + 1;

    // Queries
    const { data: todayData, isLoading: todayLoading, refetch: refetchToday } = useTodayAttendance();
    const { data: summaryData, isLoading: summaryLoading } = useAttendanceSummary(currentMonthNum, currentYear);
    const { data: attendanceData, isLoading: attendanceLoading } = useMyAttendance({
        from_date: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
        to_date: format(endOfMonth(currentMonth), 'yyyy-MM-dd'),
    });
    const { data: holidaysData } = useHolidays(currentYear);

    // Mutations
    const checkInMutation = useCheckIn();
    const checkOutMutation = useCheckOut();

    // Derived state
    const isCheckedIn = !!todayData?.check_in_time && !todayData?.check_out_time;
    const isCheckedOut = !!todayData?.check_out_time;
    const currentTime = useMemo(() => new Date(), []);

    // Calendar days
    const calendarDays = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    // Handle check-in
    const handleCheckIn = async () => {
        try {
            await checkInMutation.mutateAsync();
            toast({
                title: 'Checked In Successfully!',
                description: `You've checked in at ${format(new Date(), 'hh:mm a')}`,
            });
            refetchToday();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message || 'Unable to check in. Please try again.';
            toast({
                title: 'Check-in Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    };

    // Handle check-out
    const handleCheckOut = async () => {
        try {
            await checkOutMutation.mutateAsync();
            toast({
                title: 'Checked Out Successfully!',
                description: `You've checked out at ${format(new Date(), 'hh:mm a')}`,
            });
            refetchToday();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message || 'Unable to check out. Please try again.';
            toast({
                title: 'Check-out Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    };

    // Get attendance status for a day
    const getAttendanceForDay = (day: Date) => {
        if (!attendanceData?.records) return null;
        return attendanceData.records.find((r) => isSameDay(parseISO(r.date), day));
    };

    // Check if day is a holiday
    const isHoliday = (day: Date) => {
        if (!holidaysData?.holidays) return null;
        return holidaysData.holidays.find((h) => isSameDay(parseISO(h.date), day));
    };

    return (
        <MemberLayout
            headerTitle="Attendance"
            headerDescription="Track your daily attendance and view your work history"
        >
            <div className="space-y-6">

                {/* Main Check-in/out Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl">
                        {/* Animated background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse" />

                        <CardContent className="relative p-6 md:p-8">
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                {/* Time Display */}
                                <div className="text-center lg:text-left">
                                    <div className="flex items-center gap-3 mb-2">
                                        {currentTime.getHours() < 12 ? (
                                            <Sun className="h-8 w-8 text-amber-400" />
                                        ) : currentTime.getHours() < 18 ? (
                                            <Coffee className="h-8 w-8 text-orange-400" />
                                        ) : (
                                            <Moon className="h-8 w-8 text-indigo-400" />
                                        )}
                                        <span className="text-lg text-muted-foreground">
                                            {format(new Date(), 'EEEE, MMMM d, yyyy')}
                                        </span>
                                    </div>
                                    <motion.div
                                        key="time"
                                        className="text-5xl md:text-6xl font-bold font-mono bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent"
                                    >
                                        {format(new Date(), 'hh:mm:ss a')}
                                    </motion.div>
                                </div>

                                {/* Status and Action */}
                                <div className="flex flex-col items-center gap-4">
                                    {todayLoading ? (
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    ) : (
                                        <>
                                            {/* Current Status */}
                                            <div className="flex items-center gap-3">
                                                {todayData?.check_in_time && (
                                                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1">
                                                        <LogIn className="h-3 w-3 mr-1" />
                                                        In: {format(parseISO(todayData.check_in_time), 'hh:mm a')}
                                                    </Badge>
                                                )}
                                                {todayData?.check_out_time && (
                                                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-3 py-1">
                                                        <LogOut className="h-3 w-3 mr-1" />
                                                        Out: {format(parseISO(todayData.check_out_time), 'hh:mm a')}
                                                    </Badge>
                                                )}
                                                {todayData?.is_late && (
                                                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-3 py-1">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Late ({todayData.late_minutes >= 60
                                                            ? `${Math.floor(todayData.late_minutes / 60)}h ${todayData.late_minutes % 60}m`
                                                            : `${todayData.late_minutes}m`})
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <AnimatePresence mode="wait">
                                                {!todayData?.check_in_time ? (
                                                    <motion.div
                                                        key="check-in"
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.9, opacity: 0 }}
                                                    >
                                                        <Button
                                                            size="lg"
                                                            onClick={handleCheckIn}
                                                            disabled={checkInMutation.isPending}
                                                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
                                                        >
                                                            {checkInMutation.isPending ? (
                                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                            ) : (
                                                                <LogIn className="h-5 w-5 mr-2" />
                                                            )}
                                                            Check In
                                                        </Button>
                                                    </motion.div>
                                                ) : !todayData?.check_out_time ? (
                                                    <motion.div
                                                        key="check-out"
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.9, opacity: 0 }}
                                                    >
                                                        <Button
                                                            size="lg"
                                                            onClick={handleCheckOut}
                                                            disabled={checkOutMutation.isPending}
                                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                                                        >
                                                            {checkOutMutation.isPending ? (
                                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                            ) : (
                                                                <LogOut className="h-5 w-5 mr-2" />
                                                            )}
                                                            Check Out
                                                        </Button>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="complete"
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="flex items-center gap-2 text-emerald-400"
                                                    >
                                                        <CheckCircle2 className="h-6 w-6" />
                                                        <span className="font-medium">Day Complete</span>
                                                        {todayData?.worked_hours && (
                                                            <Badge variant="outline" className="ml-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                                                {todayData.worked_hours.toFixed(1)}h worked
                                                            </Badge>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Tabs: Summary / Calendar / History */}
                <Tabs defaultValue="summary" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700/50">
                        <TabsTrigger value="summary" className="data-[state=active]:bg-slate-700">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Summary
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="data-[state=active]:bg-slate-700">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Calendar
                        </TabsTrigger>
                        <TabsTrigger value="history" className="data-[state=active]:bg-slate-700">
                            <Clock className="h-4 w-4 mr-2" />
                            History
                        </TabsTrigger>
                    </TabsList>

                    {/* Summary Tab */}
                    <TabsContent value="summary" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Present Days */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Present</p>
                                                <p className="text-3xl font-bold text-emerald-400">{summaryData?.summary?.present || 0}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                            </div>
                                        </div>
                                        <Progress
                                            value={((summaryData?.summary?.present || 0) / (summaryData?.working_days || 1)) * 100}
                                            className="mt-3 h-1.5 bg-emerald-500/20"
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Absent Days */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <Card className="border-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 backdrop-blur-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Absent</p>
                                                <p className="text-3xl font-bold text-red-400">{summaryData?.summary?.absent || 0}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                                <XCircle className="h-6 w-6 text-red-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* On Leave */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">On Leave</p>
                                                <p className="text-3xl font-bold text-blue-400">{summaryData?.summary?.on_leave || 0}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <Calendar className="h-6 w-6 text-blue-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Hours Worked */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Hours Worked</p>
                                                <p className="text-3xl font-bold text-purple-400">{summaryData?.hours?.worked || 0}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                <Timer className="h-6 w-6 text-purple-400" />
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Expected: {summaryData?.hours?.expected || 0}h
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Punctuality Stats */}
                        {summaryData?.punctuality && (
                            <Card className="border-slate-700/50 bg-slate-800/30">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                                        Punctuality
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-lg bg-slate-900/50">
                                            <p className="text-sm text-muted-foreground">On Time</p>
                                            <p className="text-2xl font-bold text-emerald-400">{summaryData.punctuality.on_time}</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-slate-900/50">
                                            <p className="text-sm text-muted-foreground">Late Arrivals</p>
                                            <p className="text-2xl font-bold text-amber-400">{summaryData.punctuality.late_arrivals}</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-slate-900/50">
                                            <p className="text-sm text-muted-foreground">Avg Late (mins)</p>
                                            <p className="text-2xl font-bold text-orange-400">{summaryData.punctuality.average_late_minutes}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Calendar Tab */}
                    <TabsContent value="calendar">
                        <Card className="border-slate-700/50 bg-slate-800/30">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
                                    <CardDescription>Your attendance calendar</CardDescription>
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
                                        const record = getAttendanceForDay(day);
                                        const holiday = isHoliday(day);
                                        const isTodayDay = isToday(day);

                                        return (
                                            <motion.div
                                                key={day.toISOString()}
                                                whileHover={{ scale: 1.05 }}
                                                className={`
                        aspect-square p-1 rounded-lg flex flex-col items-center justify-center text-sm cursor-default
                        ${isTodayDay ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''}
                        ${holiday ? 'bg-amber-500/20' : record ? statusColors[record.status]?.replace('text-', 'bg-').split(' ')[0] : 'bg-slate-800/50'}
                      `}
                                            >
                                                <span className={`font-medium ${isTodayDay ? 'text-blue-400' : ''}`}>
                                                    {format(day, 'd')}
                                                </span>
                                                {record && (
                                                    <span className="text-[10px] mt-0.5 opacity-80">
                                                        {record.status === 'present' ? '✓' : record.status === 'absent' ? '✗' : record.status === 'on_leave' ? '🏖' : ''}
                                                    </span>
                                                )}
                                                {holiday && (
                                                    <span className="text-[10px] text-amber-400">🎉</span>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-700/50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-emerald-500/40" />
                                        <span className="text-xs text-muted-foreground">Present</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-red-500/40" />
                                        <span className="text-xs text-muted-foreground">Absent</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-blue-500/40" />
                                        <span className="text-xs text-muted-foreground">On Leave</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-amber-500/40" />
                                        <span className="text-xs text-muted-foreground">Holiday</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history">
                        <Card className="border-slate-700/50 bg-slate-800/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Attendance History
                                </CardTitle>
                                <CardDescription>
                                    {format(startOfMonth(currentMonth), 'MMM d')} - {format(endOfMonth(currentMonth), 'MMM d, yyyy')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {attendanceLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : attendanceData?.records?.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No attendance records found for this period.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {attendanceData?.records?.map((record) => (
                                            <motion.div
                                                key={record.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 hover:bg-slate-900/70 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center">
                                                        <p className="text-lg font-bold">{format(parseISO(record.date), 'd')}</p>
                                                        <p className="text-xs text-muted-foreground">{format(parseISO(record.date), 'EEE')}</p>
                                                    </div>
                                                    <div>
                                                        <Badge variant="outline" className={statusColors[record.status]}>
                                                            {statusLabels[record.status]}
                                                        </Badge>
                                                        {record.is_late && (
                                                            <Badge variant="outline" className="ml-2 bg-amber-500/20 text-amber-400 border-amber-500/30">
                                                                Late
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 text-sm">
                                                    {record.check_in_time && (
                                                        <div className="text-right">
                                                            <p className="text-muted-foreground text-xs">In</p>
                                                            <p className="font-medium">{format(parseISO(record.check_in_time), 'hh:mm a')}</p>
                                                        </div>
                                                    )}
                                                    {record.check_out_time && (
                                                        <div className="text-right">
                                                            <p className="text-muted-foreground text-xs">Out</p>
                                                            <p className="font-medium">{format(parseISO(record.check_out_time), 'hh:mm a')}</p>
                                                        </div>
                                                    )}
                                                    {record.worked_hours && (
                                                        <div className="text-right">
                                                            <p className="text-muted-foreground text-xs">Hours</p>
                                                            <p className="font-medium text-emerald-400">{record.worked_hours.toFixed(1)}h</p>
                                                        </div>
                                                    )}
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
        </MemberLayout>
    );
}
