// ============================================================================
// DASHBOARD TYPES - Dashboard and monitoring related types
// ============================================================================

import type { WorkloadStatus } from './workload.types';
import type { Sprint } from './sprint.types';
import type { Task } from './task.types';

// Team Health Types
export type TeamHealthStatus = 'good' | 'at_risk' | 'critical';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type RiskCategory = 'technical' | 'operational' | 'resource' | 'schedule' | 'quality' | 'external';
export type RiskImpact = 'low' | 'medium' | 'high' | 'critical';
export type RiskStatus = 'identified' | 'mitigating' | 'monitoring' | 'resolved';
export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TeamHealthMetrics {
  score: number;
  status: TeamHealthStatus;
  factors: string[];
}

export interface QuickStats {
  active_sprints: number;
  active_tasks: number;
  overdue_tasks: number;
  blocked_tasks: number;
  active_alerts: number;
  high_risk_items: number;
}

export interface DashboardTeamMember {
  user_id: string;
  user_code: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  team_role: string;
  current_workload: WorkloadStatus;
  active_flags: number;
}

// Alert Types
export interface Alert {
  id: string;
  alert_code: string;
  rule_id?: string;
  title: string;
  message?: string;
  severity: AlertSeverity;
  status: AlertStatus;
  triggered_at: string;
  triggered_by_entity_type?: string;
  triggered_by_entity_id?: string;
  context_data?: Record<string, unknown>;
  acknowledged_at?: string;
  resolved_at?: string;
}

export interface AlertsResponse {
  alerts: Alert[];
  summary: {
    total: number;
    by_severity: Record<AlertSeverity, number>;
    by_status: Record<AlertStatus, number>;
  };
}

export interface AcknowledgeAlertRequest {
  notes?: string;
}

export interface ResolveAlertRequest {
  resolution_notes: string;
}

// Risk Types
export interface Risk {
  id: string;
  risk_code: string;
  team_id?: string;
  title: string;
  description?: string;
  risk_category: RiskCategory;
  probability?: number;
  impact: RiskImpact;
  risk_score: number;
  current_status: RiskStatus;
  owner_id?: string;
  mitigation_plan?: string;
  mitigation_actions?: Array<{
    action: string;
    due_date: string;
    status: string;
  }>;
  contingency_plan?: string;
  identified_date?: string;
  target_resolution_date?: string;
  next_review_date?: string;
  created_at?: string;
}

export interface CreateRiskRequest {
  title: string;
  description?: string;
  risk_category: RiskCategory;
  probability: number;
  impact: RiskImpact;
  owner_id?: string;
  mitigation_plan?: string;
  mitigation_actions?: Array<{
    action: string;
    due_date: string;
    status: string;
  }>;
  contingency_plan?: string;
  target_resolution_date?: string;
}

export interface RisksResponse {
  risks: Risk[];
  summary: {
    total: number;
    by_category: Record<string, number>;
    high_risk_count: number;
    average_risk_score: number;
  };
}

// Milestone Types
export interface Milestone {
  id: string;
  milestone_code: string;
  title: string;
  target_date: string;
  status: string;
  description?: string;
}

// Action Item Types
export interface ActionItem {
  type: string;
  priority: string;
  title: string;
  action: string;
  entity_id: string;
}

// Team Dashboard Response
export interface TeamDashboardResponse {
  team: {
    id: string;
    team_code: string;
    name: string;
    member_count: number;
  };
  team_health: TeamHealthMetrics;
  quick_stats: QuickStats;
  team_members: DashboardTeamMember[];
  active_sprints: Sprint[];
  recent_alerts: Alert[];
  active_risks: Risk[];
  upcoming_milestones: Milestone[];
  action_items: ActionItem[];
}

// Monitoring Rule Types
export interface MonitoringRule {
  id: string;
  rule_code: string;
  team_id: string;
  name: string;
  description?: string;
  rule_type: string;
  condition_sql?: string;
  trigger_frequency: string;
  severity: AlertSeverity;
  notification_channels: string[];
  notify_roles?: string[];
  auto_actions?: Array<{
    action: string;
    params: Record<string, unknown>;
  }>;
  is_active: boolean;
  created_at: string;
}

export interface CreateMonitoringRuleRequest {
  name: string;
  description?: string;
  rule_type: string;
  condition_sql?: string;
  trigger_frequency: string;
  severity: AlertSeverity;
  notification_channels: string[];
  notify_roles?: string[];
  auto_actions?: Array<{
    action: string;
    params: Record<string, unknown>;
  }>;
}
