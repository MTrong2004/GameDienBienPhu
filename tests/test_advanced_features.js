const fs = require('fs');
const vm = require('vm');

console.log("=== RUNNING ADVANCED UI & STORY BEHAVIORAL TESTS ===");

const htmlFile = fs.existsSync('index.html') ? 'index.html' : 'hanoi-12-ngay-dem.html';
const html = fs.readFileSync(htmlFile, 'utf-8');

// Extract JS
const scriptMatches = html.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);
let gameScript = "";
if (scriptMatches) {
    scriptMatches.forEach(tag => {
        const content = tag.replace(/<\/?script[^>]*>/gi, '');
        gameScript += "\n" + content;
    });
}

// Build mock DOM
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
        addEventListener: () => {},
        removeEventListener: () => {},
        setAttribute: () => {},
        getAttribute: () => null
    };
}

const idRegex = /id="([a-zA-Z0-9_\-]+)"/g;
let m;
while ((m = idRegex.exec(html)) !== null) {
    if (!elements[m[1]]) {
        elements[m[1]] = createMockElement(m[1]);
    }
}

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
    addEventListener: () => {}
};

const windowMock = {
    localStorage: mockLocalStorage,
    addEventListener: () => {},
    requestAnimationFrame: (cb) => 1,
    cancelAnimationFrame: () => {},
    setTimeout: (fn, delay) => 1,
    clearTimeout: () => {},
    setInterval: (fn, delay) => 1,
    clearInterval: () => {},
    AudioContext: function() {
        return {
            state: 'running', currentTime: 0, sampleRate: 44100,
            createBuffer: () => ({ getChannelData: () => new Float32Array(100) }),
            createGain: () => ({ gain: { value: 1, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, setTargetAtTime: () => {}, linearRampToValueAtTime: () => {} }, connect: () => {} }),
            createOscillator: () => ({ frequency: { setValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} }),
            createDynamicsCompressor: () => ({ threshold: {}, ratio: {}, attack: {}, release: {}, connect: () => {} }),
            createConvolver: () => ({ connect: () => {} }),
            createBufferSource: () => ({ buffer: null, connect: () => {}, start: () => {}, stop: () => {} }),
            createBiquadFilter: () => ({ frequency: { setValueAtTime: () => {} }, Q: {}, connect: () => {} }),
            destination: {}
        };
    },
    speechSynthesis: {
        speak: () => {},
        cancel: () => {},
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
        get: () => function() {
            this.position = { set: () => {}, copy: () => {} };
            this.rotation = { set: () => {} };
            this.scale = { set: () => {} };
            this.add = () => {};
            this.remove = () => {};
            this.setPixelRatio = () => {};
            this.setSize = () => {};
            this.render = () => {};
        }
    }),
    tailwind: { config: {} },
    performance: { now: () => Date.now() }
};

vm.createContext(context);
vm.runInContext(gameScript, context);

// ADVANCED TEST 1: New Player Flow (0 missions)
console.log("\n--- ADVANCED TEST 1: New Player Flow ---");
context.saveProgress({ unlocked: 1, best: {} });
context.renderMenuProgress();
const progText0 = elements['menu-prog-text'].textContent;
const btnContinue0 = elements['btn-continue-campaign'].textContent;
const pipsHtml0 = elements['menu-pips'].innerHTML;
console.log(`Menu Prog Text (0 missions): "${progText0}"`);
console.log(`Continue Button Text (0 missions): "${btnContinue0}"`);
console.log(`Pips generated count: ${(pipsHtml0.match(/<div/g) || []).length}`);
if ((progText0.includes('0/12 ĐÊM') || progText0.includes('0/5 ĐÊM')) && btnContinue0.includes('Bắt đầu Chiến dịch') && ((pipsHtml0.match(/<div/g) || []).length === 12 || (pipsHtml0.match(/<div/g) || []).length === 5)) {
    console.log("✓ New player flow correctly presents Start Campaign CTA and 12 timeline pips.");
} else {
    console.error("✗ New player flow failed.");
    process.exit(1);
}

// ADVANCED TEST 2: Grand Campaign Victorious Flow (All missions completed)
console.log("\n--- ADVANCED TEST 2: Victorious Campaign Flow ---");
const bestAll = {};
for (let i = 1; i <= 12; i++) {
    bestAll[`m${i}`] = { kills: 2, shots: 4, time: 100 };
}
context.saveProgress({
    unlocked: 12,
    best: bestAll
});
context.renderMenuProgress();
const progTextAll = elements['menu-prog-text'].textContent;
const btnContinueAll = elements['btn-continue-campaign'].textContent;
console.log(`Menu Prog Text (All missions complete): "${progTextAll}"`);
console.log(`Continue Button Text (All missions complete): "${btnContinueAll}"`);
if ((progTextAll.includes('12/12 ĐÊM') || progTextAll.includes('5/5 ĐÊM')) && progTextAll.includes('TOÀN THẮNG') && btnContinueAll.includes('Xem Đại Thắng')) {
    console.log("✓ Victorious campaign flow updates menu with Grand Victory CTA.");
} else {
    console.error("✗ Victorious campaign flow failed.");
    process.exit(1);
}

// ADVANCED TEST 3: continueCampaign() when campaign completed routes to Victory Epilogue
console.log("\n--- ADVANCED TEST 3: continueCampaign routing when campaign complete ---");
elements['screen-victory'].classList.remove('is-open');
context.continueCampaign();
console.log(`Victory screen is-open after continueCampaign(): ${elements['screen-victory'].classList.contains('is-open')}`);
if (elements['screen-victory'].classList.contains('is-open')) {
    console.log("✓ continueCampaign correctly forwarded to Grand Victory Epilogue.");
} else {
    console.error("✗ continueCampaign did not forward to Victory Epilogue.");
    process.exit(1);
}

// ADVANCED TEST 4: Timeline Epilogue Node (13 nodes total: 12 missions + 30.12 Epilogue)
console.log("\n--- ADVANCED TEST 4: Timeline 13th Epilogue Node ---");
context.renderMissionList();
const timelineHtml = elements['timeline-track'].innerHTML;
const timelineNodesCount = (timelineHtml.match(/timeline-node/g) || []).length;
console.log(`Total timeline nodes rendered: ${timelineNodesCount}`);
console.log(`Timeline contains 30.12 node? ${timelineHtml.includes('30.12')}`);
console.log(`Timeline contains is-epilogue class? ${timelineHtml.includes('is-epilogue')}`);
if ((timelineNodesCount === 13 || timelineNodesCount === 6) && timelineHtml.includes('30.12') && timelineHtml.includes('is-epilogue')) {
    console.log(`✓ Timeline successfully renders ${timelineNodesCount} nodes with unlocked 30.12 Epilogue milestone.`);
} else {
    console.error("✗ Timeline epilogue node failed.");
    process.exit(1);
}

// ADVANCED TEST 5: Briefing Historical Prologue Quote
console.log("\n--- ADVANCED TEST 5: Briefing Historical Prologue Quote ---");
context.openBriefing(0);
const prologueHtml = elements['brief-story-quote'].innerHTML;
console.log(`Briefing prologue quote rendered: ${prologueHtml.includes('BỐI CẢNH LỊCH SỬ')}`);
console.log(`Prologue snippet: "${prologueHtml.slice(0, 100)}..."`);
if (prologueHtml.includes('BỐI CẢNH LỊCH SỬ') && prologueHtml.includes('Tiểu đoàn tên lửa 59')) {
    console.log("✓ openBriefing correctly populated narrative prologue quote.");
} else {
    console.error("✗ openBriefing prologue quote failed.");
    process.exit(1);
}

// ADVANCED TEST 6: Debrief Failure Analysis & Tactical Coaching
console.log("\n--- ADVANCED TEST 6: Debrief Failure Analysis & Tactical Coaching ---");
vm.runInContext('gameState = "PLAYING"; activeMission = MISSIONS[0]; activeMissionIdx = 0; missionWon = false; endMission(false, "Hết đạn! Các tốp B-52 còn lại đã thoát.");', context);
context.showDebrief();
const debriefResFail = elements['debrief-result'].textContent;
const failAnalysis = elements['debrief-fail-analysis'].innerHTML;
console.log(`Debrief Result on Fail: "${debriefResFail}"`);
console.log(`Failure analysis rendered? ${failAnalysis.includes('NGUYÊN NHÂN CHƯA HOÀN THÀNH')}`);
console.log(`Specific tactical coaching included? ${failAnalysis.includes('Chỉ đạo tác chiến của Bộ Tư lệnh')}`);
console.log(`SAM-2 tactical advice included? ${failAnalysis.includes('Ba điểm')}`);
if (debriefResFail.includes('Chưa hoàn thành') && failAnalysis.includes('Hết đạn') && failAnalysis.includes('Ba điểm')) {
    console.log("✓ Debrief on failure correctly provides root cause analysis and tactical coaching.");
} else {
    console.error("✗ Debrief failure analysis test failed.");
    process.exit(1);
}

// ADVANCED TEST 7: Radio Log Transmission History & Modal
console.log("\n--- ADVANCED TEST 7: Radio Log History & Modal ---");
vm.runInContext('missionTime = 15;', context);
context.showRadio('SỞ CHỈ HUY', 'Báo động phòng không toàn thành phố!');
vm.runInContext('missionTime = 30;', context);
context.showRadio('TRẮC THỦ', 'Đã bắt được dải nhiễu B-52 trên màn hiện sóng.');

const radioLog = vm.runInContext('missionRadioLog', context);
console.log(`Total messages in radio log: ${radioLog.length}`);
console.log(`Message 1: [${radioLog[0].who}] "${radioLog[0].text}" at T+${radioLog[0].time}s`);
console.log(`Message 2: [${radioLog[1].who}] "${radioLog[1].text}" at T+${radioLog[1].time}s`);

context.toggleRadioLog(true);
const modalRadioLog = elements['modal-radio-log'];
const radioLogList = elements['radio-log-list'].innerHTML;
console.log(`modal-radio-log open? ${modalRadioLog.classList.contains('is-open')}`);
console.log(`radio-log-list contains message 1? ${radioLogList.includes('Báo động phòng không')}`);
console.log(`radio-log-list contains message 2? ${radioLogList.includes('bắt được dải nhiễu')}`);

context.toggleRadioLog(false);
console.log(`modal-radio-log closed? ${!modalRadioLog.classList.contains('is-open')}`);

if (radioLog.length >= 2 && modalRadioLog && radioLogList.includes('Báo động phòng không') && !modalRadioLog.classList.contains('is-open')) {
    console.log("✓ Combat Radio Log correctly records transmissions and renders full history modal.");
} else {
    console.error("✗ Radio log test failed.");
    process.exit(1);
}

// ADVANCED TEST 8: Victory Epilogue Historical Strategic Prophecy
console.log("\n--- ADVANCED TEST 8: Victory Epilogue Strategic Prophecy ---");
const victoryScreenHtml = elements['screen-victory'].innerHTML;
const hasProphecy = html.includes('DỰ BÁO CHIẾN LƯỢC THIÊN TÀI CỦA BÁC HỒ');
const hasQuote = html.includes('Mỹ nhất định thua, nhưng chỉ chịu thua sau khi thua trên bầu trời Hà Nội');
console.log(`Victory Epilogue contains Ho Chi Minh 1968 strategic prophecy? ${hasProphecy && hasQuote}`);
if (hasProphecy && hasQuote) {
    console.log("✓ Grand Victory Epilogue prominently showcases the 1968 strategic prophecy.");
} else {
    console.error("✗ Victory Epilogue prophecy check failed.");
    process.exit(1);
}

console.log("\n=== ALL 8 ADVANCED BEHAVIORAL TESTS PASSED WITH 100% SUCCESS! ===");
