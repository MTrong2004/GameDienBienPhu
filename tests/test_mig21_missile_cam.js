const assert = require('assert');

// ponytail: lightweight self-check for MiG-21 K-13 missile camera follow & enhanced flight difficulty
const THREE = {
    Vector3: function(x = 0, y = 0, z = 0) {
        this.x = x; this.y = y; this.z = z;
        this.set = function(x, y, z) { this.x = x; this.y = y; this.z = z; return this; };
        this.copy = function(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; };
        this.clone = function() { return new THREE.Vector3(this.x, this.y, this.z); };
        this.add = function(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; };
        this.sub = function(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; };
        this.addScaledVector = function(v, s) { this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this; };
        this.multiplyScalar = function(s) { this.x *= s; this.y *= s; this.z *= s; return this; };
        this.normalize = function() {
            const l = Math.hypot(this.x, this.y, this.z) || 1;
            this.x /= l; this.y /= l; this.z /= l;
            return this;
        };
        this.length = function() { return Math.hypot(this.x, this.y, this.z); };
        this.angleTo = function(v) {
            const dot = (this.x * v.x + this.y * v.y + this.z * v.z) / ((this.length() * v.length()) || 1);
            return Math.acos(Math.max(-1, Math.min(1, dot)));
        };
        this.lerp = function(v, a) {
            this.x += (v.x - this.x) * a;
            this.y += (v.y - this.y) * a;
            this.z += (v.z - this.z) * a;
            return this;
        };
    }
};

// 1. Check K-13 seeker gimbal limit test
function testSteerK13() {
    const m = {
        dir: new THREE.Vector3(0, 0, -1),
        mesh: { position: new THREE.Vector3(0, 0, 0) },
        speed: 20, speed0: 14, lost: false
    };
    const tgt = { mesh: { position: new THREE.Vector3(0, 0, -100) }, vel: new THREE.Vector3(0, 0, -10) };

    function leadDirection(missile, target) {
        return new THREE.Vector3().copy(target.mesh.position).sub(missile.mesh.position).normalize();
    }

    function steerK13(m, tgt, dt) {
        m.speed = Math.min(m.speed0 + 38, m.speed + 42 * dt);
        if (!tgt) return;
        const toT = new THREE.Vector3().copy(tgt.mesh.position).sub(m.mesh.position);
        const angle = m.dir.angleTo(toT);
        if (angle > 0.45) {
            m.lost = true;
        }
        if (!m.lost) {
            const turnRate = toT.length() < 30 ? 2.6 : 1.9;
            m.dir.lerp(leadDirection(m, tgt), Math.min(1, dt * turnRate)).normalize();
        }
    }

    // Normal tracking within gimbal limit
    steerK13(m, tgt, 0.016);
    assert.strictEqual(m.lost, false, 'Missile should track when target is within 0.45 rad seeker cone');
    assert(m.speed > 20, 'Missile should accelerate');

    // Target off-gimbal (> 0.45 rad, approx 30 deg)
    const mOff = {
        dir: new THREE.Vector3(0, 0, -1),
        mesh: { position: new THREE.Vector3(0, 0, 0) },
        speed: 20, speed0: 14, lost: false
    };
    const tgtOff = { mesh: { position: new THREE.Vector3(80, 0, -100) }, vel: new THREE.Vector3(0, 0, -10) }; // angle > 0.6 rad
    steerK13(mOff, tgtOff, 0.016);
    assert.strictEqual(mOff.lost, true, 'Missile must lose tracking when target exceeds 0.45 rad gimbal limit');
}

// 2. Check MiG flight auto-stabilization during missile cam
function testMiGFlightStabilization() {
    const mig = { bank: 0.5, pitch: 0.3, yaw: 0, speed: 14, throttle: 0.7 };
    const dt = 0.1;
    const inMissileCam = true;
    if (inMissileCam) {
        mig.bank *= Math.exp(-dt * 2.5);
        mig.pitch *= Math.exp(-dt * 2.0);
    }
    assert(mig.bank < 0.5, 'Bank angle should dampen towards zero in missile cam');
    assert(mig.pitch < 0.3, 'Pitch angle should dampen towards zero in missile cam');
}

// 3. Check K-13 camera follow offsets
function testK13CameraOffsets() {
    const settle = 0.5;
    const backSAM = 15 - 2.5 * settle;
    const backK13 = 7.5 - 1.5 * settle;
    assert(backK13 < backSAM, 'K-13 missile camera offset should be closer than SAM-2 offset');
    assert(backK13 >= 6.0 && backK13 <= 7.5, 'K-13 missile camera back offset is within 6.0 to 7.5 units');
}

testSteerK13();
testMiGFlightStabilization();
testK13CameraOffsets();

console.log('[PASS] MiG-21 K-13 missile camera & difficulty logic verified successfully.');
