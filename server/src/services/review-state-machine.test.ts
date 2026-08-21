import assert from 'node:assert/strict';
import test from 'node:test';
import { canReview, transitionStatus } from './review-state-machine';
import { ValueStatus } from '@prisma/client';

test('allows the defined review workflow transitions', () => {
  assert.equal(transitionStatus('start-review', ValueStatus.Submitted), ValueStatus.UnderReview);
  assert.equal(transitionStatus('approve', ValueStatus.UnderReview), ValueStatus.Approved);
  assert.equal(transitionStatus('request-revision', ValueStatus.UnderReview), ValueStatus.NeedsRevision);
  assert.equal(transitionStatus('resubmit', ValueStatus.NeedsRevision), ValueStatus.Submitted);
});

test('rejects invalid transitions', () => {
  assert.throws(() => transitionStatus('approve', ValueStatus.Draft));
  assert.throws(() => transitionStatus('resubmit', ValueStatus.Approved));
  assert.throws(() => transitionStatus('reject', ValueStatus.Approved));
});

test('only reviewer and admin roles can review', () => {
  assert.equal(canReview('REVIEWER'), true);
  assert.equal(canReview('ADMIN'), true);
  assert.equal(canReview('PIC'), false);
  assert.equal(canReview('MANAGEMENT'), false);
});
