const assert = require('assert');

// Launcher #03 origin
const LAUNCHER_X = 2.8, LAUNCHER_Z = 20.5;
const ARC_R = 21, ARC_SPAN = 2.8, NUM_BAGS = 38;
const STEP = ARC_SPAN / (NUM_BAGS - 1);

// Generate all sandbag positions
const bags = [];
for (let row = 0; row < 4; row++) {
    const r = ARC_R - row * 0.08, y = 0.35 + row * 0.48;
    for (let i = 0; i < NUM_BAGS; i++) {
        const phi = -ARC_SPAN / 2 + (i + (row % 2) * 0.5) * STEP;
        const x = LAUNCHER_X + r * Math.sin(phi);
        const z = LAUNCHER_Z + r * Math.cos(phi);
        bags.push({ x, y, z });
    }
}

assert.strictEqual(bags.length, 4 * 38, 'Should have 152 sandbags');

// Test camera clearance in DECK and REVETMENT presets across pitch and yaw
const presets = [
    { name: 'DECK', back: 15, lift: 3.0, side: -2.6 },
    { name: 'REVETMENT', back: 18, lift: 1.6, side: -4.2 }
];

let minClearance = Infinity;

for (const p of presets) {
    for (let yaw = -Math.PI; yaw <= Math.PI; yaw += 0.2) {
        for (let pitch = 0.04; pitch <= 1.54; pitch += 0.1) {
            const cp = Math.cos(pitch), sp = Math.sin(pitch), sy = Math.sin(yaw), cy = Math.cos(yaw);
            const look = { x: -sy * cp, y: sp, z: -cy * cp };
            const up = { x: sy * sp, y: cp, z: cy * sp };
            const right = { x: cy, y: 0, z: -sy };

            // Tail anchor around launcher nose
            const tail = { x: LAUNCHER_X, y: 2.5, z: LAUNCHER_Z - 2.5 };

            let camX = tail.x - look.x * p.back + up.x * p.lift + right.x * p.side;
            let camY = tail.y - look.y * p.back + up.y * p.lift + right.y * p.side;
            let camZ = tail.z - look.z * p.back + up.z * p.lift + right.z * p.side;

            if (camY < 1.4 && look.y > 0.05) {
                const f = (1.4 - camY) / look.y;
                camX += look.x * f;
                camY += look.y * f;
                camZ += look.z * f;
            }

            for (const b of bags) {
                const dist = Math.hypot(camX - b.x, camY - b.y, camZ - b.z);
                if (dist < minClearance) minClearance = dist;
            }
        }
    }
}

console.log('Minimum camera clearance from any sandbag:', minClearance.toFixed(2), 'units');
assert(minClearance > 2.0, `Camera clearance too small: ${minClearance}`);
console.log('Sandbag arc geometry test PASSED!');
