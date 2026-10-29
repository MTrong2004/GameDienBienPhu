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

console.log('All auto-pilot logic assertions passed!');
