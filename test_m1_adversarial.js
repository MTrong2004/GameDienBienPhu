// test_m1_adversarial.js
// Independent adversarial stress-test suite for Milestone 1 using VM context
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log('=== STARTING ADVERSARIAL STRESS TEST FOR MILESTONE 1 ===\n');

const htmlContent = fs.readFileSync('index.html', 'utf8');

// Extract JS between <script> tags
const scriptMatches = htmlContent.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);
let gameScript = "";
if (scriptMatches) {
    scriptMatches.forEach(tag => {
        const content = tag.replace(/<\/?script[^>]*>/gi, '');
        gameScript += "\n" + content;
    });
}

function createTestSandbox(initialStorage = null) {
    const store = {};
    if (initialStorage !== null) {
        store['hn12_progress'] = initialStorage;
    }

    const elements = {};
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
            addEventListener: () => { },
            removeEventListener: () => { },
            setAttribute: () => { },
            getAttribute: () => null
        };
    }

    // Find all elements with ID in the HTML
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
        querySelectorAll: () => [],
        querySelector: () => null,
        addEventListener: () => { }
    };

    const windowMock = {
        localStorage: mockLocalStorage,
        addEventListener: () => { },
        requestAnimationFrame: () => 1,
        cancelAnimationFrame: () => { },
        setTimeout: (fn) => setTimeout(fn, 0),
        clearTimeout: (id) => clearTimeout(id),
        setInterval: () => 1,
        clearInterval: () => { },
        AudioContext: function () {
            return {
                state: 'running',
                currentTime: 0,
                sampleRate: 44100,
                createBuffer: () => ({ getChannelData: () => new Float32Array(100) }),
                createGain: () => ({
                    gain: { value: 1, setValueAtTime: () => { }, exponentialRampToValueAtTime: () => { }, linearRampToValueAtTime: () => { }, setTargetAtTime: () => { } },
                    connect: () => { }
                }),
                createOscillator: () => ({ frequency: { setValueAtTime: () => { }, exponentialRampToValueAtTime: () => { } }, connect: () => { }, start: () => { }, stop: () => { } }),
                createDynamicsCompressor: () => ({ threshold: {}, ratio: {}, attack: {}, release: {}, connect: () => { } }),
                createConvolver: () => ({ connect: () => { } }),
                createBufferSource: () => ({ buffer: null, connect: () => { }, start: () => { }, stop: () => { } }),
                createBiquadFilter: () => ({ frequency: { setValueAtTime: () => { }, linearRampToValueAtTime: () => { } }, Q: {}, connect: () => { } }),
                destination: {}
            };
        },
        speechSynthesis: {
            speak: () => { },
            cancel: () => { },
            getVoices: () => []
        }
    };

    const context = {
        window: windowMock,
        document: documentMock,
        localStorage: mockLocalStorage,
        console: console,
        Math: Math,
        Date: Date,
        setTimeout: windowMock.setTimeout,
        clearTimeout: windowMock.clearTimeout,
        requestAnimationFrame: (cb) => 1,
        THREE: new Proxy({}, {
            get: (target, prop) => {
                const DummyClass = function () {
                    this.x = 0; this.y = 0; this.z = 0;
                    this.position = { set: () => { }, copy: () => { } };
                    this.rotation = { set: () => { } };
                    this.scale = { set: () => { } };
                    this.add = () => { };
                    this.remove = () => { };
                    this.lookAt = () => { };
                    this.setPixelRatio = () => { };
                    this.setSize = () => { };
                    this.render = () => { };
                };
                return DummyClass;
            }
        }),
        tailwind: { config: {} },
        performance: { now: () => Date.now() }
    };

    vm.createContext(context);
    vm.runInContext(gameScript, context);

    return {
        context,
        elements,
        store,
        run: (code) => vm.runInContext(code, context),
        get: (varName) => vm.runInContext(varName, context)
    };
}

// --- TEST 1: Bounds Checking on openBriefing ---
console.log('--- TEST 1: Bounds Checking on openBriefing ---');
const sb1 = createTestSandbox();
const MISSIONS = sb1.get('MISSIONS');
assert(Array.isArray(MISSIONS) && MISSIONS.length === 12, 'MISSIONS must have 12 missions');

const invalidIndices = [-100, -1, 12, 13, 999, NaN, Infinity, -Infinity, null, undefined, '0', '5', {}, []];
for (const badIdx of invalidIndices) {
    sb1.run(`activeMissionIdx = 0; showScreen('menu');`);
    sb1.context.openBriefing(badIdx);
    const currIdx = sb1.get('activeMissionIdx');
    assert.strictEqual(currIdx, 0, `activeMissionIdx must not change for invalid index: ${badIdx}`);
    const briefingOpen = sb1.elements['screen-briefing']?.classList.contains('is-open');
    assert.strictEqual(briefingOpen, false, `screen-briefing must not open for invalid index: ${badIdx}`);
}
console.log('✓ TEST 1 PASSED: All 14 boundary & non-integer indices safely rejected without error.\n');


// --- TEST 2: Locked Mission Protection ---
console.log('--- TEST 2: Locked Mission Protection ---');
const sb2 = createTestSandbox(JSON.stringify({ unlocked: 3, best: { m1: { kills: 3 }, m2: { kills: 2 } } }));
sb2.run(`activeMissionIdx = 1; showScreen('menu');`);

// Attempt to open locked Mission 5 (index 4, unlocked = 3)
sb2.context.openBriefing(4);
assert.strictEqual(sb2.get('activeMissionIdx'), 1, 'activeMissionIdx must NOT update to locked mission index 4');
assert.strictEqual(sb2.elements['screen-briefing']?.classList.contains('is-open'), false, 'Briefing screen must NOT open for locked mission');

// Now open unlocked Mission 3 (index 2, unlocked = 3)
sb2.context.openBriefing(2);
assert.strictEqual(sb2.get('activeMissionIdx'), 2, 'activeMissionIdx must update to unlocked mission index 2');
assert.strictEqual(sb2.elements['screen-briefing']?.classList.contains('is-open'), true, 'Briefing screen must open for unlocked mission');
console.log('✓ TEST 2 PASSED: Locked mission protection verified.\n');


// --- TEST 3: Adversarial LocalStorage Fuzzing ---
console.log('--- TEST 3: Adversarial LocalStorage Fuzzing ---');
const corruptPayloads = [
    { name: 'Malformed JSON', data: '{ unlocked: 1, broken' },
    { name: 'Null string', data: 'null' },
    { name: 'Number primitive', data: '42' },
    { name: 'String primitive', data: '"corrupted"' },
    { name: 'Array payload', data: '[1, 2, 3]' },
    { name: 'Missing best key', data: JSON.stringify({ unlocked: 3 }) },
    { name: 'Null best key', data: JSON.stringify({ unlocked: 3, best: null }) },
    { name: 'Negative unlocked', data: JSON.stringify({ unlocked: -5, best: {} }) },
    { name: 'Zero unlocked', data: JSON.stringify({ unlocked: 0, best: {} }) },
    { name: 'Out-of-bounds unlocked', data: JSON.stringify({ unlocked: 99, best: {} }) },
    { name: 'Empty object', data: '{}' }
];

const results = [];
for (const p of corruptPayloads) {
    let errorCaught = null;
    try {
        const sb = createTestSandbox(p.data);
        sb.run(`
            // Exercise all UI entrypoints that call loadProgress()
            renderMenuProgress();
            renderMissionList();
            continueCampaign();
        `);
    } catch(e) {
        errorCaught = e.message;
    }
    results.push({ name: p.name, error: errorCaught });
}

console.log('Fuzzing Results:');
let failCount = 0;
for (const r of results) {
    if (r.error) {
        console.log(`  ❌ ${r.name}: FAILED with "${r.error}"`);
        failCount++;
    } else {
        console.log(`  ✓ ${r.name}: PASSED gracefully`);
    }
}

if (failCount > 0) {
    console.log(`\n⚠️ ${failCount} payloads caused unhandled exceptions in UI rendering!`);
} else {
    console.log('\n✓ All corrupt localStorage payloads handled gracefully.');
}

console.log('\n=== ADVERSARIAL STRESS TEST COMPLETE ===');
