import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { BarChart3, Users, TrendingUp, Clock, Target, Zap } from "lucide-react";

const DashboardPreview = () => {
  return (
    <div className="h-full w-full bg-background p-4 md:p-6 overflow-hidden">
      {/* Mock Dashboard Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Team Dashboard</h3>
          <p className="text-sm text-muted-foreground">Sprint 24 Overview</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 bg-accent rounded-lg text-xs font-medium text-accent-foreground">
            This Week
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Velocity", value: "87pts", icon: Zap, change: "+12%" },
          { label: "Completion", value: "94%", icon: Target, change: "+5%" },
          { label: "Team Health", value: "A+", icon: Users, change: "Stable" },
          { label: "Cycle Time", value: "2.3d", icon: Clock, change: "-18%" },
        ].map((stat, i) => (
          <div key={i} className="p-3 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="bg-card border border-border rounded-xl p-4 h-[40%]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-foreground">Performance Trend</h4>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-primary rounded-full" />
              Velocity
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-muted-foreground rounded-full" />
              Capacity
            </span>
          </div>
        </div>
        {/* Simplified Chart Bars */}
        <div className="flex items-end justify-between h-[70%] gap-2 px-2">
          {[65, 72, 58, 85, 78, 92, 88, 95, 82, 90, 87, 94].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col gap-1">
              <div
                className="bg-primary/80 rounded-t"
                style={{ height: `${height}%` }}
              />
              <div
                className="bg-muted-foreground/30 rounded"
                style={{ height: `${100 - height}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ContainerScrollSection = () => {
  return (
    <section className="bg-background">
      <ContainerScroll
        titleComponent={
          <>
            <h2 className="text-4xl font-semibold text-foreground">
              Powerful insights at a glance <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-muted-foreground">
                Real-time Analytics
              </span>
            </h2>
          </>
        }
      >
        <DashboardPreview />
      </ContainerScroll>
    </section>
  );
};

export default ContainerScrollSection;
