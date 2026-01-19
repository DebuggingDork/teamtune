import { useState } from "react";
import { motion } from "framer-motion";
import {
  Github,
  Settings,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePlugins, useConnectGitHubPlugin, useUpdatePlugin, useSyncPlugin } from "@/hooks/useAdmin";
import { toast } from "@/hooks/use-toast";
import type { PluginStatus } from "@/api/types/index";
import { AdminLayout } from "@/components/layouts/AdminLayout";

const PluginsPage = () => {
  const { data: pluginsData, isLoading: isLoadingPlugins } = usePlugins();
  const plugins = (Array.isArray(pluginsData) ? pluginsData : (pluginsData as { plugins?: any[] } | undefined)?.plugins || []) as any[];
  const connectGitHubMutation = useConnectGitHubPlugin();
  const updatePluginMutation = useUpdatePlugin();
  const syncPluginMutation = useSyncPlugin();

  const [selectedPlugin, setSelectedPlugin] = useState<any>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  const handleConnectGitHub = async () => {
    try {
      await connectGitHubMutation.mutateAsync();
      toast({
        title: "Success",
        description: "GitHub plugin connection initiated. Please complete the authorization.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to connect GitHub plugin.",
        variant: "destructive",
      });
    }
  };

  const handleSyncPlugin = async (pluginId: string) => {
    try {
      await syncPluginMutation.mutateAsync(pluginId);
      toast({
        title: "Success",
        description: "Plugin sync initiated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to sync plugin.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePluginStatus = async (pluginId: string, status: PluginStatus) => {
    try {
      await updatePluginMutation.mutateAsync({
        pluginId,
        data: { status },
      });
      toast({
        title: "Success",
        description: "Plugin status updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update plugin status.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: PluginStatus) => {
    switch (status) {
      case "connected":
      case "active":
        return <Badge className="bg-emerald-500/10 text-emerald-500">{status}</Badge>;
      case "inactive":
        return <Badge variant="secondary">{status}</Badge>;
      case "disconnected":
        return <Badge variant="outline">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPluginIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "github":
        return <Github className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  return (
    <AdminLayout
      headerTitle="Plugins"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >

        {isLoadingPlugins ? (
          <div className="flex flex-col items-center justify-center p-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-10 w-10 text-primary" />
            </motion.div>
            <p className="text-sm text-muted-foreground mt-4">Loading plugins...</p>
          </div>
        ) : plugins.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-16">
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">No Plugins Available</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Connect external services to enhance your workflow
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {plugins.map((plugin, index) => {
              const isConnected = plugin.status === "connected" || plugin.status === "active";
              return (
                <motion.div
                  key={plugin.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                >
                  <Card className={`border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${isConnected ? 'ring-1 ring-primary/20' : ''}`}>
                    <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-transparent pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl transition-all duration-200 ${isConnected
                              ? 'bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-sm'
                              : 'bg-muted/50 border border-border/50'
                            }`}>
                            {getPluginIcon(plugin.type)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{plugin.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {plugin.type === 'github' ? 'Code Repository' : plugin.type}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(plugin.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4">
                      {/* Status Row */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-2">
                          {isConnected ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium text-foreground">
                            {isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">{plugin.status}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {plugin.status === "disconnected" ? (
                          <Button
                            onClick={handleConnectGitHub}
                            disabled={connectGitHubMutation.isPending}
                            className="flex-1 h-10 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md shadow-primary/20"
                          >
                            {connectGitHubMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Connect
                              </>
                            )}
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedPlugin(plugin);
                                setIsConfigDialogOpen(true);
                              }}
                              className="flex-1 h-10 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleSyncPlugin(plugin.id)}
                              disabled={syncPluginMutation.isPending}
                              className="h-10 px-4 hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-colors"
                              title="Sync"
                            >
                              {syncPluginMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleUpdatePluginStatus(
                                  plugin.id,
                                  plugin.status === "active" ? "inactive" : "active"
                                )
                              }
                              disabled={updatePluginMutation.isPending}
                              className={`h-10 px-4 transition-colors ${plugin.status === "active"
                                  ? 'hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
                                  : 'hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30'
                                }`}
                              title={plugin.status === "active" ? "Deactivate" : "Activate"}
                            >
                              {plugin.status === "active" ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Configuration Dialog */}
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Configure {selectedPlugin?.name}
              </DialogTitle>
              <DialogDescription>
                Manage plugin settings and configuration
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-sm text-muted-foreground text-center">
                  Plugin configuration options will be available here
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfigDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AdminLayout>
  );
};

export default PluginsPage;

