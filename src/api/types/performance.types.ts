// ============================================================================
// PERFORMANCE TYPES - Performance metrics and evaluation types
// ============================================================================

import type {
  ObservationCategory,
  ObservationRating,
  PerformanceTier
} from './common.types';
import type { Observation } from './observation.types';
import type { PerformanceGoal } from './workload.types';

// Performance Metrics Types
export interface TaskMetrics {
  total: number;
  completed: number;
  in_progress: number;
  blocked: number;
  completion_rate: number;
  average_completion_days?: number;
  overdue?: number;
}

export interface TimeTrackingMetrics {
  total_hours_logged: number;
  total_estimated_hours?: number;
  variance_percentage?: number;
  average_hours_per_task?: number;
  average_hours_per_day?: number;
}

export interface ObservationMetrics {
  total: number;
  by_category: Record<ObservationCategory, number>;
  by_rating: Record<ObservationRating, number>;
}

export interface EvaluationMetrics {
  finalized_count?: number;
  average_score?: number;
  tier_distribution?: Record<PerformanceTier, number>;
}

export interface PerformanceMetrics {
  tasks: TaskMetrics;
  time_tracking: TimeTrackingMetrics;
  observations: ObservationMetrics;
  evaluations?: EvaluationMetrics;
}

export interface MemberPerformanceSummary {
  user_id: string;
  user_code: string;
  user_name: string;
  tasks_completed?: number;
  tasks_total?: number;
  performance_score: number;
  tier?: PerformanceTier;
}

export interface TeamPerformanceResponse {
  team: {
    team_id: string;
    team_code: string;
    team_name: string;
  };
  period: {
    start_date: string;
    end_date: string;
  };
  metrics: PerformanceMetrics;
  members?: MemberPerformanceSummary[];
  members_summary?: {
    total_members: number;
    active_members: number;
    average_performance_score: number;
  };
}

export interface MemberPerformanceResponse {
  user: {
    user_id: string;
    user_code: string;
    user_name: string;
  };
  team?: {
    team_id: string;
    team_code: string;
    team_name: string;
  };
  period: {
    start_date: string;
    end_date: string;
  };
  metrics: PerformanceMetrics;
  summary: {
    performance_score: number;
    tier: PerformanceTier;
  };
}

export interface PerformanceFilters {
  period_start: string;
  period_end: string;
}

// Performance Summary Types
export type TrendDirection = 'improving' | 'stable' | 'declining';

export interface PerformanceSummary {
  overall_score: number;
  tier: string;
  trend_direction: TrendDirection;
  risk_level: string;
}

export interface PerformanceTrends {
  velocity_trend: number;
  quality_trend: number;
  overall_direction: TrendDirection;
  risk_level: string;
}

export interface MemberPerformanceDashboard {
  user: {
    id: string;
    user_code: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  performance_summary: PerformanceSummary;
  goals: {
    active: PerformanceGoal[];
    completed: PerformanceGoal[];
    completion_rate: number;
  };
  metrics: Array<{
    metric_date: string;
    tasks_completed: number;
    tasks_on_time: number;
    story_points_completed: number;
    code_review_participation: number;
    pr_reviews_given: number;
  }>;
  trends: PerformanceTrends;
  flags: unknown[];
  recent_observations: Observation[];
  recommendations: string[];
}

// Performance Flags Types
export type FlagType =
  | 'performance_decline'
  | 'quality_issues'
  | 'attendance_issues'
  | 'collaboration_problems'
  | 'skill_gap'
  | 'overload'
  | 'disengagement';

export type FlagStatus = 'active' | 'investigating' | 'action_plan' | 'monitoring' | 'resolved';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface PerformanceFlag {
  id: string;
  flag_code: string;
  user_id: string;
  team_id: string;
  flag_type: FlagType;
  severity: AlertSeverity;
  title: string;
  description?: string;
  evidence?: string[];
  metrics_data?: Record<string, unknown>;
  flagged_by: string;
  flagged_date: string;
  status: FlagStatus;
  action_plan?: string;
  escalation_level: number;
  created_at: string;
}

export interface CreateFlagRequest {
  flag_type: FlagType;
  severity: AlertSeverity;
  title: string;
  description?: string;
  evidence?: string[];
  metrics_data?: Record<string, unknown>;
  action_plan?: string;
  target_resolution_date?: string;
}

export interface FlagsResponse {
  flags: PerformanceFlag[];
  summary?: {
    total: number;
    by_type: Record<FlagType, number>;
    by_severity: Record<AlertSeverity, number>;
  };
}
