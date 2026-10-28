# Project: Hà Nội 12 Ngày Đêm (18/12 - 29/12/1972)

## Architecture
- Single-file web application (`index.html` / `hanoi-12-ngay-dem.html`) built with Three.js, procedural 3D meshes, 2D Radar canvas, procedural Web Audio API, and DOM UI overlays.
- Pure client-side execution with zero external asset dependencies.
- Modular subsystems:
  - Data Layer: `MISSIONS` configuration array (12 historical missions).
  - Combat Engine: Wave spawning, ballistic missile simulation, IR lock, radar tracking, damage calculation.
  - UI / Navigation: Mission Select grid, timeline track, briefing modal, in-game HUD, debriefing modal, victory epilogue.
  - Audio Engine: Procedural Web Audio API mixer (`SoundFX`), master compressor, convolver reverb, 3D Doppler panner, dual-stage missile synthesizer.

## Code Layout
- HTML DOM & Styles (lines 1–1300): UI overlays, mission selection cards, timeline bar, audio controls.
- Core Sim & HighPoly Meshes (lines 1301–3500): Three.js scene, procedural aircraft/missile CAD geometry.
- Gameplay & Simulation Loop (lines 3501–5999): Radar canvas, SAM-2 guidance, MiG-21 flight model, B-52 cell spawning (`spawnB52Cell`), combat resolution.
- Web Audio Synthesizer (lines 6000–6600): `SoundFX` mixer, procedural sound generators, audio hooks.
- Campaign State, UI Handlers & Epilogue (lines 6601–7800): `MISSIONS` definition, mission progress, local storage persistence, debriefing, victory epilogue.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | 12-Mission Historical Campaign Data | Full 12-mission dataset from 18/12 to 29/12/1972 with rich historical metadata | M1 | Survey E1, E2 |
| 2 | MiG-21 Night Intercept Missions | M10 (27/12 Phạm Tuân) and M11 (28/12 Vũ Xuân Thiều) night dogfights with K-13 missiles | M1 | Survey E1, E2 |
| 3 | Dynamic Campaign UI & Timeline Bar | Elimination of all hardcoded "5/5" strings, responsive scrollable 13-node timeline track | M1 | Survey E1 |
| 4 | Combat Scaling to 34 B-52s | Wave calibration, B-52 spawn rates, ammo pools, and mission durations across all 12 nights | M2 | Survey E2 |
| 5 | Cumulative Campaign Stats & Debriefing | Accurate campaign-wide aggregation of downed aircraft (34 B-52s, 81 total), ammo, and victory epilogue | M2 | Survey E2 |
| 6 | Procedural Air Raid Siren | Resonant dual-station acoustic horn simulation with realistic spin-up/spin-down and city reverb | M3 | Survey E3 |
| 7 | 3D Doppler Jet Engine Sound | Relative velocity pitch shifting and stereo panning for B-52 bombers and MiG-21 fighters | M3 | Survey E3 |
| 8 | SAM-2 Dual-Stage Propulsion Audio | Solid booster 2.6s rumble followed by 24s high-frequency liquid sustainer scream | M3 | Survey E3 |
| 9 | Carpet Bombing Audio-Visual Sync | Screen shake and horizon flashes synchronized with each delayed bomb explosion in the carpet | M3 | Survey E3 |
| 10| Radio Squelch & PTT Roger Beep | Realistic high-frequency chirp and white-noise squelch tail on radio transmissions | M3 | Survey E3 |
| 11| Volume Bus & Gesture Audio Unlock | Master/SFX/Voice volume sliders, mute toggle, and resilient global user-gesture AudioContext resume | M3 | Survey E3 |
| 12| Single-File Distribution & Zero Regressions | Seamless packaging in both index.html and hanoi-12-ngay-dem.html with 100% test pass | M4 | Survey E1, E2, E3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0| E2E Testing Track | Independent opaque-box test suite (Tiers 1-4) in test_e2e_suite.js / verify_suite.py | none | DONE |
| M1| Campaign Data & UI Expansion | 12 historical missions in MISSIONS array, dynamic UI counters, timeline track, radio chatter | none | DONE |
| M2| Combat Scale & Kill Calibration | Wave generation, 34 B-52 kill distribution, ammo tuning, cumulative stats tracking | M1 | PLANNED |
| M3| Procedural Web Audio Engine | Upgraded SoundFX mixer, Doppler 3D, dual-stage SAM-2, carpet bomb sync, radio squelch, volume sliders | M1 | PLANNED |
| M4| Final E2E Integration & Hardening | Pass 100% E2E test suite + Challenger adversarial testing + Forensic Audit | M0, M2, M3 | PLANNED |

## Interface Contracts
### MISSIONS Schema (M1 ↔ M2 ↔ M3 ↔ E2E Tests)
- Each mission entry in `MISSIONS` must provide:
  - `id`: string (`'m1'` to `'m12'`)
  - `date`: string (`'18/12/1972'` to `'29/12/1972'`)
  - `dateLabel`: string (e.g. `'ĐÊM 1 · 18/12/1972'`)
  - `clock`: string (e.g. `'19:40'`)
  - `title`: string (e.g. `'ĐÒN PHỦ ĐẦU'`)
  - `unit`: string (combat battalion, e.g. `'Tiểu đoàn 59 · Trung đoàn 261'`)
  - `place`: string (e.g. `'Trận địa Tráng Việt, Mê Linh'`)
  - `mode`: string (`'SAM2'` or `'MIG21'`)
  - `story`: string (historical narrative)
  - `briefing`: string (mission objective briefing)
  - `forces`: string (enemy force description)
  - `kills`: number (historical target B-52 kills; total sum across 12 missions must be 34)
  - `ammo`: number (missile allocation, 4 to 18)
  - `timeLimit`: number (mission duration in seconds, 180 to 420)
  - `waves`: array of wave spawn delay seconds
  - `radio`: array of radio chatter dialogue objects `{ at: number, who: string, text: string }` (engine also supports legacy aliases `{ t, sender, text }`)
  - `jam`: object with electronic warfare parameters `{ freq, width, speed, chaff }` for SAM2 mode, or `null` for MIG21 mode
  - `history`: string (historical context fact)

### SoundFX Engine Contract (M3 ↔ Gameplay Loop)
- `SoundFX.init()`: returns AudioContext; safe to call repeatedly.
- `SoundFX.siren(active: boolean)`: toggles air raid siren with dual-station horn and Doppler spin-down.
- `SoundFX.launch(isMiG: boolean)`: plays launch sound; for SAM-2 initiates 2.6s booster then hooks continuous sustainer sound.
- `SoundFX.boom(pos: Vector3, isBig: boolean)`: plays explosive detonation at given position.
- `SoundFX.carpet(onImpactCallback?: (k: number) => void)`: schedules carpet bombing explosions and invokes callback on each impact to trigger `cameraShake` and `skyFlashLight`.
- `SoundFX.radio(isEnd?: boolean)`: plays radio opening burst or closing squelch tail.
- `SoundFX.update(dt: number, camera: Camera, bombers: Array, mig: Object)`: frame-by-frame 3D Doppler and panning calculation.
- `SoundFX.setMasterVolume(val: number)`: sets master gain [0..1].
- `SoundFX.setSFXVolume(val: number)`: sets sfx gain [0..1].
- `SoundFX.setVoiceVolume(val: number)`: sets voice gain [0..1].

### Statistics & Epilogue Contract (M2 ↔ Debriefing UI)
- `prog.best[missionId]`: records `{ score: number, shots: number, kills: number, accuracy: number, time: number }`.
- `showVictoryEpilogue()`: aggregates `totalKills = sum(prog.best[m.id].kills)` across all 12 missions, displays exact historical tally (34 B-52s, 81 total aircraft).
