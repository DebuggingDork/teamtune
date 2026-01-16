import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGithubStatus, useDisconnectGitHub } from '@/hooks/useGithub';
import { CheckCircle, Github, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function GitHubConnectionCard() {
    const { data: status, isLoading } = useGithubStatus();
    const disconnectMutation = useDisconnectGitHub();

    const handleConnect = () => {
        // OAuth flows require direct browser redirect, not AJAX calls
        // This prevents CORS errors when redirecting to GitHub's OAuth page
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://upea.onrender.com';
        const token = localStorage.getItem(import.meta.env.VITE_TOKEN_STORAGE_KEY || 'upea_token');

        if (!token) {
            // This shouldn't happen as the component is protected, but handle it gracefully
            console.error('No authentication token found');
            return;
        }

        // Pass token as query parameter for backend authentication
        window.location.href = `${apiBase}/api/employee/github/connect?token=${token}`;
    };

    const handleDisconnect = () => {
        if (confirm('Are you sure you want to disconnect your GitHub account?')) {
            disconnectMutation.mutate();
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    const isConnected = status?.connected;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    GitHub Integration
                </CardTitle>
                <CardDescription>
                    Connect your GitHub account to access repositories and manage pull requests.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isConnected ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={status.avatar_url} />
                                    <AvatarFallback>{status.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium flex items-center gap-2">
                                        @{status.username}
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-400">
                                        Connected {status.connected_at ? format(new Date(status.connected_at), 'MMM d, yyyy') : ''}
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={disconnectMutation.isPending}>
                                {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <Alert>
                            <AlertDescription>
                                You need to connect your GitHub account to enable code integration features.
                            </AlertDescription>
                        </Alert>
                        <Button onClick={handleConnect} className="w-full sm:w-auto">
                            <Github className="mr-2 h-4 w-4" />
                            Connect GitHub Account
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
