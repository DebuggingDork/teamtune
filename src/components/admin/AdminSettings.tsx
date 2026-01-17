import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Building,
  Shield,
  Github,
  Slack,
  Zap,
  Save,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { usePlugins, useDisconnectGitHubPlugin } from "@/hooks/useAdmin";
import type { PluginStatus } from "@/api/types";

const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any>(null);

  // Real hooks
  const { data: plugins, isLoading: isLoadingPlugins, refetch: refetchPlugins } = usePlugins();
  const disconnectGitHubMutation = useDisconnectGitHubPlugin();

  // Organization Settings
  const [orgSettings, setOrgSettings] = useState({
    name: "TeamTune Organization",
    description: "A collaborative platform for team management and project tracking",
    allowedDomains: "company.com, teamtune.com",
    maxUsers: "500",
    timezone: "UTC-8 (Pacific Time)"
  });

  // Authentication Settings
  const [authSettings, setAuthSettings] = useState({
    requireEmailVerification: true,
    passwordMinLength: 8,
    sessionTimeout: 24,
    twoFactorEnabled: false
  });

  // Refetch plugins when component mounts to get latest status
  useEffect(() => {
    refetchPlugins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleSaveSettings = (settingsType: string, newSettings: any) => {
    setPendingChanges({ type: settingsType, settings: newSettings });
    setIsConfirmDialogOpen(true);
  };

  const confirmSaveSettings = async () => {
    if (!pendingChanges) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      switch (pendingChanges.type) {
        case "organization":
          setOrgSettings(pendingChanges.settings);
          break;
        case "authentication":
          setAuthSettings(pendingChanges.settings);
          break;
      }

      toast({
        title: "Settings Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsConfirmDialogOpen(false);
      setPendingChanges(null);
    }
  };

  const handleConnectPlugin = (pluginId: string) => {
    if (pluginId === 'github') {
      // OAuth flows require direct browser redirect, not AJAX calls
      // This prevents CORS errors when redirecting to GitHub's OAuth page
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://upea.onrender.com';
      const token = localStorage.getItem(import.meta.env.VITE_TOKEN_STORAGE_KEY || 'upea_token');

      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to connect GitHub.",
          variant: "destructive",
        });
        return;
      }

      // Pass token as query parameter for backend authentication
      window.location.href = `${apiBase}/api/admin/plugins/github/connect?token=${token}`;
    } else {
      toast({
        title: "Not Implemented",
        description: `Connection flow for ${pluginId} is coming soon.`,
      });
    }
  };

  const handleDisconnectPlugin = async (pluginId: string) => {
    if (pluginId === 'github') {
      try {
        await disconnectGitHubMutation.mutateAsync();
        toast({
          title: "Success",
          description: "GitHub plugin disconnected successfully.",
        });
      } catch (error: any) {
        // Error is already handled by the mutation's onError
        // But we can add additional UI feedback if needed
        toast({
          title: "Failed to Disconnect",
          description: error?.response?.data?.error?.message || error?.response?.data?.message || "Failed to disconnect GitHub plugin.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Not Implemented",
        description: `Disconnection flow for ${pluginId} is coming soon.`,
      });
    }
  };

  const getIntegrationStatusBadge = (status?: PluginStatus) => {
    switch (status) {
      case "active":
      case "connected":
        return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none">Connected</Badge>;
      case "inactive":
      case "disconnected":
        return <Badge variant="outline" className="text-muted-foreground">Disconnected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getIntegrationIcon = (status?: PluginStatus) => {
    switch (status) {
      case "active":
      case "connected":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "inactive":
      case "disconnected":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Merge real plugins with static definitions for display
  // Merge real plugins with static definitions for display
  const displayIntegrations = [
    {
      id: "github",
      name: "GitHub",
      description: "Connect repositories and track commits",
      icon: Github,
      status: (() => {
        const githubPlugin = (plugins || []).find((p: any) =>
          p.type === 'github' || p.type === 'code_repo' || p.name === 'github' || p.id === 'github' || p.plugin_type === 'github'
        );

        // Comprehensive status detection - check ALL possible indicators
        const isConnected =
          githubPlugin?.is_active === true ||
          githubPlugin?.status === 'active' ||
          githubPlugin?.status === 'connected' ||
          (githubPlugin?.connected_at != null && githubPlugin?.connected_at !== '') ||
          (githubPlugin?.access_token != null && githubPlugin?.access_token !== '') ||
          (githubPlugin?.github_username != null && githubPlugin?.github_username !== '');

        return isConnected ? 'active' : 'disconnected';
      })(),
      config: (plugins || []).find((p: any) =>
        p.type === 'github' || p.type === 'code_repo' || p.name === 'github' || p.id === 'github' || p.plugin_type === 'github'
      )?.config
    },
    {
      id: "slack",
      name: "Slack",
      description: "Team communication and notifications",
      icon: Slack,
      status: "disconnected", // Placeholder
      config: null
    },
    {
      id: "jira",
      name: "Jira",
      description: "Issue tracking and project management",
      icon: Zap,
      status: "disconnected", // Placeholder
      config: null
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Organization Settings */}
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Organization</CardTitle>
              <CardDescription className="text-xs">
                Basic information and configuration
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={orgSettings.name}
                onChange={(e) => setOrgSettings({ ...orgSettings, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={orgSettings.timezone}
                onChange={(e) => setOrgSettings({ ...orgSettings, timezone: e.target.value })}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-description">Description</Label>
            <Textarea
              id="org-description"
              value={orgSettings.description}
              onChange={(e) => setOrgSettings({ ...orgSettings, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allowed-domains">Allowed Email Domains</Label>
              <Input
                id="allowed-domains"
                value={orgSettings.allowedDomains}
                onChange={(e) => setOrgSettings({ ...orgSettings, allowedDomains: e.target.value })}
                placeholder="company.com, example.org"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-users">Maximum Users</Label>
              <Input
                id="max-users"
                value={orgSettings.maxUsers}
                onChange={(e) => setOrgSettings({ ...orgSettings, maxUsers: e.target.value })}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => handleSaveSettings("organization", orgSettings)}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Organization Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Settings */}
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Security</CardTitle>
              <CardDescription className="text-xs">
                Authentication and security policies
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Verification Required</Label>
                  <p className="text-sm text-muted-foreground">Require users to verify their email</p>
                </div>
                <Switch
                  checked={authSettings.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    setAuthSettings({ ...authSettings, requireEmailVerification: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Enable 2FA for enhanced security</p>
                </div>
                <Switch
                  checked={authSettings.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    setAuthSettings({ ...authSettings, twoFactorEnabled: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password-length">Minimum Password Length</Label>
                <Input
                  id="password-length"
                  type="number"
                  value={authSettings.passwordMinLength}
                  onChange={(e) =>
                    setAuthSettings({ ...authSettings, passwordMinLength: parseInt(e.target.value) })
                  }
                  min="6"
                  max="32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={authSettings.sessionTimeout}
                  onChange={(e) =>
                    setAuthSettings({ ...authSettings, sessionTimeout: parseInt(e.target.value) })
                  }
                  min="1"
                  max="168"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => handleSaveSettings("authentication", authSettings)}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Security Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Integrations</CardTitle>
              <CardDescription className="text-xs">
                Connect external services
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {isLoadingPlugins ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">Loading integrations...</p>
                </div>
              </div>
            ) : (
              displayIntegrations.map((integration) => {
                const Icon = integration.icon;
                const isConnected = integration.status === 'connected' || integration.status === 'active';

                return (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-gradient-to-r from-background to-muted/20 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-all duration-200 ${isConnected ? 'bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20' : 'bg-muted/50 border border-border/50'}`}>
                        <Icon className={`h-5 w-5 ${isConnected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{integration.name}</h4>
                          {getIntegrationIcon(integration.status as PluginStatus)}
                        </div>
                        <p className="text-xs text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getIntegrationStatusBadge(integration.status as PluginStatus)}
                      {isConnected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                          onClick={() => handleDisconnectPlugin(integration.id)}
                          disabled={disconnectGitHubMutation.isPending}
                        >
                          {disconnectGitHubMutation.isPending ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Disconnecting...
                            </>
                          ) : (
                            "Disconnect"
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                          onClick={() => handleConnectPlugin(integration.id)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Settings Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these settings? Some changes may require users to re-authenticate or may affect system behavior.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSaveSettings}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div >
  );
};

export default AdminSettings;