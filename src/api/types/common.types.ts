// ============================================================================
// COMMON TYPES - Base types, pagination, and API errors
// ============================================================================

// Base Status Types
export type UserRole = 'admin' | 'project_manager' | 'team_lead' | 'employee';
export type UserStatus = 'pending' | 'active' | 'blocked' | 'inactive';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'in_review' | 'done' | 'cancelled';
export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled';
export type ObservationCategory = 'technical' | 'communication' | 'leadership' | 'delivery' | 'quality' | 'collaboration';
export type ObservationRating = 'positive' | 'neutral' | 'negative';
export type PerformanceTier = 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
export type PluginStatus = 'connected' | 'active' | 'inactive' | 'disconnected';

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ExtendedPaginationResponse extends PaginationResponse {
  has_next: boolean;
  has_prev: boolean;
}

// API Error Types
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}
