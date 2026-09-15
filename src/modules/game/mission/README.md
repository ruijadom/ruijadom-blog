# Dev Space · Softphone Odyssey

A new version of the blog's existing `/game` experience. The `GameCanvas` export and route stay compatible with the blog. No new dependencies or lockfile changes are required.

## Play

Survive four 30-second stages: Prototype, Integration, Hardening and Production. Shoot or collect teal feature shards; destroy bugs before they hit the ship or cross the production boundary. Bugs represent SIP timeouts, ICE failures, regressions and packet loss. These are educational metaphors, not a protocol simulation.

- Arrow keys / A and D: move. On touchscreens, drag in the playfield or hold an arrow button.
- Missions start with manual firing: hold Space or the on-screen Fire button. The first Developer tooling upgrade unlocks and enables auto-fire; you can then toggle it off.
- E / Hotfix: clear active bugs, with a 12-second cooldown.
- Escape / P: pause. Leaving the tab or window automatically pauses the mission.
- At each checkpoint, choose one free upgrade: automatic test satellite, resilience (+1 capacity and up to 2 restored integrity), or developer tooling (auto-fire and faster shots on the first investment, dual shots on the second).
- Gold-ringed bugs have two hit points. Consecutive hits build a multiplier; surviving a stage earns 100 points per remaining integrity.
- Optional Simplified controls in the welcome/pause screen enable firing automatically from the start, without spending an upgrade. This choice and your auto-fire toggle are saved with the mission.
- Win by surviving Production. Lose when integrity reaches zero.

## Run the blog

Use Node 20+ and the repository's pinned pnpm 8.15.5:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `/game` on the local development server.

## Implementation

- `engine.ts`: simulation, collisions, upgrades and versioned persistence, independent of React and canvas.
- `render.ts`: high-DPI canvas graphics, ship, feature crystals, bugs, satellites, particles and background.
- `mission.module.css`: scoped, responsive mission-control interface.
- `../components/game-canvas.tsx`: React HUD, input, dialogs, optional audio and lifecycle.
- `engine.test.ts`: thirteen focused logic tests.

Simulation uses delta time with a capped step to avoid jumps after a stall. React receives HUD snapshots at approximately 10 Hz while canvas renders through one animation loop. ResizeObserver handles the playfield and device pixel ratio is capped at 2. Reduced-motion settings remove moving background stars, satellite bobbing, exhaust variation and particle effects; essential gameplay motion remains.

Dialogs have labels, focus trapping and keyboard controls. Scores and controls are DOM content rather than canvas text. The canvas shooter itself still relies on visual targeting: this is not a fully nonvisual gameplay mode.

## Saved progress

Mission state is saved locally every five seconds, on pause, at checkpoints and when leaving the game. Continue restores entities, health, upgrades, score and cooldowns. Browser privacy settings can disable saving without disabling gameplay.

This version uses `dev-space-mission-v2` and `dev-space-best-v2`. Legacy saves and statistics remain untouched but are not imported, because the campaign and scoring system have changed. Finishing or losing clears the active mission save. Starting a new mission replaces it.

## Validation

Completed:

- Full-project TypeScript check (`pnpm exec tsc --noEmit`).
- ESLint for the new engine, renderer, tests and modified component.
- Thirteen passing tests covering refresh-rate-independent movement, pause, single-hit projectile collision, escaped bugs, hotfix cooldown, upgrades, health bounds, win/loss precedence and saved-state validation.
- The uploaded original `game-canvas.tsx` matches public GitHub `main` at commit `50d307082dd632a0ed4528fa94ecf5fd433eb2b3`.

Run the tests without adding a test framework:

```sh
pnpm exec tsc src/modules/game/mission/engine.ts src/modules/game/mission/engine.test.ts --outDir /tmp/dev-space-tests --module commonjs --target es2020 --esModuleInterop --skipLibCheck
node --test /tmp/dev-space-tests/engine.test.js
```

Still to verify manually: desktop and mobile visual layout, touch interaction, audio, complete mission difficulty and production build. Browser preview access was denied by the environment's permission policy, so no browser or visual-validation pass is claimed.

Suggested smoke test: launch, move, trigger Hotfix, pause with Escape, resume with Escape, open/close help, reload and Continue, finish a stage and pick each upgrade on separate runs, then check win and loss screens. Check 390px mobile and short landscape viewports, keyboard-only dialog navigation and reduced-motion settings.

The archive excludes generated build output, dependencies, Git internals and macOS metadata. Existing blog source and assets are preserved.
