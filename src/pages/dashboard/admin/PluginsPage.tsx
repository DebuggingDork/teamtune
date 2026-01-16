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
import type { PluginStatus } from "@/api/types";
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
      headerTitle="Plugins Management"
      headerDescription="Connect and manage integrations with external services."
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >

      {isLoadingPlugins ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : plugins.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No plugins available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plugins.map((plugin) => (
            <Card key={plugin.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent rounded-lg">
                      {getPluginIcon(plugin.type)}
                    </div>
                    <div>
                      <CardTitle>{plugin.name}</CardTitle>
                      <CardDescription>{plugin.type}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(plugin.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">{plugin.status}</span>
                </div>

                <div className="flex gap-2">
                  {plugin.status === "disconnected" ? (
                    <Button
                      onClick={handleConnectGitHub}
                      disabled={connectGitHubMutation.isPending}
                      className="flex-1"
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
                        className="flex-1"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSyncPlugin(plugin.id)}
                        disabled={syncPluginMutation.isPending}
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
          ))}
        </div>
      )}

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {selectedPlugin?.name}</DialogTitle>
            <DialogDescription>
              Manage plugin settings and configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Plugin configuration options will be available here.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
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

