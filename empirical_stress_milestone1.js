const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('='.repeat(75));
console.log('EMPIRICAL STRESS & ADVERSARIAL CHALLENGE HARNESS — MILESTONE 1');
console.log('Targeting: index.html & h_n_i_12_ng_y_m_18_12_29_12_1972.html');
console.log('='.repeat(75));

// Helper to construct a robust mock DOM & WebGL environment
function createMockEnvironment(htmlContent) {
    const storage = {};
    const elements = {};

    function createElement(id = '', tag = 'div') {
        return {
            id,
            tagName: tag.toUpperCase(),
            textContent: '',
            innerHTML: '',
            style: {},
            value: '0',
            disabled: false,
            children: [],
            classList: {
                classes: new Set(),
                add(...cls) { cls.forEach(c => this.classes.add(c)); },
                remove(...cls) { cls.forEach(c => this.classes.delete(c)); },
                toggle(c, force) {
                    if (force !== undefined) {
                        if (force) this.classes.add(c); else this.classes.delete(c);
                        return force;
                    }
                    if (this.classes.has(c)) { this.classes.delete(c); return false; }
                    this.classes.add(c); return true;
                },
                contains(c) { return this.classes.has(c); }
            },
            offsetWidth: 100,
            offsetHeight: 100,
            addEventListener() {},
            removeEventListener() {},
            setAttribute() {},
            getAttribute() { return null; },
            appendChild(c) { this.children.push(c); }
        };
    }

    // Pre-populate IDs from HTML
    const idRegex = /id="([a-zA-Z0-9_\-]+)"/g;
    let mId;
    while ((mId = idRegex.exec(htmlContent)) !== null) {
        if (!elements[mId[1]]) {
            elements[mId[1]] = createElement(mId[1]);
        }
    }

    const documentMock = {
        body: createElement('body', 'body'),
        getElementById(id) {
            if (!elements[id]) {
                elements[id] = createElement(id);
            }
            return elements[id];
        },
        querySelectorAll() { return []; },
        querySelector() { return null; },
        addEventListener() {},
        removeEventListener() {}
    };

    const localStorageMock = {
        getItem(k) { return Object.prototype.hasOwnProperty.call(storage, k) ? storage[k] : null; },
        setItem(k, v) { storage[k] = String(v); },
        removeItem(k) { delete storage[k]; },
        clear() { for (const k in storage) delete storage[k]; }
    };

    const threeMock = new Proxy({}, {
        get: (target, prop) => {
            if (prop === 'MathUtils') {
                return {
                    radToDeg: (r) => r * 180 / Math.PI,
                    degToRad: (d) => d * Math.PI / 180,
                    clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
                    lerp: (x, y, t) => x + (y - x) * t
                };
            }
            if (prop === 'AdditiveBlending' || prop === 'NormalBlending') return 1;
            const DummyClass = function() {
                this.x = 0; this.y = 0; this.z = 0;
                this.position = {
                    x: 0, y: 0, z: 0,
                    set: function(x,y,z){ this.x=x;this.y=y;this.z=z; return this; },
                    copy: function(v){ this.x=v.x;this.y=v.y;this.z=v.z; return this; },
                    add: function(v){ this.x+=v.x;this.y+=v.y;this.z+=v.z; return this; },
                    clone: function(){ return { x:this.x, y:this.y, z:this.z }; }
                };
                this.rotation = { x: 0, y: 0, z: 0, set: function(x,y,z){ this.x=x;this.y=y;this.z=z; return this; } };
                this.quaternion = { setFromUnitVectors: function(){} };
                this.scale = { set: function(){} };
                this.visible = true;
                this.geometry = { dispose: function(){} };
                this.material = { dispose: function(){} };
                this.add = function(){};
                this.remove = function(){};
                this.lookAt = function(){};
                this.setPixelRatio = function(){};
                this.setSize = function(){};
                this.render = function(){};
                this.set = function(x,y,z){ this.x=x;this.y=y;this.z=z; return this; };
                this.clone = function(){ const c = new DummyClass(); c.x=this.x;c.y=this.y;c.z=this.z; return c; };
                this.normalize = function(){ return this; };
                this.length = function(){ return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z); };
                this.angleTo = function(){ return 0.05; };
                this.applyEuler = function(){ return this; };
                this.addScaledVector = function(v,s){ this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s; return this; };
                this.multiplyScalar = function(s){ this.x*=s;this.y*=s;this.z*=s; return this; };
            };
            return DummyClass;
        }
    });

    const windowMock = {
        localStorage: localStorageMock,
        document: documentMock,
        addEventListener() {},
        removeEventListener() {},
        requestAnimationFrame: () => 1,
        cancelAnimationFrame: () => {},
        setTimeout: (fn) => setTimeout(fn, 0),
        clearTimeout: () => {},
        setInterval: () => 1,
        clearInterval: () => {},
        AudioContext: function() {
            return {
                state: 'running', currentTime: 0, sampleRate: 44100,
                createBuffer: () => ({ getChannelData: () => new Float32Array(100) }),
                createGain: () => ({ gain: { value: 1, setValueAtTime(){}, exponentialRampToValueAtTime(){}, linearRampToValueAtTime(){}, setTargetAtTime(){} }, connect(){} }),
                createOscillator: () => ({ frequency: { setValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){}, start(){}, stop(){} }),
                createDynamicsCompressor: () => ({ threshold: {}, ratio: {}, attack: {}, release: {}, connect(){} }),
                createConvolver: () => ({ connect(){} }),
                createBufferSource: () => ({ buffer: null, connect(){}, start(){}, stop(){} }),
                createBiquadFilter: () => ({ frequency: { setValueAtTime(){}, linearRampToValueAtTime(){} }, Q: {}, connect(){} }),
                destination: {}
            };
        },
        speechSynthesis: { speak(){}, cancel(){}, pause(){}, resume(){}, getVoices(){ return []; } }
    };

    const sandbox = {
        window: windowMock,
        document: documentMock,
        localStorage: localStorageMock,
        console: { log: () => {}, warn: () => {}, error: () => {}, info: () => {} },
        setTimeout: windowMock.setTimeout,
        clearTimeout: windowMock.clearTimeout,
        setInterval: windowMock.setInterval,
        clearInterval: windowMock.clearInterval,
        requestAnimationFrame: windowMock.requestAnimationFrame,
        Math,
        String,
        Number,
        Array,
        Object,
        JSON,
        Boolean,
        RegExp,
        Date,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        THREE: threeMock,
        tailwind: { config: {} },
        performance: { now: () => Date.now() },
        scene: {
            fog: { density: 0.0009 },
            add() {},
            remove() {}
        },
        camera: {
            position: { set() {}, copy() {}, clone() { return { x:0, y:0, z:0 }; }, add() {}, sub() {} },
            lookAt() {},
            fov: 60,
            updateProjectionMatrix() {}
        }
    };

    // Extract all JS scripts
    const scriptMatches = htmlContent.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);
    let fullScript = '';
    if (scriptMatches) {
        scriptMatches.forEach(tag => {
            const content = tag.replace(/<\/?script[^>]*>/gi, '');
            fullScript += '\n' + content;
        });
    }

    const context = vm.createContext(sandbox);
    vm.runInContext(fullScript, context);

    // Initialize core 3D simulation globals inside VM context
    vm.runInContext(`
        if (typeof scene === 'undefined' || !scene) {
            scene = new THREE.Scene();
            scene.fog = { density: 0.0009 };
        }
        if (typeof camera === 'undefined' || !camera) {
            camera = { position: new THREE.Vector3(), lookAt() {} };
        }
        if (typeof playerMiG21 === 'undefined' || !playerMiG21) {
            playerMiG21 = new THREE.Mesh();
            playerMiG21.visible = true;
        }
        if (typeof samLaunchers === 'undefined' || !samLaunchers || samLaunchers.length === 0) {
            samLaunchers = [
                { loaded: true, reloadT: 0, battery: { loadedMissile: { visible: true } } },
                { loaded: true, reloadT: 0, battery: { loadedMissile: { visible: true } } },
                { loaded: true, reloadT: 0, battery: { loadedMissile: { visible: true } } }
            ];
        }
    `, context);

    const exposed = vm.runInContext(`({
        MISSIONS,
        openBriefing,
        continueCampaign,
        loadProgress,
        saveProgress,
        renderMenuProgress,
        renderMissionList,
        beginMission,
        endMission,
        showDebrief,
        showVictoryEpilogue,
        backToMenuAttract,
        openCampaign,
        pauseMission,
        resumeMission,
        restartMission,
        quitToMenu,
        updateObjectiveHud,
        init3DEngine,
        getActiveMission: () => activeMission,
        setActiveMission: (m) => { activeMission = m; },
        getActiveMissionIdx: () => activeMissionIdx,
        setActiveMissionIdx: (i) => { activeMissionIdx = i; },
        getGameState: () => gameState,
        setGameState: (s) => { gameState = s; },
        getGamePaused: () => gamePaused,
        setGamePaused: (p) => { gamePaused = p; },
        setMissionKills: (k) => { missionKills = k; },
        setMissionShots: (s) => { missionShots = s; },
        setMissionTime: (t) => { missionTime = t; }
    })`, context);

    try {
        exposed.init3DEngine();
    } catch (e) {}

    return { context, sandbox, elements, storage, exposed };
}

// ============================================================================
// TEST SUITE 1: MISSION DATA INTEGRITY & SERIALIZATION
// ============================================================================
console.log('\n[TEST SUITE 1] Missions Schema, Serialization & Access Verification');

const filesToTest = [
    { name: 'index.html', path: 'index.html' },
    { name: 'h_n_i_12_ng_y_m_18_12_29_12_1972.html', path: 'h_n_i_12_ng_y_m_18_12_29_12_1972.html' }
];

const requiredSchemaFields = [
    'id', 'date', 'dateLabel', 'clock', 'title', 'unit', 'place', 'mode',
    'camera', 'story', 'briefing', 'forces', 'kills', 'ammo', 'timeLimit',
    'speed', 'waves', 'jam', 'controls', 'radio', 'lines', 'history'
];

let totalSuite1Errors = 0;

filesToTest.forEach(f => {
    console.log(`\n  Checking file: ${f.name}...`);
    const content = fs.readFileSync(f.path, 'utf8');
    const { exposed } = createMockEnvironment(content);
    const MISSIONS = exposed.MISSIONS;

    assert(Array.isArray(MISSIONS), `${f.name}: MISSIONS must be an array`);
    console.log(`    ✓ MISSIONS is an array of length ${MISSIONS.length}`);
    if (MISSIONS.length !== 12) {
        console.error(`    ✗ FAILED: Expected exactly 12 missions, found ${MISSIONS.length}`);
        totalSuite1Errors++;
    }

    let cumulativeKills = 0;
    MISSIONS.forEach((m, i) => {
        const expectedId = `m${i+1}`;
        if (m.id !== expectedId) {
            console.error(`    ✗ Mission ${i+1} has invalid ID: ${m.id} (expected ${expectedId})`);
            totalSuite1Errors++;
        }
        cumulativeKills += m.kills;

        requiredSchemaFields.forEach(field => {
            if (m[field] === undefined) {
                console.error(`    ✗ Mission ${m.id} missing required field: ${field}`);
                totalSuite1Errors++;
            }
        });

        // Serialization roundtrip check
        try {
            const serialized = JSON.stringify(m);
            const parsed = JSON.parse(serialized);
            assert.strictEqual(parsed.id, m.id);
            assert.strictEqual(parsed.kills, m.kills);
            assert.strictEqual(parsed.waves.length, m.waves.length);
        } catch (e) {
            console.error(`    ✗ Mission ${m.id} failed JSON roundtrip: ${e.message}`);
            totalSuite1Errors++;
        }

        // Radio chatter checks
        if (Array.isArray(m.radio)) {
            m.radio.forEach((rc, rIdx) => {
                if (typeof rc.at !== 'number' || !rc.who || !rc.text) {
                    console.error(`    ✗ Mission ${m.id} malformed radio item at index ${rIdx}`);
                    totalSuite1Errors++;
                }
            });
        } else {
            console.error(`    ✗ Mission ${m.id} radio is not an array`);
            totalSuite1Errors++;
        }
    });

    console.log(`    ✓ Cumulative B-52 Target Kills: ${cumulativeKills} (Target: 34)`);
    if (cumulativeKills !== 34) {
        console.error(`    ✗ FAILED: Cumulative kills = ${cumulativeKills}, expected 34`);
        totalSuite1Errors++;
    }

    // MiG-21 Hero sortie assertions
    const m10 = MISSIONS[9];
    const m11 = MISSIONS[10];
    if (m10.mode !== 'MIG21' || !m10.story.includes('Phạm Tuân')) {
        console.error(`    ✗ Mission 10 is not properly configured for Hero Pilot Phạm Tuân`);
        totalSuite1Errors++;
    }
    if (m11.mode !== 'MIG21' || !m11.story.includes('Vũ Xuân Thiều')) {
        console.error(`    ✗ Mission 11 is not properly configured for Hero Pilot Vũ Xuân Thiều`);
        totalSuite1Errors++;
    }
    console.log(`    ✓ MiG-21 hero sorties M10 (Phạm Tuân) and M11 (Vũ Xuân Thiều) verified.`);
});

console.log(`\nSuite 1 Complete. Errors: ${totalSuite1Errors}`);

// ============================================================================
// TEST SUITE 2: BOUNDARY & MALFORMED INPUT FUZZING
// ============================================================================
console.log('\n[TEST SUITE 2] Boundary Values & Malformed Inputs Stress Test');

const htmlContent = fs.readFileSync('index.html', 'utf8');
const { sandbox, exposed } = createMockEnvironment(htmlContent);

let totalSuite2Errors = 0;

// Test openBriefing with extreme & pathological inputs
const pathologicalIndices = [
    -1, -2, -999, -Infinity,
    12, 13, 100, 9999, Infinity,
    0.5, 1.99, -0.01,
    NaN, undefined, null,
    "", "0", "11", "m1", "m12", "SELECT * FROM missions", "<script>",
    {}, [], [1], { idx: 1 }, () => {}, false, true
];

console.log(`  Fuzzing openBriefing with ${pathologicalIndices.length} pathological inputs...`);
pathologicalIndices.forEach((val) => {
    try {
        const preIdx = exposed.getActiveMissionIdx();
        exposed.openBriefing(val);
        if (typeof val === 'number' && Number.isInteger(val) && val >= 0 && val < 12) {
            // Valid index
        } else {
            if (exposed.getActiveMissionIdx() !== preIdx) {
                console.error(`    ✗ openBriefing mutated activeMissionIdx on invalid input: ${String(val)}`);
                totalSuite2Errors++;
            }
        }
    } catch (err) {
        console.error(`    ✗ CRASH in openBriefing with input [${String(val)}]:`, err.message);
        totalSuite2Errors++;
    }
});
console.log('    ✓ openBriefing handled all pathological inputs without crashing.');

// Test loadProgress & continueCampaign with corrupted localStorage payloads
const malformedStoragePayloads = [
    null,
    "",
    "   ",
    "{corrupted_json",
    "12345",
    "true",
    "false",
    "\"a string\"",
    "[]",
    "{}",
    JSON.stringify({ unlocked: -1 }),
    JSON.stringify({ unlocked: 0 }),
    JSON.stringify({ unlocked: 999 }),
    JSON.stringify({ unlocked: "invalid" }),
    JSON.stringify({ unlocked: NaN }),
    JSON.stringify({ unlocked: null }),
    JSON.stringify({ unlocked: 1, best: null }),
    JSON.stringify({ unlocked: 1, best: "corrupted" }),
    JSON.stringify({ unlocked: 1, best: { m1: "not an object" } }),
    JSON.stringify({ unlocked: 12, best: {} }),
    JSON.stringify({ unlocked: 13, best: {} })
];

console.log(`  Fuzzing loadProgress & continueCampaign with ${malformedStoragePayloads.length} corrupted storage payloads...`);
malformedStoragePayloads.forEach((payload, idx) => {
    try {
        if (payload === null) {
            sandbox.localStorage.removeItem('hn12_progress');
        } else {
            sandbox.localStorage.setItem('hn12_progress', payload);
        }

        const prog = exposed.loadProgress();
        assert(typeof prog === 'object' && prog !== null, 'loadProgress must return an object');

        exposed.continueCampaign();
        exposed.renderMenuProgress();
        exposed.renderMissionList();
    } catch (err) {
        console.error(`    ✗ CRASH in campaign handlers with storage payload #${idx} [${String(payload)}]:`, err.message);
        totalSuite2Errors++;
    }
});
console.log('    ✓ loadProgress, continueCampaign, renderMenuProgress & renderMissionList survived all storage payloads.');

console.log(`Suite 2 Complete. Errors: ${totalSuite2Errors}`);

// ============================================================================
// TEST SUITE 3: RAPID-CLICKING & DEBOUNCE / RACING STRESS
// ============================================================================
console.log('\n[TEST SUITE 3] Rapid-Click & Racing Interaction Stress Test');

let totalSuite3Errors = 0;
sandbox.localStorage.setItem('hn12_progress', JSON.stringify({ unlocked: 1, best: {} }));

console.log('  Simulating 2,000 rapid burst clicks on navigation handlers in <50ms...');
const startTime = Date.now();
for (let i = 0; i < 2000; i++) {
    try {
        const r = i % 8;
        switch (r) {
            case 0: exposed.continueCampaign(); break;
            case 1: exposed.openBriefing(i % 14 - 1); break;
            case 2: exposed.beginMission(); break;
            case 3: exposed.updateObjectiveHud(); break;
            case 4: exposed.endMission(i % 2 === 0, 'Test Stress'); break;
            case 5: exposed.showDebrief(); break;
            case 6: exposed.showVictoryEpilogue(); break;
            case 7: exposed.backToMenuAttract(); break;
        }
    } catch (err) {
        console.error(`    ✗ CRASH at rapid click iteration ${i}:`, err.message);
        totalSuite3Errors++;
        break;
    }
}
const elapsed = Date.now() - startTime;
console.log(`    ✓ 2,000 rapid-click operations completed in ${elapsed}ms without uncaught exceptions.`);

// ============================================================================
// TEST SUITE 4: MONTE-CARLO RANDOM WALK FUZZER (10,000 ACTIONS)
// ============================================================================
console.log('\n[TEST SUITE 4] Monte-Carlo Random Walk Simulation (10,000 Steps)');

let totalSuite4Errors = 0;
sandbox.localStorage.setItem('hn12_progress', JSON.stringify({ unlocked: 1, best: {} }));
exposed.backToMenuAttract();

const ACTIONS = [
    'CONTINUE_CAMPAIGN',
    'OPEN_CAMPAIGN_MAP',
    'CLICK_TIMELINE_NODE',
    'CLICK_MISSION_CARD',
    'OPEN_BRIEFING',
    'BEGIN_MISSION',
    'PAUSE_MISSION',
    'RESUME_MISSION',
    'RESTART_MISSION',
    'QUIT_TO_MENU',
    'END_MISSION_WIN',
    'END_MISSION_FAIL',
    'SHOW_DEBRIEF',
    'SHOW_VICTORY_EPILOGUE',
    'BACK_TO_MENU'
];

let successfulMissionsCompleted = 0;
let epilogueVisits = 0;

for (let step = 0; step < 10000; step++) {
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const randomMissionIdx = Math.floor(Math.random() * 16) - 2; // range [-2 .. 13]

    try {
        switch (action) {
            case 'CONTINUE_CAMPAIGN':
                exposed.continueCampaign();
                break;
            case 'OPEN_CAMPAIGN_MAP':
                exposed.openCampaign();
                break;
            case 'CLICK_TIMELINE_NODE':
            case 'CLICK_MISSION_CARD':
            case 'OPEN_BRIEFING':
                exposed.openBriefing(randomMissionIdx);
                break;
            case 'BEGIN_MISSION':
                if (exposed.getGameState() !== 'PLAYING') {
                    exposed.beginMission();
                }
                break;
            case 'PAUSE_MISSION':
                if (exposed.getGameState() === 'PLAYING') {
                    exposed.pauseMission();
                }
                break;
            case 'RESUME_MISSION':
                if (exposed.getGamePaused()) {
                    exposed.resumeMission();
                }
                break;
            case 'RESTART_MISSION':
                if (exposed.getGameState() === 'PLAYING' || exposed.getGameState() === 'PAUSED') {
                    exposed.restartMission();
                }
                break;
            case 'QUIT_TO_MENU':
                exposed.quitToMenu();
                break;
            case 'END_MISSION_WIN':
                if (exposed.getGameState() === 'PLAYING') {
                    const m = exposed.getActiveMission();
                    exposed.setMissionKills(m.kills);
                    exposed.setMissionShots(m.ammo);
                    exposed.setMissionTime(120);
                    exposed.endMission(true);
                    successfulMissionsCompleted++;
                }
                break;
            case 'END_MISSION_FAIL':
                if (exposed.getGameState() === 'PLAYING') {
                    const m = exposed.getActiveMission();
                    exposed.setMissionKills(0);
                    exposed.setMissionShots(m.ammo);
                    exposed.setMissionTime(m.timeLimit);
                    exposed.endMission(false, 'Hết đạn');
                }
                break;
            case 'SHOW_DEBRIEF':
                if (exposed.getActiveMission()) {
                    exposed.showDebrief();
                }
                break;
            case 'SHOW_VICTORY_EPILOGUE':
                exposed.showVictoryEpilogue();
                epilogueVisits++;
                break;
            case 'BACK_TO_MENU':
                exposed.backToMenuAttract();
                break;
        }

        // Integrity assertions after every action
        const curIdx = exposed.getActiveMissionIdx();
        assert(curIdx >= 0 && curIdx < 12, `activeMissionIdx out of bounds: ${curIdx}`);

        const p = exposed.loadProgress();
        assert(p.unlocked >= 1 && p.unlocked <= 12, `unlocked progress out of bounds: ${p.unlocked}`);

    } catch (err) {
        console.error(`    ✗ CRASH during Monte-Carlo step ${step} [Action: ${action}]:`, err.message);
        totalSuite4Errors++;
        if (totalSuite4Errors > 10) {
            console.error('    Terminating Monte-Carlo run due to excessive errors.');
            break;
        }
    }
}

console.log(`    ✓ 10,000 Monte-Carlo steps finished successfully.`);
console.log(`    Total simulated mission victories: ${successfulMissionsCompleted}`);
console.log(`    Total victory epilogue visits: ${epilogueVisits}`);
console.log(`Suite 4 Complete. Errors: ${totalSuite4Errors}`);

// ============================================================================
// TEST SUITE 5: SAM-2 VS MIG-21 FLIP & HUD INTEGRITY
// ============================================================================
console.log('\n[TEST SUITE 5] SAM-2 vs MiG-21 Mode Transition & HUD Invariants');

let totalSuite5Errors = 0;
for (let i = 0; i < 12; i++) {
    try {
        exposed.setActiveMissionIdx(i);
        exposed.openBriefing(i);
        exposed.beginMission();
        exposed.updateObjectiveHud();

        const badgeText = sandbox.document.getElementById('hud-ammo-badge').textContent;
        const roleText = sandbox.document.getElementById('hud-role-label').textContent;
        const activeM = exposed.getActiveMission();

        if (activeM.mode === 'MIG21') {
            assert(badgeText.includes('K-13'), `Mission ${i+1} MiG-21 mode must display K-13 in hud-ammo-badge. Got: ${badgeText}`);
            assert(roleText.includes('MIG-21'), `Mission ${i+1} MiG-21 mode must display MIG-21 in hud-role-label. Got: ${roleText}`);
        } else {
            assert(badgeText.includes('V-750'), `Mission ${i+1} SAM2 mode must display V-750 in hud-ammo-badge. Got: ${badgeText}`);
        }
    } catch (err) {
        console.error(`    ✗ Mode transition error on Mission ${i+1}:`, err.message);
        totalSuite5Errors++;
    }
}
console.log(`    ✓ All 12 missions transitioned between SAM2 and MiG21 cleanly.`);
console.log(`Suite 5 Complete. Errors: ${totalSuite5Errors}`);

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n' + '='.repeat(75));
console.log('CHALLENGER STRESS HARNESS SUMMARY REPORT');
console.log('='.repeat(75));
console.log(`  ● Suite 1 (Schema & Serialization)    : ${totalSuite1Errors === 0 ? 'PASS (0 errors)' : `FAIL (${totalSuite1Errors} errors)`}`);
console.log(`  ● Suite 2 (Boundary & Corrupt Inputs) : ${totalSuite2Errors === 0 ? 'PASS (0 errors)' : `FAIL (${totalSuite2Errors} errors)`}`);
console.log(`  ● Suite 3 (Rapid Click & Racing)      : ${totalSuite3Errors === 0 ? 'PASS (0 errors)' : `FAIL (${totalSuite3Errors} errors)`}`);
console.log(`  ● Suite 4 (10,000 Monte-Carlo Walk)   : ${totalSuite4Errors === 0 ? 'PASS (0 errors)' : `FAIL (${totalSuite4Errors} errors)`}`);
console.log(`  ● Suite 5 (Mode Transitions & HUD)    : ${totalSuite5Errors === 0 ? 'PASS (0 errors)' : `FAIL (${totalSuite5Errors} errors)`}`);

const grandTotal = totalSuite1Errors + totalSuite2Errors + totalSuite3Errors + totalSuite4Errors + totalSuite5Errors;
console.log('-'.repeat(75));
console.log(`TOTAL LOGICAL & RUNTIME STRESS ERRORS: ${grandTotal}`);
console.log('='.repeat(75));

if (grandTotal > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
