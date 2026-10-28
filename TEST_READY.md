# TEST READY DECLARATION: E2E TEST TRACK (M0)
**Project**: Hà Nội 12 Ngày Đêm (18/12 – 29/12/1972)  
**Date**: 2026-10-28T19:30:00Z  
**Author**: Test Writer Subagent (`teamwork_test_writer_e2e`)  
**Status**: `TEST_SUITE_READY` (Verified & Executable)

---

## 1. Test Execution Command
The comprehensive opaque-box E2E test suite requires **zero external npm dependencies** and is executable directly with Node.js (v18+):

```bash
# Standard test run (exits 0 if all 93 pass, non-zero if pending specifications remain)
node test_e2e_suite.js

# Test harness self-verification (always exits 0 if runner executes cleanly)
node test_e2e_suite.js --self-check

# Milestone progress inspection mode (detailed diagnostic report, exits 0)
node test_e2e_suite.js --allow-pending
```

---

## 2. Test Suite Philosophy & Architecture
- **Strictly Opaque-Box**: Tests user-observable DOM elements, mission configurations, Web Audio synthesizer contracts, simulation loop callbacks, and localStorage persistence without relying on internal private state.
- **Specification-Driven**: Every assertion is derived directly from authoritative requirements in `ORIGINAL_REQUEST.md` and `PROJECT.md`.
- **Zero-Dependency Headless Sandbox**: Implements an in-memory DOM, Web Audio API (`AudioContext`, `GainNode`, `OscillatorNode`, `BiquadFilterNode`, `DynamicsCompressorNode`), and storage sandbox via Node.js `vm`.
- **Milestone Attribution**: Failing assertions are categorized by the responsible implementation milestone (`[Pending Milestone M1]`, `[Pending Milestone M2]`, `[Pending Milestone M3]`).

---

## 3. Tier & Feature Coverage Breakdown (93 Tests Total)

| Tier | Category / Feature | Total Tests | Current Passed | Pending Implementation |
|---|---|:---:|:---:|:---:|
| **Tier 1** | **Feature Coverage (>=5 per feature)** | **38** | **33** | **5** |
| | F1: 12-Mission Dataset Validation (m1..m12, 18/12..29/12, required fields) | 6 | 6 | 0 |
| | F2: Hero MiG-21 Sorties (M10 Phạm Tuân 27/12, M11 Vũ Xuân Thiều 28/12, K-13 ammo) | 5 | 5 | 0 |
| | F3: Dynamic Campaign UI & Timeline Bar (no "5/5", 13 timeline nodes, mission select) | 5 | 4 | 1 (T1.16) |
| | F4: Combat Scale & Wave Mechanics (sum kills = 34, ammo pools, wave timings) | 5 | 4 | 1 (T1.19) |
| | F5: Cumulative Campaign Statistics (prog.best, aggregation, epilogue tallies) | 5 | 4 | 1 (T1.25) |
| | F6: Web Audio Procedural API (SoundFX siren, launch, boom, carpet, radio, volume bus) | 7 | 5 | 2 (T1.27, T1.33) |
| | F7: Single-File Delivery & Integrity (zero external asset URLs, HTML5 structure, syntax) | 5 | 5 | 0 |
| **Tier 2** | **Boundary & Corner Cases (>=5 per feature)** | **25** | **22** | **3** |
| | B1: Storage & Profile Initialization (empty storage, corrupted JSON, schema migration) | 5 | 5 | 0 |
| | B2: Zero Ammo & Rapid Firing (ammo=0 debounce, reload reset, MiG-21 unguided, out of ammo) | 5 | 5 | 0 |
| | B3: Mission Boundary Transitions (M1->M2, M11->M12, M12->Epilogue, locked guards, clamp) | 5 | 2 | 3 (T2.13, T2.14, T2.15) |
| | B4: Volume Bus & Audio Levels (0.0 silence, 1.0 unity, negative clamp, excess clamp, mute memory) | 5 | 5 | 0 |
| | B5: Autoplay Policy & AudioContext Resume (suspended resilience, gesture resume, idempotent init) | 5 | 5 | 0 |
| **Tier 3** | **Pairwise & Cross-Feature Interactions** | **20** | **18** | **2** |
| | X1: SAM2 vs MiG21 Mode Transitions (HUD swap, camera model, Fan Song restore, sound route) | 5 | 5 | 0 |
| | X2: Replay Persistence & Best Score Preservation (best score retention, unlocked preservation) | 5 | 3 | 2 (T3.6, T3.7) |
| | X3: Carpet Bombing Audio-Visual Sync (impact callbacks, cameraShake impulse, skyFlashLight, decay) | 5 | 5 | 0 |
| | X4: Radio Chatter & Audio Squelch Sync (opening burst, trailing squelch, timeline order, HUD sync) | 5 | 5 | 0 |
| **Tier 4** | **Real-World Scenarios** | **10** | **9** | **1** |
| | S1: Full 12-Day Campaign Playthrough Simulation (M1..M12 sequence, 34 B-52 kills, epilogue) | 5 | 4 | 1 (T4.5) |
| | S2: Historical Accuracy & Forensic Victory Data Audit (dates, hero pilots, regiments, Paris treaty) | 5 | 5 | 0 |
| **TOTAL** | **Entire Test Suite** | **93** | **82 (88.2%)** | **11 (11.8%)** |

---

## 4. Pending Milestone Attribution for Implementing Agents

### Milestone M1 (Campaign Data & Dynamic UI) — 4 Pending Tests:
1. `T1.16`: Debriefing completion text template must dynamically reference total completed nights instead of hardcoded `"5/5 đêm"`.
2. `T2.13`: `continueCampaign()` completion check must route to Grand Victory Epilogue when `unlocked >= MISSIONS.length` (12) instead of `>= 5`.
3. `T2.14`: `openBriefing(idx)` must guard against opening locked missions when `idx >= prog.unlocked`.
4. `T2.15`: `openBriefing(idx)` must safely bounds-check `idx < 0 || idx >= MISSIONS.length` to avoid property access errors.

### Milestone M2 (Combat Scale & Cumulative Statistics) — 5 Pending Tests:
1. `T1.19`: Mission 10 (`m10`) must define at least 2 wave spawn intervals in `waves` (currently `[12]`).
2. `T1.25`: Victory epilogue screen text must prominently showcase official tally of 34 B-52s downed and 81 total aircraft.
3. `T3.6`: Replaying a mission with a lower kill count must preserve previously higher kill count in `prog.best[mId].kills` (fix line 7751 compare condition).
4. `T3.7`: Replaying a mission with a higher kill count must update `prog.best[mId].kills` to the new record.
5. `T4.5`: Epilogue screen must include the full historical banner `"ĐIỆN BIÊN PHỦ TRÊN KHÔNG"` alongside official casualty metrics.

### Milestone M3 (Procedural Web Audio Engine) — 2 Pending Tests:
1. `T1.27`: `SoundFX.init()` must be implemented on the `SoundFX` object returning the AudioContext and setting up master/sfx buses.
2. `T1.33`: `SoundFX.setMasterVolume(val)`, `SoundFX.setSFXVolume(val)`, and `SoundFX.setVoiceVolume(val)` must be exposed on `SoundFX`.

---

## 5. Artifact Index
- **Test Suite Source**: `c:\Users\trong\VS Code\GameDienBienPhu\test_e2e_suite.js`
- **Readiness Declaration**: `c:\Users\trong\VS Code\GameDienBienPhu\TEST_READY.md`
- **Subagent Handoff**: `c:\Users\trong\VS Code\GameDienBienPhu\.agents\teamwork\teamwork_test_writer_e2e\handoff.md`
