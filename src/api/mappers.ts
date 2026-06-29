import type {
  ApiActivityEvent,
  ApiApplication,
  ApiRole,
  ApiStatus,
  ApiUser,
  UiActivityEvent,
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

export function formatPriorityDisplay(priority: string | null | undefined): string | undefined {
  if (!priority) return undefined;
  const upper = priority.toUpperCase();
  const map: Record<string, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
  };
  return map[upper] ?? priority;
}

export function priorityToApi(priority: string): string {
  return priority.toUpperCase();
}

export function mapApplication(app: ApiApplication): UiApplication {
  const applicantName = app.applicant
    ? `${app.applicant.firstName} ${app.applicant.lastName}`.trim()
    : undefined;

  return {
    id: app.id,
    title: app.title,
    description: app.description,
    status: mapStatus(app.status),
    applicantId: app.applicantId,
    applicantName,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    submittedAt: app.submittedAt,
    type: app.type ?? undefined,
    priority: formatPriorityDisplay(app.priority),
    amount: app.amount != null ? String(app.amount) : undefined,
    justification: app.justification ?? undefined,
  };
}

export function mapActivityEvent(event: ApiActivityEvent): UiActivityEvent {
  if (event.type === 'COMMENT') {
    return {
      id: event.id,
      type: event.type,
      actor: event.reviewerName ?? 'Reviewer',
      label: 'added a comment',
      comment: event.comment ?? undefined,
      ts: event.createdAt,
      dot: '#8a9a8a',
    };
  }

  const actor = event.changedByName ?? 'System';
  const toLabel = event.toStatus
    ? event.toStatus.replace(/_/g, ' ').toLowerCase()
    : 'updated';
  const label =
    event.fromStatus && event.toStatus
      ? `moved status to ${toLabel}`
      : `updated status to ${toLabel}`;

  return {
    id: event.id,
    type: event.type,
    actor,
    label,
    ts: event.createdAt,
    dot: statusDotForApi(event.toStatus),
  };
}

function statusDotForApi(status: string | null | undefined): string {
  if (!status) return '#b8c4b8';
  const ui = mapStatus(status as ApiStatus);
  const dots: Record<UiStatus, string> = {
    draft: '#b8c4b8',
    submitted: '#c4a882',
    under_review: '#5a7a6a',
    approved: '#1a302a',
    rejected: '#b85450',
    changes_requested: '#c4a882',
  };
  return dots[ui] ?? '#b8c4b8';
}

export function formatApplicationId(id: string): string {
  const year = new Date().getFullYear();
  const short = id.replace(/-/g, '').slice(0, 4).toUpperCase();
  return `APP-${year}-${short}`;
}

export function initials(nameOrId: string): string {
  if (!nameOrId) return '?';
  const parts = nameOrId.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return nameOrId.slice(0, 2).toUpperCase();
}

export function fmtDate(iso: string | undefined | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function fmtDateTime(iso: string | undefined | null): string {
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

export function canEditApplication(status: UiStatus): boolean {
  return status === 'draft' || status === 'changes_requested';
}
