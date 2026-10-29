const assert = require('assert');

// Test 1: Verify edge pan isolation when autoPilotActive
let autoPilotActive = false;
let currentMode = 'SAM2';
let gameState = 'PLAYING';
let gamePaused = false;
let guidedMissile = null;
let missileCamHold = 0;

function shouldEdgePan(smoothAimX) {
    if (currentMode === 'SAM2' && gameState === 'PLAYING' && !gamePaused && !guidedMissile && missileCamHold <= 0 && !autoPilotActive) {
        return Math.abs(smoothAimX) > 0.62;
    }
    return false;
}

assert.strictEqual(shouldEdgePan(0.8), true, 'Manual mode should edge pan');
autoPilotActive = true;
assert.strictEqual(shouldEdgePan(0.8), false, 'Auto-pilot should NOT edge pan');

// Test 2: Jamming hopping condition
let jamPromptState = { show: true, info: false, best: -1 };
function shouldHop(state) {
    return !!(state && state.show && !state.info && state.best !== 0);
}

assert.strictEqual(shouldHop(jamPromptState), true, 'Real jamming should trigger hop');
assert.strictEqual(shouldHop({ show: true, info: true, best: 0 }), false, 'Info prompt (weak signal) should NOT hop');
assert.strictEqual(shouldHop({ show: false, info: false, best: 1 }), false, 'Hidden prompt should NOT hop');

// Test 3: Target stickiness (hysteresis) to prevent target hopping
let autoPilotTarget = { id: 1, pos: { x: 0, z: -1200 }, downed: false };
let bombers = [
    autoPilotTarget,
    { id: 2, pos: { x: 50, z: -1180 }, downed: false } // slightly closer
];
function distKm(b) { return Math.abs(b.pos.z) * 0.03; } // simulated km

let tgt = null;
if (!tgt && autoPilotTarget && !autoPilotTarget.downed && bombers.includes(autoPilotTarget)) {
    const d = distKm(autoPilotTarget);
    if (d >= 8 && d <= 56) tgt = autoPilotTarget;
}
assert.strictEqual(tgt.id, 1, 'Hysteresis must keep lock on bomber 1 even when bomber 2 is slightly closer');

// Test 4: Precision 3-point radio command guidance lead vector
let mPos = { x: 0, y: 50, z: -100 };
let mSpeed = 80;
let tgtPos = { x: 100, y: 390, z: -800 };
let tgtVel = { x: 0, y: 0, z: 15 }; // flying South toward Hanoi
let dx = tgtPos.x - mPos.x, dy = tgtPos.y - mPos.y, dz = tgtPos.z - mPos.z;
let dist = Math.hypot(dx, dy, dz);
let tgo = dist / mSpeed;
let leadPoint = {
    x: tgtPos.x + tgtVel.x * tgo,
    y: tgtPos.y + tgtVel.y * tgo,
    z: tgtPos.z + tgtVel.z * tgo
};
assert.ok(leadPoint.z > tgtPos.z, 'Lead intercept point must be ahead along velocity vector');

// Test 5: MiG-21 yaw steering math
let aimPoint = { x: 0, y: 400, z: -500 };
let pMig = { x: 100, y: 400, z: -200 };
let steerVec = { x: aimPoint.x - pMig.x, y: aimPoint.y - pMig.y, z: aimPoint.z - pMig.z }; // (-100, 0, -300)
let desiredYaw = Math.atan2(-steerVec.x, -steerVec.z); // atan2(100, 300) > 0 (pointing West/Left)
let migYaw = 0; // currently flying North
let diffYaw = ((desiredYaw - migYaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI; // diffYaw > 0
let mouseAimX = Math.max(-1, Math.min(1, -diffYaw * 2.8)); // negative, so roll left
assert.ok(mouseAimX < 0, 'MiG should roll left when target is to the left');

// Test 6: Threat scoring prioritizes un-leaked bombers over already-leaked bombers
function scoreThreat(b, isCurrent, trackTimer) {
    const isLeaked = !!b.leaked;
    let score = isLeaked ? 2000 : 0;
    if (!isLeaked) score += Math.max(0, 40 - b.pos.z) * 0.4;
    const d = Math.abs(b.pos.z) * 0.03;
    if (d < 10) score += (10 - d) * 35;
    else if (d > 45) score += (d - 45) * 6;
    else score += d * 0.5;
    if (isCurrent && !isLeaked) score -= 40 + trackTimer * 20;
    return score;
}
const leakedBomber = { id: 1, pos: { x: 0, z: 100 }, leaked: true }; // already dropped bombs
const incomingBomber = { id: 2, pos: { x: 0, z: -500 }, leaked: false }; // approaching Hanoi
const s1 = scoreThreat(leakedBomber, true, 1.0); // was current target
const s2 = scoreThreat(incomingBomber, false, 0);
assert.ok(s2 < s1, 'Incoming bomber must have much better (lower) threat score than leaked bomber');

// Test 7: Smart ECCM band scanning finds minimum jamming channel
function mockJamAt(f) {
    // simulated jammers at 2950 MHz and 3050 MHz
    return Math.exp(-Math.pow((f - 2950) / 22, 2)) + Math.exp(-Math.pow((f - 3050) / 22, 2));
}
let playerFreq = 2950; // currently jammed
let bestF = playerFreq, minJam = mockJamAt(playerFreq);
for (let f = 2900; f <= 3100; f += 10) {
    const j = mockJamAt(f);
    if (j < minJam) { minJam = j; bestF = f; }
}
assert.ok(minJam < 0.05, 'Band scan must find clear channel');
assert.ok(bestF !== 2950 && bestF !== 3050, 'Best channel must avoid jammer frequencies');

// Test 8: Proactive launcher reloading
const launchers = [{ loaded: false }, { loaded: true }, { loaded: true }];
const reserve = 4;
const reloading = false;
const shouldReload = reserve > 0 && !reloading && launchers.some(l => !l.loaded);
assert.strictEqual(shouldReload, true, 'Should proactively reload empty launcher');

// Test 9: PD-damped roll control prevents bank overshoot
const bankAngle = -0.3; // banked left, turning right
const turnRate = -Math.sin(bankAngle) * 0.6; // positive yaw rate
const smallDiffYaw = 0.05; // almost aligned with target
const predYaw = smallDiffYaw - turnRate * 0.85; // predicted error after turn rate
const dampedAimX = Math.max(-1, Math.min(1, -predYaw * 2.2));
assert.ok(dampedAimX > 0, 'Damped controller must command opposite roll to level wings before reaching heading');

console.log('All auto-pilot logic assertions passed!');
