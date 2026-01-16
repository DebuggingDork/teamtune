import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTeamCollaborators, useRemoveCollaborator } from '@/hooks/useGithub';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Trash2, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function CollaboratorManagement({ teamCode }: { teamCode: string }) {
    const { data: collaborators, isLoading } = useTeamCollaborators(teamCode);
    const removeMutation = useRemoveCollaborator();

    const handleRemove = (userCode: string) => {
        if (confirm('Remove this collaborator?')) {
            removeMutation.mutate({ teamCode, userCode });
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Collaborators</CardTitle>
                    <CardDescription>Manage repository access for this team.</CardDescription>
                </div>
                <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Collaborator
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {collaborators?.map(collab => (
                        <div key={collab.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>{collab.full_name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{collab.full_name}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>@{collab.github_username}</span>
                                        <span>•</span>
                                        <span className="capitalize">{collab.permission}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {collab.invitation_status === 'pending' && <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">Pending</Badge>}
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={() => handleRemove(collab.user_code)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {(!collaborators || collaborators.length === 0) && (
                        <div className="text-center py-6 text-muted-foreground">No collaborators added yet.</div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
