import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { adminKeys } from '@/hooks/useAdmin';
import { githubKeys } from '@/hooks/useGithub';

/**
 * GitHub OAuth Callback Handler
 * 
 * This page handles the redirect after GitHub OAuth authorization.
 * It can be used for both admin and employee GitHub connections.
 * 
 * Expected query parameters:
 * - status: 'success' | 'error'
 * - message: Optional message from backend
 * - github: 'connected' (for backward compatibility)
 */
export default function GitHubCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const status = searchParams.get('status') || (searchParams.get('github') === 'connected' ? 'success' : 'error');
    const message = searchParams.get('message');
    const error = searchParams.get('error');

    useEffect(() => {
        // Invalidate queries to refresh plugin/GitHub status
        if (status === 'success') {
            console.log('=== GitHub OAuth Success - Invalidating Caches ===');

            // AGGRESSIVE CACHE INVALIDATION
            // Invalidate ALL admin-related queries
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: adminKeys.all });
            queryClient.invalidateQueries({ queryKey: adminKeys.plugins.all });

            // Invalidate GitHub status queries for both employee and team lead
            queryClient.invalidateQueries({ queryKey: githubKeys.employee.status });
            queryClient.invalidateQueries({ queryKey: githubKeys.teamLead.status });

            // Force immediate refetch
            queryClient.refetchQueries({ queryKey: adminKeys.plugins.all });

            console.log('Cache invalidation complete');

            // POLLING MECHANISM - Poll for 10 seconds to catch status update
            let pollCount = 0;
            const maxPolls = 5; // Poll 5 times
            const pollInterval = setInterval(async () => {
                pollCount++;
                console.log(`Polling for status update (${pollCount}/${maxPolls})...`);
                await queryClient.refetchQueries({ queryKey: adminKeys.plugins.all });

                if (pollCount >= maxPolls) {
                    clearInterval(pollInterval);
                    console.log('Polling complete');
                }
            }, 2000); // Poll every 2 seconds

            // Auto-redirect after 6 seconds (after polling completes)
            const timer = setTimeout(() => {
                clearInterval(pollInterval);
                redirectToDashboard();
            }, 6000);

            return () => {
                clearTimeout(timer);
                clearInterval(pollInterval);
            };
        }
    }, [status, user, queryClient]);

    const redirectToDashboard = () => {
        // Redirect based on user role - go to GitHub page for roles that use GitHub
        if (user?.role === 'admin') {
            navigate('/dashboard/admin/plugins');
        } else if (user?.role === 'employee') {
            navigate('/dashboard/member/github');
        } else if (user?.role === 'team_lead') {
            navigate('/dashboard/team-lead/github');
        } else if (user?.role === 'project_manager') {
            navigate('/dashboard/project-manager');
        } else {
            navigate('/dashboard');
        }
    };

    const getStatusIcon = () => {
        if (status === 'success') {
            return <CheckCircle className="h-16 w-16 text-green-500" />;
        } else if (status === 'error') {
            return <XCircle className="h-16 w-16 text-red-500" />;
        } else {
            return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
        }
    };

    const getStatusTitle = () => {
        if (status === 'success') {
            return 'GitHub Connected Successfully!';
        } else if (status === 'error') {
            return 'GitHub Connection Failed';
        } else {
            return 'Processing GitHub Connection...';
        }
    };

    const getStatusDescription = () => {
        if (status === 'success') {
            return message || 'Your GitHub account has been successfully connected. You can now access GitHub features.';
        } else if (status === 'error') {
            const errorMessage = error || message || 'Failed to connect your GitHub account. Please try again.';

            // Provide user-friendly messages for specific errors
            if (errorMessage.includes('duplicate key') || errorMessage.includes('users_github_user_id_key')) {
                return 'This GitHub account is already connected to another user in the system. Each GitHub account can only be linked to one user. Please use a different GitHub account or contact your administrator if you believe this is an error.';
            }

            if (errorMessage.includes('already connected') || errorMessage.includes('already linked')) {
                return 'This GitHub account is already connected. Please disconnect it first before reconnecting, or use a different GitHub account.';
            }

            if (errorMessage.includes('unauthorized') || errorMessage.includes('access denied')) {
                return 'GitHub authorization was denied or expired. Please try connecting again and make sure to authorize the application.';
            }

            if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
                return 'Network error occurred while connecting to GitHub. Please check your internet connection and try again.';
            }

            // Return the original error message if no specific match
            return errorMessage;
        } else {
            return 'Please wait while we complete your GitHub connection...';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {getStatusIcon()}
                    </div>
                    <CardTitle className="text-2xl">{getStatusTitle()}</CardTitle>
                    <CardDescription className="text-base mt-2">
                        {getStatusDescription()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status === 'success' && (
                        <div className="text-center text-sm text-muted-foreground">
                            Refreshing connection status... Redirecting in 6 seconds...
                        </div>
                    )}

                    {status === 'error' && (error || message || '').includes('duplicate key') && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-2">
                            <h4 className="font-semibold text-amber-900 dark:text-amber-100 text-sm">What can you do?</h4>
                            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                                <li>Use a different GitHub account that isn't already linked</li>
                                <li>Contact your administrator to unlink this GitHub account from the other user</li>
                                <li>If you previously had an account, ask admin to restore or clean up the old connection</li>
                            </ul>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Button
                            onClick={redirectToDashboard}
                            className="flex-1"
                            variant={status === 'success' ? 'default' : 'outline'}
                        >
                            Go to Dashboard
                        </Button>
                        {status === 'error' && (
                            <Button
                                onClick={() => window.history.back()}
                                variant="outline"
                                className="flex-1"
                            >
                                Try Again
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
