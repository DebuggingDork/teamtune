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
            // Invalidate admin plugins query
            queryClient.invalidateQueries({ queryKey: adminKeys.plugins.all });

            // Invalidate employee GitHub status query
            queryClient.invalidateQueries({ queryKey: githubKeys.employee.status });

            // Auto-redirect after 3 seconds on success
            const timer = setTimeout(() => {
                redirectToDashboard();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [status, user, queryClient]);

    const redirectToDashboard = () => {
        // Redirect based on user role
        if (user?.role === 'admin') {
            navigate('/dashboard/admin/settings');
        } else if (user?.role === 'employee') {
            navigate('/dashboard/member');
        } else if (user?.role === 'team_lead') {
            navigate('/dashboard/team-lead');
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
            return error || message || 'Failed to connect your GitHub account. Please try again.';
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
                            Redirecting to dashboard in 3 seconds...
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
