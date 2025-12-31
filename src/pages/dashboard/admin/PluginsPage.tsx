import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const plugins = pluginsData || [];
  const connectGitHubMutation = useConnectGitHubPlugin();
  const updatePluginMutation = useUpdatePlugin();
  const syncPluginMutation = useSyncPlugin();

  const [selectedPlugin, setSelectedPlugin] = useState<any>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  const handleConnectGitHub = async () => {
    try {
      await (connectGitHubMutation.mutateAsync as any)();
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

        <AnimatePresence mode="wait">
          {isLoadingPlugins ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
                <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
              </div>
              <p className="text-xs font-black text-muted-foreground tracking-[0.4em] uppercase animate-pulse">Scanning Plugin Grid</p>
            </motion.div>
          ) : plugins.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-24 h-24 rounded-[2rem] bg-muted/30 border-2 border-dashed border-border/50 flex items-center justify-center mb-8 shadow-inner">
                <Zap className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3">No Active Relays</h3>
              <p className="text-muted-foreground text-sm font-medium max-w-xs mx-auto">Your system currently has no external module connections established.</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {plugins.map((plugin, index) => (
                <motion.div
                  key={plugin.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                >
                  {/* Glow Backdrop */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[2.5rem] blur opacity-0 group-hover:opacity-10 transition duration-700" />

                  <Card className="relative h-full bg-card/40 backdrop-blur-2xl border-border/50 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl transition-all duration-500 hover:border-primary/40">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                      {getPluginIcon(plugin.type)}
                    </div>

                    <CardHeader className="p-8 pb-4">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-4 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                          {getPluginIcon(plugin.type)}
                        </div>
                        {getStatusBadge(plugin.status)}
                      </div>
                      <CardTitle className="text-2xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors">
                        {plugin.name}
                      </CardTitle>
                      <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                        Mod Type: {plugin.type}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8 pt-4 flex-1 flex flex-col">
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/20 mb-8">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">
                          <span>Current Phase</span>
                          <span>v1.0.0</span>
                        </div>
                        <p className="text-sm font-black text-foreground capitalize">
                          {plugin.status === 'active' ? 'Operational High' :
                            plugin.status === 'inactive' ? 'Standby Mode' : 'Link Offline'}
                        </p>
                      </div>

                      <div className="mt-auto space-y-3">
                        {plugin.status === "disconnected" ? (
                          <Button
                            onClick={handleConnectGitHub}
                            disabled={connectGitHubMutation.isPending}
                            className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-white border-none"
                          >
                            {connectGitHubMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Authorize Unit
                              </>
                            )}
                          </Button>
                        ) : (
                          <div className="grid grid-cols-3 gap-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedPlugin(plugin);
                                setIsConfigDialogOpen(true);
                              }}
                              className="h-12 rounded-2xl border-border/50 bg-background/50 hover:bg-primary/10 hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleSyncPlugin(plugin.id)}
                              disabled={syncPluginMutation.isPending}
                              className="h-12 rounded-2xl border-border/50 bg-background/50 hover:bg-amber-500/10 hover:text-amber-500 transition-all font-black text-[10px] uppercase tracking-widest"
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
                              className={`h-12 rounded-2xl border-border/50 bg-background/50 transition-all font-black text-[10px] uppercase tracking-widest ${plugin.status === 'active' ? 'hover:bg-destructive/10 hover:text-destructive' : 'hover:bg-emerald-500/10 hover:text-emerald-500'
                                }`}
                            >
                              {plugin.status === "active" ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

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

