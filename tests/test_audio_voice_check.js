const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatches = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)];
assert(scriptMatches.length >= 2, 'Main game script block must exist');
const mainScript = scriptMatches[1][1];

const mockCtx = {
    currentTime: 10,
    state: 'running',
    sampleRate: 44100,
    createGain: () => ({ gain: { value: 1, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, setTargetAtTime: () => {} }, connect: () => {} }),
    createOscillator: () => ({ frequency: { value: 440, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {}, setTargetAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} }),
    createBiquadFilter: () => ({ frequency: { value: 1000, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, setTargetAtTime: () => {} }, Q: { value: 1 }, connect: () => {} }),
    createBuffer: () => ({ getChannelData: () => new Float32Array(100) }),
    createBufferSource: () => ({ buffer: null, loop: false, connect: () => {}, start: () => {}, stop: () => {} }),
    createDynamicsCompressor: () => ({ threshold: {}, ratio: {}, attack: {}, release: {}, connect: () => {} }),
    createConvolver: () => ({ connect: () => {} }),
    destination: {}
};

let spokenList = [];
let speechCancelled = false;

let playedAudioSrc = null;
function MockAudio(src) {
    this.src = src;
    this.volume = 1;
    this.play = () => { playedAudioSrc = this.src; return Promise.resolve(); };
    this.pause = () => {};
}

const domElements = {};
function getOrCreateElement(id) {
    if (!domElements[id]) {
        const classes = new Set();
        domElements[id] = {
            id,
            textContent: '',
            innerHTML: '',
            style: {},
            classList: {
                add: (c) => classes.add(c),
                remove: (c) => classes.delete(c),
                contains: (c) => classes.has(c),
                toggle: (c, force) => {
                    if (force !== undefined) {
                        force ? classes.add(c) : classes.delete(c);
                        return force;
                    }
                    if (classes.has(c)) { classes.delete(c); return false; }
                    classes.add(c); return true;
                }
            },
            offsetWidth: 100
        };
    }
    return domElements[id];
}

const windowMock = {
    Audio: MockAudio,
    AudioContext: function() { return mockCtx; },
    webkitAudioContext: function() { return mockCtx; },
    speechSynthesis: {
        speaking: false,
        paused: false,
        speak: (u) => { spokenList.push(u); },
        cancel: () => { speechCancelled = true; },
        resume: () => {},
        pause: () => {},
        getVoices: () => [
            { name: 'Microsoft David Desktop', lang: 'en-US', default: true },
            { name: 'Microsoft Zira Desktop', lang: 'en-US', default: false }
        ]
    },
    SpeechSynthesisUtterance: function(text) {
        this.text = text;
        this.voice = null;
        this.lang = '';
        this.pitch = 1;
        this.rate = 1;
        this.volume = 1;
    },
    addEventListener: () => {},
    setTimeout: (fn, ms) => { fn(); return 1; },
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    requestAnimationFrame: (cb) => 1,
    document: {
        body: { classList: { add: () => {}, remove: () => {}, toggle: () => {} } },
        getElementById: (id) => getOrCreateElement(id),
        querySelectorAll: () => [],
        addEventListener: () => {}
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    tailwind: { config: {} }
};

const sandbox = {
    Audio: MockAudio,
    window: windowMock,
    document: windowMock.document,
    localStorage: windowMock.localStorage,
    AudioContext: windowMock.AudioContext,
    speechSynthesis: windowMock.speechSynthesis,
    SpeechSynthesisUtterance: windowMock.SpeechSynthesisUtterance,
    setTimeout: windowMock.setTimeout,
    clearTimeout: windowMock.clearTimeout,
    setInterval: windowMock.setInterval,
    clearInterval: windowMock.clearInterval,
    console: console,
    performance: { now: () => Date.now() },
    Math: Math,
    Date: Date,
    tailwind: { config: {} },
    THREE: new Proxy({}, {
        get: () => function() {
            this.position = { set: () => {}, copy: () => {}, clone: () => this.position, distanceTo: () => 100 };
            this.rotation = { set: () => {} };
            this.scale = { set: () => {} };
            this.add = () => {};
            this.remove = () => {};
            this.clone = () => this;
        }
    })
};

vm.createContext(sandbox);
vm.runInContext(mainScript, sandbox);

const SoundFX = sandbox.window.SoundFX;
const SoundEngine = sandbox.window.SoundEngine;
const Voice = sandbox.window.Voice;

assert(SoundFX, 'SoundFX must exist');
assert(typeof SoundFX.loudspeakerChime === 'function', 'SoundFX.loudspeakerChime exists');
assert(typeof SoundFX.sonicBoom === 'function', 'SoundFX.sonicBoom exists');
assert(typeof SoundFX.secondaryBoom === 'function', 'SoundFX.secondaryBoom exists');
assert(typeof SoundFX.teletype === 'function', 'SoundFX.teletype exists');
assert(typeof SoundFX.salvo === 'function', 'SoundFX.salvo exists');

// Verify volume controls
SoundFX.setVoiceVolume(0.7);
assert.strictEqual(SoundFX.voiceVolume, 0.7, 'SoundFX.voiceVolume must be stored');

// Test 1: Briefing story narration uses high-quality neural AI audio file
if (sandbox.openBriefing) sandbox.openBriefing(0);
else if (sandbox.window.openBriefing) sandbox.window.openBriefing(0);
Voice.toggleBriefingStory();
assert.strictEqual(playedAudioSrc, 'assets/audio/story_m1.mp3', 'Narrator story must play neural audio file (HoaiMy)');

// Test 2: Voice.speak does NOT butcher Vietnamese with English voice (David) when offline
SoundFX.init();
Voice.init();
spokenList = [];
Voice.speak('TRẮC THỦ', 'Mục tiêu phương vị 280.', true);
assert.strictEqual(spokenList.length, 0, 'Must NOT use English voice (David) to read Vietnamese');

// Test 3: Voice.speak uses Vietnamese voice when available
windowMock.speechSynthesis.getVoices = () => [
    { name: 'Microsoft HoaiMy Online (Natural) - Vietnamese (Vietnam)', lang: 'vi-VN' }
];
Voice.init();
spokenList = [];
Voice.speak('TRẮC THỦ', 'Mục tiêu phương vị 280.', true);
assert(spokenList.length > 0, 'Uses Vietnamese voice when present');
assert.strictEqual(spokenList[0].lang, 'vi-VN', 'Lang must be vi-VN');

// Test 3.1: Voice.speak strictly drops tutorial / control guidance voice
spokenList = [];
Voice.speak('HƯỚNG DẪN', 'Giữ vòng ngắm trên B-52 khoảng 2 giây để BÁM.', true);
assert.strictEqual(spokenList.length, 0, 'Must suppress HƯỚNG DẪN voice lines');
Voice.speak('TRẮC THỦ', 'Kéo thanh tần số hoặc bấm Q / E để đưa vạch phát ra khỏi đỉnh nhiễu!', true);
assert.strictEqual(spokenList.length, 0, 'Must suppress keyboard/mouse tutorial voice lines');
Voice.speak('SĨ QUAN ĐIỀU KHIỂN', 'Đạn rời bệ! Đưa chuột về giữa màn hình. Lệch chuột để lái đạn, Space để lệnh nổ.', true);
assert.strictEqual(spokenList.length, 0, 'Must suppress steering control tutorial voice lines');

// Test 4: Offline military cues play authentic neural MP3s at local
playedAudioSrc = null;
Voice.speak('LOA PHÒNG KHÔNG', 'Đồng bào chú ý! Máy bay địch cách Hà Nội 50 km!', true);
assert.strictEqual(playedAudioSrc, 'assets/audio/cue_air_raid.mp3', 'Air raid alert plays cue_air_raid.mp3');

playedAudioSrc = null;
Voice.speak('TRẮC THỦ', 'Mục tiêu bốc cháy! B-52 rơi tại chỗ!', true);
assert.strictEqual(playedAudioSrc, 'assets/audio/cue_kill.mp3', 'Downed bomber plays cue_kill.mp3');

// Test 5: Debrief history narration plays historical neural voice file
Voice.stop();
playedAudioSrc = null;
Voice.toggleDebriefHistory();
assert.strictEqual(playedAudioSrc, 'assets/audio/history_m1.mp3', 'Debrief history must play history_m1.mp3');

// Test 6: Auto-play story on opening mission & smooth continuous playback into combat
Voice.stop();
playedAudioSrc = null;
windowMock.localStorage.getItem = () => JSON.stringify({ unlocked: 12, best: {} });
if (sandbox.openBriefing) sandbox.openBriefing(3); // Mission 4
else if (sandbox.window.openBriefing) sandbox.window.openBriefing(3);
assert.strictEqual(playedAudioSrc, 'assets/audio/story_m4.mp3', 'Mission 4 must auto-play story_m4.mp3 on openBriefing');
assert.strictEqual(Voice.isStoryPlaying(), true, 'isStoryPlaying must be true while story is playing');

// Starting combat must NOT interrupt or stop the story voice
sandbox.switchSimMode = () => {};
sandbox.setBomberCount = () => {};
sandbox.setCinematicCamera = () => {};
sandbox.setEccmSlider = () => {};
sandbox.setAirArena = () => {};
sandbox.showCombatAlert = () => {};
sandbox.updateObjectiveHud = () => {};
if (sandbox.beginMission) sandbox.beginMission();
else if (sandbox.window.beginMission) sandbox.window.beginMission();
assert.strictEqual(Voice.isStoryPlaying(), true, 'beginMission must NOT cut off active story voice');
assert.strictEqual(playedAudioSrc, 'assets/audio/story_m4.mp3', 'Audio source remains story_m4.mp3 without being stomped');

// Radio speech attempts during story must not interrupt
Voice.speak('SỞ CHỈ HUY', 'Toàn tiểu đoàn vào cấp 1!', true);
assert.strictEqual(playedAudioSrc, 'assets/audio/story_m4.mp3', 'Radio chatter must not stomp ongoing story narration');

// When story audio finishes, normal speech resumes
Voice.stop();
assert.strictEqual(Voice.isStoryPlaying(), false, 'isStoryPlaying resets to false on stop/end');
playedAudioSrc = null;
Voice.speak('LOA PHÒNG KHÔNG', 'Đồng bào chú ý!', true);
assert.strictEqual(playedAudioSrc, 'assets/audio/cue_air_raid.mp3', 'Voice cues work normally once story has concluded');

// Test Archive silence mode:
const screenArchive = getOrCreateElement('screen-archive');
if (screenArchive) {
    screenArchive.classList.add('is-open');
    assert.strictEqual(SoundEngine.isSilenced(), true, 'SoundEngine.isSilenced must be true when archive is open');
    assert.strictEqual(SoundFX.ensure(), false, 'SoundFX.ensure must return false when archive is open');
    playedAudioSrc = null;
    const playRes = Voice.playAudioFile('assets/audio/story_m1.mp3');
    assert.strictEqual(playRes, false, 'Voice.playAudioFile must return false and not play when archive is open');
    assert.strictEqual(playedAudioSrc, null, 'No audio file should play when archive is open');
    Voice.speak('SỞ CHỈ HUY', 'Bắn rơi B-52!', true);
    assert.strictEqual(playedAudioSrc, null, 'Voice.speak must be completely silent when archive is open');
    screenArchive.classList.remove('is-open');
    assert.strictEqual(SoundEngine.isSilenced(), false, 'SoundEngine.isSilenced must be false once archive is closed');
    assert.strictEqual(SoundFX.ensure(), true, 'SoundFX.ensure must return true once archive is closed');
}

console.log('ALL AUDIO & VOICE RUNNABLE CHECKS PASSED!');
