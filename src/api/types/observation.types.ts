// ============================================================================
// OBSERVATION TYPES - Observation related types
// ============================================================================

import type { ObservationCategory, ObservationRating, PaginationResponse } from './common.types';

// Observation Types
export interface Observation {
  id: string;
  observation_code: string;
  user_id: string;
  user_code: string;
  user_name: string;
  evaluator_id: string;
  evaluator_name: string;
  evaluator_role?: string;
  related_task_id?: string;
  related_task_code?: string;
  related_task_title?: string;
  category: ObservationCategory;
  rating: ObservationRating;
  note: string;
  observation_date: string;
  created_at: string;
}

export interface CreateObservationRequest {
  category: ObservationCategory;
  rating: ObservationRating;
  note: string;
  related_task_id?: string;
  observation_date: string;
}

export interface UpdateObservationRequest {
  category?: ObservationCategory;
  rating?: ObservationRating;
  note?: string;
}

export interface ObservationsResponse {
  observations: Observation[];
  pagination: PaginationResponse;
  member?: {
    user_id: string;
    user_code: string;
    user_name: string;
  };
  team?: {
    team_id: string;
    team_code: string;
    team_name: string;
  };
  summary?: {
    total: number;
    by_category: Record<ObservationCategory, number>;
    by_rating: Record<ObservationRating, number>;
  };
}
