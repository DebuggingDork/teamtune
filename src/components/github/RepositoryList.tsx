import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAccessibleRepositories } from '@/hooks/useGithub';
import { ExternalLink, GitBranch, GitPullRequest, Loader2, Lock, Unlock, Search, Globe, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateBranchModal } from './CreateBranchModal';
import { CreatePRModal } from './CreatePRModal';
import { Input } from '@/components/ui/input';

export function RepositoryList() {
    const { data: repositories, isLoading } = useAccessibleRepositories();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRepo, setSelectedRepo] = useState<{ id: number; name: string } | null>(null);
    const [modalMode, setModalMode] = useState<'branch' | 'pr' | null>(null);

    const filteredRepos = Array.isArray(repositories) ? repositories.filter(repo =>
        repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Accessing repositories...</p>
            </div>
        );
    }

    if (!Array.isArray(repositories) || repositories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/50 rounded-2xl bg-accent/5">
                <Globe className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">No repositories assigned</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Ask your Team Lead to grant you access to team repositories.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Filter repositories..."
                    className="pl-9 bg-background/40 backdrop-blur-sm border-border/50 focus:ring-primary/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {filteredRepos?.map((repo, index) => (
                        <motion.div
                            key={repo.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="group relative bg-background/40 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:border-primary/30 hover:bg-background/60 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            {repo.is_private ? (
                                                <Lock className="h-5 w-5 text-primary" />
                                            ) : (
                                                <Unlock className="h-5 w-5 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg flex items-center gap-2 group-hover:text-primary transition-colors">
                                                {repo.full_name}
                                                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                                                </a>
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{repo.description || 'No description provided'}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-xs mt-3">
                                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 font-bold uppercase tracking-wider h-5">
                                            {repo.permission}
                                        </Badge>
                                        <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Updated {format(new Date(repo.updated_at), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 gap-2 bg-background/50 hover:bg-primary hover:text-primary-foreground border-border/50 transition-all rounded-lg"
                                        onClick={() => {
                                            setSelectedRepo({ id: repo.id, name: repo.full_name });
                                            setModalMode('branch');
                                        }}
                                    >
                                        <GitBranch className="h-4 w-4" />
                                        New Branch
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 gap-2 bg-background/50 hover:bg-primary hover:text-primary-foreground border-border/50 transition-all rounded-lg"
                                        onClick={() => {
                                            setSelectedRepo({ id: repo.id, name: repo.full_name });
                                            setModalMode('pr');
                                        }}
                                    >
                                        <GitPullRequest className="h-4 w-4" />
                                        Create PR
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {selectedRepo && (
                <>
                    <CreateBranchModal
                        repositoryId={selectedRepo.id}
                        repositoryName={selectedRepo.name}
                        isOpen={modalMode === 'branch'}
                        onClose={() => {
                            setModalMode(null);
                            setSelectedRepo(null);
                        }}
                    />
                    <CreatePRModal
                        repositoryId={selectedRepo.id}
                        repositoryName={selectedRepo.name}
                        isOpen={modalMode === 'pr'}
                        onClose={() => {
                            setModalMode(null);
                            setSelectedRepo(null);
                        }}
                    />
                </>
            )}
        </div>
    );
}
