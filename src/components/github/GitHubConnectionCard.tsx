import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGithubStatus, useDisconnectGitHub } from '@/hooks/useGithub';
import { CheckCircle, Github, Loader2, Link2, Unlink2, ShieldCheck, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export function GitHubConnectionCard() {
    const { data: status, isLoading } = useGithubStatus();
    const disconnectMutation = useDisconnectGitHub();
    const { user } = useAuth();

    const handleConnect = () => {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://upea.onrender.com';
        const token = localStorage.getItem(import.meta.env.VITE_TOKEN_STORAGE_KEY || 'upea_token');

        if (!token) {
            console.error('No authentication token found');
            return;
        }

        // Use appropriate endpoint based on user role
        const roleEndpoint = user?.role === 'team_lead' ? 'team-lead' : 'employee';
        window.location.href = `${apiBase}/api/${roleEndpoint}/github/connect?token=${token}`;
    };

    const handleDisconnect = () => {
        if (confirm('Are you sure you want to disconnect your GitHub account?')) {
            disconnectMutation.mutate();
        }
    };

    if (isLoading) {
        return (
            <div className="bg-background/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const isConnected = status?.connected;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative overflow-hidden bg-background/40 backdrop-blur-md border rounded-2xl p-6 shadow-sm transition-all duration-300 ${isConnected ? 'border-green-500/20 shadow-green-500/5' : 'border-border/50 shadow-primary/5'
                }`}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isConnected ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                        <Github className={`h-6 w-6 ${isConnected ? 'text-green-500' : 'text-primary'}`} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">GitHub Status</h3>
                        <p className="text-xs text-muted-foreground">Connected workspace account</p>
                    </div>
                </div>
                {isConnected && (
                    <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-500">Verified Integration</span>
                    </div>
                )}
            </div>

            {isConnected ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-background/60 border border-border/50 rounded-xl">
                        <Avatar className="h-12 w-12 border-2 border-green-500/20">
                            <AvatarImage src={status.avatar_url} />
                            <AvatarFallback className="bg-green-500/10 text-green-600 font-bold">
                                {status.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg truncate flex items-center gap-2">
                                @{status.username}
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3 text-orange-400" />
                                Active since {status.connected_at ? format(new Date(status.connected_at), 'MMM d, yyyy') : 'Recently'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-xl h-11 border-border/50 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all font-semibold gap-2"
                            onClick={handleDisconnect}
                            disabled={disconnectMutation.isPending}
                        >
                            {disconnectMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Unlink2 className="h-4 w-4" />
                            )}
                            Disconnect Account
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Link2 className="h-12 w-12 text-primary" />
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                            Connect your GitHub account to automatically sync your repository contributions and manage PRs directly from TeamTune.
                        </p>
                    </div>

                    <Button
                        onClick={handleConnect}
                        className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-95 font-bold gap-2"
                    >
                        <Github className="h-5 w-5" />
                        Link GitHub Profile
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
