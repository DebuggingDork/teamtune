import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamLeadLayout } from '@/components/layouts/TeamLeadLayout';
import { GitHubConnectionCard } from '@/components/github/GitHubConnectionCard';
import { RepositoryList } from '@/components/github/RepositoryList';
import { CollaboratorManagement } from '@/components/github/CollaboratorManagement';
import { TeamPullRequestList } from '@/components/github/TeamPullRequestList';
import { GitHubGlassCard } from '@/components/github/GitHubGlassCard';
import { Button } from '@/components/ui/button';
import { CreateRepositoryModal } from '@/components/github/CreateRepositoryModal';
import { useMyTeams } from '@/hooks/useTeamLead';
import { useTeamRepository } from '@/hooks/useGithub';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Github, Users, GitPullRequest, Settings, AlertCircle } from 'lucide-react';

export default function TeamLeadGithubPage() {
    const { isAuthenticated } = useAuth();
    const { data: teamsData } = useMyTeams(isAuthenticated);
    const [isCreateRepoOpen, setIsCreateRepoOpen] = useState(false);

    const teamCode = useMemo(() => {
        if (teamsData?.teams && teamsData.teams.length > 0) {
            return teamsData.teams[0].team_code;
        }
        return null;
    }, [teamsData]);

    const { data: teamRepo, isLoading: isLoadingRepo } = useTeamRepository(teamCode || '');
    const hasLinkedRepository = !!teamRepo?.repository;

    return (
        <TeamLeadLayout>
            <div className="space-y-8 max-w-7xl mx-auto pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                            GitHub Workspace
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Orchestrate team repositories, collaborators, and code reviews.
                        </p>
                    </div>
                    {teamCode && (
                        <Button
                            onClick={() => setIsCreateRepoOpen(true)}
                            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Create Repository
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    <div className="xl:col-span-3 space-y-8">
                        <Tabs defaultValue="repositories" className="w-full">
                            <TabsList className="mb-8 w-full justify-start overflow-x-auto bg-background/50 backdrop-blur-md border border-border/50 p-1 rounded-xl h-auto">
                                <TabsTrigger
                                    value="repositories"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-2.5 rounded-lg transition-all duration-300"
                                >
                                    <Github className="mr-2 h-4 w-4" /> Repositories
                                </TabsTrigger>
                                <TabsTrigger
                                    value="collaborators"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-2.5 rounded-lg transition-all duration-300"
                                >
                                    <Users className="mr-2 h-4 w-4" /> Team Access
                                </TabsTrigger>
                                <TabsTrigger
                                    value="pull-requests"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-2.5 rounded-lg transition-all duration-300"
                                >
                                    <GitPullRequest className="mr-2 h-4 w-4" /> Team PRs
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="repositories" className="space-y-6 pt-2 focus-visible:outline-none focus-visible:ring-0">
                                <GitHubGlassCard delay={0.1} title="Active Repositories" icon={<Settings className="h-5 w-5" />}>
                                    <RepositoryList />
                                </GitHubGlassCard>
                            </TabsContent>

                            <TabsContent value="collaborators" className="space-y-6 pt-2 focus-visible:outline-none focus-visible:ring-0">
                                <GitHubGlassCard delay={0.1} title="Collaborator Management" icon={<Users className="h-5 w-5" />}>
                                    {teamCode && hasLinkedRepository ? (
                                        <CollaboratorManagement teamCode={teamCode} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-12 text-center">
                                            <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                            <p className="text-muted-foreground font-medium">No linked repository</p>
                                            <p className="text-sm text-muted-foreground/70 mt-1">Create or link a repository first to manage collaborators.</p>
                                        </div>
                                    )}
                                </GitHubGlassCard>
                            </TabsContent>

                            <TabsContent value="pull-requests" className="space-y-6 pt-2 focus-visible:outline-none focus-visible:ring-0">
                                <GitHubGlassCard delay={0.1} title="Team Pull Requests" icon={<GitPullRequest className="h-5 w-5" />}>
                                    {teamCode && hasLinkedRepository ? (
                                        <TeamPullRequestList teamCode={teamCode} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-12 text-center">
                                            <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                            <p className="text-muted-foreground font-medium">No linked repository</p>
                                            <p className="text-sm text-muted-foreground/70 mt-1">Create or link a repository first to view pull requests.</p>
                                        </div>
                                    )}
                                </GitHubGlassCard>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="xl:col-span-1 space-y-6">
                        <GitHubConnectionCard />

                        <GitHubGlassCard delay={0.2} gradient className="bg-gradient-to-br from-purple-500/10 to-primary/10">
                            <h3 className="text-lg font-bold mb-3">Sync Insights</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Keep your local team repository settings synchronized with GitHub organizations.
                            </p>
                            <Button variant="outline" className="w-full bg-background/50">
                                View Logs
                            </Button>
                        </GitHubGlassCard>
                    </div>
                </div>

                {teamCode && (
                    <CreateRepositoryModal
                        teamCode={teamCode}
                        isOpen={isCreateRepoOpen}
                        onClose={() => setIsCreateRepoOpen(false)}
                    />
                )}
            </div>
        </TeamLeadLayout>
    );
}
