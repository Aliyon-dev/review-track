export type ApiRole = 'APPLICANT' | 'REVIEWER' | 'ADMIN';

export type ApiStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED';

export type UiRole = 'applicant' | 'reviewer';

export type UiStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'changes_requested';

export type ActivityEventType = 'STATUS_CHANGE' | 'COMMENT';

export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: ApiRole;
}

export interface ApiApplicantRef {
  firstName: string;
  lastName: string;
}

export interface ApiApplication {
  id: string;
  title: string;
  description: string;
  status: ApiStatus;
  applicantId: string;
  applicant?: ApiApplicantRef;
  type?: string | null;
  priority?: string | null;
  amount?: number | null;
  justification?: string | null;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiActivityEvent {
  type: ActivityEventType;
  id: string;
  createdAt: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  changedBy?: string | null;
  changedByName?: string | null;
  comment?: string | null;
  reviewerId?: string | null;
  reviewerName?: string | null;
}

export interface UiUser {
  id: string;
  name: string;
  email: string;
  role: UiRole;
  apiRole: ApiRole;
}

export interface UiApplication {
  id: string;
  title: string;
  description: string;
  status: UiStatus;
  applicantId: string;
  applicantName?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  type?: string;
  priority?: string;
  amount?: string;
  justification?: string;
}

export interface UiActivityEvent {
  id: string;
  type: ActivityEventType;
  actor: string;
  label: string;
  comment?: string;
  ts: string;
  dot: string;
}

export interface ApplicationFormPayload {
  title: string;
  description: string;
  type?: string;
  priority?: string;
  amount?: number;
  justification?: string;
}

export const API_GAP_TOOLTIP = 'Not available in API v1.2';
