// ============================================================================
// TASK TYPES - Task related types
// ============================================================================

import type { TaskStatus, PaginationParams, PaginationResponse } from './common.types';

// Task Types
export interface Task {
  id: string;
  task_code: string;
  team_id: string;
  team_code: string;
  team_name: string;
  title: string;
  description: string;
  assigned_to: string;
  assigned_to_name: string;
  created_by: string;
  created_by_name: string;
  status: TaskStatus;
  priority: number;
  estimated_hours: number;
  actual_hours: number;
  due_date: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  assigned_to: string;
  priority: number;
  estimated_hours: number;
  due_date: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: number;
  estimated_hours?: number;
  due_date?: string;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface AssignTaskRequest {
  assigned_to: string;
}

export interface TasksResponse {
  tasks: Task[];
  pagination: PaginationResponse;
  team?: {
    team_id: string;
    team_code: string;
    team_name: string;
  };
}

export interface TaskFilters extends PaginationParams {
  status?: TaskStatus;
}

// Task Template Types
export interface TaskTemplate {
  id: string;
  template_code: string;
  team_id: string;
  name: string;
  category: string;
  title_pattern: string;
  description_pattern: string;
  default_task_type?: string;
  default_complexity?: string;
  default_estimated_hours?: number;
  default_priority?: number;
  subtask_templates?: Array<{
    title: string;
    estimated_hours: number;
  }>;
  default_acceptance_criteria?: string[];
  default_tags?: string[];
  created_at: string;
}

export interface CreateTaskTemplateRequest {
  name: string;
  category: string;
  title_pattern: string;
  description_pattern: string;
  default_task_type?: string;
  default_complexity?: string;
  default_estimated_hours?: number;
  default_priority?: number;
  subtask_templates?: Array<{
    title: string;
    estimated_hours: number;
  }>;
  default_acceptance_criteria?: string[];
  default_tags?: string[];
}
