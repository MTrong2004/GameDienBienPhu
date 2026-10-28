const fs = require('fs');
const assert = require('assert');

// Simple mock environment
const THREE = {
    Vector3: function(x=0,y=0,z=0) {
        this.x = x; this.y = y; this.z = z;
        this.copy = function(v){ this.x=v.x;this.y=v.y;this.z=v.z; return this; }; this.set = function(x,y,z){ this.x=x;this.y=y;this.z=z; return this; };
        this.clone = function(){ return new THREE.Vector3(this.x,this.y,this.z); };
        this.add = function(v){ this.x+=v.x;this.y+=v.y;this.z+=v.z; return this; };
        this.sub = function(v){ this.x-=v.x;this.y-=v.y;this.z-=v.z; return this; };
        this.addScaledVector = function(v,s){ this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s; return this; };
        this.multiplyScalar = function(s){ this.x*=s;this.y*=s;this.z*=s; return this; };
        this.normalize = function(){ return this; };
        this.length = function(){ return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z); };
        this.angleTo = function(){ return 0.05; };
        this.applyEuler = function(){ return this; };
    },
    CylinderGeometry: function(){},
    MeshBasicMaterial: function(){},
    Mesh: function(g,m){
        this.position = new THREE.Vector3();
        this.quaternion = { setFromUnitVectors: function(){} };
    },
    MathUtils: { radToDeg: function(r){ return r * 180 / Math.PI; } },
    AdditiveBlending: 1
};

global.THREE = THREE;
global.WORLD_UP = new THREE.Vector3(0,1,0);
global._tmpV2 = new THREE.Vector3();
global.worldCombatGroup = { add: function(){} };
global.gunTracers = [];
global.tracerGeo = null;
global.tracerMat = null;
global.cameraShake = 0;
global.SoundFX = { gunBurst: function(){} };
global.showRadio = function(){};
global.updateObjectiveHud = function(){};
global.gameState = 'PLAYING';
global.currentMode = 'MIG21';
global.playerMiG21 = {
    position: new THREE.Vector3(0, 400, 0),
    rotation: { x:0, y:0, z:0 }
};
global.mig = {
    fwd: new THREE.Vector3(0, 0, -1),
    cannonAmmo: 200,
    lastCannonFire: -10,
    target: null
};
global.activeBombers = [];

// Load fireMiGCannon code from index.html
const html = fs.readFileSync('index.html', 'utf8');
const fnCode = html.match(/function fireMiGCannon\(\)\s*\{[\s\S]*?\n        \}/)[0];
eval(fnCode);

console.log('Testing fireMiGCannon execution...');
assert.strictEqual(mig.cannonAmmo, 200);

// Fire first burst
fireMiGCannon();
assert.strictEqual(mig.cannonAmmo, 190, 'Ammo should decrement by 10');
assert.strictEqual(gunTracers.length, 2, 'Should spawn 2 tracers for twin barrels');

// Test cooldown (less than 120ms)
fireMiGCannon();
assert.strictEqual(mig.cannonAmmo, 190, 'Should not fire during cooldown');

// Advance time past cooldown
mig.lastCannonFire -= 1;
fireMiGCannon();
assert.strictEqual(mig.cannonAmmo, 180, 'Should fire again after cooldown');

console.log('✓ fireMiGCannon passed all behavioral unit assertions!');
