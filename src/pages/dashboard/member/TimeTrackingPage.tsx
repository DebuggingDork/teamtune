import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  X,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { MemberLayout } from "@/components/layouts/MemberLayout";
import {
  useMyTimeEntries,
  useCreateTimeEntry,
  useUpdateMyTimeEntry,
  useDeleteMyTimeEntry,
  useMyTasks,
} from "@/hooks/useEmployee";
import { toast } from "@/hooks/use-toast";
import type { CreateTimeEntryRequest, UpdateTimeEntryRequest, TimeEntryFilters } from "@/api/types";
import { format } from "date-fns";

const TimeTrackingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [newEntry, setNewEntry] = useState<CreateTimeEntryRequest>({
    task_code: "",
    work_date: new Date().toISOString().split('T')[0],
    hours: 0,
    description: "",
  });

  // Get tasks for dropdown
  const { data: tasksData } = useMyTasks({ page: 1, limit: 100 });
  const tasks = tasksData?.tasks || [];

  // Get time entries
  const filters: TimeEntryFilters = useMemo(() => {
    const f: TimeEntryFilters = { page: 1, limit: 100 };
    if (startDateFilter) f.start_date = startDateFilter;
    if (endDateFilter) f.end_date = endDateFilter;
    return f;
  }, [startDateFilter, endDateFilter]);

  const { data: timeEntriesData, isLoading: isLoadingEntries } = useMyTimeEntries(filters);
  const timeEntries = timeEntriesData?.time_entries || [];

  // Mutations
  const createEntryMutation = useCreateTimeEntry();
  const updateEntryMutation = useUpdateMyTimeEntry();
  const deleteEntryMutation = useDeleteMyTimeEntry();

  // Filter entries
  const filteredEntries = useMemo(() => {
    let filtered = timeEntries;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.task_title?.toLowerCase().includes(query) ||
          entry.description?.toLowerCase().includes(query) ||
          entry.task_code.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [timeEntries, searchQuery]);

  // Calculate totals
  const totalHours = useMemo(() => {
    return filteredEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
  }, [filteredEntries]);

  const handleCreateEntry = async () => {
    if (!newEntry.task_code || !newEntry.work_date || newEntry.hours <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and ensure hours is greater than 0.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createEntryMutation.mutateAsync(newEntry);
      toast({
        title: "Success",
        description: "Time entry created successfully.",
      });
      setIsCreateDialogOpen(false);
      setNewEntry({
        task_code: "",
        work_date: new Date().toISOString().split('T')[0],
        hours: 0,
        description: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create time entry.",
        variant: "destructive",
      });
    }
  };

  const handleEditEntry = async () => {
    if (!selectedEntry || newEntry.hours <= 0) {
      return;
    }

    try {
      const updateData: UpdateTimeEntryRequest = {
        work_date: newEntry.work_date,
        hours: newEntry.hours,
        description: newEntry.description,
      };
      await updateEntryMutation.mutateAsync({
        timeCode: selectedEntry.time_code,
        data: updateData,
      });
      toast({
        title: "Success",
        description: "Time entry updated successfully.",
      });
      setIsEditDialogOpen(false);
      setSelectedEntry(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update time entry.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;

    try {
      await deleteEntryMutation.mutateAsync(selectedEntry.time_code);
      toast({
        title: "Success",
        description: "Time entry deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedEntry(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete time entry.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (entry: any) => {
    setSelectedEntry(entry);
    setNewEntry({
      task_code: entry.task_code,
      work_date: entry.work_date.split('T')[0],
      hours: entry.hours,
      description: entry.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (entry: any) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  // Group entries by date for reports
  const entriesByDate = useMemo(() => {
    const grouped: Record<string, typeof filteredEntries> = {};
    filteredEntries.forEach((entry) => {
      const date = entry.work_date.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(entry);
    });
    return grouped;
  }, [filteredEntries]);

  return (
    <MemberLayout
      headerTitle="Time Tracking"
      headerDescription="Log and manage your time entries"
      headerActions={
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Time
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Time Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold text-foreground">{filteredEntries.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average per Entry</p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredEntries.length > 0
                    ? (totalHours / filteredEntries.length).toFixed(1)
                    : "0.0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                />
              </div>
              {(searchQuery || startDateFilter || endDateFilter) && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setStartDateFilter("");
                      setEndDateFilter("");
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Time Entries List */}
        <Card>
          <CardHeader>
            <CardTitle>Time Entries ({filteredEntries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingEntries ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No time entries found</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(entriesByDate)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([date, entries]) => (
                    <div key={date} className="space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b">
                        <h3 className="font-medium text-foreground">
                          {format(new Date(date), "EEEE, MMMM d, yyyy")}
                        </h3>
                        <Badge variant="secondary">
                          {entries.reduce((sum, e) => sum + e.hours, 0).toFixed(1)}h
                        </Badge>
                      </div>
                      {entries.map((entry) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-3 bg-accent/50 rounded-lg border border-border hover:bg-accent transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-foreground">
                                {entry.task_title || entry.task_code}
                              </h4>
                              <Badge variant="outline">{entry.hours}h</Badge>
                            </div>
                            {entry.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {entry.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span>{entry.task_code}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(entry)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(entry)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Time Entry Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Time Entry</DialogTitle>
            <DialogDescription>Record time spent on a task.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task_code">Task *</Label>
              <Select
                value={newEntry.task_code}
                onValueChange={(value) => setNewEntry({ ...newEntry, task_code: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.task_code} value={task.task_code}>
                      {task.title} ({task.task_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="work_date">Work Date *</Label>
                <Input
                  id="work_date"
                  type="date"
                  value={newEntry.work_date}
                  onChange={(e) => setNewEntry({ ...newEntry, work_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hours">Hours *</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={newEntry.hours}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, hours: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What did you work on?"
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEntry} disabled={createEntryMutation.isPending}>
              {createEntryMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                "Log Time"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Time Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
            <DialogDescription>Update time entry details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Task</Label>
              <Input value={selectedEntry?.task_title || selectedEntry?.task_code || ""} disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-work_date">Work Date *</Label>
                <Input
                  id="edit-work_date"
                  type="date"
                  value={newEntry.work_date}
                  onChange={(e) => setNewEntry({ ...newEntry, work_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-hours">Hours *</Label>
                <Input
                  id="edit-hours"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={newEntry.hours}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, hours: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEntry} disabled={updateEntryMutation.isPending}>
              {updateEntryMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Entry"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedEntry(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEntry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteEntryMutation.isPending}
            >
              {deleteEntryMutation.isPending ? (
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
    </MemberLayout>
  );
};

export default TimeTrackingPage;




