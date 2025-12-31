import { motion } from "framer-motion";
import { useState } from "react";
import {
  Settings,
  Building,
  Mail,
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

const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any>(null);

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

  // Integration Settings
  const [integrations, setIntegrations] = useState([
    {
      id: "github",
      name: "GitHub",
      description: "Connect repositories and track commits",
      icon: Github,
      status: "connected",
      lastSync: "2024-12-29T10:30:00Z",
      config: {
        organization: "teamtune-org",
        repositories: 12
      }
    },
    {
      id: "slack",
      name: "Slack",
      description: "Team communication and notifications",
      icon: Slack,
      status: "disconnected",
      lastSync: null,
      config: null
    },
    {
      id: "jira",
      name: "Jira",
      description: "Issue tracking and project management",
      icon: Zap,
      status: "pending",
      lastSync: null,
      config: null
    }
  ]);

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

  const getIntegrationStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-emerald-500/10 text-emerald-500">Connected</Badge>;
      case "disconnected":
        return <Badge variant="outline">Disconnected</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getIntegrationIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "disconnected":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      case "pending":
        return <Loader2 className="h-4 w-4 text-warning animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">System Settings</h2>
        <p className="text-muted-foreground">
          Configure organization-level settings and integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Organization Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-3xl shadow-2xl group hover:border-primary/30 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-purple-500/50 to-primary/50" />
            <CardHeader className="pb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-inner">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">Organization Core</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Registry & Identity</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name" className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 pl-1">Legal Entity Name</Label>
                  <Input
                    id="org-name"
                    value={orgSettings.name}
                    onChange={(e) => setOrgSettings({ ...orgSettings, name: e.target.value })}
                    className="h-12 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-description" className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 pl-1">Operational Mandate</Label>
                  <Textarea
                    id="org-description"
                    value={orgSettings.description}
                    onChange={(e) => setOrgSettings({ ...orgSettings, description: e.target.value })}
                    rows={3}
                    className="bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="allowed-domains" className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 pl-1">Secure Domains</Label>
                    <Input
                      id="allowed-domains"
                      value={orgSettings.allowedDomains}
                      onChange={(e) => setOrgSettings({ ...orgSettings, allowedDomains: e.target.value })}
                      placeholder="company.com"
                      className="h-12 bg-background/50 border-border/50 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 pl-1">Temporal Grid</Label>
                    <Input
                      id="timezone"
                      value={orgSettings.timezone}
                      readOnly
                      className="h-12 bg-muted/30 border-border/30 rounded-xl text-muted-foreground/60"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50">
                <Button
                  onClick={() => handleSaveSettings("organization", orgSettings)}
                  className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Synchronize Identity
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Authentication Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-3xl shadow-2xl group hover:border-primary/30 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 via-primary/50 to-emerald-500/50" />
            <CardHeader className="pb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">Security Protocol</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Access & Encryption</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-background/30 border border-border/20 group/switch transition-all hover:bg-background/50">
                  <div className="space-y-1">
                    <Label className="text-sm font-black text-foreground">Email Verification</Label>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Mandatory validation for new entries</p>
                  </div>
                  <Switch
                    checked={authSettings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setAuthSettings({ ...authSettings, requireEmailVerification: checked })
                    }
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-background/30 border border-border/20 group/switch transition-all hover:bg-background/50">
                  <div className="space-y-1">
                    <Label className="text-sm font-black text-foreground">Multi-Factor Intel</Label>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Secondary vault authentication</p>
                  </div>
                  <Switch
                    checked={authSettings.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      setAuthSettings({ ...authSettings, twoFactorEnabled: checked })
                    }
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password-length" className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 pl-1">Entropy Min</Label>
                    <Input
                      id="password-length"
                      type="number"
                      value={authSettings.passwordMinLength}
                      onChange={(e) =>
                        setAuthSettings({ ...authSettings, passwordMinLength: parseInt(e.target.value) })
                      }
                      className="h-12 bg-background/50 border-border/50 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout" className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 pl-1">TTL (Hours)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={authSettings.sessionTimeout}
                      onChange={(e) =>
                        setAuthSettings({ ...authSettings, sessionTimeout: parseInt(e.target.value) })
                      }
                      className="h-12 bg-background/50 border-border/50 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50">
                <Button
                  onClick={() => handleSaveSettings("authentication", authSettings)}
                  className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] active:scale-95 transition-all text-white border-none"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Harden Protocols
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Integrations - Wide Layout */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-[2.5rem] shadow-2xl">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight">External Uplinks</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Cross-Platform Sync</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="rounded-xl px-4 py-1.5 font-black uppercase tracking-widest border-border/50">
                {integrations.filter(i => i.status === 'connected').length} Active Links
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {integrations.map((integration, idx) => {
                const Icon = integration.icon;
                return (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + (idx * 0.1) }}
                    className="flex flex-col p-6 rounded-3xl border border-border/50 bg-background/40 hover:bg-background/60 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 rounded-2xl bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Icon className="h-6 w-6" />
                      </div>
                      {getIntegrationStatusBadge(integration.status)}
                    </div>

                    <h4 className="font-black text-lg mb-1">{integration.name}</h4>
                    <p className="text-xs font-medium text-muted-foreground/70 mb-6 leading-relaxed">
                      {integration.description}
                    </p>

                    <div className="mt-auto space-y-4">
                      {integration.config && (
                        <div className="p-3 rounded-xl bg-muted/30 border border-border/20">
                          <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60 mb-1">Grid Target</p>
                          <p className="text-[11px] font-bold text-foreground truncate">
                            {integration.id === "github" ? integration.config.organization : "Default Cluster"}
                          </p>
                        </div>
                      )}
                      <Button variant="outline" className="w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/10 hover:text-primary border-border/50 transition-all">
                        {integration.status === "connected" ? "Reconfigure" : "Establish Link"}
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Information - Minimal Footer */}
      <div className="flex flex-wrap gap-4 items-center justify-between px-8 py-6 rounded-3xl bg-muted/20 border border-border/50">
        <div className="flex gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Core Version</p>
            <p className="text-xs font-black text-foreground">v2.1.0-STABLE</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Circuit Status</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-black text-foreground uppercase tracking-tight">Production Grid Online</p>
            </div>
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          Last Internal Sync: Dec 29, 2024
        </p>
      </div>

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
    </motion.div>
  );
};

export default AdminSettings;