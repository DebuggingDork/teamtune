import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useMyBranches, useAccessibleRepositories } from '@/hooks/useGithub';
import { GitBranch, ArrowRight, Loader2, Calendar, GitCommit, Search, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CreatePRModal } from './CreatePRModal';
import { Input } from '@/components/ui/input';

export function MyBranchList() {
    const { data: branches, isLoading: isLoadingBranches } = useMyBranches();
    const { data: repositories } = useAccessibleRepositories();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRepo, setSelectedRepo] = useState<{ id: string; name: string; head: string } | null>(null);

    const filteredBranches = useMemo(() => {
        if (!Array.isArray(branches)) return [];
        return branches.filter(branch =>
            branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.repository_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [branches, searchQuery]);

    const handleCreatePR = (branchName: string, repoName: string) => {
        // Try to find repository ID by name
        const repo = repositories?.find(r => r.full_name === repoName || r.name === repoName);
        if (repo) {
            setSelectedRepo({
                id: repo.id.toString(),
                name: repo.full_name,
                head: branchName
            });
        } else {
            // Fallback or error
            console.error('Could not find repository for branch:', repoName);
        }
    };

    if (isLoadingBranches) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Scanning your branches...</p>
            </div>
        );
    }

    if (!Array.isArray(branches) || branches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/50 rounded-2xl bg-accent/5">
                <div className="h-16 w-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                    <GitBranch className="h-8 w-8 text-purple-500/40" />
                </div>
                <p className="text-muted-foreground font-medium">No active branches</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Ready to start a new feature? Create a branch in one of your repositories.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search branches or repositories..."
                    className="pl-9 bg-background/40 backdrop-blur-sm border-border/50 focus:ring-primary/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {filteredBranches?.map((branch, index) => (
                        <motion.div
                            key={branch.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="group relative bg-background/40 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-purple-500/30 hover:bg-background/60 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                            <GitBranch className="h-4 w-4 text-purple-500" />
                                        </div>
                                        <span className="font-bold text-foreground group-hover:text-purple-600 transition-colors">{branch.name}</span>
                                        {branch.is_protected && (
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase py-0 px-1.5 h-5 border-purple-200 text-purple-700 bg-purple-50">
                                                Protected
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground/80">{branch.repository_name}</span>
                                        <span className="flex items-center gap-1">
                                            <GitCommit className="h-3.5 w-3.5" />
                                            {branch.commits_ahead ? `${branch.commits_ahead} ahead` : 'Synced with main'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {branch.last_commit_at ? format(new Date(branch.last_commit_at), 'MMM d, h:mm a') : 'Uncommitted'}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-9 gap-2 bg-purple-500/10 hover:bg-purple-500 hover:text-white transition-all rounded-lg border-none"
                                    onClick={() => handleCreatePR(branch.name, branch.repository_name)}
                                >
                                    Create PR <Plus className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {selectedRepo && (
                <CreatePRModal
                    repositoryId={Number(selectedRepo.id)}
                    repositoryName={selectedRepo.name}
                    isOpen={!!selectedRepo}
                    defaultHead={selectedRepo.head}
                    onClose={() => setSelectedRepo(null)}
                />
            )}
        </div>
    );
}
