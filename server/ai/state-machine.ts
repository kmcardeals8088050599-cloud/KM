// State machine for vehicle draft lifecycle.
// Enforces legal transitions and records who initiated them.

import type { VehicleDraftState } from '../../src/types/ai.js';
import { VEHICLE_DRAFT_TRANSITIONS } from '../../src/types/ai.js';

export type ActorType = 'system' | 'admin';

export function canTransition(
  current: VehicleDraftState,
  next: VehicleDraftState,
  actorType: ActorType
): boolean {
  const allowed = VEHICLE_DRAFT_TRANSITIONS[current];
  if (!allowed) return false;
  return allowed[actorType].includes(next);
}

export function assertTransition(
  current: VehicleDraftState,
  next: VehicleDraftState,
  actorType: ActorType
): void {
  if (!canTransition(current, next, actorType)) {
    throw new Error(
      `[StateMachine] Illegal transition: ${actorType} cannot move ${current} → ${next}`
    );
  }
}

/**
 * Determine the best terminal state after extraction + validation completes.
 * - If ready fields satisfy all required → READY_FOR_REVIEW
 * - If some desired fields missing → INCOMPLETE
 * - If nothing meaningful extracted → PROCESSING_FAILED
 */
export function derivePostExtractionState(
  requiredPresent: number,
  totalRequired: number,
  desiredPresent: number,
  totalDesired: number
): VehicleDraftState {
  if (totalRequired === 0) return 'READY_FOR_REVIEW';
  if (requiredPresent === totalRequired) {
    // All required present; check desired
    return 'READY_FOR_REVIEW';
  }
  const ratio = requiredPresent / totalRequired;
  if (ratio >= 0.6 && desiredPresent >= 3) return 'INCOMPLETE';
  return 'PROCESSING_FAILED';
}
