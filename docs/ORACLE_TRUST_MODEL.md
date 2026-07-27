# EnergyOracle Trust Model

## Roles

- **Owner:** Can update the oracle address and set the confirmer. Cannot report or finalize unless also set as oracle/confirmer.
- **Oracle:** Can call `reportProduction` and `finalizeTimeSlot`. When a confirmer is set, finalization requires the slot to be confirmed first.
- **Confirmer (optional):** Can call `confirmTimeSlot(timeSlot)`. When set, the oracle cannot finalize a slot until the confirmer has confirmed it.

## Single-oracle (default)

If no confirmer is set (`confirmer == address(0)`):

- The oracle (or owner) reports production and finalizes time slots in one step.
- Trust: a single oracle key is trusted to report and finalize. Suitable for testnets or when the oracle is operated by a known party.

## Two-step finalization (confirmer set)

When `setConfirmer(addr)` has been called:

1. **Report:** Oracle (or owner) calls `reportProduction(panelId, timestamp, energyWh)` as usual.
2. **Confirm:** Confirmer (or owner) calls `confirmTimeSlot(timeSlot)`. This signals that the slot data has been audited or agreed.
3. **Finalize:** Oracle (or owner) calls `finalizeTimeSlot(timeSlot)`. This reverts with `SlotNotConfirmed` if the slot was not confirmed.

Trust: two roles (oracle + confirmer) must cooperate to finalize. The confirmer acts as an auditor or second signer. Gas: one extra transaction per slot (`confirmTimeSlot`).

## Operations

- **Enable two-step:** Owner calls `setConfirmer(confirmerAddress)`. For production, use a different key or multisig for the confirmer.
- **Disable two-step:** Owner calls `setConfirmer(address(0))`. Finalization then does not require confirm.
- **View:** `isTimeSlotConfirmed(timeSlot)` returns whether the slot has been confirmed (for UI or automation).

## Gas

- `confirmTimeSlot`: ~50k gas (single storage write + event).
- No change to `reportProduction` or `finalizeTimeSlot` gas when confirmer is not set.
