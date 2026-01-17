import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTeamCollaborators, useRemoveCollaborator } from '@/hooks/useGithub';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Trash2, UserPlus, Shield, ExternalLink, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddCollaboratorModal } from './AddCollaboratorModal';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

export function CollaboratorManagement({ teamCode }: { teamCode: string }) {
    const { data: collaborators, isLoading } = useTeamCollaborators(teamCode);
    const removeMutation = useRemoveCollaborator();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleRemove = async (userCode: string, name: string) => {
        if (confirm(`Are you sure you want to remove ${name} from the repository?`)) {
            try {
                await removeMutation.mutateAsync({ teamCode, userCode });
                toast({
                    title: 'Removed',
                    description: `${name} has been removed from the repository.`,
                });
            } catch (error: any) {
                toast({
                    title: 'Error',
                    description: error?.response?.data?.message || 'Failed to remove collaborator.',
                    variant: 'destructive',
                });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading collaborators...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-row items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Repository Access Control
                    </h3>
                    <p className="text-sm text-muted-foreground">Manage who can contribute to this team's codebase.</p>
                </div>
                <Button
                    size="sm"
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 shadow-md group border-none"
                >
                    <UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Invite Member
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                    {collaborators?.map((collab, index) => (
                        <motion.div
                            key={collab.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="group relative flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/30 hover:bg-background/60 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-12 w-12 border-2 border-background shadow-inner">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {collab.full_name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${collab.invitation_status === 'accepted' ? 'bg-green-500' : 'bg-yellow-500'
                                        }`} />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground group-hover:text-primary transition-colors">{collab.full_name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider py-0 px-1.5 h-5">
                                            {collab.permission}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            @{collab.github_username}
                                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {collab.invitation_status === 'pending' && (
                                    <Badge variant="outline" className="text-[10px] text-yellow-600 bg-yellow-50/50 border-yellow-200">
                                        Invited
                                    </Badge>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={() => handleRemove(collab.user_code, collab.full_name)}
                                    disabled={removeMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {(!collaborators || collaborators.length === 0) && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/50 rounded-2xl bg-accent/5">
                        <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground font-medium">No collaborators found</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">Start by inviting your team members to the repository.</p>
                        <Button
                            variant="outline"
                            className="mt-6"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add First Collaborator
                        </Button>
                    </div>
                )}
            </div>

            <AddCollaboratorModal
                teamCode={teamCode}
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
}
