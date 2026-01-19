import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAddCollaborators, useTeamCollaborators } from '@/hooks/useGithub';
import { useTeamInfo } from '@/hooks/useTeamLead';
import { toast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { GitHubPermission } from '@/api/types/index';

interface AddCollaboratorModalProps {
    teamCode: string;
    isOpen: boolean;
    onClose: () => void;
}

const PERMISSIONS: { value: GitHubPermission; label: string; desc: string }[] = [
    { value: 'read', label: 'Read', desc: 'Can view and clone' },
    { value: 'triage', label: 'Triage', desc: 'Can manage issues/PRs' },
    { value: 'write', label: 'Write', desc: 'Can push and manage PRs' },
    { value: 'maintain', label: 'Maintain', desc: 'Can manage settings' },
    { value: 'admin', label: 'Admin', desc: 'Full access' },
];

export function AddCollaboratorModal({ teamCode, isOpen, onClose }: AddCollaboratorModalProps) {
    const { data: teamInfo, isLoading: isLoadingTeam } = useTeamInfo(teamCode);
    const { data: collaborators } = useTeamCollaborators(teamCode);
    const addMutation = useAddCollaborators();

    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [permission, setPermission] = useState<GitHubPermission>('write');

    const availableMembers = useMemo(() => {
        if (!teamInfo?.members) return [];
        // Filter out those already in collaborators list
        const existingCodes = new Set(collaborators?.map(c => c.user_code) || []);
        return teamInfo.members.filter(m => !existingCodes.has(m.user_code));
    }, [teamInfo, collaborators]);

    const handleToggleUser = (userCode: string) => {
        setSelectedUsers(prev =>
            prev.includes(userCode)
                ? prev.filter(code => code !== userCode)
                : [...prev, userCode]
        );
    };

    const handleAdd = async () => {
        if (selectedUsers.length === 0) return;

        try {
            const result = await addMutation.mutateAsync({
                teamCode,
                data: {
                    user_codes: selectedUsers,
                    permission,
                }
            });

            const failures = result.results.filter(r => !r.success);
            if (failures.length > 0) {
                toast({
                    title: 'Partial Success',
                    description: `Added ${selectedUsers.length - failures.length} members. ${failures.length} failed (likely haven't connected GitHub).`,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Success',
                    description: `Successfully added ${selectedUsers.length} collaborators.`,
                });
            }

            onClose();
            setSelectedUsers([]);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Failed to add collaborators.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] border-border/50 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <UserPlus className="h-6 w-6 text-primary" />
                        Add Team Collaborators
                    </DialogTitle>
                    <DialogDescription>
                        Grant repository access to your team members. Only members who have connected their GitHub account can be added.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Select Team Members</label>
                        <div className="max-h-[200px] overflow-y-auto border border-border/30 rounded-lg p-2 space-y-1 bg-background/50">
                            {isLoadingTeam ? (
                                <div className="flex justify-center p-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
                            ) : availableMembers.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground p-4">No more members to add.</p>
                            ) : (
                                availableMembers.map(member => (
                                    <div
                                        key={member.user_code}
                                        className="flex items-center space-x-3 p-2 hover:bg-accent/20 rounded-md transition-colors cursor-pointer"
                                        onClick={() => handleToggleUser(member.user_code)}
                                    >
                                        <Checkbox
                                            checked={selectedUsers.includes(member.user_code)}
                                            onCheckedChange={() => handleToggleUser(member.user_code)}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium leading-none">{member.full_name}</p>
                                            <p className="text-xs text-muted-foreground">{member.user_code}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            Permission Level
                        </label>
                        <Select value={permission} onValueChange={(v) => setPermission(v as GitHubPermission)}>
                            <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Select permission" />
                            </SelectTrigger>
                            <SelectContent>
                                {PERMISSIONS.map(p => (
                                    <SelectItem key={p.value} value={p.value}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{p.label}</span>
                                            <span className="text-xs text-muted-foreground">{p.desc}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={addMutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAdd}
                        disabled={selectedUsers.length === 0 || addMutation.isPending}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {addMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            `Add ${selectedUsers.length} ${selectedUsers.length === 1 ? 'Collaborator' : 'Collaborators'}`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
