        /* ============================================================================
           3. MAIN THREE.JS SCENE, 2048x2048 HANOI NIGHT MAP, RAIN & VOLUMETRICS
           ============================================================================ */
        let scene, camera, renderer, composer, bloomPass;
        let worldCombatGroup, hangarStudioGroup, hangarPivot, tacticalMap3DGroup;
        let samBatteryObj, fanSongObj, playerMiG21;
        let searchlightCones = [];
        let volumetricClouds = [];
        let aaaTracerLines = [];
        let rainGeo, rainSystem;
        let skyFlashLight, launchPadLight;
        let skyDome, skyUniforms, cinematicGradePass;
        let campaignMinutes = 20 * 60;
        let lastClockText = '';
        let sparkSystem, sparkData = [];
        let lightningLevel = 0, lightningTimer = 4;

        /* ============================================================================
           3A. CINEMATIC LOOK: STORM SKY DOME, COLOR GRADE, SHADER SEARCHLIGHTS, SPARKS
           ============================================================================ */
        const GLSL_NOISE = `
            float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
            float noise(vec2 p) {
                vec2 i = floor(p), f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                           mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
            }
            float fbm(vec2 p) {
                float v = 0.0, a = 0.5;
                for (int i = 0; i < 6; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
                return v;
            }
        `;

        // Film-style grade: teal shadows / amber highlights, vignette, grain, light chromatic aberration
        const CinematicGradeShader = {
            uniforms: {
                tDiffuse: { value: null },
                uTime: { value: 0 },
                uVignette: { value: 1.15 },
                uGrain: { value: 0.04 },
                uAberration: { value: 0.0011 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float uTime, uVignette, uGrain, uAberration;
                varying vec2 vUv;
                void main() {
                    vec2 c = vUv - 0.5;
                    float r2 = dot(c, c);
                    vec3 col;
                    col.r = texture2D(tDiffuse, vUv + c * uAberration * 4.0).r;
                    col.g = texture2D(tDiffuse, vUv).g;
                    col.b = texture2D(tDiffuse, vUv - c * uAberration * 4.0).b;
                    float l = dot(col, vec3(0.299, 0.587, 0.114));
                    col = mix(col, col * vec3(0.84, 0.98, 1.14), (1.0 - smoothstep(0.0, 0.45, l)) * 0.55);
                    col = mix(col, col * vec3(1.14, 1.0, 0.84), smoothstep(0.35, 1.0, l) * 0.45);
                    col = (col - 0.5) * 1.07 + 0.5;
                    col *= 1.0 - r2 * uVignette;
                    float g = fract(sin(dot(vUv * vec2(1920.0, 1080.0) + uTime * 61.0, vec2(12.9898, 78.233))) * 43758.5453);
                    col += (g - 0.5) * uGrain;
                    gl_FragColor = vec4(max(col, 0.0), 1.0);
                }
            `
        };

        // Procedural thunderstorm sky (replaced by assets/sky_night_panorama.jpg when present)
        function buildStormSkyDome() {
            skyUniforms = {
                uTime: { value: 0 },
                uFlash: { value: 0 },
                uPano: { value: null },
                uUsePano: { value: 0 },
                uPanoGain: { value: 0.9 }
            };
            const mat = new THREE.ShaderMaterial({
                uniforms: skyUniforms,
                side: THREE.BackSide,
                depthWrite: false,
                fog: false,
                vertexShader: `
                    varying vec3 vDir;
                    void main() {
                        vDir = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float uTime, uFlash, uUsePano, uPanoGain;
                    uniform sampler2D uPano;
                    varying vec3 vDir;
                    ${GLSL_NOISE}
                    void main() {
                        vec3 d = normalize(vDir);
                        if (uUsePano > 0.5) {
                            vec2 puv = vec2(atan(d.z, d.x) / 6.2831853 + 0.5, asin(clamp(d.y, -1.0, 1.0)) / 3.14159265 + 0.5);
                            gl_FragColor = vec4(texture2D(uPano, puv).rgb * uPanoGain * (1.0 + uFlash * 0.7), 1.0);
                            return;
                        }
                        float h = max(d.y, 0.0);
                        vec3 col = mix(vec3(0.055, 0.07, 0.095), vec3(0.014, 0.02, 0.036), pow(h, 0.45));
                        col += vec3(0.62, 0.27, 0.07) * exp(-h * 16.0) * 0.32;
                        vec2 cuv = d.xz / (h + 0.12) * 1.5 + vec2(uTime * 0.012, uTime * 0.005);
                        float c1 = fbm(cuv);
                        float c2 = fbm(cuv * 2.3 + 7.0);
                        float cloud = smoothstep(0.36, 0.86, c1 * 0.78 + c2 * 0.34);
                        vec3 cloudCol = mix(vec3(0.035, 0.045, 0.06), vec3(0.15, 0.16, 0.19), c2);
                        cloudCol += vec3(0.5, 0.22, 0.06) * exp(-h * 5.0) * 0.45;
                        cloudCol += vec3(0.85, 0.82, 1.0) * uFlash * c2 * 1.1;
                        col = mix(col, cloudCol, cloud * smoothstep(-0.02, 0.1, d.y));
                        col = mix(col, vec3(0.02, 0.022, 0.028), smoothstep(0.0, -0.1, d.y));
                        gl_FragColor = vec4(col, 1.0);
                    }
                `
            });
            skyDome = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), mat);
            skyDome.renderOrder = -10;
            scene.add(skyDome);
        }

        // Volumetric-looking beam: bright at the lamp, soft edges, fades with length, drifting dust
        function makeSearchlightMaterial(colorHex, intensity) {
            return new THREE.ShaderMaterial({
                uniforms: {
                    uColor: { value: new THREE.Color(colorHex) },
                    uIntensity: { value: intensity },
                    uTime: { value: 0 }
                },
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                vertexShader: `
                    varying float vH;
                    varying vec3 vN;
                    varying vec3 vView;
                    varying vec2 vRadial;
                    void main() {
                        vH = position.y / 118.0;
                        vRadial = position.xz;
                        vN = normalize(normalMatrix * normal);
                        vec4 mv = modelViewMatrix * vec4(position, 1.0);
                        vView = normalize(-mv.xyz);
                        gl_Position = projectionMatrix * mv;
                    }
                `,
                fragmentShader: `
                    uniform vec3 uColor;
                    uniform float uIntensity, uTime;
                    varying float vH;
                    varying vec3 vN;
                    varying vec3 vView;
                    varying vec2 vRadial;
                    ${GLSL_NOISE}
                    void main() {
                        float edge = pow(abs(dot(normalize(vN), normalize(vView))), 2.2);
                        float along = smoothstep(0.0, 0.03, vH) * pow(1.0 - vH, 1.8) * (0.35 + 0.65 * exp(-vH * 3.0));
                        float dust = 0.6 + 0.4 * fbm(vec2(atan(vRadial.y, vRadial.x) * 2.0, vH * 9.0 - uTime * 0.35));
                        float a = uIntensity * edge * along * dust;
                        gl_FragColor = vec4(uColor * a, 1.0);
                    }
                `
            });
        }

        // Pooled additive spark particles (launch blast + explosions)
        function buildSparkSystem() {
            const MAX = 600;
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX * 3), 3));
            geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MAX * 3), 3));
            const mat = new THREE.PointsMaterial({
                size: 0.42,
                map: HighPolyFactory.textures.sparkSprite,
                vertexColors: true,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
            sparkSystem = new THREE.Points(geo, mat);
            sparkSystem.frustumCulled = false;
            worldCombatGroup.add(sparkSystem);
            for (let i = 0; i < MAX; i++) sparkData.push({ life: 0, max: 1, vel: new THREE.Vector3() });
        }

        function spawnSparks(origin, count, speed, upBias = 0.5) {
            const pos = sparkSystem.geometry.attributes.position.array;
            let spawned = 0;
            for (let i = 0; i < sparkData.length && spawned < count; i++) {
                const s = sparkData[i];
                if (s.life > 0) continue;
                s.max = s.life = 0.6 + Math.random() * 1.1;
                s.vel.set((Math.random() - 0.5) * 2, Math.random() * 2 * upBias + (1 - upBias) * (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2)
                    .normalize().multiplyScalar(speed * (0.35 + Math.random() * 0.65));
                pos[i * 3] = origin.x; pos[i * 3 + 1] = origin.y; pos[i * 3 + 2] = origin.z;
                spawned++;
            }
        }

        function updateSparks(dt) {
            if (!sparkSystem) return;
            const pos = sparkSystem.geometry.attributes.position.array;
            const col = sparkSystem.geometry.attributes.color.array;
            for (let i = 0; i < sparkData.length; i++) {
                const s = sparkData[i];
                if (s.life <= 0) { col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = 0; continue; }
                s.life -= dt;
                s.vel.y -= 9.8 * dt;
                s.vel.multiplyScalar(1 - dt * 0.8);
                pos[i * 3] += s.vel.x * dt; pos[i * 3 + 1] += s.vel.y * dt; pos[i * 3 + 2] += s.vel.z * dt;
                const k = Math.max(0, s.life / s.max);
                col[i * 3] = 1.0 * k; col[i * 3 + 1] = 0.62 * k * k; col[i * 3 + 2] = 0.22 * k * k * k;
            }
            sparkSystem.geometry.attributes.position.needsUpdate = true;
            sparkSystem.geometry.attributes.color.needsUpdate = true;
        }

        /* ============================================================================
           3B. OPTIONAL AI-GENERATED ASSETS (Copilot) — see assets/COPILOT_PROMPTS.md
           Every asset is optional: missing files silently keep the procedural look.
           ============================================================================ */
        const AI_ASSET_FILES = {
            sky: 'assets/sky_night_panorama.jpg',
            skyline: 'assets/skyline_hanoi_1972.png',
            smoke: 'assets/smoke_puff.png',
            fire: 'assets/fire_flare.png',
            crate: 'assets/crate_s75.jpg',
            sandbag: 'assets/sandbag.jpg',
            ground: 'assets/ground_concrete_wet.jpg'
        };

        /* ============================================================================
           3C. OPTIONAL REAL 3D MODELS (.glb) — see assets/models/HUONG_DAN_MO_HINH.md
           Each file replaces the procedural model of the same key. The model is rotated by
           `rotate` (degrees, applied X then Y then Z), then scaled so its nose-to-tail length
           along +Z matches the procedural model, and centred on it — gameplay distances,
           cameras and hit boxes stay the same. Nose must end up pointing +Z.
           ============================================================================ */
        const GLB_MODEL_FILES = {
            MIG21: { file: 'assets/models/mig21.glb', rotate: [0, 0, 0] },
            B52:   { file: 'assets/models/b52.glb',   rotate: [0, 0, 0] },
            SAM2:  { file: 'assets/models/sa2_missile.glb', rotate: [0, 0, 0] },
            RADAR: { file: 'assets/models/fan_song_radar.glb', rotate: [0, 0, 0] }
        };

        const PROCEDURAL_BUILDERS = {
            MIG21: () => HighPolyFactory.createMiG21Bis(),
            B52: () => HighPolyFactory.createB52G(),
            SAM2: () => HighPolyFactory.createSAM2Missile(),
            RADAR: () => HighPolyFactory.createFanSongRadar()
        };

        // Bounding box ignoring effect meshes (plumes, auras) so we match the airframe only
        function solidBounds(obj) {
            obj.updateMatrixWorld(true);
            const box = new THREE.Box3();
            obj.traverse(o => {
                if (!o.isMesh || o.name === 'jamAura') return;
                let p = o, fx = false;
                while (p) { if (p.name === 'afterburnerPlume') fx = true; p = p.parent; }
                if (fx || (o.material && o.material.blending === THREE.AdditiveBlending)) return;
                box.expandByObject(o);
            });
            return box;
        }

        function normalizeGLBModel(key, gltfScene, rotateDeg) {
            const cfg = rotateDeg || [0, 0, 0];
            const inner = new THREE.Group();
            inner.add(gltfScene);
            inner.rotation.set(...cfg.map(d => THREE.MathUtils.degToRad(d)), 'XYZ');

            // reference = procedural model built before any custom model is registered
            const saved = HighPolyFactory.customGLBModels[key];
            delete HighPolyFactory.customGLBModels[key];
            const reference = PROCEDURAL_BUILDERS[key]();
            if (saved) HighPolyFactory.customGLBModels[key] = saved;

            const refBox = solidBounds(reference);
            const refSize = refBox.getSize(new THREE.Vector3());
            const box = solidBounds(inner);
            const size = box.getSize(new THREE.Vector3());
            const refLen = key === 'RADAR' ? Math.max(refSize.x, refSize.y, refSize.z) : refSize.z;
            const len = key === 'RADAR' ? Math.max(size.x, size.y, size.z) : size.z;
            const scale = refLen / Math.max(len, 1e-4);

            const wrapper = new THREE.Group();
            inner.scale.setScalar(scale);
            const c = box.getCenter(new THREE.Vector3()).multiplyScalar(scale);
            const refC = refBox.getCenter(new THREE.Vector3());
            inner.position.copy(refC).sub(c);
            if (key === 'RADAR') inner.position.y = refBox.min.y - box.min.y * scale; // stand on the ground
            wrapper.add(inner);

            gltfScene.traverse(o => {
                if (!o.isMesh) return;
                o.castShadow = true;
                o.receiveShadow = true;
                const mats = Array.isArray(o.material) ? o.material : [o.material];
                mats.forEach(m => { if (m && 'envMapIntensity' in m) m.envMapIntensity = 0.8; });
            });

            // keep gameplay effects from the procedural model (jamming haze, afterburner, radar head)
            ['jamAura', 'afterburnerPlume'].forEach(name => {
                const part = reference.getObjectByName(name);
                if (part) wrapper.add(part);
            });
            wrapper.userData.glbKey = key;
            return wrapper;
        }

        function makeGLTFLoader() {
            const loader = new THREE.GLTFLoader();
            if (typeof THREE.DRACOLoader !== 'undefined') {
                const draco = new THREE.DRACOLoader();
                draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/');
                loader.setDRACOLoader(draco);
            }
            return loader;
        }

        // Called before the scene is built so every spawn uses the real models
        async function loadOptionalGLBModels() {
            if (location.protocol === 'file:' || typeof THREE.GLTFLoader === 'undefined') return;
            HighPolyFactory.initTextures();
            const loader = makeGLTFLoader();
            const loaded = [];
            await Promise.all(Object.entries(GLB_MODEL_FILES).map(([key, cfg]) =>
                new Promise(resolve => {
                    loader.load(cfg.file, gltf => {
                        try {
                            HighPolyFactory.customGLBModels[key] = normalizeGLBModel(key, gltf.scene, cfg.rotate);
                            loaded.push(key);
                        } catch (e) {
                            console.warn(`[models] Lỗi xử lý ${cfg.file}:`, e);
                        }
                        resolve();
                    }, undefined, () => resolve());
                })
            ));
            console.info('[models] Đã nạp mô hình .glb:', loaded.length ? loaded.join(', ') : '(không có file nào, dùng mô hình thủ tục)');
        }

        function loadAssetImage(path) {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = path;
            });
        }

        // mode 'luma': white-on-black sprite -> alpha from brightness; 'chroma': remove pure green background
        function imageToAlphaCanvas(img, mode) {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, c.width, c.height);
            const px = data.data;
            for (let i = 0; i < px.length; i += 4) {
                const r = px[i], g = px[i + 1], b = px[i + 2];
                if (mode === 'luma') {
                    const l = Math.max(r, g, b);
                    px[i + 3] = l;
                    if (l > 0) {
                        px[i] = Math.min(255, (r * 255) / l);
                        px[i + 1] = Math.min(255, (g * 255) / l);
                        px[i + 2] = Math.min(255, (b * 255) / l);
                    }
                } else {
                    const greenness = g - Math.max(r, b);
                    px[i + 3] = greenness > 60 ? 0 : greenness > 25 ? 255 * (1 - (greenness - 25) / 35) : 255;
                    if (greenness > 0) px[i + 1] = Math.max(r, b); // de-spill
                }
            }
            ctx.putImageData(data, 0, 0);
            return c;
        }

        function applyAssetToMaterials(key, tex, repeat) {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(repeat, repeat);
            tex.anisotropy = 8;
            tex.needsUpdate = true;
            scene.traverse(o => {
                if (o.isMesh && o.material && o.material.userData && o.material.userData.assetKey === key) {
                    o.material.map = tex;
                    o.material.color.setHex(0xFFFFFF);
                    o.material.needsUpdate = true;
                }
            });
        }

        async function loadOptionalAIAssets() {
            if (location.protocol === 'file:') {
                console.info('[assets] Mở game qua start-game.bat (http://localhost) để nạp ảnh AI trong thư mục assets/. Đang dùng đồ họa thủ tục.');
                return;
            }
            const [sky, skyline, smoke, fire, crate, sandbag, ground] = await Promise.all(
                Object.values(AI_ASSET_FILES).map(loadAssetImage)
            );

            if (sky) {
                const t = new THREE.Texture(sky);
                t.needsUpdate = true;
                skyUniforms.uPano.value = t;
                skyUniforms.uUsePano.value = 1;
            }
            if (skyline) {
                const t = new THREE.CanvasTexture(imageToAlphaCanvas(skyline, 'chroma'));
                t.wrapS = THREE.RepeatWrapping;
                t.repeat.x = -2; // viewed from inside the cylinder
                const arc = Math.PI * 1.25;
                const band = new THREE.Mesh(
                    new THREE.CylinderGeometry(520, 520, 130, 96, 1, true, Math.PI - arc / 2, arc),
                    new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, color: 0xB8C0CC })
                );
                band.position.set(0, 57, 20);
                band.renderOrder = -5;
                worldCombatGroup.add(band);
            }
            if (smoke) {
                HighPolyFactory.textures.smokeSprite.image = imageToAlphaCanvas(smoke, 'luma');
                HighPolyFactory.textures.smokeSprite.needsUpdate = true;
            }
            if (fire) {
                HighPolyFactory.textures.fireSprite.image = imageToAlphaCanvas(fire, 'luma');
                HighPolyFactory.textures.fireSprite.needsUpdate = true;
            }
            if (crate) {
                HighPolyFactory.textures.crateTex.image = crate;
                HighPolyFactory.textures.crateTex.needsUpdate = true;
            }
            if (sandbag) applyAssetToMaterials('sandbag', new THREE.Texture(sandbag), 1);
            if (ground) applyAssetToMaterials('ground', new THREE.Texture(ground), 3);
            const loaded = Object.keys(AI_ASSET_FILES).filter((k, i) => [sky, skyline, smoke, fire, crate, sandbag, ground][i]);
            console.info('[assets] Đã nạp:', loaded.length ? loaded.join(', ') : '(không có file nào)');
        }

        // Simulation & Camera State
        let currentMode = 'SAM2'; // 'SAM2' | 'MIG21' | 'HANGAR'
        let cameraPreset = 'DECK'; // 'DECK' (1A), 'REVETMENT' (1B), 'MAP3D' (1C), 'COCKPIT' (2A), 'CHASE' (2B)
        let activeBombers = [];
        let activeMissiles = [];
        let fallingWrecks = [];
        let explosionParticles = [];
        let lockedBomber = null;

        let mouseAimX = 0;
        let mouseAimY = 0.15;
        let smoothAimX = 0;
        let smoothAimY = 0.15;

        // Hangar Orbit State
        let hangarDrag = false;
        let prevHX = 0, prevHY = 0;
        let hangarYaw = 0.65, hangarPitch = 0.22, hangarDist = 17;
        let hangarWireframe = false;
        let currentHangarKey = 'MIG21';

        let eccmFreq = 76;
        let jammingLevel = 0.04;
        let totalB52Downed = 0;
        let autoAIEnabled = true;
        let autoPilotActive = false;
        let autoHopCooldown = 0;
        let aiFireTimer = 0;
        let cameraShake = 0;
        let radarSweepAngle = 0;

        // 3D Map Pin World Positions (Matches Reference Image 2)
        const HANOI_MAP_PINS = [
            { id: 'pin-sam45', pos: new THREE.Vector3(-48, 2, -26) },
            { id: 'pin-sam72', pos: new THREE.Vector3(24, 2, 22) },
            { id: 'pin-radar291', pos: new THREE.Vector3(-22, 2, 24) },
            { id: 'pin-aaa37', pos: new THREE.Vector3(-56, 2, 12) },
            { id: 'pin-gialam', pos: new THREE.Vector3(28, 2, -4) },
            { id: 'pin-b52path', pos: new THREE.Vector3(-6, 16, -98) },
            { id: 'pin-wp1', pos: new THREE.Vector3(-2, 12, -74) },
            { id: 'pin-wp2', pos: new THREE.Vector3(4, 10, -48) },
            { id: 'pin-wp3', pos: new THREE.Vector3(10, 8, -22) },
            { id: 'pin-hotay-lbl', pos: new THREE.Vector3(-58, 1, -52) },
            { id: 'pin-hoankiem-lbl', pos: new THREE.Vector3(-12, 1, -24) },
            { id: 'pin-songhong-lbl', pos: new THREE.Vector3(42, 1, -18) },
            { id: 'pin-longbien-lbl', pos: new THREE.Vector3(22, 4, -36) }
        ];

        function init3DEngine() {
            const viewport = document.getElementById('webgl-viewport');
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x070B12);
            scene.fog = new THREE.FogExp2(0x0B1320, 0.0009);

            camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.5, 4000);
            renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 0.92;
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            viewport.appendChild(renderer.domElement);

            buildProceduralIBLEnvironment();
            buildStormSkyDome();

            if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.UnrealBloomPass !== 'undefined') {
                composer = new THREE.EffectComposer(renderer);
                composer.addPass(new THREE.RenderPass(scene, camera));
                bloomPass = new THREE.UnrealBloomPass(
                    new THREE.Vector2(window.innerWidth, window.innerHeight),
                    0.95,
                    0.62,
                    0.86
                );
                composer.addPass(bloomPass);
                if (typeof THREE.ShaderPass !== 'undefined') {
                    cinematicGradePass = new THREE.ShaderPass(CinematicGradeShader);
                    composer.addPass(cinematicGradePass);
                }
            }

            // Dim moonlit night: cold blue fill, warm city/fire bounce from below
            const hemiLight = new THREE.HemisphereLight(0x33435E, 0x140E0A, 0.62);
            scene.add(hemiLight);

            const moonDirLight = new THREE.DirectionalLight(0x9DB4D6, 0.85);
            moonDirLight.position.set(60, 120, 90);
            moonDirLight.castShadow = true;
            moonDirLight.shadow.mapSize.set(2048, 2048);
            moonDirLight.shadow.camera.left = -45;
            moonDirLight.shadow.camera.right = 45;
            moonDirLight.shadow.camera.top = 45;
            moonDirLight.shadow.camera.bottom = -45;
            moonDirLight.shadow.camera.near = 20;
            moonDirLight.shadow.camera.far = 320;
            moonDirLight.shadow.bias = -0.0006;
            moonDirLight.target.position.set(0, 0, 18);
            scene.add(moonDirLight);
            scene.add(moonDirLight.target);

            const groundFireRim = new THREE.DirectionalLight(0xF97316, 0.55);
            groundFireRim.position.set(-60, -40, -50);
            scene.add(groundFireRim);

            skyFlashLight = new THREE.PointLight(0xFF9E2C, 0, 1600);
            skyFlashLight.position.set(0, 60, -80);
            scene.add(skyFlashLight);

            // Launch Pad Ground Flash Light (Illuminates smoke plume from below during SAM-2 launch as in Image 3 & 4)
            launchPadLight = new THREE.PointLight(0xFF7B00, 0, 48);
            launchPadLight.position.set(2.5, 4.0, 20.5);
            scene.add(launchPadLight);

            worldCombatGroup = new THREE.Group();
            scene.add(worldCombatGroup);

            build2048HanoiTerrainAndBridges();
            buildForegroundSAM2DioramaAndMiG21();
            buildVolumetricSkySearchlightsAndRain();
            build360HangarStudio();

            buildOuterGroundAndAirArena();
            collectGroundScenery();
            scene.add(camera);
            buildCockpit3D();

            // Foreground battery casts/receives moonlight shadows
            worldCombatGroup.traverse(o => {
                if (o.isMesh && !o.isInstancedMesh && (o.material.isMeshStandardMaterial || o.material.isMeshLambertMaterial) && !o.material.transparent) {
                    o.castShadow = true;
                    o.receiveShadow = true;
                }
            });

            loadOptionalAIAssets();
            setupEventHandlers();
            window.addEventListener('resize', onResize);
        }

        function buildProceduralIBLEnvironment() {
            if (!THREE.PMREMGenerator) return;
            const pmrem = new THREE.PMREMGenerator(renderer);
            pmrem.compileCubemapShader();

            const envScene = new THREE.Scene();
            const domeGeo = new THREE.SphereGeometry(50, 32, 16);
            const c = document.createElement('canvas');
            c.width = 512;
            c.height = 256;
            const ctx = c.getContext('2d');
            const grad = ctx.createLinearGradient(0, 0, 0, 256);
            grad.addColorStop(0.0, '#141C2B');
            grad.addColorStop(0.45, '#0B111C');
            grad.addColorStop(0.52, '#4A2408');
            grad.addColorStop(0.60, '#0C0C0E');
            grad.addColorStop(1.0, '#050506');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 512, 256);

            const envTex = new THREE.CanvasTexture(c);
            const domeMat = new THREE.MeshBasicMaterial({ map: envTex, side: THREE.BackSide });
            envScene.add(new THREE.Mesh(domeGeo, domeMat));

            const renderTarget = pmrem.fromScene(envScene);
            scene.environment = renderTarget.texture;
            pmrem.dispose();
        }

        function build2048HanoiTerrainAndBridges() {
            const c = document.createElement('canvas');
            c.width = 2048;
            c.height = 2048;
            const ctx = c.getContext('2d');

            // ---- Ground: rice paddies, villages, Hanoi blocks, Red River, bomb craters ----
            // Three layers share one UV: albedo, an emissive map for lit windows and fires, and a
            // roughness map so only water is glossy. World (x, z) maps to canvas px = (v + 340) / 680 * 2048.
            const W = 2048, toPx = v => (v + 340) / 680 * W, toWorld = p => p / W * 680 - 340;
            const mk = fill => { const cv = document.createElement('canvas'); cv.width = cv.height = W; const x = cv.getContext('2d'); x.fillStyle = fill; x.fillRect(0, 0, W, W); return [cv, x]; };
            const [eCanvas, ectx] = mk('#000000');
            const [rCanvas, rctx] = mk('#E6E6E6');
            const rnd = (a, b) => a + Math.random() * (b - a);
            const pick = arr => arr[Math.floor(Math.random() * arr.length)];

            ctx.fillStyle = '#1A1E15';
            ctx.fillRect(0, 0, W, W);
            // paddy fields in 512 px blocks, each block at its own angle
            const paddy = ['#1E2417', '#232A19', '#1B2015', '#28291B', '#212718', '#1C2326', '#202A1D', '#262619'];
            for (let bx = 0; bx < W; bx += 512) for (let by = 0; by < W; by += 512) {
                ctx.save();
                ctx.beginPath(); ctx.rect(bx, by, 512, 512); ctx.clip();
                ctx.translate(bx + 256, by + 256);
                ctx.rotate(rnd(-0.5, 0.5));
                for (let y = -380; y < 380;) {
                    const h = rnd(16, 38);
                    for (let x = -380; x < 380;) {
                        const w = rnd(18, 50);
                        ctx.fillStyle = pick(paddy);
                        ctx.fillRect(x, y, w, h);
                        ctx.strokeStyle = 'rgba(78, 70, 50, 0.55)';
                        ctx.lineWidth = 1.3;
                        ctx.strokeRect(x, y, w, h);
                        x += w;
                    }
                    y += h;
                }
                ctx.restore();
            }
            for (let i = 0; i < 26000; i++) {   // soil and crop speckle
                ctx.fillStyle = Math.random() < 0.5 ? `rgba(0,0,0,${rnd(0.05, 0.2)})` : `rgba(120,110,80,${rnd(0.03, 0.1)})`;
                ctx.fillRect(Math.random() * W, Math.random() * W, rnd(1, 3), rnd(1, 3));
            }

            // Red River with sandy banks and dike roads; West Lake and Hoàn Kiếm
            const river = c2 => { c2.beginPath(); c2.moveTo(620, 0); c2.bezierCurveTo(960, 620, 1280, 1180, 1680, 2048); c2.stroke(); };
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#3A3628'; ctx.lineWidth = 240; river(ctx);
            ctx.strokeStyle = '#4A4434'; ctx.lineWidth = 190; river(ctx);
            ctx.strokeStyle = '#0D1A22'; ctx.lineWidth = 150; river(ctx);
            ctx.strokeStyle = '#11222C'; ctx.lineWidth = 90; river(ctx);
            rctx.lineCap = 'round'; rctx.strokeStyle = '#1C1C1C'; rctx.lineWidth = 150; river(rctx);
            const lake = (c2, x, y, rx, ry, fill) => { c2.fillStyle = fill; c2.beginPath(); c2.ellipse(x, y, rx, ry, 0.2, 0, Math.PI * 2); c2.fill(); };
            lake(ctx, 680, 740, 238, 222, '#3A3628'); lake(ctx, 680, 740, 225, 210, '#0E1C25'); lake(rctx, 680, 740, 225, 210, '#1C1C1C');
            lake(ctx, 920, 960, 80, 58, '#0F1F29'); lake(rctx, 920, 960, 80, 58, '#1C1C1C');
            const isWater = (px, py) => {
                if (Math.hypot((px - 680) / 225, (py - 740) / 210) < 1.05 || Math.hypot((px - 920) / 80, (py - 960) / 58) < 1.1) return true;
                // distance to the river curve, sampled
                for (let t = 0; t <= 1; t += 0.01) {
                    const u = 1 - t;
                    const rx = u * u * u * 620 + 3 * u * u * t * 960 + 3 * u * t * t * 1280 + t * t * t * 1680;
                    const ry = 3 * u * u * t * 620 + 3 * u * t * t * 1180 + t * t * t * 2048;
                    if (Math.hypot(px - rx, py - ry) < 110) return true;
                }
                return false;
            };

            // roads: asphalt out of the city, dirt tracks between villages
            const cityC = { x: 900, y: 1250 }, cityR = { x: 520, y: 420 };
            ctx.lineCap = 'round';
            for (let k = 0; k < 9; k++) {
                const a = k / 9 * Math.PI * 2 + rnd(-0.2, 0.2);
                ctx.strokeStyle = k % 3 === 0 ? '#3E3B35' : '#3A3427';
                ctx.lineWidth = k % 3 === 0 ? 7 : 4;
                ctx.beginPath();
                ctx.moveTo(cityC.x, cityC.y);
                ctx.quadraticCurveTo(cityC.x + Math.cos(a + 0.3) * 700, cityC.y + Math.sin(a + 0.3) * 700, cityC.x + Math.cos(a) * 1500, cityC.y + Math.sin(a) * 1500);
                ctx.stroke();
            }

            // Hanoi: street grid, blocks and rooftops inside an ellipse; positions kept for 3D buildings
            const inCity = (px, py) => Math.hypot((px - cityC.x) / cityR.x, (py - cityC.y) / cityR.y) < 1;
            const cityLots = [], villageLots = [], treeSpots = [];
            ctx.save();
            ctx.beginPath(); ctx.ellipse(cityC.x, cityC.y, cityR.x, cityR.y, 0, 0, Math.PI * 2); ctx.clip();
            ctx.fillStyle = '#26251F';
            ctx.fillRect(cityC.x - cityR.x, cityC.y - cityR.y, cityR.x * 2, cityR.y * 2);
            for (let y = cityC.y - cityR.y; y < cityC.y + cityR.y; y += 34) {
                for (let x = cityC.x - cityR.x; x < cityC.x + cityR.x; x += 40) {
                    if (isWater(x + 18, y + 15)) continue;
                    ctx.fillStyle = pick(['#34302A', '#2E2B26', '#3A342B', '#2B2925', '#403629']);
                    ctx.fillRect(x + 4, y + 4, 32, 26);
                    for (let k = 0; k < 4; k++) {   // rooftops inside the block
                        ctx.fillStyle = pick(['#4A2E22', '#3B3530', '#2A2724', '#55402F']);
                        ctx.fillRect(x + 5 + rnd(0, 22), y + 5 + rnd(0, 16), rnd(5, 10), rnd(4, 9));
                    }
                    if (Math.random() < 0.7) cityLots.push([toWorld(x + 20), toWorld(y + 17)]);
                }
            }
            ctx.restore();
            // rubble where the carpet bombing hit (Khâm Thiên, Bạch Mai...)
            for (let s = 0; s < 9; s++) {
                const x0 = rnd(200, 1850), y0 = rnd(200, 1850), a = rnd(0, Math.PI), n = 30 + Math.floor(rnd(0, 30));
                for (let k = 0; k < n; k++) {
                    const x = x0 + Math.cos(a) * k * 9 + rnd(-10, 10), y = y0 + Math.sin(a) * k * 9 + rnd(-10, 10), r = rnd(2.5, 6);
                    if (isWater(x, y)) continue;
                    ctx.fillStyle = '#4A4434'; ctx.beginPath(); ctx.arc(x, y, r + 1.8, 0, 6.283); ctx.fill();
                    ctx.fillStyle = '#0B0B09'; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
                }
                // still-burning fires along the strike
                for (let k = 0; k < 3; k++) {
                    const fx = x0 + Math.cos(a) * rnd(0, 250), fy = y0 + Math.sin(a) * rnd(0, 250), fr = rnd(8, 22);
                    const g = ectx.createRadialGradient(fx, fy, 0, fx, fy, fr);
                    g.addColorStop(0, 'rgba(255,190,90,0.95)'); g.addColorStop(0.4, 'rgba(255,100,30,0.55)'); g.addColorStop(1, 'rgba(255,60,10,0)');
                    ectx.fillStyle = g; ectx.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
                }
            }

            // villages: bamboo hedges around a few houses
            for (let v = 0; v < 70; v++) {
                const x = rnd(60, W - 60), y = rnd(60, W - 60);
                if (inCity(x, y) || isWater(x, y) || Math.hypot(x - 1024, y - 1084) < 160) continue;
                const r = rnd(18, 40);
                const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.3);
                g.addColorStop(0, '#0C120B'); g.addColorStop(0.75, '#111A0F'); g.addColorStop(1, 'rgba(17,26,15,0)');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.3, 0, 6.283); ctx.fill();
                const houses = 3 + Math.floor(rnd(0, 6));
                for (let k = 0; k < houses; k++) {
                    const hx = x + rnd(-r, r) * 0.6, hy = y + rnd(-r, r) * 0.6;
                    villageLots.push([toWorld(hx), toWorld(hy)]);
                    if (Math.random() < 0.25) { ectx.fillStyle = `rgba(255,170,80,${rnd(0.4, 0.8)})`; ectx.fillRect(hx, hy, 2, 2); }
                }
                for (let k = 0; k < 7; k++) treeSpots.push([toWorld(x + Math.cos(k) * r * rnd(0.7, 1.1)), toWorld(y + Math.sin(k) * r * rnd(0.7, 1.1))]);
            }
            // city lights under the blackout: sparse, warm, a few cold ones
            for (let i = 0; i < 1400; i++) {
                const x = cityC.x + rnd(-1, 1) * cityR.x, y = cityC.y + rnd(-1, 1) * cityR.y;
                if (!inCity(x, y) || isWater(x, y)) continue;
                ectx.fillStyle = Math.random() < 0.88 ? `rgba(255,176,90,${rnd(0.35, 0.85)})` : `rgba(150,200,255,${rnd(0.3, 0.6)})`;
                ectx.fillRect(x, y, rnd(1, 3), rnd(1, 3));
            }
            // launch site: bulldozed earth pad, tyre tracks, revetment berm
            const sx = toPx(2.8), sy = toPx(20.5);
            ctx.fillStyle = '#3A3427'; ctx.beginPath(); ctx.arc(sx, sy, 90, 0, 6.283); ctx.fill();
            ctx.strokeStyle = 'rgba(25,22,16,0.7)'; ctx.lineWidth = 3;
            for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.arc(sx, sy, 30 + k * 8, rnd(0, 6), rnd(0, 6) + 2.5); ctx.stroke(); }
            ctx.strokeStyle = '#4C4535'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(sx, sy, 24, 0, 6.283); ctx.stroke();

            const terrainTex = new THREE.CanvasTexture(c);
            terrainTex.anisotropy = 8;
            const terrainEmissive = new THREE.CanvasTexture(eCanvas);
            const terrainRough = new THREE.CanvasTexture(rCanvas);

            const terrainGeo = new THREE.PlaneBufferGeometry(680, 680, 128, 128);
            terrainGeo.rotateX(-Math.PI / 2);
            const terrainHeight = (vx, vz) => {
                const distFromBattery = Math.hypot(vx, vz - 22);
                if (distFromBattery < 18) return Math.exp(-Math.pow((distFromBattery - 7.5) / 2.2, 2)) * 1.15;
                return Math.max(-0.4, Math.sin(vx * 0.025) * Math.cos(vz * 0.025) * 1.8 + Math.sin(vx * 0.11 + vz * 0.07) * 0.25);
            };
            const pos = terrainGeo.attributes.position;
            for (let i = 0; i < pos.count; i++) pos.setY(i, terrainHeight(pos.getX(i), pos.getZ(i)));
            pos.needsUpdate = true;
            terrainGeo.computeVertexNormals();

            const terrainMat = new THREE.MeshStandardMaterial({
                map: terrainTex,
                emissiveMap: terrainEmissive, emissive: 0xFFFFFF, emissiveIntensity: 1.1,
                roughnessMap: terrainRough, roughness: 1,
                metalness: 0.0,
                envMapIntensity: 0.7
            });
            const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
            worldCombatGroup.add(terrainMesh);

            // ---- 3D houses, city blocks and trees (instanced, cheap) ----
            const wc = document.createElement('canvas');
            wc.width = wc.height = 128;
            const wctx = wc.getContext('2d');
            wctx.fillStyle = '#6A6052'; wctx.fillRect(0, 0, 128, 128);
            const we = document.createElement('canvas');
            we.width = we.height = 128;
            const wectx = we.getContext('2d');
            wectx.fillStyle = '#000'; wectx.fillRect(0, 0, 128, 128);
            for (let y = 10; y < 120; y += 20) for (let x = 8; x < 124; x += 16) {
                wctx.fillStyle = '#1A1714'; wctx.fillRect(x, y, 8, 11);
                if (Math.random() < 0.12) { wectx.fillStyle = `rgba(255,180,95,${rnd(0.5, 1)})`; wectx.fillRect(x + 1, y + 1, 6, 9); }
            }
            wctx.fillStyle = '#2A2724'; wctx.fillRect(0, 0, 4, 4);   // roof corner sample (dark)
            const bodyGeo = new THREE.BoxGeometry(1, 1, 1);
            bodyGeo.translate(0, 0.5, 0);
            const uv = bodyGeo.attributes.uv;
            for (let k = 8; k < 12; k++) uv.setXY(k, 0.01, 0.99);   // +Y face samples the dark corner, not windows
            const bodyMat = new THREE.MeshStandardMaterial({
                map: new THREE.CanvasTexture(wc), emissiveMap: new THREE.CanvasTexture(we), emissive: 0xFFFFFF, emissiveIntensity: 0.9, roughness: 0.92
            });
            const roofGeo = new THREE.ConeGeometry(0.78, 0.55, 4);
            roofGeo.rotateY(Math.PI / 4);
            roofGeo.translate(0, 1.27, 0);
            const roofMat = new THREE.MeshStandardMaterial({ color: 0x5A3226, roughness: 0.85 });
            const lots = cityLots.map(p => [...p, true]).concat(villageLots.map(p => [...p, false]))
                .filter(([x, z]) => Math.hypot(x - 2.8, z - 20.5) > 46 && Math.abs(x) < 330 && Math.abs(z) < 330);
            const bodies = new THREE.InstancedMesh(bodyGeo, bodyMat, lots.length);
            const roofs = new THREE.InstancedMesh(roofGeo, roofMat, lots.length);
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p3 = new THREE.Vector3(), col = new THREE.Color();
            let nRoof = 0;
            lots.forEach(([x, z, city], i) => {
                const w = city ? rnd(3, 6) : rnd(2.2, 3.6), d = city ? rnd(3, 6) : rnd(2, 3), h = city ? rnd(2.5, 9) : rnd(1.6, 2.4);
                q.setFromAxisAngle(WORLD_UP, city ? rnd(-0.08, 0.08) : rnd(0, Math.PI));
                p3.set(x, terrainHeight(x, z) - 0.2, z);
                bodies.setMatrixAt(i, m4.compose(p3, q, sc.set(w, h, d)));
                bodies.setColorAt(i, col.setHSL(0.08, rnd(0.05, 0.2), rnd(0.35, 0.65)));
                if (!city || h < 4) {   // tiled roofs on low houses, flat roofs on city blocks
                    m4.compose(p3.clone().setY(p3.y + h - 1), q, sc.set(w * 1.15, 1.1, d * 1.15));
                    roofs.setMatrixAt(nRoof++, m4);
                }
            });
            roofs.count = nRoof;
            // instances spread over the whole map: the base geometry's bounds would cull them wrongly
            bodies.frustumCulled = roofs.frustumCulled = false;
            worldCombatGroup.add(bodies, roofs);

            const treeGeo = new THREE.IcosahedronGeometry(1, 0);
            const trees = new THREE.InstancedMesh(treeGeo, new THREE.MeshStandardMaterial({ color: 0x1F3A1C, roughness: 1, flatShading: true }), treeSpots.length + 900);
            let nTree = 0;
            const addTree = (x, z) => {
                if (Math.hypot(x - 2.8, z - 20.5) < 30 || Math.abs(x) > 335 || Math.abs(z) > 335) return;
                const s = rnd(1.4, 3.2);
                trees.setMatrixAt(nTree, m4.compose(p3.set(x, terrainHeight(x, z) + s * 0.7, z), q.setFromAxisAngle(WORLD_UP, rnd(0, 6)), sc.set(s, s * rnd(1, 1.6), s)));
                trees.setColorAt(nTree, col.setHSL(rnd(0.24, 0.32), rnd(0.25, 0.45), rnd(0.25, 0.42)));
                nTree++;
            };
            treeSpots.forEach(([x, z]) => addTree(x, z));
            for (let k = 0; k < 900; k++) {   // scattered trees and bamboo clumps along field edges
                const px = rnd(0, W), py = rnd(0, W);
                if (!isWater(px, py)) addTree(toWorld(px), toWorld(py));
            }
            trees.count = nTree;
            trees.frustumCulled = false;
            worldCombatGroup.add(trees);

            // Long Biên Cantilever Steel Bridge spanning the Red River
            const bridgeGroup = new THREE.Group();
            bridgeGroup.position.set(18, 0.2, -38);
            bridgeGroup.rotation.y = 0.35;
            // Long Biên cantilever truss: chords + diagonals per span, deck, piers
            const trussMat = new THREE.MeshStandardMaterial({ color: 0x3B4250, metalness: 0.75, roughness: 0.45 });
            const beam = (len, x, y, z, rotZ) => {
                const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.22, 0.22), trussMat);
                m.position.set(x, y, z);
                m.rotation.z = rotZ;
                bridgeGroup.add(m);
            };
            for (let s = -4; s <= 4; s++) {
                const cx = s * 14.2;
                const hgt = s % 2 === 0 ? 6.2 : 3.8;
                [-1.6, 1.6].forEach(z => {
                    beam(14.2, cx, 1.6, z, 0);
                    beam(14.2, cx, 1.6 + hgt, z, 0);
                    for (let k = 0; k < 4; k++) {
                        const x0 = cx - 7.1 + k * 3.55;
                        const len = Math.hypot(3.55, hgt);
                        const ang = Math.atan2(hgt, 3.55) * (k % 2 === 0 ? 1 : -1);
                        beam(len, x0 + 1.775, 1.6 + hgt / 2, z, ang);
                    }
                });
                const deck = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.3, 3.4), trussMat);
                deck.position.set(cx, 1.5, 0);
                bridgeGroup.add(deck);
                const pier = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 4.2), new THREE.MeshStandardMaterial({ color: 0x3F3A35, roughness: 0.9 }));
                pier.position.set(cx - 7.1, 0.4, 0);
                bridgeGroup.add(pier);
            }
            worldCombatGroup.add(bridgeGroup);

            // 3D Tactical Command Map Overlays (Glowing Radar Rings & Red Dashed B-52 Flight Path for View 1C)
            tacticalMap3DGroup = new THREE.Group();

            // Radar Rings on Ground
            [
                { x: -22, z: 24, r: 16, color: 0x38BDF8 },
                { x: 24, z: 22, r: 15, color: 0x10B981 },
                { x: -48, z: -26, r: 12, color: 0x2DD4BF }
            ].forEach(rc => {
                for (let k = 1; k <= 3; k++) {
                    const rMesh = new THREE.Mesh(
                        new THREE.RingGeometry((rc.r * k) / 3 - 0.35, (rc.r * k) / 3, 48),
                        new THREE.MeshBasicMaterial({ color: rc.color, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
                    );
                    rMesh.rotation.x = -Math.PI / 2;
                    rMesh.position.set(rc.x, 1.2, rc.z);
                    tacticalMap3DGroup.add(rMesh);
                }
            });

            // Red Dashed B-52 Flight Path Line across Hanoi (Matches Image 2)
            for (let s = 0; s < 16; s++) {
                const t = s / 15;
                const seg = new THREE.Mesh(
                    new THREE.BoxGeometry(0.9, 0.4, 3.6),
                    new THREE.MeshBasicMaterial({ color: 0xFB7185 })
                );
                seg.position.set(-6 + t * 30, 8 - t * 5, -96 + t * 118);
                seg.rotation.y = -0.24;
                tacticalMap3DGroup.add(seg);
            }

            tacticalMap3DGroup.visible = false;
            worldCombatGroup.add(tacticalMap3DGroup);
        }

        function buildForegroundSAM2DioramaAndMiG21() {
            // 1. Primary SM-63 SAM-2 Launcher (#03 - Right side in Deck View 1A)
            samBatteryObj = HighPolyFactory.createSM63LauncherBattery();
            samBatteryObj.root.position.set(2.8, 0, 20.5);
            samBatteryObj.pitchBoom.rotation.x = 0.62;
            worldCombatGroup.add(samBatteryObj.root);
            samLaunchers = [{ battery: samBatteryObj, name: '#03', baseYaw: 0, loaded: true, reloadT: 0 }];

            // 2. Twin Reserve V-750 Missiles on Loading Rack (Left side in Deck View 1A, matches Image 3)
            const reserveRack = HighPolyFactory.createReserveMissileRack();
            reserveRack.position.set(-5.8, 0, 23.2);
            reserveRack.rotation.y = 0.28;
            worldCombatGroup.add(reserveRack);

            // 3. Sandbag Revetment Wall, Concrete Barriers, Stenciled "S-75 DVINA - SAM-2" Crates & ZIL Truck (Matches Image 4)
            const revetmentProps = HighPolyFactory.createSandbagRevetmentAndCrates();
            worldCombatGroup.add(revetmentProps);

            // 4. Hanoi 1972 Skyline (St. Joseph's Cathedral & Traditional Curved-Roof Houses)
            const skylineProps = HighPolyFactory.createHanoi1972SkylineProps();
            worldCombatGroup.add(skylineProps);

            // 5. Flanking SAM-2 Launchers & SNR-75 "Fan Song" Radar Van
            [-22, 22].forEach(lx => {
                const flank = HighPolyFactory.createSM63LauncherBattery();
                flank.root.position.set(lx, 0, 10);
                flank.pitchBoom.rotation.x = 0.56;
                flank.yawTurntable.rotation.y = lx < 0 ? -0.25 : 0.25;
                worldCombatGroup.add(flank.root);
                samLaunchers.push({ battery: flank, name: lx < 0 ? '#01' : '#02', baseYaw: lx < 0 ? -0.25 : 0.25, loaded: true, reloadT: 0 });
            });

            fanSongObj = HighPolyFactory.createFanSongRadar();
            fanSongObj.position.set(-13.5, 0, 15.5);
            worldCombatGroup.add(fanSongObj);

            // 6. Hero MiG-21bis (#5121 - Phạm Tuân with 5 Red Victory Stars)
            playerMiG21 = HighPolyFactory.createMiG21Bis();
            playerMiG21.rotation.y = Math.PI;
            playerMiG21.position.set(0, 48, 10);
            worldCombatGroup.add(playerMiG21);
        }

        function buildVolumetricSkySearchlightsAndRain() {
            HighPolyFactory.initTextures();

            // Low storm-cloud deck: dark billows lit from below by flashes and the launch fire
            volumetricClouds = [];
            for (let i = 0; i < 70; i++) {
                const cMat = new THREE.MeshLambertMaterial({
                    map: HighPolyFactory.textures.cloudSprite,
                    color: 0x2A3242,
                    emissive: 0x0A0E15,
                    transparent: true,
                    opacity: 0.3 + Math.random() * 0.25,
                    depthWrite: false
                });
                const size = 180 + Math.random() * 220;
                const plane = new THREE.Mesh(new THREE.PlaneGeometry(size, size * 0.62), cMat);
                plane.position.set(
                    (Math.random() - 0.5) * 1800,
                    150 + Math.random() * 70,
                    -1500 + Math.random() * 1500
                );
                plane.userData.drift = 0.6 + Math.random() * 1.2;
                worldCombatGroup.add(plane);
                volumetricClouds.push(plane);
            }

            // 12 Anti-Aircraft Searchlights: narrow at the lamp, widening into the sky, soft shader falloff
            searchlightCones = [];
            const searchlightCoords = [
                { x: -65, z: -25 }, { x: -42, z: -18 }, { x: -20, z: -22 },
                { x: 0, z: -28 }, { x: 22, z: -22 }, { x: 45, z: -20 },
                { x: 68, z: -30 }, { x: -52, z: -65 }, { x: -15, z: -72 },
                { x: 18, z: -68 }, { x: 54, z: -62 }, { x: 0, z: -95 }
            ];
            const lampFlareMat = new THREE.SpriteMaterial({
                map: HighPolyFactory.textures.fireSprite,
                color: 0xFFF4D6,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                transparent: true
            });
            searchlightCoords.forEach((pos, idx) => {
                const coneGeo = new THREE.ConeGeometry(7.5, 118, 32, 1, true);
                coneGeo.rotateX(Math.PI);          // apex (lamp) at the bottom
                coneGeo.translate(0, 59, 0);
                const coneMat = makeSearchlightMaterial(idx % 3 === 0 ? 0xFFE7A8 : 0xF2F0E0, 0.24);
                const cone = new THREE.Mesh(coneGeo, coneMat);
                cone.scale.set(2.2, 3.6, 2.2);    // ~10 km beams reaching the bomber stream
                cone.position.set(pos.x, 0.8, pos.z);
                cone.userData = { phase: idx * 0.9, speed: 0.4 + (idx % 3) * 0.14 };
                worldCombatGroup.add(cone);
                searchlightCones.push(cone);

                const flare = new THREE.Sprite(lampFlareMat);
                flare.scale.set(5, 5, 1);
                flare.position.set(pos.x, 1.4, pos.z);
                worldCombatGroup.add(flare);
            });

            // 24 Rising AAA Tracer Streams (37mm / 57mm / 100mm) — additive streaks so they bloom
            aaaTracerLines = [];
            for (let t = 0; t < 24; t++) {
                const tracerMesh = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.07, 0.07, 6.5, 6),
                    new THREE.MeshBasicMaterial({
                        color: t % 2 === 0 ? 0xFFB347 : 0xFF6B4A,
                        transparent: true,
                        opacity: 0.9,
                        blending: THREE.AdditiveBlending,
                        depthWrite: false
                    })
                );
                resetAAATracer(tracerMesh);
                worldCombatGroup.add(tracerMesh);
                aaaTracerLines.push(tracerMesh);
            }

            // Wind-driven December rain: slanted streaks of varying length in a box that follows the camera
            const rainCount = 2600;
            rainGeo = new THREE.BufferGeometry();
            const rainPositions = new Float32Array(rainCount * 6);
            const rainLen = new Float32Array(rainCount);
            for (let i = 0; i < rainCount; i++) {
                const rx = (Math.random() - 0.5) * 120;
                const ry = Math.random() * 70;
                const rz = (Math.random() - 0.5) * 120;
                const len = 1.4 + Math.random() * 2.6;
                rainLen[i] = len;
                rainPositions[i * 6] = rx;
                rainPositions[i * 6 + 1] = ry;
                rainPositions[i * 6 + 2] = rz;
                rainPositions[i * 6 + 3] = rx - len * 0.18;
                rainPositions[i * 6 + 4] = ry - len;
                rainPositions[i * 6 + 5] = rz;
            }
            rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
            rainGeo.userData.len = rainLen;
            const rainMat = new THREE.LineBasicMaterial({
                color: 0xA9B8CC,
                transparent: true,
                opacity: 0.32,
                depthWrite: false
            });
            rainSystem = new THREE.LineSegments(rainGeo, rainMat);
            rainSystem.frustumCulled = false;
            scene.add(rainSystem);

            // Wet concrete launch pad under SAM-2 #03 (catches the orange launch glare)
            const padMat = new THREE.MeshStandardMaterial({ color: 0x2A2D31, roughness: 0.32, metalness: 0.1 });
            padMat.userData.assetKey = 'ground';
            const pad = new THREE.Mesh(new THREE.CircleGeometry(6.6, 48), padMat);
            pad.rotation.x = -Math.PI / 2;
            pad.position.set(2.8, 0.06, 21.5);
            worldCombatGroup.add(pad);

            buildSparkSystem();
        }

        function resetAAATracer(mesh) {
            mesh.position.set((Math.random() - 0.5) * 160, 2 + Math.random() * 12, -25 - Math.random() * 110);
            mesh.userData = {
                vx: (Math.random() - 0.5) * 14,
                vy: 48 + Math.random() * 22,
                vz: (Math.random() - 0.5) * 14
            };
        }

        function build360HangarStudio() {
            hangarStudioGroup = new THREE.Group();
            hangarStudioGroup.visible = false;

            const pedestal = new THREE.Mesh(
                new THREE.CylinderGeometry(14, 15.5, 0.8, 64),
                new THREE.MeshStandardMaterial({ color: 0x121215, metalness: 0.85, roughness: 0.2 })
            );
            pedestal.position.y = -3.2;
            hangarStudioGroup.add(pedestal);

            const ring1 = new THREE.Mesh(
                new THREE.RingGeometry(13.4, 13.8, 64),
                new THREE.MeshBasicMaterial({ color: 0x10B981, side: THREE.DoubleSide })
            );
            ring1.rotation.x = -Math.PI / 2;
            ring1.position.y = -2.78;
            hangarStudioGroup.add(ring1);

            const spotA = new THREE.PointLight(0xFAFAFA, 2.2, 60);
            spotA.position.set(14, 12, 14);
            const spotB = new THREE.PointLight(0x38BDF8, 1.6, 60);
            spotB.position.set(-14, 10, -14);
            hangarStudioGroup.add(spotA, spotB);

            hangarPivot = new THREE.Group();
            hangarStudioGroup.add(hangarPivot);
            scene.add(hangarStudioGroup);
        }

