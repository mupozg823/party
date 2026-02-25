# Decision Log (Memory Bank)

This file captures implementation decisions so future work stays consistent.

## D-001 - Initial scope strategy

- Date: 2026-02-25
- Status: accepted
- Decision:
  - Build a playable MVP first (one board + limited minigames) before expanding content.
- Rationale:
  - A complete loop is required to validate fun, pacing, and technical stability.

## D-002 - Platform priority

- Date: 2026-02-25
- Status: accepted
- Decision:
  - PC-first release target, online mode prioritized over local split-screen.
- Rationale:
  - Lower initial release complexity and faster iteration for multiplayer telemetry.

## D-003 - Network authority model

- Date: 2026-02-25
- Status: accepted (MVP), revisitable
- Decision:
  - Use host-authoritative model for MVP with validation and checksums.
  - Prepare migration path to dedicated authoritative server post-MVP.
- Rationale:
  - Fast to ship MVP while keeping anti-cheat and scaling options open.

## D-004 - Content architecture

- Date: 2026-02-25
- Status: accepted
- Decision:
  - Build minigames against a shared interface contract and data-driven board config.
- Rationale:
  - Reduces integration cost and prevents bespoke one-off logic per minigame.

## Open questions

- OQ-001: Unity stack finalization vs alternative engine if team skillset differs.
- OQ-002: Dedicated server timing (before beta vs after beta).
- OQ-003: Ranked/competitive mode inclusion timeline.
