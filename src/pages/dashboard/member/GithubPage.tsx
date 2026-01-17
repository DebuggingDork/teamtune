import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitHubConnectionCard } from '@/components/github/GitHubConnectionCard';
import { RepositoryList } from '@/components/github/RepositoryList';
import { MyBranchList } from '@/components/github/MyBranchList';
import { PullRequestList } from '@/components/github/PullRequestList';
import { MemberLayout } from '@/components/layouts/MemberLayout';
import { GitHubGlassCard } from '@/components/github/GitHubGlassCard';
import { motion } from 'framer-motion';
import { Code2, GitBranch, GitPullRequest, Layout, Sparkles } from 'lucide-react';

export default function MemberGithubPage() {
    return (
        <MemberLayout headerTitle="GitHub Hub" headerDescription="Your central dashboard for code contributions, branches, and pull requests.">
            <div className="space-y-10 max-w-7xl mx-auto pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        <Tabs defaultValue="repositories" className="w-full">
                            <div className="relative mb-8">
                                <TabsList className="bg-background/40 backdrop-blur-md border border-border/50 p-1 h-12 rounded-2xl w-full justify-start md:w-auto">
                                    <TabsTrigger
                                        value="repositories"
                                        className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg px-6 transition-all duration-300 gap-2"
                                    >
                                        <Layout className="h-4 w-4" />
                                        Repositories
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="branches"
                                        className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg px-6 transition-all duration-300 gap-2"
                                    >
                                        <GitBranch className="h-4 w-4" />
                                        My Branches
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="pull-requests"
                                        className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg px-6 transition-all duration-300 gap-2"
                                    >
                                        <GitPullRequest className="h-4 w-4" />
                                        My PRs
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <TabsContent value="repositories" className="mt-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <GitHubGlassCard title="Assigned Repositories" icon={<Code2 className="h-5 w-5" />} gradient>
                                        <RepositoryList />
                                    </GitHubGlassCard>
                                </TabsContent>

                                <TabsContent value="branches" className="mt-0 outline-none">
                                    <GitHubGlassCard title="Active Contributions" icon={<GitBranch className="h-5 w-5" />} gradient>
                                        <MyBranchList />
                                    </GitHubGlassCard>
                                </TabsContent>

                                <TabsContent value="pull-requests" className="mt-0 outline-none">
                                    <GitHubGlassCard title="Pull Request Status" icon={<GitPullRequest className="h-5 w-5" />} gradient>
                                        <PullRequestList />
                                    </GitHubGlassCard>
                                </TabsContent>
                            </motion.div>
                        </Tabs>
                    </div>

                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <GitHubConnectionCard />
                        </motion.div>

                        <GitHubGlassCard gradient>
                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-orange-500" />
                                    Developer Tips
                                </h3>
                                <div className="space-y-3 text-sm text-muted-foreground">
                                    <div className="p-3 bg-accent/30 rounded-xl border border-border/50">
                                        Keep your PRs small and focused for faster reviews.
                                    </div>
                                    <div className="p-3 bg-accent/30 rounded-xl border border-border/50">
                                        Use descriptive branch names like <code>feat/ui-glow</code>.
                                    </div>
                                </div>
                            </div>
                        </GitHubGlassCard>
                    </div>
                </div>
            </div>
        </MemberLayout>
    );
}
