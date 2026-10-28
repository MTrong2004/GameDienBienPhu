const fs = require('fs');

console.log("=== RUNNING BEHAVIORAL AND LOGIC UNIT TESTS ===");

const htmlFile = fs.existsSync('index.html') ? 'index.html' : 'h_n_i_12_ng_y_m_18_12_29_12_1972.html';
const html = fs.readFileSync(htmlFile, 'utf-8');

// Extract JS between <script> tags
const scriptMatches = html.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);
let gameScript = "";
if (scriptMatches) {
    scriptMatches.forEach(tag => {
        const content = tag.replace(/<\/?script[^>]*>/gi, '');
        gameScript += "\n" + content;
    });
}

// Build a mock DOM environment
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
while ((m = idRegex.exec(html)) !== null) {
    if (!elements[m[1]]) {
        elements[m[1]] = createMockElement(m[1]);
    }
}

// Also mock document and window
const store = {};
const mockLocalStorage = {
    getItem: (k) => store[k] || null,
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
    addEventListener: () => { }
};

let timerCounter = 1;
const timers = {};
const windowMock = {
    localStorage: mockLocalStorage,
    addEventListener: () => { },
    requestAnimationFrame: (cb) => 1,
    cancelAnimationFrame: () => { },
    setTimeout: (fn, delay) => {
        const tid = timerCounter++;
        timers[tid] = fn;
        return tid;
    },
    clearTimeout: (tid) => {
        delete timers[tid];
    },
    setInterval: (fn, delay) => {
        const tid = timerCounter++;
        timers[tid] = fn;
        return tid;
    },
    clearInterval: (tid) => {
        delete timers[tid];
    },
    AudioContext: function () {
        return {
            state: 'running',
            currentTime: 0,
            sampleRate: 44100,
            createBuffer: () => ({ getChannelData: () => new Float32Array(100) }),
            createGain: () => ({
                gain: {
                    value: 1,
                    setValueAtTime: () => { },
                    exponentialRampToValueAtTime: () => { },
                    linearRampToValueAtTime: () => { },
                    setTargetAtTime: () => { }
                },
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

const vm = require('vm');
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

try {
    vm.runInContext(gameScript, context);
    console.log("✓ Game script loaded and executed in mock context successfully.");
} catch (err) {
    console.error("✗ Error running game script in context:", err);
    process.exit(1);
}

// TEST 1: Progress Storage
console.log("\n--- TEST 1: Progress Storage ---");
context.saveProgress({ unlocked: 2, best: { m1: { kills: 2, time: 120 } } });
let prog = context.loadProgress();
console.log(`Unlocked: ${prog.unlocked}, Best for M1: kills=${prog.best.m1?.kills}, time=${prog.best.m1?.time}`);
if (prog.unlocked === 2 && prog.best.m1 && prog.best.m1.kills === 2) {
    console.log("✓ Progress saved and loaded correctly.");
} else {
    console.error("✗ Progress test failed.");
    process.exit(1);
}

// TEST 2: continueCampaign
console.log("\n--- TEST 2: continueCampaign ---");
context.continueCampaign();
const briefTitle = elements['brief-title'].textContent;
const briefDate = elements['brief-date'].textContent;
const briefScreen = elements['screen-briefing'];
console.log(`Brief Title: "${briefTitle}", Date: "${briefDate}"`);
console.log(`Briefing screen is-open: ${briefScreen.classList.contains('is-open')}`);
if ((briefTitle === 'Lưới lửa tầm thấp' || briefTitle === 'Đêm rực lửa') && briefDate.includes('MÀN 2') && briefScreen.classList.contains('is-open')) {
    console.log("✓ continueCampaign correctly forwarded to Mission 2 (the unlocked mission) and opened briefing.");
} else {
    console.error("✗ continueCampaign did not pick m2 briefing.");
    process.exit(1);
}

// TEST 3: renderMenuProgress
console.log("\n--- TEST 3: renderMenuProgress ---");
context.renderMenuProgress();
const menuBox = elements['menu-campaign-progress'];
const continueBtn = elements['btn-continue-campaign'];
const progText = elements['menu-prog-text'];
console.log(`menuBox hidden? ${menuBox.classList.contains('hidden')}`);
console.log(`continueBtn hidden? ${continueBtn.classList.contains('hidden')}`);
console.log(`progText: "${progText.textContent}"`);
if (!menuBox.classList.contains('hidden') && (progText.textContent.includes('1/12') || progText.textContent.includes('1/5'))) {
    console.log("✓ renderMenuProgress correctly updated UI with 1 completed mission.");
} else {
    console.error("✗ renderMenuProgress UI update failed.");
    process.exit(1);
}

// TEST 4: Victory Epilogue & Screen Navigation
console.log("\n--- TEST 4: Victory Epilogue & Screen Navigation ---");
context.showVictoryEpilogue();
const victoryScreen = elements['screen-victory'];
console.log(`Victory screen is-open: ${victoryScreen.classList.contains('is-open')}`);
if (victoryScreen.classList.contains('is-open')) {
    console.log("✓ Victory screen activated via showVictoryEpilogue.");
} else {
    console.error("✗ Victory screen activation failed.");
    process.exit(1);
}

// TEST 5: toggleTacticalGuide
console.log("\n--- TEST 5: toggleTacticalGuide ---");
const modalGuide = elements['modal-tactical-guide'];
modalGuide.classList.remove('is-open');
context.toggleTacticalGuide(true);
console.log(`modalGuide open (is-open added)? ${modalGuide.classList.contains('is-open')}`);
const opened = modalGuide.classList.contains('is-open');
context.toggleTacticalGuide(false);
console.log(`modalGuide closed (is-open removed)? ${!modalGuide.classList.contains('is-open')}`);
const closed = !modalGuide.classList.contains('is-open');
if (opened && closed) {
    console.log("✓ toggleTacticalGuide works as expected.");
} else {
    console.error("✗ toggleTacticalGuide failed.");
    process.exit(1);
}

// TEST 6: showCombatAlert
console.log("\n--- TEST 6: showCombatAlert ---");
const m0 = vm.runInContext('MISSIONS[0]', context);
const alertBanner = elements['combat-alert-banner'];
alertBanner.classList.remove('is-visible');
context.showCombatAlert(m0);
console.log(`Alert banner is-visible? ${alertBanner.classList.contains('is-visible')}`);
const bannerTitle = elements['alert-banner-title'].textContent;
console.log(`Alert banner title: "${bannerTitle}"`);
if (alertBanner.classList.contains('is-visible') && (bannerTitle.includes('ĐÒN PHỦ ĐẦU') || bannerTitle.includes('ĐÊM MỞ MÀN') || bannerTitle.includes(m0.title.toUpperCase()))) {
    console.log("✓ showCombatAlert correctly populated and displayed banner.");
} else {
    console.error("✗ showCombatAlert failed.");
    process.exit(1);
}

// TEST 7: showKillSplash
console.log("\n--- TEST 7: showKillSplash ---");
const splash = elements['kill-splash'];
splash.classList.remove('is-visible');
context.showKillSplash(m0, 1);
console.log(`Kill splash is-visible? ${splash.classList.contains('is-visible')}`);
const splashDetail = elements['kill-splash-detail'].textContent;
console.log(`Kill splash detail text: "${splashDetail}"`);
if (splash.classList.contains('is-visible') && splashDetail.includes('LẬP CÔNG')) {
    console.log("✓ showKillSplash correctly displayed kill splash banner.");
} else {
    console.error("✗ showKillSplash failed.");
    process.exit(1);
}

// TEST 8: SoundFX synthesized methods
console.log("\n--- TEST 8: SoundFX Methods ---");
try {
    vm.runInContext('SoundFX.click(); SoundFX.fanfare(); SoundFX.alertChime();', context);
    console.log("✓ SoundFX.click(), SoundFX.fanfare(), and SoundFX.alertChime() ran without throwing.");
} catch (err) {
    console.error("✗ SoundFX methods threw an error:", err);
    process.exit(1);
}

// TEST 9: Debriefing Medals evaluation
console.log("\n--- TEST 9: Debriefing Medals ---");
vm.runInContext('activeMission = MISSIONS[0]; activeMissionIdx = 0; missionWon = true; missionKills = 1; missionShots = 2; missionTime = 100;', context);
context.showDebrief();
const debriefRes = elements['debrief-result'].textContent;
const debriefStats = elements['debrief-stats'].innerHTML;
console.log(`Debrief result: "${debriefRes}"`);
console.log(`Debrief stats medals badge generated: ${debriefStats.includes('medal-badge')}`);
console.log(`Huân chương chiến công 3 sao awarded: ${debriefStats.includes('DŨNG SĨ DIỆT MỸ')}`);
if (debriefRes.includes('Hoàn thành nhiệm vụ') && debriefStats.includes('medal-badge') && debriefStats.includes('DŨNG SĨ DIỆT MỸ')) {
    console.log("✓ showDebrief correctly generated 3-star medal badge and victory debrief.");
} else {
    console.error("✗ showDebrief medal generation failed.");
    process.exit(1);
}

// TEST 10: Grand Campaign Victory Epilogue on Final Mission
console.log("\n--- TEST 10: Final Mission Victory Epilogue Trigger ---");
vm.runInContext('activeMission = MISSIONS[MISSIONS.length - 1]; activeMissionIdx = MISSIONS.length - 1; missionWon = true; missionKills = 1; missionShots = 2; missionTime = 120;', context);
context.showDebrief();
const debriefActions = elements['debrief-actions'].innerHTML;
console.log(`Final Mission Debrief Actions include showVictoryEpilogue: ${debriefActions.includes('showVictoryEpilogue()')}`);
if (debriefActions.includes('showVictoryEpilogue()') && debriefActions.includes('ĐẠI THẮNG ĐIỆN BIÊN PHỦ TRÊN KHÔNG')) {
    console.log("✓ Final mission successfully unlocked Grand Campaign Victory Epilogue button.");
} else {
    console.error("✗ Grand Campaign Victory button missing from final mission debrief.");
    process.exit(1);
}

console.log("\n=== ALL 10 BEHAVIORAL UNIT TESTS PASSED WITH 100% SUCCESS! ===");
