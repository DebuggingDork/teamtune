import { Button } from '@/components/ui/button';
import { useMyBranches } from '@/hooks/useGithub';
import { GitBranch, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function MyBranchList() {
    const { data: branches, isLoading } = useMyBranches();

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
    }

    if (!branches || branches.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
                No active branches found.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {branches.map(branch => (
                <div key={branch.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <GitBranch className="h-4 w-4 text-purple-500" />
                            <span className="font-medium">{branch.name}</span>
                            {branch.is_protected && <Badge variant="outline" className="text-xs">Protected</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {branch.repository_name} • {branch.commits_ahead ? `${branch.commits_ahead} commits ahead` : 'Up to date'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Last commit {branch.last_commit_at ? format(new Date(branch.last_commit_at), 'MMM d, h:mm a') : 'Unknown'}
                        </div>
                    </div>
                    <Button size="sm" variant="secondary" className="gap-2">
                        Create PR <ArrowRight className="h-3 w-3" />
                    </Button>
                </div>
            ))}
        </div>
    );
}
