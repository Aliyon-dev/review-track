import type {
  ApiApplication,
  ApiRole,
  ApiStatus,
  ApiUser,
  UiApplication,
  UiRole,
  UiStatus,
  UiUser,
} from '@/types/ui';

export function mapRole(role: ApiRole): UiRole {
  if (role === 'APPLICANT') return 'applicant';
  return 'reviewer';
}

export function mapStatus(status: ApiStatus): UiStatus {
  const map: Record<ApiStatus, UiStatus> = {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CHANGES_REQUESTED: 'changes_requested',
  };
  return map[status];
}

export function mapStatusToApi(status: UiStatus): ApiStatus {
  const map: Record<UiStatus, ApiStatus> = {
    draft: 'DRAFT',
    submitted: 'SUBMITTED',
    under_review: 'UNDER_REVIEW',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    changes_requested: 'CHANGES_REQUESTED',
  };
  return map[status];
}

export function mapUser(user: ApiUser): UiUser {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    role: mapRole(user.role),
    apiRole: user.role,
  };
}

export function mapApplication(app: ApiApplication): UiApplication {
  return {
    id: app.id,
    title: app.title,
    description: app.description,
    status: mapStatus(app.status),
    applicantId: app.applicantId,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}

export function initials(nameOrId: string): string {
  if (!nameOrId) return '?';
  const parts = nameOrId.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return nameOrId.slice(0, 2).toUpperCase();
}

export function fmtDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function fmtDateTime(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  );
}

export function statusNote(status: UiStatus): string {
  const notes: Record<UiStatus, string> = {
    draft: 'This application is a draft and has not been submitted yet.',
    submitted: 'Submitted and waiting to be picked up by a reviewer.',
    under_review: 'A reviewer is currently reviewing this application.',
    approved: 'This application has been approved.',
    rejected: 'This application was rejected.',
    changes_requested:
      'A reviewer requested changes. Edit and resubmit to continue.',
  };
  return notes[status];
}

export function isActiveStatus(status: UiStatus): boolean {
  return ['submitted', 'under_review', 'changes_requested'].includes(status);
}
