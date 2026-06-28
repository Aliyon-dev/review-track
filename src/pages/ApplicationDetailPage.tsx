import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '@/api/client';
import {
  canEditApplication,
  fmtDate,
  statusNote,
} from '@/api/mappers';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { ConfirmModal } from '@/components/ConfirmModal';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  useAddComment,
  useApplication,
  useApplicationEvents,
  useApproveApplication,
  useDeleteApplication,
  useRejectApplication,
  useReturnApplication,
  useStartReview,
  useSubmitApplication,
} from '@/hooks/useApplications';
import styles from './ApplicationDetailPage.module.css';

type ModalKind =
  | 'approve'
  | 'reject'
  | 'return'
  | 'submit'
  | 'delete'
  | null;

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isReviewer = user?.role === 'reviewer';

  const { data: app, isLoading } = useApplication(id, true, isReviewer);
  const { data: events = [] } = useApplicationEvents(id, Boolean(id));

  const startReviewMutation = useStartReview();
  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();
  const returnMutation = useReturnApplication();
  const submitMutation = useSubmitApplication();
  const deleteMutation = useDeleteApplication();
  const addCommentMutation = useAddComment();

  const [modal, setModal] = useState<ModalKind>(null);
  const [modalComment, setModalComment] = useState('');
  const [commentDraft, setCommentDraft] = useState('');

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

  const reviewerPending =
    startReviewMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    returnMutation.isPending;

  const postCommentIfNeeded = async () => {
    if (!id || !modalComment.trim()) return;
    await addCommentMutation.mutateAsync({
      id,
      comment: modalComment.trim(),
    });
  };

  const runReviewerAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
    errorFallback: string,
    withComment = false,
  ) => {
    try {
      await action();
      if (withComment) await postCommentIfNeeded();
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
        true,
      );
    }
    if (modal === 'reject') {
      runReviewerAction(
        () => rejectMutation.mutateAsync(id),
        'Application rejected',
        'Failed to reject application',
        true,
      );
    }
    if (modal === 'return') {
      runReviewerAction(
        () => returnMutation.mutateAsync(id),
        'Changes requested',
        'Failed to request changes',
        true,
      );
    }
    if (modal === 'submit') handleSubmit();
    if (modal === 'delete') handleDelete();
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

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      showToast('success', 'Application deleted');
      setModal(null);
      navigate('/dashboard');
    } catch (err) {
      showToast(
        'error',
        err instanceof ApiError ? err.message : 'Failed to delete application',
      );
    }
  };

  const handleAddComment = async () => {
    if (!id || !commentDraft.trim()) return;
    try {
      await addCommentMutation.mutateAsync({
        id,
        comment: commentDraft.trim(),
      });
      setCommentDraft('');
      showToast('success', 'Comment added');
    } catch (err) {
      showToast(
        'error',
        err instanceof ApiError ? err.message : 'Failed to add comment',
      );
    }
  };

  if (isLoading) {
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

  const submittedDisplay = app.submittedAt
    ? fmtDate(app.submittedAt)
    : app.status !== 'draft'
      ? fmtDate(app.updatedAt)
      : '—';

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
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setModal('delete')}
                disabled={deleteMutation.isPending}
              >
                Delete
              </button>
            )}
            {canEditApplication(app.status) && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/applications/' + app.id + '/edit')}
              >
                Edit
              </button>
            )}
            {canEditApplication(app.status) && (
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
              <div className={styles.metaLabel}>Type</div>
              <div className={styles.metaValue}>{app.type ?? '—'}</div>
            </div>
            <div>
              <div className={styles.metaLabel}>Priority</div>
              <div className={styles.metaValue}>{app.priority ?? '—'}</div>
            </div>
            <div>
              <div className={styles.metaLabel}>Amount</div>
              <div className={styles.metaValue}>
                {app.amount ? `$${app.amount}` : '—'}
              </div>
            </div>
            <div>
              <div className={styles.metaLabel}>Applicant</div>
              <div className={styles.metaValue}>
                {isReviewer
                  ? (app.applicantName ?? app.applicantId)
                  : user?.name}
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

          <div className={styles.textSection}>
            <div className={styles.metaLabel}>Justification</div>
            <div className={styles.textBody}>
              {app.justification ?? '—'}
            </div>
          </div>

          {isReviewer && (
            <div className={styles.commentSection}>
              <div className={styles.sectionLabel}>Add a comment</div>
              <textarea
                className="field-input"
                rows={3}
                placeholder="Write a comment…"
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                style={{ marginBottom: 12 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddComment}
                  disabled={addCommentMutation.isPending || !commentDraft.trim()}
                >
                  Add comment
                </button>
              </div>
            </div>
          )}
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

              {reviewerActions.resolved &&
                !reviewerActions.canDecide &&
                !reviewerActions.canStart && (
                  <div className={styles.resolved}>No further action required</div>
                )}
            </div>
          )}

          <div className={styles.sectionLabel}>Activity</div>
          <ActivityTimeline events={events} />
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
      {modal === 'delete' && (
        <ConfirmModal
          title="Delete application?"
          message="This draft will be permanently deleted."
          confirmLabel="Delete"
          onConfirm={confirmModal}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
