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

export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: ApiRole;
}

export interface ApiApplication {
  id: string;
  title: string;
  description: string;
  status: ApiStatus;
  applicantId: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
  type?: string;
  priority?: string;
  amount?: string;
  justification?: string;
}

export const API_GAP_TOOLTIP = 'Not available in API v1.0';
