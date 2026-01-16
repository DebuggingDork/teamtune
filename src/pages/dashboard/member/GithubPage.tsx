import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitHubConnectionCard } from '@/components/github/GitHubConnectionCard';
import { RepositoryList } from '@/components/github/RepositoryList';
import { MyBranchList } from '@/components/github/MyBranchList';
import { PullRequestList } from '@/components/github/PullRequestList';
import { MemberSidebar } from '@/components/layouts/MemberSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function MemberGithubPage() {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background">
                <MemberSidebar />
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">GitHub Integration</h1>
                                <p className="text-muted-foreground mt-2">
                                    Manage your code contributions and collaborative workflows.
                                </p>
                            </div>
                            <SidebarTrigger className="md:hidden" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <Tabs defaultValue="repositories" className="w-full">
                                    <TabsList className="mb-4 w-full justify-start overflow-x-auto bg-transparent border-b h-auto p-0 space-x-6 rounded-none">
                                        <TabsTrigger
                                            value="repositories"
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2"
                                        >
                                            Repositories
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="branches"
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2"
                                        >
                                            My Branches
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="pull-requests"
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2"
                                        >
                                            Pull Requests
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="repositories" className="space-y-4 pt-2">
                                        <RepositoryList />
                                    </TabsContent>
                                    <TabsContent value="branches" className="space-y-4 pt-2">
                                        <MyBranchList />
                                    </TabsContent>
                                    <TabsContent value="pull-requests" className="space-y-4 pt-2">
                                        <PullRequestList />
                                    </TabsContent>
                                </Tabs>
                            </div>
                            <div className="space-y-6">
                                <GitHubConnectionCard />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
