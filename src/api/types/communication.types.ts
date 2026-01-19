// ============================================================================
// COMMUNICATION TYPES - Announcements, one-on-ones, and decisions
// ============================================================================

import type { AnnouncementPriority } from './dashboard.types';

// Announcement Types
export interface Announcement {
  id: string;
  announcement_code: string;
  team_id: string;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  channels: string[];
  target_audience: string;
  is_pinned: boolean;
  expires_at?: string;
  read_by: string[];
  acknowledged_by: string[];
  created_at: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  message: string;
  priority: AnnouncementPriority;
  channels: string[];
  target_audience: string;
  is_pinned?: boolean;
  expires_at?: string;
}

// One-on-One Types
export interface OneOnOne {
  id: string;
  session_code: string;
  manager_id: string;
  employee_id: string;
  scheduled_date: string;
  duration_minutes: number;
  agenda: string[];
  status: string;
  notes?: string;
  action_items?: string[];
  created_at: string;
}

export interface CreateOneOnOneRequest {
  scheduled_date: string;
  duration_minutes: number;
  agenda: string[];
}

// Team Decision Types
export interface TeamDecision {
  id: string;
  decision_code: string;
  team_id: string;
  title: string;
  description?: string;
  decision_type: string;
  context?: string;
  options_considered?: Array<{
    option: string;
    pros: string[];
    cons: string[];
  }>;
  decision_made: string;
  rationale?: string;
  decision_makers?: string[];
  stakeholders?: string[];
  implementation_date?: string;
  created_at: string;
}

export interface CreateDecisionRequest {
  title: string;
  description?: string;
  decision_type: string;
  context?: string;
  options_considered?: Array<{
    option: string;
    pros: string[];
    cons: string[];
  }>;
  decision_made: string;
  rationale?: string;
  decision_makers?: string[];
  stakeholders?: string[];
  implementation_date?: string;
}
