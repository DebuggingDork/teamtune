import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAccessibleRepositories } from '@/hooks/useGithub';
import { ExternalLink, GitBranch, GitPullRequest, Loader2, Lock, Unlock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function RepositoryList() {
    const { data: repositories, isLoading } = useAccessibleRepositories();

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
    }

    if (!repositories || repositories.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    No repositories found. Ask your Team Lead to add you to a repository.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {repositories.map(repo => (
                <Card key={repo.id}>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {repo.full_name}
                                    {repo.is_private ? <Lock className="h-3 w-3 text-muted-foreground" /> : <Unlock className="h-3 w-3 text-muted-foreground" />}
                                </CardTitle>
                                <CardDescription>{repo.description || 'No description'}</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" asChild>
                                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                                <Badge variant="secondary" className="capitalize">{repo.permission} Access</Badge>
                            </span>
                            <span>Updated {format(new Date(repo.updated_at), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                                <GitBranch className="h-4 w-4" />
                                Branches
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                                <GitPullRequest className="h-4 w-4" />
                                Pull Requests
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
