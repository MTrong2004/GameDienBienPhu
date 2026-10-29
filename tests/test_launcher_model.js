const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Minimal Three.js and Canvas Mock for Headless Unit Verification
const createMockMesh = (geo, mat) => {
    const mesh = {
        isMesh: true,
        geometry: geo,
        material: mat,
        position: { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } },
        rotation: { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } },
        scale: { x: 1, y: 1, z: 1, set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } },
        children: [],
        add(...objs) {
            objs.forEach(o => { if (o) { o.parent = this; this.children.push(o); } });
            return this;
        },
        clone() { return createMockMesh(this.geometry, this.material); }
    };
    return mesh;
};

const THREE = {
    Group: function() { return createMockMesh(null, null); },
    Mesh: function(geo, mat) { return createMockMesh(geo, mat); },
    Vector2: function(x, y) { this.x = x; this.y = y; },
    Vector3: function(x, y, z) { this.x = x; this.y = y; this.z = z; },
    SplineCurve: function(pts) { this.getPoints = () => pts; },
    Shape: function() {
        return {
            moveTo: () => {}, bezierCurveTo: () => {}, lineTo: () => {}, closePath: () => {}
        };
    },
    LatheBufferGeometry: function() {
        return {
            rotateX: () => {},
            computeVertexNormals: () => {},
            attributes: {
                position: {
                    count: 10,
                    getX: () => 0, getY: () => 0, getZ: () => 0,
                    setXYZ: () => {}, needsUpdate: false
                }
            }
        };
    },
    CircleGeometry: function() { return {}; },
    ExtrudeGeometry: function() {
        return { center: () => {}, computeVertexNormals: () => {}, getIndex: () => null, attributes: { position: { count: 10, getX: () => 0, getY: () => 0, getZ: () => 0, setXYZ: () => {}, needsUpdate: false, array: new Float32Array(30) } } };
    },
    ExtrudeBufferGeometry: function() {
        return { center: () => {}, computeVertexNormals: () => {}, getIndex: () => null, attributes: { position: { count: 10, getX: () => 0, getY: () => 0, getZ: () => 0, setXYZ: () => {}, needsUpdate: false, array: new Float32Array(30) } } };
    },
    BoxGeometry: function() { return {}; },
    CylinderGeometry: function() { return {}; },
    ConeGeometry: function() { return {}; },
    SphereGeometry: function() { return {}; },
    TorusGeometry: function() { return {}; },
    MeshBasicMaterial: function(cfg) { Object.assign(this, cfg); },
    MeshStandardMaterial: function(cfg) { Object.assign(this, cfg); },
    CanvasTexture: function(c) { this.canvas = c; this.repeat = { set: () => {} }; },
    DoubleSide: 2,
    RepeatWrapping: 1000
};

const mockCanvas = () => ({
    width: 256, height: 256,
    getContext: () => ({
        fillStyle: '', strokeStyle: '', lineWidth: 1, font: '',
        fillRect: () => {}, strokeRect: () => {}, strokeText: () => {}, fillText: () => {},
        beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {}, fill: () => {},
        arc: () => {}, closePath: () => {}, bezierCurveTo: () => {},
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
        save: () => {}, restore: () => {}, translate: () => {}, setLineDash: () => {}
    })
});

global.THREE = THREE;
global.document = { createElement: (tag) => (tag === 'canvas' ? mockCanvas() : {}) };

// Load 01_mesh_factory.js
const meshFactoryCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', '01_mesh_factory.js'), 'utf8');
const factoryEval = new Function('THREE', 'document', `${meshFactoryCode}; return HighPolyFactory;`);
const HighPolyFactory = factoryEval(THREE, global.document);

console.log('[TEST] Initializing HighPolyFactory launcher textures...');
HighPolyFactory.initTextures();
assert(HighPolyFactory.textures.ready === true, 'Textures must be marked ready');
assert(HighPolyFactory.textures.launcherStencils, 'Launcher stencils texture must exist');
assert(HighPolyFactory.textures.treadPlate, 'Tread plate texture must exist');
assert(HighPolyFactory.textures.blastSoot, 'Blast deflector soot texture must exist');

console.log('[TEST] Generating SM-63 Launcher Battery 3D model...');
const launcher = HighPolyFactory.createSM63LauncherBattery();
assert(launcher && typeof launcher === 'object', 'Launcher battery must return an object');
assert(launcher.root && launcher.root.children, 'launcher.root must be a valid 3D group');
assert(launcher.yawTurntable && launcher.yawTurntable.children, 'launcher.yawTurntable must be a valid 3D group');
assert(launcher.pitchBoom && launcher.pitchBoom.children, 'launcher.pitchBoom must be a valid 3D group');
assert(launcher.loadedMissile, 'launcher.loadedMissile must be defined');

// Verify structural complexity:
// root contains pedestal hub, cable conduit, distribution box, 4 outrigger arms, and yawTurntable
assert(launcher.root.children.length >= 7, 'launcher.root must have pedestal hub, junction, cables and 4 outrigger arms');

// yawTurntable contains traverse ring, drum, deck, stanchions, torque tube, catwalk, control console, and pitchBoom
assert(launcher.yawTurntable.children.length >= 8, 'launcher.yawTurntable must have deck, stanchions, catwalk, console, pitchBoom');

// pitchBoom contains girder, top deck, guide rails, center channel, blast deflector, hydraulic cylinders, forward yoke, booster stops, umbilical arm, gear quadrant, counterweight, and loaded missile
assert(launcher.pitchBoom.children.length >= 12, 'launcher.pitchBoom must have launch girder, rails, blast deflector, hydraulics, forward yoke, umbilical, and missile');

// Verify loaded missile positioning
assert.strictEqual(launcher.loadedMissile.position.y, 0.95, 'Missile must sit at y = 0.95 atop launcher rail');
assert.strictEqual(launcher.loadedMissile.position.z, -0.4, 'Missile must sit at z = -0.4 on rail');

console.log('[PASS] SM-63 Launcher Battery 3D model verification passed successfully!');
