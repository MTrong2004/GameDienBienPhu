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
            objs.forEach(o => { o.parent = this; this.children.push(o); });
            return this;
        },
        getObjectByName(name) {
            if (this.name === name) return this;
            for (const c of this.children) {
                if (c.getObjectByName) {
                    const found = c.getObjectByName(name);
                    if (found) return found;
                }
            }
            return null;
        },
        clone() { return createMockMesh(this.geometry, this.material); }
    };
    return mesh;
};

const THREE = {
    Group: function() { return createMockMesh(null, null); },
    Mesh: function(geo, mat) { return createMockMesh(geo, mat); },
    PointLight: function(col, intensity, dist) {
        const light = createMockMesh(null, null);
        light.isLight = true;
        return light;
    },
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
    ExtrudeBufferGeometry: function() {
        return {
            computeVertexNormals: () => {},
            getIndex: () => null,
            attributes: {
                position: {
                    count: 10,
                    getX: () => 0, getY: () => 0, getZ: () => 0,
                    setXYZ: () => {}, needsUpdate: false,
                    array: new Float32Array(30)
                }
            }
        };
    },
    BufferGeometry: function() {
        return {
            setAttribute: () => {},
            setIndex: () => {},
            computeVertexNormals: () => {}
        };
    },
    Float32BufferAttribute: function(arr, size) {
        this.array = arr;
        this.itemSize = size;
    },
    BoxGeometry: function() { return {}; },
    CylinderGeometry: function() { return {}; },
    ConeGeometry: function() { return {}; },
    SphereGeometry: function() { return {}; },
    TorusGeometry: function() { return {}; },
    PlaneGeometry: function() { return {}; },
    OctahedronGeometry: function() { return {}; },
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

// Self-Check Assertions
console.log('[TEST] Initializing HighPolyFactory textures...');
HighPolyFactory.initTextures();
assert(HighPolyFactory.textures.ready === true, 'Textures must be marked ready');
assert(HighPolyFactory.textures.vpafRoundel, 'VPAF Roundel decal must exist');
assert(HighPolyFactory.textures.mig5121Port, 'Hero #5121 Port decal must exist');
assert(HighPolyFactory.textures.mig5121Stbd, 'Hero #5121 Starboard decal must exist');

console.log('[TEST] Generating MiG-21bis 3D model...');
const mig21 = HighPolyFactory.createMiG21Bis();
assert(mig21 && mig21.children, 'MiG-21bis must be a valid 3D group');
assert(mig21.children.length >= 10, 'MiG-21bis must contain comprehensive multi-part hierarchy');

const plume = mig21.getObjectByName('afterburnerPlume');
assert(plume, 'Afterburner plume group must exist with name "afterburnerPlume"');
assert(plume.children.length >= 4, 'Afterburner plume must include multiple shock discs and lighting');

console.log('[TEST] Generating K-13 Atoll missile...');
const k13 = HighPolyFactory.createK13Missile();
assert(k13 && k13.children, 'K-13 missile must be a valid 3D group');
assert(k13.children.length >= 6, 'K-13 missile must contain body, warhead stripe, seeker, canards, and rollerons');

console.log('[PASS] MiG-21bis 3D model verification passed successfully!');
