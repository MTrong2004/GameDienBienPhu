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
        clone() {
            const c = createMockMesh(this.geometry, this.material);
            c.name = this.name;
            c.visible = this.visible;
            c.children = this.children.map(ch => ch.clone ? ch.clone() : ch);
            return c;
        }
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
    ExtrudeBufferGeometry: function() {
        return {
            computeVertexNormals: () => {},
            getIndex: () => null,
            attributes: {
                position: {
                    count: 10,
                    getX: () => 0, getY: () => 0, getZ: () => 0,
                    setXYZ: () => {}, needsUpdate: false,
                    array: new Float32Array(90)
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
    BufferAttribute: function(arr, size) {
        this.array = arr;
        this.itemSize = size;
    },
    BoxGeometry: function() { return {}; },
    CylinderGeometry: function() { return {}; },
    ConeGeometry: function() { return {}; },
    SphereGeometry: function() { return {}; },
    TorusGeometry: function() { return {}; },
    PlaneGeometry: function() { return {}; },
    CircleGeometry: function() { return {}; },
    MeshBasicMaterial: function(cfg) { Object.assign(this, cfg); },
    MeshStandardMaterial: function(cfg) { Object.assign(this, cfg); },
    CanvasTexture: function(c) {
        this.canvas = c;
        this.repeat = { set: () => {} };
        this.anisotropy = 1;
    },
    DoubleSide: 2,
    BackSide: 1,
    AdditiveBlending: 2,
    RepeatWrapping: 1000
};

const mockCanvas = () => ({
    width: 1024, height: 1024,
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
console.log('[TEST] Initializing HighPolyFactory textures for B-52...');
HighPolyFactory.initTextures();
assert(HighPolyFactory.textures.ready === true, 'Textures must be marked ready');
assert(HighPolyFactory.textures.b52Camo, 'B-52 SEA Camouflage texture must exist');
assert(HighPolyFactory.textures.b52Belly, 'B-52 Night Black belly texture must exist');

console.log('[TEST] Generating Boeing B-52G Stratofortress 3D model...');
const b52 = HighPolyFactory.createB52G();
assert(b52 && b52.children, 'B-52 must be a valid 3D group');
assert(b52.children.length >= 15, `B-52 model hierarchy should contain detailed components (found ${b52.children.length})`);

// jamAura check
const jamAura = b52.getObjectByName('jamAura');
assert(jamAura, 'jamAura object must exist on B-52 model');
assert.strictEqual(jamAura.visible, false, 'jamAura must be initially hidden');

// Caching check
const b52Clone = HighPolyFactory.createB52G();
assert(b52Clone && b52Clone.children, 'Cloned B-52 must be valid');
assert(b52 !== b52Clone, 'HighPolyFactory must return a clone from cache');
assert.strictEqual(b52Clone.children.length, b52.children.length, 'Clone must have identical child count');

console.log('[PASS] B-52 3D model verification passed successfully!');
