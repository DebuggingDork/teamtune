import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Users, 
  Settings, 
  BarChart3, 
  Bell, 
  Search,
  LogOut,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  FolderKanban,
  UsersRound,
  GitCommit,
  Building2,
  UserCog,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TeamTuneLogo from "@/components/TeamTuneLogo";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Static data for demonstration
const commitActivityData = [
  { name: "Mon", commits: 45 },
  { name: "Tue", commits: 52 },
  { name: "Wed", commits: 78 },
  { name: "Thu", commits: 61 },
  { name: "Fri", commits: 89 },
  { name: "Sat", commits: 34 },
  { name: "Sun", commits: 28 },
];

const contributorTrendData = [
  { name: "Week 1", contributors: 12 },
  { name: "Week 2", contributors: 15 },
  { name: "Week 3", contributors: 18 },
  { name: "Week 4", contributors: 22 },
];

const pendingApprovals = [
  { id: 1, name: "Sarah Johnson", email: "sarah.j@company.com", requestedDate: "Dec 26, 2025" },
  { id: 2, name: "Michael Chen", email: "m.chen@company.com", requestedDate: "Dec 27, 2025" },
  { id: 3, name: "Emily Rodriguez", email: "e.rodriguez@company.com", requestedDate: "Dec 28, 2025" },
];

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 hidden lg:flex flex-col">
        <Link to="/">
          <TeamTuneLogo />
        </Link>
        
        <nav className="mt-8 flex-1">
          <div className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground bg-accent rounded-lg">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <Users className="h-4 w-4" />
              Users
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <UserCog className="h-4 w-4" />
              Roles
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <Building2 className="h-4 w-4" />
              Departments
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <Settings className="h-4 w-4" />
              Settings
            </a>
          </div>
        </nav>

        <div className="border-t border-border pt-4">
          <Link to="/auth">
            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <TeamTuneLogo showText={false} />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users, projects..."
                  className="pl-10 pr-4 py-2 bg-accent border-none rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
              </button>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">Admin User</p>
                  <p className="text-xs text-muted-foreground">System Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-foreground mb-2">System Overview</h1>
            <p className="text-muted-foreground mb-8">Monitor and manage your organization's health and access.</p>

            {/* System Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Users", value: "1,234", icon: Users, color: "bg-primary/10 text-primary" },
                { label: "Pending", value: "8", icon: Clock, color: "bg-warning/10 text-warning" },
                { label: "Active", value: "1,156", icon: UserCheck, color: "bg-emerald-500/10 text-emerald-500" },
                { label: "Blocked", value: "12", icon: UserX, color: "bg-destructive/10 text-destructive" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Role Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-6 mb-8"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Role Distribution</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { role: "Admins", count: 4, icon: Shield },
                  { role: "Project Managers", count: 28, icon: FolderKanban },
                  { role: "Team Leads", count: 86, icon: UsersRound },
                  { role: "Members", count: 1116, icon: Users },
                ].map((item) => (
                  <div key={item.role} className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">{item.count}</p>
                      <p className="text-xs text-muted-foreground">{item.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pending Approvals - High Priority */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card border-2 border-warning/50 rounded-xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Pending Approvals</h2>
                    <p className="text-sm text-muted-foreground">Users awaiting your approval</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                  {pendingApprovals.length} pending
                </Badge>
              </div>
              
              <div className="space-y-3">
                {pendingApprovals.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        Requested {user.requestedDate}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Organization Health & Activity Signals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Organization Health */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">Organization Health</h2>
                <div className="space-y-4">
                  {[
                    { label: "Active Projects", value: "56", trend: "+3 this month", icon: FolderKanban, positive: true },
                    { label: "Active Teams", value: "23", trend: "+2 this month", icon: UsersRound, positive: true },
                    { label: "Total Contributors", value: "342", trend: "+18 this month", icon: Users, positive: true },
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <metric.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{metric.label}</p>
                          <p className="text-xl font-bold text-foreground">{metric.value}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-500">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">{metric.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Commit Activity Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <GitCommit className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Commit Activity</h2>
                    <p className="text-sm text-muted-foreground">Last 7 days</p>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={commitActivityData}>
                      <defs>
                        <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="commits"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#commitGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Contributor Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-card border border-border rounded-xl p-6 mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Active Contributors Trend</h2>
                  <p className="text-sm text-muted-foreground">Weekly growth</p>
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={contributorTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="contributors"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Administrative Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Administrative Controls</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { 
                    title: "User Management", 
                    description: "View, edit, and manage all user accounts", 
                    icon: Users,
                    href: "#"
                  },
                  { 
                    title: "Role Management", 
                    description: "Configure roles and permissions", 
                    icon: UserCog,
                    href: "#"
                  },
                  { 
                    title: "Department Management", 
                    description: "Organize teams and departments", 
                    icon: Layers,
                    href: "#"
                  },
                ].map((control) => (
                  <a
                    key={control.title}
                    href={control.href}
                    className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
                  >
                    <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                      <control.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{control.title}</h3>
                    <p className="text-sm text-muted-foreground">{control.description}</p>
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
