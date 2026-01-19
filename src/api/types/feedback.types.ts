// ============================================================================
// FEEDBACK TYPES - 360-degree feedback related types
// ============================================================================

// Feedback Type Enums
export type FeedbackType = '360' | 'peer' | 'upward' | 'self' | 'customer';
export type FeedbackStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type ReviewerRelationship = 'peer' | 'direct_report' | 'manager' | 'customer' | 'other';
export type ReviewerStatus = 'pending' | 'completed' | 'declined';
export type QuestionType = 'rating' | 'text' | 'multiple_choice';

export interface FeedbackReviewer {
  user_id: string;
  user_name?: string;
  user_code?: string;
  relationship: ReviewerRelationship;
  status: ReviewerStatus;
}

export interface FeedbackQuestion {
  id: number;
  text: string;
  type: QuestionType;
  scale?: number;
  options?: string[];
}

export interface FeedbackRequest {
  id: string;
  request_code: string;
  subject_user_id: string;
  subject_name?: string;
  subject_user_code?: string;
  requested_by: string;
  requested_by_name?: string;
  title: string;
  description: string;
  feedback_type: FeedbackType;
  reviewers: FeedbackReviewer[];
  questions: FeedbackQuestion[];
  anonymous: boolean;
  deadline: string;
  status: FeedbackStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackRequest {
  title: string;
  description?: string;
  feedback_type: string;
  reviewers: Array<{
    user_id: string;
    relationship: string;
  }>;
  questions: Array<{
    question: string;
    type: string;
  }>;
  anonymous: boolean;
  deadline: string;
}

export interface CreateFeedbackRequestData {
  title: string;
  description: string;
  feedback_type: FeedbackType;
  reviewers: {
    user_id: string;
    relationship: ReviewerRelationship;
    status: ReviewerStatus;
  }[];
  questions: FeedbackQuestion[];
  anonymous: boolean;
  deadline: string;
}

export interface UpdateFeedbackRequestData {
  title?: string;
  description?: string;
  reviewers?: {
    user_id: string;
    relationship: ReviewerRelationship;
    status: ReviewerStatus;
  }[];
  questions?: FeedbackQuestion[];
  anonymous?: boolean;
  deadline?: string;
  status?: FeedbackStatus;
}

export interface FeedbackRequestListItem {
  id: string;
  request_code: string;
  subject_user_id: string;
  subject_name: string;
  subject_user_code: string;
  title: string;
  feedback_type: FeedbackType;
  status: FeedbackStatus;
  deadline: string;
  created_at: string;
  total_reviewers?: number;
  completed_responses?: number;
}

export interface FeedbackResponse {
  id: string;
  reviewer_id?: string;
  reviewer_name?: string;
  reviewer_user_code?: string;
  responses: {
    [questionId: string]: {
      rating?: number;
      text?: string;
    };
  };
  overall_rating?: number;
  submitted_at: string;
}

export interface FeedbackResponsesData {
  responses: FeedbackResponse[];
  total: number;
  anonymous: boolean;
}

export interface QuestionSummary {
  question: string;
  ratings: number[];
  avgRating: number;
  textResponses: string[];
}

export interface FeedbackSummary {
  request_code: string;
  title: string;
  status: FeedbackStatus;
  deadline: string;
  anonymous: boolean;
  total_reviewers: number;
  completed_responses: number;
  pending_reviewers: number;
  completion_rate: number;
  average_overall_rating: number;
  question_summaries: QuestionSummary[];
}
