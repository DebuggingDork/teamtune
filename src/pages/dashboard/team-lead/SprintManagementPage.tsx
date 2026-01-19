import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    PlayCircle,
    AlertCircle,
    Plus,
    Edit2,
    MoreVertical,
    Loader2,
    ArrowRight,
    TrendingUp,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TeamLeadLayout } from "@/components/layouts/TeamLeadLayout";
import {
    useMyTeams,
    useTeamSprints,
    useUpdateSprint,
    useCloseSprint,
    useCreateSprint,
} from "@/hooks/useTeamLead";
import { toast } from "@/hooks/use-toast";
import type { Sprint, UpdateSprintRequest, CloseSprintRequest, CreateSprintRequest } from "@/api/types/index";
import { format } from "date-fns";

const StatusBadge = ({ status }: { status: Sprint['status'] }) => {
    const styles = {
        planning: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        active: "bg-green-500/10 text-green-500 border-green-500/20",
        completed: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        cancelled: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    };

    return (
        <Badge variant="outline" className={styles[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
};

const SprintManagementPage = () => {
    const [isEditSpritOpen, setIsEditSprintOpen] = useState(false);
    const [isCloseSprintOpen, setIsCloseSprintOpen] = useState(false);
    const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
    const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

    // Form states
    const [editFormData, setEditFormData] = useState<UpdateSprintRequest>({});
    const [closeFormData, setCloseFormData] = useState<CloseSprintRequest>({ action: 'complete', notes: '' });
    const [createFormData, setCreateFormData] = useState<Partial<CreateSprintRequest>>({
        name: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        capacity_hours: 160,
        goals: [],
    });
    const [newGoal, setNewGoal] = useState('');

    // Get teams to get teamCode
    const { data: teamsData, isLoading: isLoadingTeams } = useMyTeams();
    const teamCode = useMemo(() => teamsData?.teams?.[0]?.team_code || null, [teamsData]);
    const teamId = useMemo(() => teamsData?.teams?.[0]?.id || null, [teamsData]);
    const projectId = useMemo(() => teamsData?.teams?.[0]?.project_id || null, [teamsData]);

    // Get sprints
    const { data: sprintsData, isLoading: isLoadingSprints, refetch: refetchSprints } = useTeamSprints(teamCode || "");
    const sprints = sprintsData || [];

    // Debug logging
    console.log('Sprint Management Debug:', { sprintsData, sprints, isArray: Array.isArray(sprints) });

    // Mutations
    const createSprintMutation = useCreateSprint();
    const updateSprintMutation = useUpdateSprint();
    const closeSprintMutation = useCloseSprint();

    const handleEditClick = (sprint: Sprint) => {
        setSelectedSprint(sprint);
        setEditFormData({
            name: sprint.name,
            description: sprint.description,
            start_date: sprint.start_date.split('T')[0],
            end_date: sprint.end_date.split('T')[0],
            capacity_hours: sprint.capacity_hours,
            goals: sprint.goals || [],
        });
        setIsEditSprintOpen(true);
    };

    const handleCloseClick = (sprint: Sprint) => {
        setSelectedSprint(sprint);
        setCloseFormData({ action: 'complete', notes: '' });
        setIsCloseSprintOpen(true);
    };

    const handleUpdateSprint = async () => {
        if (!selectedSprint) return;
        try {
            await updateSprintMutation.mutateAsync({
                sprintCode: selectedSprint.sprint_code,
                data: editFormData
            });
            toast({ title: "Success", description: "Sprint updated successfully" });
            setIsEditSprintOpen(false);
            refetchSprints();
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to update sprint", variant: "destructive" });
        }
    };

    const handleActivateSprint = async (sprint: Sprint) => {
        try {
            await updateSprintMutation.mutateAsync({
                sprintCode: sprint.sprint_code,
                data: { status: 'active' }
            });
            toast({ title: "Success", description: "Sprint activated successfully" });
            refetchSprints();
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to activate sprint", variant: "destructive" });
        }
    };

    const handleCloseSprint = async () => {
        if (!selectedSprint) return;
        try {
            await closeSprintMutation.mutateAsync({
                sprintCode: selectedSprint.sprint_code,
                data: closeFormData
            });
            toast({ title: "Success", description: `Sprint ${closeFormData.action === 'complete' ? 'completed' : 'cancelled'} successfully` });
            setIsCloseSprintOpen(false);
            refetchSprints();
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to close sprint", variant: "destructive" });
        }
    };

    const handleCreateSprint = async () => {
        if (!teamId || !projectId) return;
        try {
            await createSprintMutation.mutateAsync({
                ...createFormData,
                team_id: teamId,
                project_id: projectId,
                sprint_number: (sprints?.length || 0) + 1
            } as CreateSprintRequest);
            toast({ title: "Success", description: "Sprint created successfully" });
            setIsCreateSprintOpen(false);
            refetchSprints();
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to create sprint", variant: "destructive" });
        }
    };

    const addGoal = () => {
        if (!newGoal.trim()) return;
        if (isEditSpritOpen) {
            setEditFormData(prev => ({ ...prev, goals: [...(prev.goals || []), newGoal.trim()] }));
        } else {
            setCreateFormData(prev => ({ ...prev, goals: [...(prev.goals || []), newGoal.trim()] }));
        }
        setNewGoal('');
    };

    const removeGoal = (index: number) => {
        if (isEditSpritOpen) {
            setEditFormData(prev => ({ ...prev, goals: prev.goals?.filter((_, i) => i !== index) }));
        } else {
            setCreateFormData(prev => ({ ...prev, goals: prev.goals?.filter((_, i) => i !== index) }));
        }
    };

    const isLoading = isLoadingTeams || isLoadingSprints;

    return (
        <TeamLeadLayout
            headerTitle="Sprint Management"
            headerDescription="Plan, track, and close your team's sprints"
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold tracking-tight">Sprints</h2>
                    <Button onClick={() => setIsCreateSprintOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Sprint
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading sprints...</p>
                    </div>
                ) : !sprints || sprints.length === 0 ? (
                    <Card className="bg-accent/20 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                            <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <CardTitle>No sprints found</CardTitle>
                            <CardDescription className="mt-2">
                                You haven't created any sprints for this team yet.
                            </CardDescription>
                            <Button className="mt-6" onClick={() => setIsCreateSprintOpen(true)}>
                                Create your first sprint
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {sprints.map((sprint, index) => (
                            <motion.div
                                key={sprint.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="overflow-hidden hover:border-primary/50 transition-colors">
                                    <div className={`h-1 w-full ${sprint.status === 'active' ? 'bg-green-500' :
                                        sprint.status === 'planning' ? 'bg-blue-500' :
                                            'bg-slate-200'
                                        }`} />
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-semibold">{sprint.name}</h3>
                                                    <StatusBadge status={sprint.status} />
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {format(new Date(sprint.start_date), 'MMM d')} - {format(new Date(sprint.end_date), 'MMM d, yyyy')}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {sprint.capacity_hours} hours
                                                    </div>
                                                    {sprint.velocity !== null && (
                                                        <div className="flex items-center gap-1 text-purple-600 font-medium">
                                                            <TrendingUp className="h-3.5 w-3.5" />
                                                            Velocity: {sprint.velocity}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {sprint.status === 'planning' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                        onClick={() => handleActivateSprint(sprint)}
                                                        disabled={updateSprintMutation.isPending}
                                                    >
                                                        <PlayCircle className="h-4 w-4 mr-2" />
                                                        Activate
                                                    </Button>
                                                )}
                                                {sprint.status === 'active' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-green-600 border-green-200 hover:bg-green-50"
                                                        onClick={() => handleCloseClick(sprint)}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                        Close
                                                    </Button>
                                                )}

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEditClick(sprint)}>
                                                            <Edit2 className="h-4 w-4 mr-2" />
                                                            Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            disabled={sprint.status === 'completed' || sprint.status === 'cancelled'}
                                                            onClick={() => {
                                                                setSelectedSprint(sprint);
                                                                setCloseFormData({ action: 'cancel', notes: '' });
                                                                setIsCloseSprintOpen(true);
                                                            }}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Cancel Sprint
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {sprint.goals && sprint.goals.length > 0 && (
                                            <div className="mt-4 pt-4 border-t">
                                                <p className="text-sm font-medium mb-2">Goals</p>
                                                <ul className="grid md:grid-cols-2 gap-2">
                                                    {sprint.goals.map((goal, i) => (
                                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                                                            {goal}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Sprint Dialog */}
            <Dialog open={isEditSpritOpen} onOpenChange={setIsEditSprintOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Sprint</DialogTitle>
                        <DialogDescription>Update sprint details and goals.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Sprint Name</Label>
                            <Input
                                id="edit-name"
                                value={editFormData.name}
                                onChange={e => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-start">Start Date</Label>
                                <Input
                                    id="edit-start"
                                    type="date"
                                    value={editFormData.start_date}
                                    onChange={e => setEditFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-end">End Date</Label>
                                <Input
                                    id="edit-end"
                                    type="date"
                                    value={editFormData.end_date}
                                    onChange={e => setEditFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-capacity">Capacity (Hours)</Label>
                            <Input
                                id="edit-capacity"
                                type="number"
                                value={editFormData.capacity_hours}
                                onChange={e => setEditFormData(prev => ({ ...prev, capacity_hours: parseInt(e.target.value) }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Sprint Goals</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a goal..."
                                    value={newGoal}
                                    onChange={e => setNewGoal(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addGoal()}
                                />
                                <Button type="button" size="icon" onClick={addGoal}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto pr-2">
                                {editFormData.goals?.map((goal, i) => (
                                    <div key={i} className="flex items-center justify-between bg-accent/50 p-2 rounded text-sm">
                                        <span className="truncate">{goal}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeGoal(i)}>
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditSprintOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateSprint} disabled={updateSprintMutation.isPending}>
                            {updateSprintMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Close Sprint Dialog */}
            <Dialog open={isCloseSprintOpen} onOpenChange={setIsCloseSprintOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{closeFormData.action === 'complete' ? 'Complete' : 'Cancel'} Sprint</DialogTitle>
                        <DialogDescription>
                            {closeFormData.action === 'complete'
                                ? "Officially finish the sprint. Velocity will be calculated automatically based on 'Done' tasks."
                                : "Cancel this sprint. This action cannot be undone."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="close-notes">Notes (Optional)</Label>
                            <Textarea
                                id="close-notes"
                                placeholder="What went well? What could be improved?"
                                value={closeFormData.notes}
                                onChange={e => setCloseFormData(prev => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>
                        {closeFormData.action === 'complete' && (
                            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-700">
                                    Ensure all completed tasks are marked as <strong>'Done'</strong> before closing to ensure accurate velocity calculation.
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCloseSprintOpen(false)}>Back</Button>
                        <Button
                            variant={closeFormData.action === 'complete' ? 'default' : 'destructive'}
                            onClick={handleCloseSprint}
                            disabled={closeSprintMutation.isPending}
                        >
                            {closeSprintMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Confirm {closeFormData.action === 'complete' ? 'Completion' : 'Cancellation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Sprint Dialog */}
            <Dialog open={isCreateSprintOpen} onOpenChange={setIsCreateSprintOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Sprint</DialogTitle>
                        <DialogDescription>Define the scope and dates for your next sprint.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-name">Sprint Name</Label>
                            <Input
                                id="create-name"
                                placeholder="e.g., Sprint 1, Q1 Foundation"
                                value={createFormData.name}
                                onChange={e => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-start">Start Date</Label>
                                <Input
                                    id="create-start"
                                    type="date"
                                    value={createFormData.start_date}
                                    onChange={e => setCreateFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-end">End Date</Label>
                                <Input
                                    id="create-end"
                                    type="date"
                                    value={createFormData.end_date}
                                    onChange={e => setCreateFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-capacity">Capacity (Hours)</Label>
                            <Input
                                id="create-capacity"
                                type="number"
                                value={createFormData.capacity_hours}
                                onChange={e => setCreateFormData(prev => ({ ...prev, capacity_hours: parseInt(e.target.value) }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Sprint Goals</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a goal..."
                                    value={newGoal}
                                    onChange={e => setNewGoal(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addGoal()}
                                />
                                <Button type="button" size="icon" onClick={addGoal}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto pr-2">
                                {createFormData.goals?.map((goal, i) => (
                                    <div key={i} className="flex items-center justify-between bg-accent/50 p-2 rounded text-sm">
                                        <span className="truncate">{goal}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeGoal(i)}>
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateSprintOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateSprint} disabled={createSprintMutation.isPending || !createFormData.name}>
                            {createSprintMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create Sprint
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TeamLeadLayout>
    );
};

export default SprintManagementPage;
