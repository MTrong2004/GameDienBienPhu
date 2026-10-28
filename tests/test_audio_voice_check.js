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
        getElementById: (id) => ({
            textContent: '',
            innerHTML: '',
            classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
            offsetWidth: 100
        }),
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

console.log('ALL AUDIO & VOICE RUNNABLE CHECKS PASSED!');
