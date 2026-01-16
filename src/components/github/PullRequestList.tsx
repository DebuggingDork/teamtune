import { useMyPullRequests } from '@/hooks/useGithub';
import { GitPullRequest, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function PullRequestList() {
    const { data: prs, isLoading } = useMyPullRequests('open');

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
    }

    if (!prs || prs.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
                No open pull requests.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {prs.map(pr => (
                <div key={pr.id} className="flex flex-col sm:flex-row sm:items-start justify-between p-4 border rounded-lg gap-4 hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <GitPullRequest className="h-4 w-4 text-green-500" />
                            <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                                {pr.title}
                            </a>
                            <span className="text-muted-foreground">#{pr.pr_number}</span>
                            {pr.draft && <Badge variant="secondary">Draft</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                            {pr.head_branch} <span className="text-muted-foreground/50">→</span> {pr.base_branch}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Created {format(new Date(pr.created_at), 'MMM d, yyyy')}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
