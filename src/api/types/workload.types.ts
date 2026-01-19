// ============================================================================
// WORKLOAD TYPES - Workload and capacity management types
// ============================================================================

// Workload Status Types
export type WorkloadStatus = 'underutilized' | 'normal' | 'optimal' | 'overloaded' | 'critical';
export type GoalCategory = 'learning' | 'performance' | 'technical' | 'leadership';
export type GoalStatus = 'active' | 'completed' | 'cancelled';

// Member Workload Types
export interface MemberWorkload {
  total_assigned_hours: number;
  total_estimated_hours: number;
  active_tasks_count: number;
  overdue_tasks_count: number;
  blocked_tasks_count: number;
  workload_percentage: number;
  utilization_percentage: number;
  status: WorkloadStatus;
}

export interface MemberAvailability {
  availability_percentage: number;
  availability_type: string;
}

export interface MemberSkill {
  skill_name: string;
  proficiency_level: number;
}

export interface TeamWorkloadMember {
  member: {
    user_id: string;
    user_code: string;
    full_name: string;
    email: string;
    team_role: string;
  };
  workload: MemberWorkload;
  availability: MemberAvailability;
  skills: MemberSkill[];
}

export interface TeamWorkloadResponse {
  team_metrics: {
    total_capacity: number;
    average_utilization: number;
    overloaded_count: number;
    underutilized_count: number;
  };
  member_workloads: TeamWorkloadMember[];
  recommendations: string[];
}

// Capacity Planning Types
export interface CreateCapacityPlanRequest {
  period_start: string;
  period_end: string;
  period_type: string;
  total_capacity_hours: number;
  member_allocations: Array<{
    user_id: string;
    allocated_hours: number;
    allocation_percentage: number;
  }>;
  external_resources?: unknown[];
  notes?: string;
}

export interface CapacityPlanResponse {
  id: string;
  team_id: string;
  period_start: string;
  period_end: string;
  period_type: string;
  total_capacity_hours: number;
  allocated_hours: number;
  member_allocations: unknown[];
  created_at: string;
}

// Skill Gap Analysis Types
export interface SkillGapAnalysisRequest {
  required_skills: Array<{
    skill: string;
    required_level: number;
    required_members: number;
  }>;
}

export interface SkillGapAnalysisResponse {
  id: string;
  team_id: string;
  analysis_date: string;
  analysis_period: string;
  required_skills: unknown[];
  current_skills: Record<string, { avg_level: number; member_count: number }>;
  skill_gaps: Array<{
    skill: string;
    gap: number;
    priority: string;
  }>;
  recommendations: string[];
}

// Performance Goals Types
export interface PerformanceGoal {
  id: string;
  goal_code: string;
  user_id?: string;
  title: string;
  description?: string;
  category: GoalCategory;
  priority?: string;
  period_start?: string;
  period_end: string;
  target_metrics?: Array<{
    metric: string;
    target: number;
  }>;
  milestones?: Array<{
    title: string;
    due_date: string;
    completed?: boolean;
  }>;
  progress_percentage: number;
  status: GoalStatus;
  created_at?: string;
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  category: GoalCategory;
  priority?: string;
  period_start?: string;
  period_end: string;
  target_metrics?: Array<{
    metric: string;
    target: number;
  }>;
  milestones?: Array<{
    title: string;
    due_date: string;
  }>;
}
