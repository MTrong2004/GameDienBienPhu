const assert = require('assert');
const fs = require('fs');
const path = require('path');

const src4 = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', '04_cockpit_radar_hangar.js'), 'utf8');
const src5 = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', '05_combat_simulation.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// 1. Verify shockwave functions exist
assert(src4.includes('function spawnMissileShockRing('), 'spawnMissileShockRing must be defined');
assert(src4.includes('function spawnGroundShockwave('), 'spawnGroundShockwave must be defined');
assert(src4.includes('function triggerLaunchFlash('), 'triggerLaunchFlash must be defined');
assert(src4.includes('isShockwave'), 'explosionParticles loop must handle isShockwave');

// 2. Verify dynamic rocket plume illumination follows missile
assert(src4.includes('hotMissile'), 'launchPadLight must dynamically track hotMissile');

// 3. Verify launch calls trigger dramatic effects
assert(src5.includes('spawnMissileShockRing(origin, m.dir'), 'launchSamMissile must spawn supersonic shock ring');
assert(src5.includes('triggerLaunchFlash();'), 'SAM launch must trigger launch flash');
assert(src5.includes('spawnMissileShockRing(m.mesh.position'), 'updateMissiles must periodically spawn shock rings during boost');

// 4. Verify compiled index.html has identical functionality
assert(indexHtml.includes('function spawnMissileShockRing('), 'index.html must contain spawnMissileShockRing');
assert(indexHtml.includes('function spawnGroundShockwave('), 'index.html must contain spawnGroundShockwave');

console.log('[PASS] Missile launch dramatic effects verification passed successfully!');
