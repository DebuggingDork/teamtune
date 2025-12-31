import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  FolderKanban,
  Plus,
  Edit,
  Archive,
  Loader2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface Department {
  id: string;
  name: string;
  userCount: number;
  activeProjects: number;
  status: "active" | "archived";
  created_at: string;
}

const AdminDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [editDepartmentName, setEditDepartmentName] = useState("");

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsInitialLoading(true);
      try {
        // TODO: Replace with actual API call when department endpoints are implemented
        setDepartments([]);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        setDepartments([]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const activeDepartments = departments.filter(d => d.status === "active");
  const archivedDepartments = departments.filter(d => d.status === "archived");

  const handleCreateDepartment = async () => {
    if (!newDepartmentName.trim()) {
      toast({
        title: "Validation Error",
        description: "Department name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newDepartment: Department = {
        id: Date.now().toString(),
        name: newDepartmentName.trim(),
        userCount: 0,
        activeProjects: 0,
        status: "active",
        created_at: new Date().toISOString().split('T')[0]
      };

      setDepartments([...departments, newDepartment]);
      setNewDepartmentName("");
      setIsCreateDialogOpen(false);

      toast({
        title: "Success",
        description: "Department created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create department",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDepartment = async () => {
    if (!editDepartmentName.trim() || !selectedDepartment) {
      toast({
        title: "Validation Error",
        description: "Department name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDepartments(departments.map(d =>
        d.id === selectedDepartment.id
          ? { ...d, name: editDepartmentName.trim() }
          : d
      ));

      setEditDepartmentName("");
      setSelectedDepartment(null);
      setIsEditDialogOpen(false);

      toast({
        title: "Success",
        description: "Department updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update department",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveDepartment = async () => {
    if (!selectedDepartment) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDepartments(departments.map(d =>
        d.id === selectedDepartment.id
          ? { ...d, status: "archived" as const }
          : d
      ));

      setSelectedDepartment(null);
      setIsArchiveDialogOpen(false);

      toast({
        title: "Success",
        description: "Department archived successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive department",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (department: Department) => {
    setSelectedDepartment(department);
    setEditDepartmentName(department.name);
    setIsEditDialogOpen(true);
  };

  const openArchiveDialog = (department: Department) => {
    setSelectedDepartment(department);
    setIsArchiveDialogOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 max-w-7xl mx-auto"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/40 backdrop-blur-xl border border-border/50 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">Organization Core</h2>
          </div>
          <p className="text-muted-foreground font-medium">Define and orchestrate the systemic structure of your organizational units.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="relative z-10 gap-2 h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <Plus className="h-5 w-5" />
          Create Unit
        </Button>
      </div>

      {/* Stats - Glowing KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            label: "Active Units",
            value: activeDepartments.length,
            icon: Building2,
            color: "primary",
            glow: "rgba(59, 130, 246, 0.5)"
          },
          {
            label: "Total Personnel",
            value: activeDepartments.reduce((sum, d) => sum + d.userCount, 0),
            icon: Users,
            color: "blue",
            glow: "rgba(37, 99, 235, 0.5)"
          },
          {
            label: "Active Initiatives",
            value: activeDepartments.reduce((sum, d) => sum + d.activeProjects, 0),
            icon: FolderKanban,
            color: "emerald",
            glow: "rgba(16, 185, 129, 0.5)"
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2rem] p-8 group hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{stat.label}</p>
              <div className={`p-4 rounded-2xl bg-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}/10 text-${stat.color === 'primary' ? 'primary' : stat.color + '-500'} ring-1 ring-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}/20 group-hover:scale-110 transition-transform duration-500 shadow-lg group-hover:shadow-[0_0_20px_${stat.glow}]`}>
                {isInitialLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <stat.icon className="h-5 w-5" />
                )}
              </div>
            </div>
            <p className="text-4xl font-black text-foreground tracking-tight tabular-nums">
              {isInitialLoading ? "—" : stat.value}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className={`w-1.5 h-1.5 rounded-full bg-${stat.color === 'primary' ? 'primary' : stat.color + '-500'} animate-pulse`} />
              <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Real-time Metrics</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Units Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h3 className="text-xl font-black text-foreground tracking-tight transition-all">Operational Units</h3>
          </div>
          <Badge variant="outline" className="px-4 py-1.5 rounded-xl border-border/50 text-[10px] font-black tracking-widest uppercase bg-card/40">
            {activeDepartments.length} UNITS REGISTERED
          </Badge>
        </div>

        {isInitialLoading ? (
          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium animate-pulse">Syncing Structural Data...</p>
          </div>
        ) : activeDepartments.length === 0 ? (
          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-24 text-center group">
            <div className="w-24 h-24 bg-muted/50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-border/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Building2 className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h4 className="text-2xl font-black text-foreground mb-3">No Active Operational Units</h4>
            <p className="text-muted-foreground max-w-sm mx-auto font-medium">
              Start building your organizational systemic structure by creating your first department.
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              variant="outline"
              className="mt-10 rounded-2xl h-12 px-8 border-border/50 hover:bg-accent font-bold"
            >
              Initialize Structure
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDepartments.map((department, idx) => (
              <motion.div
                key={department.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex items-center justify-between p-6 bg-card/40 backdrop-blur-lg border border-border/50 rounded-[2rem] hover:bg-card/60 hover:border-primary/30 transition-all duration-300 shadow-xl"
              >
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-all duration-500 border border-primary/10 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-black text-foreground group-hover:text-primary transition-colors">{department.name}</p>
                    <div className="flex items-center gap-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        {department.userCount} PERSONNEL
                      </p>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <FolderKanban className="h-3 w-3" />
                        {department.activeProjects} PROJECTS
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(department)}
                    className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openArchiveDialog(department)}
                    className="h-12 w-12 rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-all active:scale-90"
                  >
                    <Archive className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Archived Units Section */}
      <AnimatePresence>
        {archivedDepartments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 pt-10 border-t border-border/50"
          >
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-muted-foreground tracking-tight">System Archive</h3>
              <Badge variant="secondary" className="px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase bg-muted/30">
                {archivedDepartments.length} UNITS DECOMMISSIONED
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedDepartments.map((department) => (
                <div
                  key={department.id}
                  className="flex items-center justify-between p-5 bg-muted/10 backdrop-blur-sm border border-border/30 rounded-2xl grayscale group hover:grayscale-0 transition-all duration-500"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-xl">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-muted-foreground group-hover:text-foreground transition-colors">{department.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">
                        Archived Operation
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Archive className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs - Consistent Premium Styling */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border border-border/50 rounded-[2.5rem] shadow-2xl p-10">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2 ring-4 ring-primary/5">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black text-center">New Operational Unit</DialogTitle>
            <DialogDescription className="text-center font-medium">
              Initialize a new organizational identifier to group personnel and project workflows.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8">
            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">Unit Nomenclature</Label>
            <Input
              id="name"
              placeholder="e.g., Tactical Engineering"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              className="h-14 bg-background/50 border-border/50 rounded-2xl focus:ring-primary shadow-inner"
            />
          </div>
          <DialogFooter className="gap-3 sm:justify-center">
            <Button
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(false)}
              className="rounded-xl h-12 px-6 font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDepartment}
              disabled={isLoading}
              className="rounded-xl h-12 px-8 bg-primary hover:bg-primary/90 font-black uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Syncing...
                </>
              ) : (
                "Finalize Creation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border border-border/50 rounded-[2.5rem] shadow-2xl p-10">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Edit className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black text-center">Modify Nomenclature</DialogTitle>
          </DialogHeader>
          <div className="py-8">
            <Label htmlFor="edit-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">New Identity</Label>
            <Input
              id="edit-name"
              value={editDepartmentName}
              onChange={(e) => setEditDepartmentName(e.target.value)}
              className="h-14 bg-background/50 border-border/50 rounded-2xl focus:ring-primary"
            />
          </div>
          <DialogFooter className="gap-3 sm:justify-center">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl h-12 px-6 font-bold">Cancel</Button>
            <Button
              onClick={handleEditDepartment}
              disabled={isLoading}
              className="rounded-xl h-12 px-8 bg-primary hover:bg-primary/90 font-black uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Commit Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent className="bg-card border border-border/50 rounded-[2.5rem] shadow-2xl p-10">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2 ring-4 ring-rose-500/5">
              <Archive className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center">Decommission Unit?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium">
              Are you sure you want to archive <span className="text-foreground font-black">"{selectedDepartment?.name}"</span>?
              Associated personnel will remain active but the unit will be removed from primary operations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:justify-center mt-6">
            <AlertDialogCancel className="rounded-xl h-12 px-6 font-bold">Abort</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchiveDepartment}
              disabled={isLoading}
              className="rounded-xl h-12 px-8 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest shadow-lg shadow-rose-500/20"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Archive Unit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default AdminDepartments;