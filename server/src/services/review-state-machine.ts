import { ValueStatus } from '@prisma/client';

export type ReviewTransition = 'start-review' | 'approve' | 'request-revision' | 'reject' | 'resubmit';

const transitions: Record<ReviewTransition, { from: ValueStatus[]; to: ValueStatus }> = {
  'start-review': { from: [ValueStatus.Submitted], to: ValueStatus.UnderReview },
  approve: { from: [ValueStatus.UnderReview], to: ValueStatus.Approved },
  'request-revision': { from: [ValueStatus.UnderReview], to: ValueStatus.NeedsRevision },
  reject: { from: [ValueStatus.UnderReview], to: ValueStatus.Rejected },
  resubmit: { from: [ValueStatus.NeedsRevision], to: ValueStatus.Submitted },
};

export function transitionStatus(action: ReviewTransition, current: ValueStatus): ValueStatus {
  const transition = transitions[action];
  if (!transition.from.includes(current)) throw new Error(`Invalid transition: ${current} -> ${action}.`);
  return transition.to;
}

export function canReview(role: string): boolean { return role === 'ADMIN' || role === 'REVIEWER'; }
export function canViewAllSubmissions(role: string): boolean { return role === 'ADMIN' || role === 'REVIEWER' || role === 'MANAGEMENT'; }
