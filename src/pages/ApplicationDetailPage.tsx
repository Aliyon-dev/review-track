import { useMemo, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '@/api/client';
import {
  canEditApplication,
  fmtDate,
  statusNote,
} from '@/api/mappers';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Label, Textarea } from '@/components/ui/field';
import { SectionCard } from '@/components/ui/section-card';
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

type ModalKind =
  | 'approve'
  | 'reject'
  | 'return'
  | 'submit'
  | 'delete'
  | null;

const MODAL_CONFIG: Record<
  Exclude<ModalKind, null>,
  {
    title: string;
    message: string;
    confirmLabel: string;
    showComment?: boolean;
    commentLabel?: string;
  }
> = {
  approve: {
    title: 'Approve application?',
    message: 'The applicant will be notified that their request has been approved.',
    confirmLabel: 'Approve',
    showComment: true,
    commentLabel: 'Add a note (optional)',
  },
  reject: {
    title: 'Reject application?',
    message: 'The applicant will be notified and the request will be closed.',
    confirmLabel: 'Reject',
    showComment: true,
    commentLabel: 'Reason for rejection',
  },
  return: {
    title: 'Request changes?',
    message:
      'The application will be returned to the applicant so they can make edits and resubmit.',
    confirmLabel: 'Request changes',
    showComment: true,
    commentLabel: 'What needs to change?',
  },
  submit: {
    title: 'Submit application?',
    message:
      'Once submitted, the application enters the review queue. You can edit it again only if a reviewer requests changes.',
    confirmLabel: 'Submit',
  },
  delete: {
    title: 'Delete application?',
    message: 'This draft will be permanently deleted.',
    confirmLabel: 'Delete',
  },
};

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
    return <p className="text-sm text-brand/60">Loading…</p>;
  }

  if (!app) {
    return (
      <EmptyState
        title="Application not found"
        actionLabel="Go back"
        onAction={() => navigate(backPath)}
      />
    );
  }

  const submittedDisplay = app.submittedAt
    ? fmtDate(app.submittedAt)
    : app.status !== 'draft'
      ? fmtDate(app.updatedAt)
      : '—';

  const modalConfig = modal ? MODAL_CONFIG[modal] : null;

  return (
    <>
      <button
        type="button"
        onClick={() => navigate(backPath)}
        className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-brand/60 font-mono hover:text-brand transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2">
            <StatusBadge status={app.status} />
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-brand">
            {app.title}
          </h1>
          <p className="mt-1 text-sm text-brand/60">{statusNote(app.status)}</p>
        </div>

        {!isReviewer && (
          <div className="flex flex-wrap gap-2">
            {app.status === 'draft' && (
              <Button
                variant="secondary"
                onClick={() => setModal('delete')}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            )}
            {canEditApplication(app.status) && (
              <Button
                variant="secondary"
                onClick={() => navigate(`/applications/${app.id}/edit`)}
              >
                Edit
              </Button>
            )}
            {canEditApplication(app.status) && (
              <Button
                onClick={() => setModal('submit')}
                disabled={submitMutation.isPending}
              >
                Submit
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <SectionCard title="Details">
            <div className="px-5 py-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-brand/40 font-mono mb-1">
                  Type
                </div>
                <div className="text-sm font-medium text-brand">
                  {app.type ?? '—'}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-brand/40 font-mono mb-1">
                  Priority
                </div>
                <div className="text-sm font-medium text-brand">
                  {app.priority ?? '—'}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-brand/40 font-mono mb-1">
                  Amount
                </div>
                <div className="text-sm font-medium text-brand">
                  {app.amount ? `$${app.amount}` : '—'}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-brand/40 font-mono mb-1">
                  Applicant
                </div>
                <div className="text-sm font-medium text-brand">
                  {isReviewer
                    ? (app.applicantName ?? app.applicantId)
                    : user?.name}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-brand/40 font-mono mb-1">
                  Submitted
                </div>
                <div className="text-sm font-medium text-brand font-mono">
                  {submittedDisplay}
                </div>
              </div>
            </div>
          </SectionCard>

          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-brand/40 font-mono mb-2">
              Description
            </div>
            <p className="text-sm text-brand/70 leading-relaxed">
              {app.description}
            </p>
          </div>

          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-brand/40 font-mono mb-2">
              Justification
            </div>
            <p className="text-sm text-brand/70 leading-relaxed">
              {app.justification ?? '—'}
            </p>
          </div>

          {isReviewer && (
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-brand/40 font-mono mb-3">
                Add a comment
              </div>
              <Label className="sr-only">Comment</Label>
              <Textarea
                rows={3}
                placeholder="Write a comment…"
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                className="mb-3"
              />
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  onClick={handleAddComment}
                  disabled={addCommentMutation.isPending || !commentDraft.trim()}
                >
                  Add comment
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {isReviewer && reviewerActions && (
            <SectionCard title="Reviewer actions">
              <div className="px-5 py-4">
                <p className="text-sm text-brand/60 mb-4">
                  {reviewerActions.canDecide
                    ? 'Approve, request changes, or reject this application.'
                    : reviewerActions.canStart
                      ? 'Start review before approving or rejecting.'
                      : reviewerActions.resolved
                        ? 'This application has been resolved.'
                        : 'No action available for this status.'}
                </p>

                {reviewerActions.canStart && (
                  <Button
                    className="w-full"
                    onClick={handleStartReview}
                    disabled={reviewerPending}
                  >
                    Start review
                  </Button>
                )}

                {reviewerActions.canDecide && (
                  <div className="flex flex-col gap-2">
                    <Button className="w-full" onClick={() => setModal('approve')}>
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setModal('return')}
                    >
                      Request changes
                    </Button>
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={() => setModal('reject')}
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {reviewerActions.resolved &&
                  !reviewerActions.canDecide &&
                  !reviewerActions.canStart && (
                    <p className="text-sm text-brand/40 text-center py-2">
                      No further action required
                    </p>
                  )}
              </div>
            </SectionCard>
          )}

          <SectionCard title="Activity">
            <div className="px-5 py-4">
              <ActivityTimeline events={events} />
            </div>
          </SectionCard>
        </div>
      </div>

      {modalConfig && (
        <Dialog
          open={Boolean(modal)}
          onClose={() => setModal(null)}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmLabel={modalConfig.confirmLabel}
          showComment={modalConfig.showComment}
          commentLabel={modalConfig.commentLabel}
          comment={modalComment}
          onCommentChange={setModalComment}
          onConfirm={confirmModal}
        />
      )}
    </>
  );
}
