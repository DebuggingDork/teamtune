import { useState } from 'react';
import { useTeamPullRequests } from '@/hooks/useGithub';
import { GitPullRequest, Loader2, ExternalLink, Calendar, GitBranch, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { PRReviewModal } from './PRReviewModal';

export function TeamPullRequestList({ teamCode }: { teamCode: string }) {
    const { data: prs, isLoading } = useTeamPullRequests(teamCode, 'open');
    const [selectedPR, setSelectedPR] = useState<{ number: number; title: string } | null>(null);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Fetching team pull requests...</p>
            </div>
        );
    }

    if (!prs || prs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/50 rounded-2xl bg-accent/5">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <GitPullRequest className="h-8 w-8 text-primary/40" />
                </div>
                <p className="text-muted-foreground font-medium">No active pull requests</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Everything looks up to date! Your team is crushing it.</p>
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
                        className="group relative bg-background/40 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-primary/30 hover:bg-background/60 transition-all duration-300 shadow-sm hover:shadow-md"
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
                                        className="font-bold text-lg hover:text-primary transition-colors flex items-center gap-1.5"
                                    >
                                        {pr.title}
                                        <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                    <span className="text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded text-sm">#{pr.pr_number}</span>
                                    {pr.draft && <Badge variant="secondary" className="bg-muted/50 text-muted-foreground">Draft</Badge>}
                                </div>

                                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <span className="font-semibold text-foreground">@{pr.author_github_username}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <GitBranch className="h-3.5 w-3.5" />
                                        <span className="font-mono bg-accent/30 text-accent-foreground px-1.5 rounded">{pr.head_branch}</span>
                                        <span className="text-muted-foreground/50">→</span>
                                        <span className="font-mono bg-accent/30 text-accent-foreground px-1.5 rounded">{pr.base_branch}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-1">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        Updated {format(new Date(pr.updated_at), 'MMM d, h:mm a')}
                                    </div>
                                    {pr.review_comments > 0 && (
                                        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                                            <MessageSquare className="h-3 w-3" />
                                            {pr.review_comments} comments
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedPR({ number: pr.pr_number, title: pr.title })}
                                className="md:self-center bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-bold px-4 py-2 rounded-lg transition-all duration-300 transform group-hover:scale-105"
                            >
                                Review PR
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {selectedPR && (
                <PRReviewModal
                    open={!!selectedPR}
                    onOpenChange={(open) => !open && setSelectedPR(null)}
                    teamCode={teamCode}
                    prNumber={selectedPR.number}
                    prTitle={selectedPR.title}
                />
            )}
        </div>
    );
}
