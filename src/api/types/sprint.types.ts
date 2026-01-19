// ============================================================================
// SPRINT TYPES - Sprint management related types
// ============================================================================

import type { Task } from './task.types';

// Sprint Status Types
export type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled';

export interface Sprint {
  id: string;
  sprint_code: string;
  project_id?: string;
  team_id?: string;
  name: string;
  description?: string;
  sprint_number?: number;
  status: SprintStatus;
  start_date: string;
  end_date: string;
  capacity_hours?: number;
  committed_hours?: number;
  goals?: string[];
  success_criteria?: string[];
  velocity?: number | null;
  created_at?: string;
}

export interface CreateSprintRequest {
  project_id: string;
  team_id: string;
  name: string;
  description?: string;
  sprint_number: number;
  start_date: string;
  end_date: string;
  capacity_hours: number;
  goals?: string[];
  success_criteria?: string[];
}

export interface UpdateSprintRequest {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  capacity_hours?: number;
  committed_hours?: number;
  goals?: string[];
  success_criteria?: string[];
  status?: SprintStatus;
}

export interface CloseSprintRequest {
  action: 'complete' | 'cancel';
  notes?: string;
}

export interface SprintMetrics {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  blocked_tasks: number;
  total_story_points: number;
  completed_story_points: number;
  progress_percentage: number;
  velocity: number | null;
  days_remaining: number;
}

export interface BurndownData {
  ideal_line: number[];
  actual_line: number[];
  scope_changes: Array<{
    date: string;
    change: number;
    reason: string;
  }>;
}

export interface SprintDashboardResponse {
  sprint: Sprint;
  metrics: SprintMetrics;
  burndown_data: BurndownData;
  tasks: {
    completed: Task[];
    in_progress: Task[];
    blocked: Task[];
  };
}
