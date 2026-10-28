/**
 * test_m1_challenger_fuzz.js
 * Empirical Challenger Verification Suite for Milestone 1
 *
 * Suites:
 *   1. DOM Invariant & Layout Invariants (12 missions, 13 timeline nodes, dynamic counters, zero hardcoded 5/5)
 *   2. LocalStorage Profile Fuzzing & Resilience (1000+ fuzzing variations & property-based tests)
 *   3. Mode Indicators, Callsigns & Controls Rendering (SAM-2 vs MiG-21 m1..m12)
 *   4. Empirical Stress, Concurrency & Idempotency Harness
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

console.log('======================================================================');
console.log(' EMPIRICAL CHALLENGER 2: FUZZING & DOM INVARIANT TEST SUITE');
console.log(' Milestone 1: Campaign Data & UI Expansion');
console.log('======================================================================\n');

// 1. Target files check and hash synchronization
const files = ['index.html', 'h_n_i_12_ng_y_m_18_12_29_12_1972.html'];
const hashes = {};
for (const f of files) {
    if (!fs.existsSync(f)) {
        console.error(`FATAL: Missing file ${f}`);
        process.exit(1);
    }
    const buf = fs.readFileSync(f);
    hashes[f] = crypto.createHash('sha256').update(buf).digest('hex');
}

console.log(`[SYNC AUDIT] index.html SHA256:                         ${hashes['index.html']}`);
console.log(`[SYNC AUDIT] h_n_i_12_ng_y_m_18_12_29_12_1972.html SHA256: ${hashes['h_n_i_12_ng_y_m_18_12_29_12_1972.html']}`);
const syncMatch = hashes['index.html'] === hashes['h_n_i_12_ng_y_m_18_12_29_12_1972.html'];
console.log(`[SYNC AUDIT] Byte-for-byte identical: ${syncMatch ? 'YES (PASS)' : 'NO (FAIL)'}\n`);

const htmlContent = fs.readFileSync('index.html', 'utf8');

// Extract all scripts
const scriptMatches = htmlContent.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);
let gameScript = '';
if (scriptMatches) {
    scriptMatches.forEach(tag => {
        gameScript += '\n' + tag.replace(/<\/?script[^>]*>/gi, '');
    });
}

// Build DOM Mocking Factory
function createMockElement(id, tagName = 'div') {
    return {
        id: id,
        tagName: tagName.toUpperCase(),
        classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            toggle(c, force) {
                if (force !== undefined) {
                    if (force) this.classes.add(c);
                    else this.classes.delete(c);
                    return force;
                }
                if (this.classes.has(c)) { this.classes.delete(c); return false; }
                this.classes.add(c); return true;
            },
            contains(c) { return this.classes.has(c); }
        },
        style: {},
        innerHTML: '',
        textContent: '',
        children: [],
        addEventListener: () => {},
        removeEventListener: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
        appendChild(child) { this.children.push(child); return child; },
        removeChild(child) {
            const idx = this.children.indexOf(child);
            if (idx >= 0) this.children.splice(idx, 1);
            return child;
        }
    };
}

function createDOMContext(initialStore = {}) {
    const store = { ...initialStore };
    const elements = {};

    // Pre-populate with IDs in HTML
    const idRegex = /id="([a-zA-Z0-9_\-]+)"/g;
    let m;
    while ((m = idRegex.exec(htmlContent)) !== null) {
        if (!elements[m[1]]) {
            elements[m[1]] = createMockElement(m[1]);
        }
    }

    const mockLocalStorage = {
        getItem: (k) => store[k] !== undefined ? store[k] : null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { for (const k in store) delete store[k]; }
    };

    const documentMock = {
        body: createMockElement('body'),
        getElementById: (id) => {
            if (!elements[id]) {
                elements[id] = createMockElement(id);
            }
            return elements[id];
        },
        querySelectorAll: (sel) => [],
        querySelector: (sel) => null,
        addEventListener: () => {}
    };

    const windowMock = {
        localStorage: mockLocalStorage,
        addEventListener: () => {},
        requestAnimationFrame: (cb) => 1,
        cancelAnimationFrame: () => {},
        setTimeout: (fn, d) => 1,
        clearTimeout: () => {},
        setInterval: (fn, d) => 1,
        clearInterval: () => {},
        speechSynthesis: {
            speak: () => {},
            cancel: () => {},
            pause: () => {},
            resume: () => {},
            getVoices: () => []
        },
        AudioContext: function() {
            return {
                state: 'running',
                currentTime: 0,
                sampleRate: 44100,
                createBuffer: () => ({ getChannelData: () => new Float32Array(100) }),
                createGain: () => ({
                    gain: { value: 1, setValueAtTime(){}, exponentialRampToValueAtTime(){}, linearRampToValueAtTime(){}, setTargetAtTime(){} },
                    connect(){}
                }),
                createOscillator: () => ({ frequency: { setValueAtTime(){} }, connect(){}, start(){}, stop(){} }),
                createDynamicsCompressor: () => ({ threshold: {}, ratio: {}, attack: {}, release: {}, connect(){} }),
                createConvolver: () => ({ connect(){} }),
                createBufferSource: () => ({ buffer: null, connect(){}, start(){}, stop(){} }),
                createBiquadFilter: () => ({ frequency: { setValueAtTime(){} }, Q: {}, connect(){} }),
                destination: {}
            };
        }
    };

    const context = {
        window: windowMock,
        document: documentMock,
        localStorage: mockLocalStorage,
        console: { log(){}, warn(){}, error(){}, info(){} },
        Math: Math,
        Date: Date,
        setTimeout: windowMock.setTimeout,
        clearTimeout: windowMock.clearTimeout,
        requestAnimationFrame: windowMock.requestAnimationFrame,
        THREE: new Proxy({}, {
            get: (target, prop) => {
                return function() {
                    this.x = 0; this.y = 0; this.z = 0;
                    this.position = { set(){}, copy(){} };
                    this.rotation = { set(){} };
                    this.scale = { set(){} };
                    this.add = () => {};
                    this.remove = () => {};
                    this.lookAt = () => {};
                    this.setPixelRatio = () => {};
                    this.setSize = () => {};
                    this.render = () => {};
                };
            }
        }),
        tailwind: { config: {} },
        performance: { now: () => Date.now() }
    };

    vm.createContext(context);
    vm.runInContext(gameScript, context);

    // Mock 3D simulation globals inside VM script scope
    vm.runInContext(`
        skyDome = { visible: true };
        rainSystem = { visible: true };
        worldCombatGroup = { visible: true, remove() {}, add() {} };
        hangarStudioGroup = { visible: false };
        activeBombers = [];
        activeMissiles = [];
        fallingWrecks = [];
        explosionParticles = [];
        chaffClouds = [];
        gunTracers = [];
        jamCells = [];
        samLaunchers = [
            { loaded: true, battery: { loadedMissile: { visible: true } } },
            { loaded: true, battery: { loadedMissile: { visible: true } } },
            { loaded: true, battery: { loadedMissile: { visible: true } } }
        ];
        scene = { fog: { density: 0 } };
        camera = { position: { set() {}, copy() {} }, lookAt() {}, fov: 60, updateProjectionMatrix() {} };
        cockpitCamera = { position: { set() {}, copy() {} }, lookAt() {} };
        if (typeof SoundFX !== 'undefined') Object.assign(SoundFX, { alertChime() {}, fanfare() {}, siren() {}, radio() {}, click() {}, carpet() {}, boom() {} });
        if (typeof SoundEngine !== 'undefined') Object.assign(SoundEngine, { init() {}, enabled: true });
        playerMiG21 = {
            position: {
                set() {},
                copy() {},
                clone() { return { add() { return { x: 0, y: 0, z: 0 }; } }; }
            },
            lookAt() {}
        };
        if (typeof mig !== 'undefined') Object.assign(mig, { cannonAmmo: 200, fwd: { clone() { return { multiplyScalar() { return { x: 0, y: 0, z: 0 }; } }; } } });
        migForward = () => {};
        clearAAA = () => {};
    `, context);

    const evalInCtx = (expr) => vm.runInContext(expr, context);
    return { context, elements, store, evalInCtx };
}

// Verification reporter
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const findings = [];

function assert(cond, name, details = '') {
    totalTests++;
    if (cond) {
        passedTests++;
        console.log(`  ✓ ${name}`);
    } else {
        failedTests++;
        console.error(`  ✗ [FAIL] ${name}${details ? ': ' + details : ''}`);
        findings.push({ name, details });
    }
}

// ============================================================================
// SUITE 1: DOM INVARIANT & DATA BINDING INVARIANTS
// ============================================================================
console.log('━━━ SUITE 1: DOM INVARIANT & DATA BINDING INVARIANTS ━━━');

// 0. SHA256 Sync Invariant between index.html and h_n_i_12_ng_y_m_18_12_29_12_1972.html
assert(
    syncMatch,
    'Distribution synchronization: index.html and h_n_i_12_ng_y_m_18_12_29_12_1972.html have identical SHA256',
    `Hashes differ! index.html=${hashes['index.html']} vs h_n_i_12_ng_y_m_18_12_29_12_1972.html=${hashes['h_n_i_12_ng_y_m_18_12_29_12_1972.html']}`
);

const { context: defaultCtx, elements: domEls, evalInCtx: defaultEval } = createDOMContext();
const MISSIONS = defaultEval('MISSIONS');

assert(Array.isArray(MISSIONS) && MISSIONS.length === 12, 'MISSIONS contains exactly 12 missions', `Length is ${MISSIONS?.length}`);

// Test no hardcoded 5/5 or 5 đêm in index.html
const hardcoded55Matches = htmlContent.match(/\b5\/5\b/g);
assert(hardcoded55Matches === null, 'No hardcoded "5/5" strings exist in index.html', `Found ${hardcoded55Matches?.length} instances`);

const hardcoded5DemMatches = htmlContent.match(/\b5\s+đêm\b/gi);
assert(hardcoded5DemMatches === null, 'No hardcoded "5 đêm" strings exist in index.html', `Found ${hardcoded5DemMatches?.length} instances`);

// Test renderCampaignProgress with 0 completed
defaultCtx.renderMenuProgress();
const menuProgText = domEls['menu-prog-text'].textContent;
assert(menuProgText.includes('0/12 ĐÊM') || menuProgText.includes('0/12'), 'Menu progress text shows 0/12 nights on empty progress', `Received: "${menuProgText}"`);

// Test menu pips count
const pipsHtml = domEls['menu-pips'].innerHTML;
const pipDivMatches = (pipsHtml.match(/<div class="h-1.5 flex-1/g) || []).length;
assert(pipDivMatches === 12, 'Menu pips renders exactly 12 individual night indicators', `Found ${pipDivMatches} pips`);

// Test renderMissionList (empty progress)
defaultCtx.renderMissionList();
const badgeText = domEls['campaign-progress-badge'].textContent;
assert(badgeText.includes('0/12 ĐÊM') || badgeText.includes('0/12'), 'Campaign progress badge shows 0/12 nights', `Received: "${badgeText}"`);

// Test timeline track nodes count
const trackHtml = domEls['timeline-track'].innerHTML;
const timelineNodes = (trackHtml.match(/<button class="timeline-node/g) || []).length;
assert(timelineNodes === 13, 'Timeline track renders exactly 13 nodes (12 missions + 1 epilogue)', `Found ${timelineNodes} nodes`);

// Test mission list cards count
const missionListHtml = domEls['mission-list'].innerHTML;
const missionCards = (missionListHtml.match(/<button class="mission-card/g) || []).length;
assert(missionCards === 12, 'Mission list container renders exactly 12 mission cards', `Found ${missionCards} cards`);

// Test data mapping on all 12 cards
let cardMappingPass = true;
let cardMappingError = '';
for (let i = 0; i < 12; i++) {
    const m = MISSIONS[i];
    if (!missionListHtml.includes(m.title)) {
        cardMappingPass = false;
        cardMappingError = `Card ${i+1} missing title: ${m.title}`;
        break;
    }
    if (!missionListHtml.includes(`ĐÊM ${i + 1}`)) {
        cardMappingPass = false;
        cardMappingError = `Card ${i+1} missing night label: ĐÊM ${i + 1}`;
        break;
    }
    const expectedWeapon = m.mode === 'MIG21' ? 'Tiêm kích MiG-21bis' : 'Tổ hợp Tên lửa SAM-2';
    if (!missionListHtml.includes(expectedWeapon)) {
        cardMappingPass = false;
        cardMappingError = `Card ${i+1} missing weapon label: ${expectedWeapon}`;
        break;
    }
}
assert(cardMappingPass, 'All 12 cards correctly bind title, night label, and weapon designation', cardMappingError);

// Test progress simulation: all 12 completed
const allBest = {};
for (let i = 1; i <= 12; i++) allBest[`m${i}`] = { kills: MISSIONS[i-1].kills, shots: MISSIONS[i-1].ammo, time: 100 };
const { context: wonCtx, elements: wonEls } = createDOMContext({
    'hn12_progress': JSON.stringify({ unlocked: 12, best: allBest })
});
wonCtx.renderMenuProgress();
const wonMenuText = wonEls['menu-prog-text'].textContent;
assert(wonMenuText.includes('12/12 ĐÊM') && wonMenuText.includes('TOÀN THẮNG'), 'Menu progress text shows 12/12 TOÀN THẮNG on complete campaign', `Received: "${wonMenuText}"`);

wonCtx.renderMissionList();
const wonBadge = wonEls['campaign-progress-badge'].textContent;
assert(wonBadge.includes('12/12 ĐÊM'), 'Campaign progress badge shows 12/12 ĐÊM when all won', `Received: "${wonBadge}"`);

const wonTrackHtml = wonEls['timeline-track'].innerHTML;
assert(wonTrackHtml.includes('is-epilogue') && wonTrackHtml.includes('showVictoryEpilogue()'), 'Timeline node 13 unlocks epilogue click when all 12 missions won');

const wonListHtml = wonEls['mission-list'].innerHTML;
assert(wonListHtml.includes('CHIẾN DỊCH 12 NGÀY ĐÊM ĐÃ TOÀN THẮNG'), 'Victory banner renders at top of mission list when all 12 completed');

// ============================================================================
// SUITE 2: LOCALSTORAGE PROFILE FUZZING & RESILIENCE
// ============================================================================
console.log('\n━━━ SUITE 2: LOCALSTORAGE PROFILE FUZZING & RESILIENCE ━━━');

const deterministicFuzzCases = [
    // Malformed JSON / raw strings
    { name: 'Null in storage', raw: null },
    { name: 'Empty string', raw: '' },
    { name: 'Malformed JSON (unclosed brace)', raw: '{ "unlocked": 2, ' },
    { name: 'Malformed JSON (garbage tokens)', raw: '<xml>corrupt</xml>' },
    { name: 'Primitive JSON number', raw: '42' },
    { name: 'Primitive JSON boolean true', raw: 'true' },
    { name: 'Primitive JSON boolean false', raw: 'false' },
    { name: 'Primitive JSON string', raw: '"user_save"' },
    { name: 'JSON Array [1,2,3]', raw: '[1, 2, 3]' },

    // Incomplete or corrupted object structure
    { name: 'Empty object {}', raw: '{}' },
    { name: 'Missing best (unlocked: 2 only)', raw: '{"unlocked": 2}' },
    { name: 'Missing unlocked (best only)', raw: '{"best": {"m1": {"kills": 3}}}' },
    { name: 'best is null', raw: '{"unlocked": 1, "best": null}' },
    { name: 'best is string', raw: '{"unlocked": 1, "best": "invalid"}' },
    { name: 'best is array', raw: '{"unlocked": 1, "best": []}' },
    { name: 'best is number', raw: '{"unlocked": 1, "best": 123}' },

    // Out of bounds / invalid unlocked levels
    { name: 'unlocked = 0', raw: '{"unlocked": 0, "best": {}}' },
    { name: 'unlocked = -1', raw: '{"unlocked": -1, "best": {}}' },
    { name: 'unlocked = -999', raw: '{"unlocked": -999, "best": {}}' },
    { name: 'unlocked = 13 (beyond 12)', raw: '{"unlocked": 13, "best": {}}' },
    { name: 'unlocked = 999 (far beyond)', raw: '{"unlocked": 999, "best": {}}' },
    { name: 'unlocked = 3.14 (float)', raw: '{"unlocked": 3.14, "best": {}}' },
    { name: 'unlocked = "5" (string number)', raw: '{"unlocked": "5", "best": {}}' },
    { name: 'unlocked = "max" (string text)', raw: '{"unlocked": "max", "best": {}}' },
    { name: 'unlocked = NaN', raw: '{"unlocked": null, "best": {}}' },
    { name: 'unlocked = Infinity', raw: '{"unlocked": 1e999, "best": {}}' },

    // Corrupted best entries
    { name: 'best contains non-existent mission key', raw: '{"unlocked": 1, "best": {"m99": {"kills": 99}}}' },
    { name: 'best entry is null', raw: '{"unlocked": 2, "best": {"m1": null}}' },
    { name: 'best entry is string', raw: '{"unlocked": 2, "best": {"m1": "broken"}}' },
    { name: 'best entry kills is NaN/null', raw: '{"unlocked": 2, "best": {"m1": {"kills": null, "shots": "invalid"}}}' }
];

let fuzzFailures = [];

deterministicFuzzCases.forEach((tc, idx) => {
    let thrownError = null;
    try {
        const store = {};
        if (tc.raw !== null) store['hn12_progress'] = tc.raw;
        const { context: fCtx } = createDOMContext(store);

        // Exercise all campaign UI and lifecycle entry points
        fCtx.renderMenuProgress();
        fCtx.renderMissionList();
        fCtx.continueCampaign();
        fCtx.showVictoryEpilogue();
    } catch (err) {
        thrownError = err;
    }

    if (thrownError) {
        fuzzFailures.push({ testCase: tc.name, raw: tc.raw, error: thrownError.message, stack: thrownError.stack });
        console.log(`    ! CRASH [${tc.name}]: ${thrownError.message}`);
    } else {
        console.log(`    . Pass [${tc.name}]`);
    }
});

// Random generative fuzzing (500 random iterations)
const fuzzChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}[];:\'",.-_+*!@#$%^&*()';
function generateRandomPayload() {
    const kind = Math.floor(Math.random() * 6);
    if (kind === 0) {
        // Random string
        let s = '';
        const len = Math.floor(Math.random() * 50);
        for (let i = 0; i < len; i++) s += fuzzChars[Math.floor(Math.random() * fuzzChars.length)];
        return s;
    } else if (kind === 1) {
        // Random unlocked object
        const unlockedVals = [null, undefined, '', 'abc', -100, -1, 0, 1, 2, 5, 12, 13, 14, 50, 999, NaN, Infinity, {}, []];
        const bestVals = [null, undefined, '', 'str', 123, {}, { m1: { kills: 1 } }, { m1: null }, { m99: {} }, []];
        const u = unlockedVals[Math.floor(Math.random() * unlockedVals.length)];
        const b = bestVals[Math.floor(Math.random() * bestVals.length)];
        return JSON.stringify({ unlocked: u, best: b });
    } else if (kind === 2) {
        // Truncated valid JSON
        const valid = JSON.stringify({ unlocked: 5, best: { m1: { kills: 3, shots: 6 } } });
        const cut = Math.floor(Math.random() * valid.length);
        return valid.substring(0, cut);
    } else if (kind === 3) {
        // Numeric values
        return String((Math.random() - 0.5) * 10000);
    } else if (kind === 4) {
        // Null or boolean
        return Math.random() > 0.5 ? 'true' : 'false';
    } else {
        // Empty
        return '{}';
    }
}

let randomFuzzFailures = 0;
for (let i = 0; i < 500; i++) {
    const payload = generateRandomPayload();
    try {
        const store = { 'hn12_progress': payload };
        const { context: fCtx } = createDOMContext(store);
        fCtx.renderMenuProgress();
        fCtx.renderMissionList();
        fCtx.continueCampaign();
    } catch (err) {
        randomFuzzFailures++;
        if (fuzzFailures.length < 10) {
            fuzzFailures.push({ testCase: `Random Fuzz #${i}`, raw: payload, error: err.message });
        }
    }
}

console.log(`  Deterministic Fuzz Tests: ${deterministicFuzzCases.length - fuzzFailures.filter(f => !f.testCase.startsWith('Random')).length}/${deterministicFuzzCases.length} passed`);
console.log(`  Random Fuzz Iterations (500): ${500 - randomFuzzFailures}/500 passed (${randomFuzzFailures} crashed)`);

assert(
    fuzzFailures.length === 0,
    'Graceful recovery across all localStorage profile fuzz payloads',
    `${fuzzFailures.length} fuzz payloads caused uncaught exceptions! First crash: ${fuzzFailures[0]?.testCase} -> "${fuzzFailures[0]?.error}"`
);

// ============================================================================
// SUITE 3: MODE INDICATORS, CALLSIGNS & CONTROLS RENDERING
// ============================================================================
console.log('\n━━━ SUITE 3: MODE INDICATORS, CALLSIGNS & CONTROLS RENDERING ━━━');

for (let idx = 0; idx < 12; idx++) {
    const m = MISSIONS[idx];
    const isMiG = m.mode === 'MIG21';

    // 1. Verify schema definition
    assert(
        isMiG ? (idx === 9 || idx === 10) : (idx !== 9 && idx !== 10),
        `Mission M${idx + 1} (${m.dateLabel}): Correct mode assignment (${m.mode})`
    );

    // 2. Open briefing and inspect DOM output
    const { context: mCtx, elements: mEls } = createDOMContext({
        'hn12_progress': JSON.stringify({ unlocked: 12, best: {} })
    });
    mCtx.openBriefing(idx);

    // Check brief-controls
    const controlsHtml = mEls['brief-controls'].innerHTML;
    if (isMiG) {
        assert(
            controlsHtml.includes('K-13') && controlsHtml.includes('ЗАХВАТ'),
            `Mission M${idx + 1} (${m.dateLabel}): Briefing controls render MiG-21 K-13 & ЗАХВАТ guidelines`
        );
    } else {
        assert(
            controlsHtml.includes('Fan Song') && controlsHtml.includes('nhảy tần') && controlsHtml.includes('TẦN SỐ'),
            `Mission M${idx + 1} (${m.dateLabel}): Briefing controls render SAM-2 Fan Song & radar guidance`
        );
    }

    // Check weapon and objectives
    const objHtml = mEls['brief-objectives'].innerHTML;
    if (isMiG) {
        assert(objHtml.includes('K-13'), `Mission M${idx + 1}: Objectives specify K-13 heat-seeking missiles`);
    } else {
        assert(objHtml.includes('V-750') && objHtml.includes('bệ'), `Mission M${idx + 1}: Objectives specify V-750 surface-to-air missiles`);
    }

    // Check callsigns and hero documentation
    if (idx === 9) {
        // Phạm Tuân
        assert(m.pilot === '5121' && m.story.includes('Phạm Tuân'), 'Mission M10: Pilot callsign 5121 and Hero Phạm Tuân documented');
    }
    if (idx === 10) {
        // Vũ Xuân Thiều
        assert(m.pilot === '046' && m.story.includes('Vũ Xuân Thiều'), 'Mission M11: Pilot callsign 046 and Hero Vũ Xuân Thiều documented');
    }

    // 3. Begin mission and inspect in-game HUD indicators
    mCtx.beginMission();

    const hudRole = mEls['hud-role-label'].textContent;
    if (isMiG) {
        assert(hudRole.includes('MIG-21') && hudRole.includes(m.pilot), `Mission M${idx + 1}: In-game HUD role displays MiG-21 callsign (${hudRole})`);
    } else {
        assert(hudRole.includes('TIỂU ĐOÀN') || hudRole.includes('TRUNG ĐOÀN'), `Mission M${idx + 1}: In-game HUD role displays SAM-2 Battalion/Regiment (${hudRole})`);
    }

    const hudAmmo = mEls['hud-ammo-badge'].textContent;
    if (isMiG) {
        assert(hudAmmo.includes('K-13') && hudAmmo.includes('PHÁO'), `Mission M${idx + 1}: In-game HUD ammo displays K-13 and cannon`);
    } else {
        assert(hudAmmo.includes('V-750'), `Mission M${idx + 1}: In-game HUD ammo displays V-750 missiles`);
    }

    const launcherDisplay = mEls['launcher-row'].style.display;
    assert(
        isMiG ? launcherDisplay === 'none' : launcherDisplay === '',
        `Mission M${idx + 1}: Ground launcher UI is ${isMiG ? 'HIDDEN' : 'VISIBLE'} in ${m.mode} mode`
    );
}

// ============================================================================
// SUITE 4: EMPIRICAL STRESS, CONCURRENCY & IDEMPOTENCY HARNESS
// ============================================================================
console.log('\n━━━ SUITE 4: EMPIRICAL STRESS, CONCURRENCY & IDEMPOTENCY HARNESS ━━━');

const { context: stressCtx, elements: stressEls } = createDOMContext({
    'hn12_progress': JSON.stringify({ unlocked: 12, best: {} })
});

// Test 4.1: Render Idempotency (Calling renderMissionList 100 times without leaking DOM)
let idempotencyPass = true;
let initialCardCount = 0;
for (let i = 0; i < 100; i++) {
    stressCtx.renderMissionList();
    const count = (stressEls['mission-list'].innerHTML.match(/<button class="mission-card/g) || []).length;
    if (i === 0) initialCardCount = count;
    else if (count !== initialCardCount) {
        idempotencyPass = false;
        break;
    }
}
assert(idempotencyPass && initialCardCount === 12, 'renderMissionList is strictly idempotent (100 sequential calls produce exactly 12 cards)');

// Test 4.2: openBriefing Boundary Fuzzing
const invalidBriefingIndices = [-999, -1, 12, 13, 9999, NaN, Infinity, -Infinity, '0', '5', null, undefined, {}, []];
let briefGuardPass = true;
let briefGuardError = '';
for (const badIdx of invalidBriefingIndices) {
    try {
        stressCtx.openBriefing(badIdx);
    } catch (e) {
        briefGuardPass = false;
        briefGuardError = `openBriefing(${JSON.stringify(badIdx)}) threw: ${e.message}`;
        break;
    }
}
assert(briefGuardPass, 'openBriefing gracefully rejects all out-of-bounds, NaN, and non-numeric indices', briefGuardError);

// Test 4.3: Rapid Mode Switching (SAM2 <-> MIG21 500 times)
let modeSwitchPass = true;
let modeSwitchError = '';
for (let cycle = 0; cycle < 500; cycle++) {
    const targetIdx = cycle % 2 === 0 ? 0 : 9; // m1 (SAM2) vs m10 (MIG21)
    try {
        stressCtx.openBriefing(targetIdx);
        stressCtx.beginMission();
        if (cycle % 2 === 0) {
            if (stressEls['hud-role-label'].textContent.includes('MIG-21')) {
                throw new Error('SAM-2 mission retained MIG-21 HUD label');
            }
        } else {
            if (!stressEls['hud-role-label'].textContent.includes('MIG-21')) {
                throw new Error('MIG-21 mission failed to set MIG-21 HUD label');
            }
        }
    } catch (err) {
        modeSwitchPass = false;
        modeSwitchError = `Cycle ${cycle} (mission ${targetIdx}): ${err.message}`;
        break;
    }
}
assert(modeSwitchPass, '500 rapid SAM-2 / MiG-21 combat initialization cycles execute without state cross-contamination', modeSwitchError);

// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log('\n======================================================================');
console.log(' EMPIRICAL CHALLENGER SUMMARY VERDICT');
console.log('======================================================================');
console.log(` Total Assertions: ${totalTests}`);
console.log(` Passed:           ${passedTests}`);
console.log(` Failed:           ${failedTests}`);
console.log('----------------------------------------------------------------------');

if (failedTests > 0) {
    console.log(` CRITICAL FINDINGS IDENTIFIED (${failedTests}):`);
    findings.forEach((f, idx) => {
        console.log(`   [${idx + 1}] ${f.name}`);
        if (f.details) console.log(`       Details: ${f.details}`);
    });
    console.log('\n VERDICT: REQUEST_CHANGES');
    process.exitCode = 1;
} else {
    console.log(' ALL EMPIRICAL CHALLENGE TESTS PASSED.');
    console.log(' VERDICT: APPROVE');
    process.exitCode = 0;
}
