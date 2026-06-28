import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '@/api/client';
import {
  fmtDate,
  statusNote,
} from '@/api/mappers';
import { ConfirmModal } from '@/components/ConfirmModal';
import { DisabledWithTooltip } from '@/components/DisabledWithTooltip';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  useApproveApplication,
  useMyApplications,
  useRejectApplication,
  useReturnApplication,
  useReviewerApplication,
  useStartReview,
  useSubmitApplication,
} from '@/hooks/useApplications';
import type { UiApplication } from '@/types/ui';
import { API_GAP_TOOLTIP } from '@/types/ui';
import styles from './ApplicationDetailPage.module.css';

type ModalKind =
  | 'approve'
  | 'reject'
  | 'return'
  | 'submit'
  | null;

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isReviewer = user?.role === 'reviewer';

  const { data: reviewerApp, isLoading: reviewerLoading } =
    useReviewerApplication(id, isReviewer);
  const { data: myApps, isLoading: myLoading } = useMyApplications();

  const app: UiApplication | undefined = isReviewer
    ? reviewerApp
    : myApps?.find((a) => a.id === id);

  const startReviewMutation = useStartReview();
  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();
  const returnMutation = useReturnApplication();
  const submitMutation = useSubmitApplication();
  const reviewerPending =
    startReviewMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    returnMutation.isPending;
  const [modal, setModal] = useState<ModalKind>(null);
  const [modalComment, setModalComment] = useState('');

  const backPath = isReviewer ? '/queue' : '/dashboard';

  const reviewerActions = useMemo(() => {
    if (!app || !isReviewer) return null;
    const canStart = app.status === 'submitted';
    const canDecide = app.status === 'under_review';
    const resolved =
      app.status === 'approved' ||
      app.status === 'rejected' ||
      app.status === 'draft' ||
      app.status === 'changes_requested';
    return { canStart, canDecide, resolved };
  }, [app, isReviewer]);

  const runReviewerAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
    errorFallback: string,
  ) => {
    try {
      await action();
      showToast('success', successMessage);
      setModal(null);
      setModalComment('');
    } catch (err) {
      showToast(
        'error',
        err instanceof ApiError ? err.message : errorFallback,
      );
    }
  };

  const handleStartReview = () => {
    if (!id) return;
    runReviewerAction(
      () => startReviewMutation.mutateAsync(id),
      'Review started',
      'Failed to start review',
    );
  };

  const confirmModal = () => {
    if (!modal || !id) return;
    if (modal === 'approve') {
      runReviewerAction(
        () => approveMutation.mutateAsync(id),
        'Application approved',
        'Failed to approve application',
      );
    }
    if (modal === 'reject') {
      runReviewerAction(
        () => rejectMutation.mutateAsync(id),
        'Application rejected',
        'Failed to reject application',
      );
    }
    if (modal === 'return') {
      runReviewerAction(
        () => returnMutation.mutateAsync(id),
        'Changes requested',
        'Failed to request changes',
      );
    }
    if (modal === 'submit') handleSubmit();
  };

  const handleSubmit = async () => {
    if (!id) return;
    try {
      await submitMutation.mutateAsync(id);
      showToast('success', 'Application submitted for review');
      setModal(null);
    } catch (err) {
      showToast(
        'error',
        err instanceof ApiError ? err.message : 'Failed to submit application',
      );
    }
  };

  if (isReviewer && reviewerLoading || !isReviewer && myLoading) {
    return <p className={styles.loading}>Loading…</p>;
  }

  if (!app) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">Application not found</div>
        <button type="button" className="btn-secondary" onClick={() => navigate(backPath)}>
          Go back
        </button>
      </div>
    );
  }

  const submittedDisplay =
    app.status !== 'draft' ? fmtDate(app.updatedAt) : '—';

  return (
    <>
      <button type="button" className="btn-ghost" onClick={() => navigate(backPath)}>
        <span className={styles.backBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </span>
      </button>

      <div className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.idRow}>
            <span className={styles.id}>{app.id}</span>
            <StatusBadge status={app.status} />
          </div>
          <h1 className={styles.title}>{app.title}</h1>
          <div className={styles.statusNote}>{statusNote(app.status)}</div>
        </div>

        {!isReviewer && (
          <div className={styles.headerActions}>
            {app.status === 'draft' && (
              <DisabledWithTooltip>
                <button type="button" className="btn-secondary" disabled>
                  Delete
                </button>
              </DisabledWithTooltip>
            )}
            {(app.status === 'draft' || app.status === 'changes_requested') && (
              <DisabledWithTooltip>
                <button type="button" className="btn-secondary" disabled>
                  Edit
                </button>
              </DisabledWithTooltip>
            )}
            {(app.status === 'draft' || app.status === 'changes_requested') && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setModal('submit')}
                disabled={submitMutation.isPending}
              >
                Submit
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles.columns}>
        <div className={styles.mainCol}>
          <div className={styles.sectionLabel}>Details</div>
          <div className={styles.metaGrid}>
            <div>
              <div className={styles.metaLabel}>Priority</div>
              <div className={styles.metaValue}>
                <DisabledWithTooltip>—</DisabledWithTooltip>
              </div>
            </div>
            <div>
              <div className={styles.metaLabel}>Amount</div>
              <div className={styles.metaValue}>
                <DisabledWithTooltip>—</DisabledWithTooltip>
              </div>
            </div>
            <div>
              <div className={styles.metaLabel}>Applicant</div>
              <div className={styles.metaValue}>
                {isReviewer ? app.applicantId : user?.name}
              </div>
            </div>
            <div>
              <div className={styles.metaLabel}>Submitted</div>
              <div className={styles.metaValue}>{submittedDisplay}</div>
            </div>
          </div>

          <div className={styles.textSection}>
            <div className={styles.metaLabel}>Description</div>
            <div className={styles.textBody}>{app.description}</div>
          </div>

          <DisabledWithTooltip block>
            <div className={styles.textSection}>
              <div className={styles.metaLabel}>Justification</div>
              <div className={styles.textBody}>—</div>
            </div>
          </DisabledWithTooltip>

          <DisabledWithTooltip block className={styles.commentSection}>
            <div className={styles.sectionLabel}>Add a comment</div>
            <textarea
              className="field-input"
              rows={3}
              placeholder="Write a comment…"
              disabled
              style={{ marginBottom: 12 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" disabled>
                Add comment
              </button>
            </div>
          </DisabledWithTooltip>
        </div>

        <div className={styles.sideCol}>
          {isReviewer && reviewerActions && (
            <div className={styles.reviewerPanel}>
              <div className={styles.sectionLabel}>Reviewer actions</div>
              <p className={styles.reviewerHint}>
                {reviewerActions.canDecide
                  ? 'Approve, request changes, or reject this application.'
                  : reviewerActions.canStart
                    ? 'Start review before approving or rejecting.'
                    : reviewerActions.resolved
                      ? 'This application has been resolved.'
                      : 'No action available for this status.'}
              </p>

              {reviewerActions.canStart && (
                <button
                  type="button"
                  className={`btn-primary ${styles.fullBtn}`}
                  onClick={handleStartReview}
                  disabled={reviewerPending}
                >
                  Start review
                </button>
              )}

              {reviewerActions.canDecide && (
                <div className={styles.decideBtns}>
                  <button
                    type="button"
                    className={`btn-primary ${styles.fullBtn}`}
                    onClick={() => setModal('approve')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Approve
                  </button>
                  <button
                    type="button"
                    className={styles.returnBtn}
                    onClick={() => setModal('return')}
                  >
                    Request changes
                  </button>
                  <button
                    type="button"
                    className={styles.rejectBtn}
                    onClick={() => setModal('reject')}
                  >
                    Reject
                  </button>
                </div>
              )}

              {reviewerActions.resolved && !reviewerActions.canDecide && !reviewerActions.canStart && (
                <div className={styles.resolved}>No further action required</div>
              )}
            </div>
          )}

          <DisabledWithTooltip block tooltip={API_GAP_TOOLTIP}>
            <div className={styles.sectionLabel}>Activity</div>
            <div className={styles.activityEmpty}>
              Activity timeline not available in API v1.0
            </div>
          </DisabledWithTooltip>
        </div>
      </div>

      {modal === 'approve' && (
        <ConfirmModal
          title="Approve application?"
          message="The applicant will be notified that their request has been approved."
          confirmLabel="Approve"
          showComment
          commentLabel="Add a note (optional)"
          comment={modalComment}
          onCommentChange={setModalComment}
          onConfirm={confirmModal}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === 'reject' && (
        <ConfirmModal
          title="Reject application?"
          message="The applicant will be notified and the request will be closed."
          confirmLabel="Reject"
          showComment
          commentLabel="Reason for rejection"
          comment={modalComment}
          onCommentChange={setModalComment}
          onConfirm={confirmModal}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === 'return' && (
        <ConfirmModal
          title="Request changes?"
          message="The application will be returned to the applicant so they can make edits and resubmit."
          confirmLabel="Request changes"
          showComment
          commentLabel="What needs to change?"
          comment={modalComment}
          onCommentChange={setModalComment}
          onConfirm={confirmModal}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === 'submit' && (
        <ConfirmModal
          title="Submit application?"
          message="Once submitted, the application enters the review queue. You can edit it again only if a reviewer requests changes."
          confirmLabel="Submit"
          onConfirm={confirmModal}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
