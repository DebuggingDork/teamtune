import { useMyPullRequests } from '@/hooks/useGithub';
import { GitPullRequest, Loader2, ExternalLink, Calendar, GitBranch, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export function PullRequestList() {
    const { data: prs, isLoading } = useMyPullRequests('open');

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading your pull requests...</p>
            </div>
        );
    }

    if (!prs || prs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/50 rounded-2xl bg-accent/5">
                <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <GitPullRequest className="h-8 w-8 text-green-500/40" />
                </div>
                <p className="text-muted-foreground font-medium">No open pull requests</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Start a new contribution or check back later.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
                {prs.map((pr, index) => (
                    <motion.div
                        key={pr.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group relative bg-background/40 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-green-500/30 hover:bg-background/60 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-3 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="h-8 w-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                                        <GitPullRequest className="h-4 w-4 text-green-500" />
                                    </div>
                                    <a
                                        href={pr.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-bold text-lg hover:text-green-600 transition-colors flex items-center gap-1.5"
                                    >
                                        {pr.title}
                                        <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                    <span className="text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded text-sm">#{pr.pr_number}</span>
                                    {pr.draft && (
                                        <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border-none">
                                            Draft
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <GitBranch className="h-3.5 w-3.5" />
                                        <span className="font-mono bg-accent/30 text-accent-foreground px-1.5 rounded">{pr.head_branch}</span>
                                        <span className="text-muted-foreground/50">→</span>
                                        <span className="font-mono bg-accent/30 text-accent-foreground px-1.5 rounded">{pr.base_branch}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-1">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Created {format(new Date(pr.created_at), 'MMM d, yyyy')}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                        <Clock className="h-3.5 w-3.5" />
                                        Last active {format(new Date(pr.updated_at), 'h:mm a')}
                                    </div>
                                </div>
                            </div>

                            <a
                                href={pr.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="md:self-center bg-green-500/10 hover:bg-green-500 text-green-600 hover:text-white font-bold px-4 py-2 rounded-lg transition-all duration-300 transform group-hover:scale-105"
                            >
                                View Details
                            </a>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
