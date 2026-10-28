        /* ============================================================================
           1. PROCEDURAL PBR TEXTURES, BUMP MAPS & HIGH-POLY CAD MESH FACTORY
           ============================================================================ */
        const HighPolyFactory = {
            cache: {},
            textures: {},
            customGLBModels: {},

            initTextures() {
                if (this.textures.ready) return;

                // 1. Aircraft Skin + Procedural Bump/Normal Map + 5 Red Victory Stars on MiG-21 #5121
                const makeAircraftSkin = (bgHex, lineHex, starInsignia, tailNumber, fiveVictoryStars) => {
                    const c = document.createElement('canvas');
                    c.width = 1024;
                    c.height = 1024;
                    const ctx = c.getContext('2d');

                    ctx.fillStyle = bgHex;
                    ctx.fillRect(0, 0, 1024, 1024);

                    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
                    grad.addColorStop(0, 'rgba(255,255,255,0.12)');
                    grad.addColorStop(0.5, 'rgba(0,0,0,0.10)');
                    grad.addColorStop(1, 'rgba(255,255,255,0.09)');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, 1024, 1024);

                    // Panel seams & rivet lines
                    ctx.strokeStyle = lineHex;
                    ctx.lineWidth = 2;
                    for (let i = 64; i < 1024; i += 80) {
                        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1024); ctx.stroke();
                    }

                    // VPAF Roundel (Red circle, yellow star, white border)
                    if (starInsignia) {
                        ctx.save();
                        ctx.translate(512, 512);
                        ctx.fillStyle = '#E11D48';
                        ctx.beginPath();
                        ctx.arc(0, 0, 145, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = '#FAFAFA';
                        ctx.lineWidth = 12;
                        ctx.stroke();

                        ctx.fillStyle = '#FACC15';
                        ctx.beginPath();
                        for (let s = 0; s < 5; s++) {
                            const a1 = (s * 72 - 90) * Math.PI / 180;
                            const a2 = ((s * 72 + 36) - 90) * Math.PI / 180;
                            ctx.lineTo(Math.cos(a1) * 115, Math.sin(a1) * 115);
                            ctx.lineTo(Math.cos(a2) * 46, Math.sin(a2) * 46);
                        }
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    }

                    if (tailNumber) {
                        ctx.fillStyle = '#E11D48';
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.lineWidth = 3;
                        ctx.font = 'bold 96px "JetBrains Mono", monospace';
                        ctx.strokeText(tailNumber, 120, 230);
                        ctx.fillText(tailNumber, 120, 230);
                    }

                    // 5 Red Victory Stars on Forward Fuselage of MiG-21 #5121
                    if (fiveVictoryStars) {
                        for (let k = 0; k < 5; k++) {
                            ctx.save();
                            ctx.translate(420 + k * 46, 200);
                            ctx.fillStyle = '#E11D48';
                            ctx.beginPath();
                            for (let s = 0; s < 5; s++) {
                                const a1 = (s * 72 - 90) * Math.PI / 180;
                                const a2 = ((s * 72 + 36) - 90) * Math.PI / 180;
                                ctx.lineTo(Math.cos(a1) * 18, Math.sin(a1) * 18);
                                ctx.lineTo(Math.cos(a2) * 7, Math.sin(a2) * 7);
                            }
                            ctx.closePath();
                            ctx.fill();
                            ctx.restore();
                        }
                    }

                    const tex = new THREE.CanvasTexture(c);
                    tex.anisotropy = 4;
                    return tex;
                };

                // 2. Stenciled Military Wooden Crate Texture ("S-75 DVINA - SAM-2" from Image 4)
                const makeCrateTexture = () => {
                    const c = document.createElement('canvas');
                    c.width = 512;
                    c.height = 256;
                    const ctx = c.getContext('2d');
                    ctx.fillStyle = '#2B3024';
                    ctx.fillRect(0, 0, 512, 256);
                    ctx.strokeStyle = '#181C14';
                    ctx.lineWidth = 6;
                    for (let y = 0; y <= 256; y += 52) {
                        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
                    }
                    ctx.strokeRect(8, 8, 496, 240);
                    ctx.fillStyle = '#D6D3C4';
                    ctx.font = 'bold 34px "JetBrains Mono", monospace';
                    ctx.fillText('S-75 DVINA - SAM-2', 58, 128);
                    ctx.font = 'bold 20px "JetBrains Mono", monospace';
                    ctx.fillText('V-750 // HANOI 12.1972', 110, 175);
                    return new THREE.CanvasTexture(c);
                };

                // 3. Billowing Smoke Sprite (many overlapping soft lobes -> cauliflower puff silhouette)
                const makeSmokeSprite = (size = 256, lobes = 26, spread = 0.26) => {
                    const c = document.createElement('canvas');
                    c.width = size;
                    c.height = size;
                    const ctx = c.getContext('2d');
                    const h = size / 2;
                    for (let i = 0; i < lobes; i++) {
                        const a = Math.random() * Math.PI * 2;
                        const d = Math.random() * size * spread;
                        const x = h + Math.cos(a) * d;
                        const y = h + Math.sin(a) * d;
                        const r = size * (0.12 + Math.random() * 0.16);
                        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
                        const shade = 200 + Math.floor(Math.random() * 55);
                        g.addColorStop(0, `rgba(${shade},${shade},${shade + 3},0.34)`);
                        g.addColorStop(0.6, `rgba(${shade},${shade},${shade + 3},0.16)`);
                        g.addColorStop(1, 'rgba(255,255,255,0)');
                        ctx.fillStyle = g;
                        ctx.fillRect(0, 0, size, size);
                    }
                    // fade the square edges completely
                    ctx.globalCompositeOperation = 'destination-in';
                    const m = ctx.createRadialGradient(h, h, size * 0.2, h, h, h);
                    m.addColorStop(0, 'rgba(0,0,0,1)');
                    m.addColorStop(1, 'rgba(0,0,0,0)');
                    ctx.fillStyle = m;
                    ctx.fillRect(0, 0, size, size);
                    return new THREE.CanvasTexture(c);
                };

                // 3b. Hot fire core / lens flare sprite
                const makeGlowSprite = (size, stops) => {
                    const c = document.createElement('canvas');
                    c.width = c.height = size;
                    const ctx = c.getContext('2d');
                    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
                    stops.forEach(([o, col]) => g.addColorStop(o, col));
                    ctx.fillStyle = g;
                    ctx.fillRect(0, 0, size, size);
                    return new THREE.CanvasTexture(c);
                };

                this.textures.migPolishedAlum = makeAircraftSkin('#DCE2EA', '#7E8C9F', false, '5121', true);
                this.textures.migStarWing = makeAircraftSkin('#DCE2EA', '#7E8C9F', true, '', false);
                this.textures.b52Camo = makeAircraftSkin('#262B32', '#121519', false, '', false);
                this.textures.samDvinaWhite = makeAircraftSkin('#F1F5F9', '#94A3B8', false, 'V-750', false);
                this.textures.crateTex = makeCrateTexture();
                this.textures.smokeSprite = makeSmokeSprite();
                this.textures.cloudSprite = makeSmokeSprite(512, 60, 0.32);
                this.textures.fireSprite = makeGlowSprite(128, [
                    [0, 'rgba(255,255,240,1)'], [0.18, 'rgba(255,214,120,0.95)'],
                    [0.45, 'rgba(255,120,30,0.45)'], [1, 'rgba(120,30,0,0)']
                ]);
                this.textures.sparkSprite = makeGlowSprite(32, [
                    [0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']
                ]);
                this.textures.ready = true;
            },

            buildNACAStreamlinedWing({
                span = 12, rootChord = 3.2, tipChord = 1.0, thickness = 0.13,
                sweepZ = 4.0, dihedralY = 0, anhedralDroop = 0, side = 1, material
            }) {
                const shape = new THREE.Shape();
                shape.moveTo(0.5, 0);
                shape.bezierCurveTo(0.5, thickness, 0.16, thickness * 1.18, -0.18, thickness * 0.68);
                shape.bezierCurveTo(-0.36, thickness * 0.32, -0.46, thickness * 0.1, -0.5, 0);
                shape.bezierCurveTo(-0.46, -thickness * 0.08, -0.25, -thickness * 0.42, 0.15, -thickness * 0.55);
                shape.bezierCurveTo(0.4, -thickness * 0.58, 0.5, -thickness * 0.32, 0.5, 0);

                const geom = new THREE.ExtrudeBufferGeometry(shape, {
                    steps: 24, depth: 1.0, bevelEnabled: false, curveSegments: 20
                });

                const pos = geom.attributes.position;
                for (let i = 0; i < pos.count; i++) {
                    const ox = pos.getX(i);
                    const oy = pos.getY(i);
                    const t = pos.getZ(i);

                    const chord = rootChord + (tipChord - rootChord) * t;
                    const tipRound = t > 0.92 ? Math.sqrt(Math.max(0.05, 1 - Math.pow((t - 0.92) / 0.08, 2))) : 1.0;
                    const thickScale = (rootChord + (tipChord * 0.65 - rootChord) * t) * tipRound;

                    const wx = side * (t * span);
                    const wy = oy * thickScale + dihedralY * t - anhedralDroop * Math.pow(t, 1.75);
                    const wz = ox * chord * tipRound - sweepZ * t;
                    pos.setXYZ(i, wx, wy, wz);
                }

                if (side < 0) {
                    const idx = geom.getIndex();
                    if (idx) {
                        const a = idx.array;
                        for (let i = 0; i < a.length; i += 3) {
                            const tmp = a[i + 1]; a[i + 1] = a[i + 2]; a[i + 2] = tmp;
                        }
                    } else {
                        for (let i = 0; i < pos.count; i += 3) {
                            for (let c = 0; c < 3; c++) {
                                const tmp = pos.array[(i + 1) * 3 + c];
                                pos.array[(i + 1) * 3 + c] = pos.array[(i + 2) * 3 + c];
                                pos.array[(i + 2) * 3 + c] = tmp;
                            }
                        }
                    }
                }

                pos.needsUpdate = true;
                geom.computeVertexNormals();
                return new THREE.Mesh(geom, material);
            },

            buildVerticalFin({ height = 4.0, rootChord = 3.2, tipChord = 1.2, thickness = 0.11, sweepZ = 2.0, material }) {
                const shape = new THREE.Shape();
                shape.moveTo(0.5, 0);
                shape.bezierCurveTo(0.5, thickness, 0.1, thickness * 1.1, -0.5, 0);
                shape.bezierCurveTo(0.1, -thickness * 1.1, 0.5, -thickness, 0.5, 0);

                const geom = new THREE.ExtrudeBufferGeometry(shape, {
                    steps: 16, depth: 1.0, bevelEnabled: false, curveSegments: 16
                });

                const pos = geom.attributes.position;
                for (let i = 0; i < pos.count; i++) {
                    const ox = pos.getX(i);
                    const oy = pos.getY(i);
                    const t = pos.getZ(i);
                    const chord = rootChord + (tipChord - rootChord) * t;
                    const thick = chord * (1 - 0.35 * t);
                    pos.setXYZ(i, oy * thick, t * height, ox * chord - sweepZ * t);
                }
                pos.needsUpdate = true;
                geom.computeVertexNormals();
                return new THREE.Mesh(geom, material);
            },

            buildLatheFuselage({ length = 16, stations = [], radialSegments = 36, ovalX = 1, ovalY = 1, flattenBelly = 0, spineFn = null, material }) {
                const pts = stations.map(s => new THREE.Vector2(Math.max(0.001, s[1]), (s[0] - 0.5) * length));
                const curve = new THREE.SplineCurve(pts);
                const geom = new THREE.LatheBufferGeometry(curve.getPoints(48), radialSegments);
                geom.rotateX(Math.PI / 2);

                const pos = geom.attributes.position;
                for (let i = 0; i < pos.count; i++) {
                    let x = pos.getX(i) * ovalX;
                    let y = pos.getY(i) * ovalY;
                    const z = pos.getZ(i);
                    const normZ = (z / length) + 0.5;
                    if (flattenBelly > 0 && y < 0) y *= (1 - flattenBelly);
                    if (spineFn && y > 0) y += spineFn(normZ, x, y);
                    pos.setXYZ(i, x, y, z);
                }
                pos.needsUpdate = true;
                geom.computeVertexNormals();
                return new THREE.Mesh(geom, material);
            },

            /**
             * 1. HERO MIG-21BIS (#5121 - PHẠM TUÂN: 5 RED VICTORY STARS, VENTRAL TANK, APU-13 + K-13)
             */
            createMiG21Bis() {
                if (this.customGLBModels.MIG21) return this.customGLBModels.MIG21.clone();
                this.initTextures();
                const group = new THREE.Group();

                const alumMat = new THREE.MeshStandardMaterial({
                    map: this.textures.migPolishedAlum,
                    bumpMap: this.textures.migPolishedAlum,
                    bumpScale: 0.03,
                    metalness: 0.88,
                    roughness: 0.18
                });
                const wingStarMat = new THREE.MeshStandardMaterial({
                    map: this.textures.migStarWing,
                    bumpMap: this.textures.migStarWing,
                    bumpScale: 0.03,
                    metalness: 0.85,
                    roughness: 0.22
                });
                const coneGreenMat = new THREE.MeshStandardMaterial({
                    color: 0x059669,
                    metalness: 0.35,
                    roughness: 0.3
                });
                const redRingMat = new THREE.MeshStandardMaterial({
                    color: 0xE11D48,
                    emissive: 0x4C0519,
                    roughness: 0.25
                });
                const canopyGlassMat = new THREE.MeshStandardMaterial({
                    color: 0x34D399,
                    emissive: 0x059669,
                    emissiveIntensity: 0.35,
                    metalness: 0.92,
                    roughness: 0.08,
                    transparent: true,
                    opacity: 0.78
                });

                const fuselage = this.buildLatheFuselage({
                    length: 12.8,
                    stations: [
                        [0.00, 0.58], [0.14, 0.72], [0.36, 0.82],
                        [0.60, 0.84], [0.82, 0.74], [0.95, 0.62], [1.00, 0.55]
                    ],
                    radialSegments: 36,
                    ovalX: 0.95,
                    ovalY: 1.05,
                    spineFn: (normZ, x) => {
                        const mask = Math.max(0, 1 - Math.abs(x) * 1.8);
                        if (normZ > 0.10 && normZ < 0.76) {
                            return Math.sin(((normZ - 0.10) / 0.66) * Math.PI) * 0.46 * mask;
                        }
                        return 0;
                    },
                    material: alumMat
                });
                group.add(fuselage);

                // Intake Ring + Green Radar Shock Cone
                const lip = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.058, 16, 32), redRingMat);
                lip.position.set(0, 0, 6.38);
                group.add(lip);

                const shockCone = this.buildLatheFuselage({
                    length: 2.6,
                    stations: [[0, 0.37], [0.45, 0.28], [0.8, 0.14], [1, 0.01]],
                    radialSegments: 24,
                    material: coneGreenMat
                });
                shockCone.position.set(0, 0, 6.75);
                group.add(shockCone);

                // Pitot Boom
                const pitot = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.028, 1.85, 10), alumMat);
                pitot.rotation.x = Math.PI / 2;
                pitot.position.set(0.18, -0.25, 7.9);
                group.add(pitot);

                // Canopy + Pilot Helmet
                const canopy = this.buildLatheFuselage({
                    length: 2.8,
                    stations: [[0, 0.02], [0.2, 0.36], [0.55, 0.52], [0.82, 0.46], [1, 0.02]],
                    radialSegments: 24,
                    flattenBelly: 0.85,
                    material: canopyGlassMat
                });
                canopy.position.set(0, 0.70, 2.45);
                group.add(canopy);

                const helmet = new THREE.Mesh(
                    new THREE.SphereGeometry(0.24, 16, 16),
                    new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.15 })
                );
                helmet.position.set(0, 0.80, 2.65);
                // Pilot dark reflective visor & oxygen mask
                const visor = new THREE.Mesh(
                    new THREE.SphereGeometry(0.18, 12, 12, 0, Math.PI, 0, Math.PI * 0.65),
                    new THREE.MeshStandardMaterial({ color: 0x090D16, metalness: 0.95, roughness: 0.05 })
                );
                visor.rotation.x = -Math.PI / 2;
                visor.position.set(0, 0.83, 2.74);
                group.add(helmet, visor);

                // GSh-23L 23mm Twin-Barrel Autocannon Pod under Forward Belly
                const gunPodMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.82, roughness: 0.28 });
                const gunFairing = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 1.5), gunPodMat);
                gunFairing.position.set(0, -0.66, 1.35);
                [-0.055, 0.055].forEach(gx => {
                    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.15, 8), gunPodMat);
                    barrel.rotation.x = Math.PI / 2;
                    barrel.position.set(gx, -0.05, 0.88);
                    gunFairing.add(barrel);
                    const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.14, 8), alumMat);
                    muzzle.rotation.x = Math.PI / 2;
                    muzzle.position.set(gx, -0.05, 1.45);
                    gunFairing.add(muzzle);
                });
                group.add(gunFairing);

                // Centerline 490L Drop Tank under Belly
                const dropTank = this.buildLatheFuselage({
                    length: 3.6,
                    stations: [[0, 0.02], [0.2, 0.24], [0.5, 0.28], [0.8, 0.24], [1, 0.02]],
                    radialSegments: 20,
                    material: alumMat
                });
                dropTank.position.set(0, -1.05, 0.2);
                group.add(dropTank);

                // 57° Delta Wings + APU-13 Pylons + K-13 Atoll Missiles
                [-1, 1].forEach(side => {
                    const delta = this.buildNACAStreamlinedWing({
                        span: 4.65, rootChord: 4.55, tipChord: 0.52,
                        thickness: 0.09, sweepZ: 2.55, dihedralY: -0.08,
                        side, material: wingStarMat
                    });
                    delta.position.set(side * 0.64, -0.05, 0.5);
                    group.add(delta);

                    const hStab = this.buildNACAStreamlinedWing({
                        span: 2.05, rootChord: 1.5, tipChord: 0.45,
                        thickness: 0.09, sweepZ: 1.1, side, material: alumMat
                    });
                    hStab.position.set(side * 0.56, 0.02, -4.85);
                    group.add(hStab);

                    const navLight = new THREE.Mesh(
                        new THREE.SphereGeometry(0.11, 10, 10),
                        new THREE.MeshBasicMaterial({ color: side < 0 ? 0xE11D48 : 0x10B981 })
                    );
                    navLight.position.set(side * 5.25, -0.12, -1.85);
                    group.add(navLight);

                    // APU-13 Launch Rail + K-13 Missile
                    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.24, 1.4), alumMat);
                    pylon.position.set(side * 2.45, -0.24, -0.4);
                    group.add(pylon);

                    const k13 = this.createK13Missile();
                    k13.position.set(side * 2.45, -0.42, -0.5);
                    group.add(k13);
                });

                const vFin = this.buildVerticalFin({
                    height: 2.65, rootChord: 3.65, tipChord: 1.2,
                    thickness: 0.1, sweepZ: 1.95, material: wingStarMat
                });
                vFin.position.set(0, 0.62, -3.7);
                group.add(vFin);

                // Multi-Layered Mach-Diamond Afterburner Assembly
                const burnerGroup = new THREE.Group();
                burnerGroup.name = 'afterburnerPlume';
                burnerGroup.position.set(0, 0, -6.4);

                const outerPlume = new THREE.Mesh(
                    new THREE.ConeGeometry(0.54, 4.8, 20, 1, true),
                    new THREE.MeshBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.78, side: THREE.DoubleSide })
                );
                outerPlume.rotation.x = -Math.PI / 2;
                outerPlume.position.z = -2.4;
                burnerGroup.add(outerPlume);

                const innerCore = new THREE.Mesh(
                    new THREE.ConeGeometry(0.36, 3.0, 16),
                    new THREE.MeshBasicMaterial({ color: 0xFEF08A })
                );
                innerCore.rotation.x = -Math.PI / 2;
                innerCore.position.z = -1.5;
                burnerGroup.add(innerCore);

                [0.65, 1.45, 2.25].forEach((dz, idx) => {
                    const dRing = new THREE.Mesh(
                        new THREE.OctahedronGeometry(0.25 - idx * 0.05, 1),
                        new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.92 - idx * 0.2 })
                    );
                    dRing.scale.set(1, 1, 1.8);
                    dRing.position.z = -dz;
                    burnerGroup.add(dRing);
                });

                const engineLight = new THREE.PointLight(0x38BDF8, 2.5, 30);
                engineLight.position.set(0, 0, -1.8);
                burnerGroup.add(engineLight);

                group.add(burnerGroup);
                return group;
            },

            createK13Missile() {
                const g = new THREE.Group();
                const whiteMat = new THREE.MeshStandardMaterial({ color: 0xFAFAFA, metalness: 0.4, roughness: 0.25 });
                const body = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 2.3, 12), whiteMat);
                body.rotation.x = Math.PI / 2;
                const nose = new THREE.Mesh(
                    new THREE.SphereGeometry(0.085, 12, 12),
                    new THREE.MeshStandardMaterial({ color: 0x18181B, metalness: 0.9, roughness: 0.1 })
                );
                nose.position.z = 1.15;
                const canardH = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.22), whiteMat);
                canardH.position.z = 0.72;
                const finH = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.02, 0.4), whiteMat);
                finH.position.z = -0.9;
                const finV = finH.clone();
                finV.rotation.z = Math.PI / 2;
                g.add(body, nose, canardH, finH, finV);
                return g;
            },

            /**
             * 2. BOEING B-52G STRATOFORTRESS (8 ENGINES WITH 8 BRIGHT EXHAUST PLUMES + WINGTIP TANKS & NAV LIGHTS)
             */
            createB52G() {
                if (this.customGLBModels.B52) return this.customGLBModels.B52.clone();
                if (this.cache.B52) return this.cache.B52.clone();
                this.initTextures();
                const group = new THREE.Group();

                const upperMat = new THREE.MeshStandardMaterial({
                    map: this.textures.b52Camo,
                    bumpMap: this.textures.b52Camo,
                    bumpScale: 0.03,
                    metalness: 0.68,
                    roughness: 0.34
                });
                const bellyMat = new THREE.MeshStandardMaterial({
                    color: 0x121417,
                    metalness: 0.55,
                    roughness: 0.42
                });
                const glassMat = new THREE.MeshStandardMaterial({
                    color: 0x38BDF8,
                    emissive: 0x0369A1,
                    emissiveIntensity: 0.45,
                    metalness: 0.9,
                    roughness: 0.1
                });
                const exhaustBeamMat = new THREE.MeshBasicMaterial({
                    color: 0xFFB066,
                    transparent: true,
                    opacity: 0.32,
                    side: THREE.DoubleSide,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });

                const fuselage = this.buildLatheFuselage({
                    length: 20.5,
                    stations: [
                        [0.00, 0.15], [0.08, 0.48], [0.20, 0.78], [0.40, 0.98],
                        [0.62, 1.05], [0.80, 1.02], [0.90, 0.90], [0.96, 0.58], [1.00, 0.05]
                    ],
                    radialSegments: 32,
                    ovalX: 0.85,
                    ovalY: 1.18,
                    flattenBelly: 0.22,
                    spineFn: (normZ, x) => {
                        const c = Math.max(0, 1 - Math.abs(x) * 1.25);
                        if (normZ > 0.76 && normZ < 0.93) {
                            return Math.sin(((normZ - 0.76) / 0.17) * Math.PI) * 0.34 * c;
                        }
                        return 0;
                    },
                    material: upperMat
                });
                group.add(fuselage);

                const canopy = this.buildLatheFuselage({
                    length: 3.0,
                    stations: [[0, 0.02], [0.25, 0.55], [0.65, 0.76], [0.9, 0.5], [1, 0.02]],
                    radialSegments: 20,
                    flattenBelly: 0.85,
                    material: glassMat
                });
                canopy.position.set(0, 0.95, 6.8);
                group.add(canopy);

                // Swept Anhedral Wings + 4 Twin TF33 Engine Pods (8 Engines with 8 Glowing Exhaust Plumes as in Image 1 & 4)
                [-1, 1].forEach(side => {
                    const wing = this.buildNACAStreamlinedWing({
                        span: 16.5, rootChord: 3.6, tipChord: 1.08,
                        thickness: 0.13, sweepZ: 6.6, dihedralY: -0.15,
                        anhedralDroop: 1.18, side, material: upperMat
                    });
                    wing.position.set(side * 0.65, 0.55, 2.2);
                    group.add(wing);

                    // Wingtip External Fuel Tank + Red/Green Nav Light (Matches Image 1)
                    const tipTank = this.buildLatheFuselage({
                        length: 3.4,
                        stations: [[0, 0.02], [0.25, 0.22], [0.7, 0.22], [1, 0.02]],
                        radialSegments: 16,
                        material: upperMat
                    });
                    tipTank.position.set(side * 16.8, -0.82, -4.2);
                    group.add(tipTank);

                    const navLight = new THREE.Mesh(
                        new THREE.SphereGeometry(0.28, 12, 12),
                        new THREE.MeshBasicMaterial({ color: side < 0 ? 0xFF2A4B : 0x10B981 })
                    );
                    navLight.position.set(side * 17.15, -0.82, -4.2);
                    group.add(navLight);

                    [0.29, 0.56].forEach(frac => {
                        const px = side * (0.65 + frac * 16.5);
                        const py = 0.52 - 1.18 * Math.pow(frac, 1.75);
                        const pz = 2.2 - 6.6 * frac + 0.9;

                        const podGroup = new THREE.Group();
                        podGroup.position.set(px, py - 0.95, pz + 0.6);

                        [-0.40, 0.40].forEach(ox => {
                            const nac = this.buildLatheFuselage({
                                length: 3.2,
                                stations: [[0, 0.26], [0.25, 0.35], [0.65, 0.38], [1, 0.32]],
                                radialSegments: 18,
                                material: bellyMat
                            });
                            nac.position.x = ox;
                            podGroup.add(nac);

                            // Bright Glowing Jet Exhaust Cone (8 distinct plumes under wings as in Image 1)
                            const plume = new THREE.Mesh(
                                new THREE.ConeGeometry(0.32, 5.2, 14, 1, true),
                                exhaustBeamMat
                            );
                            plume.rotation.x = -Math.PI / 2;
                            plume.position.set(ox, -0.1, -4.1);
                            podGroup.add(plume);
                        });
                        group.add(podGroup);
                    });

                    const hStab = this.buildNACAStreamlinedWing({
                        span: 4.9, rootChord: 1.9, tipChord: 0.75,
                        thickness: 0.11, sweepZ: 2.1, dihedralY: 0.15,
                        side, material: upperMat
                    });
                    hStab.position.set(side * 0.25, 0.45, -8.0);
                    group.add(hStab);
                });

                const vTail = this.buildVerticalFin({
                    height: 4.5, rootChord: 3.5, tipChord: 1.25,
                    thickness: 0.11, sweepZ: 2.3, material: upperMat
                });
                vTail.position.set(0, 0.65, -7.4);
                group.add(vTail);

                // ECM jamming haze: faint red glow only shown while the ECCM filter is off-frequency
                const jamAura = new THREE.Mesh(
                    new THREE.SphereGeometry(13.0, 24, 16),
                    new THREE.MeshBasicMaterial({ color: 0x7F1D1D, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide })
                );
                jamAura.name = 'jamAura';
                jamAura.visible = false;
                group.add(jamAura);

                this.cache.B52 = group;
                return group.clone();
            },

            /**
             * 3. HIGH-POLY SAM-2 (S-75 DVINA / V-750 TWO-STAGE MISSILE & SM-63 LAUNCHER)
             */
            createSAM2Missile() {
                if (this.customGLBModels.SAM2) return this.customGLBModels.SAM2.clone();
                this.initTextures();
                const group = new THREE.Group();

                const whiteMat = new THREE.MeshStandardMaterial({
                    map: this.textures.samDvinaWhite,
                    bumpMap: this.textures.samDvinaWhite,
                    bumpScale: 0.02,
                    metalness: 0.58,
                    roughness: 0.24
                });
                const boosterFinMat = new THREE.MeshStandardMaterial({
                    color: 0xCBD5E1,
                    metalness: 0.7,
                    roughness: 0.28
                });
                const steelMat = new THREE.MeshStandardMaterial({
                    color: 0x27272A,
                    metalness: 0.85,
                    roughness: 0.25,
                    wireframe: true
                });

                // Accurate 10.6m V-750 profile: 0.65m Solid Booster + 0.50m Sustainer
                const body = this.buildLatheFuselage({
                    length: 10.6,
                    stations: [
                        [0.00, 0.34], [0.06, 0.46], [0.35, 0.44],
                        [0.39, 0.32], [0.78, 0.33], [0.92, 0.18], [1.00, 0.01]
                    ],
                    radialSegments: 28,
                    material: whiteMat
                });
                body.rotation.y = Math.PI;
                group.add(body);

                // Open Steel Truss Interstage Adapter
                const interstage = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.45, 0.65, 16, 2), steelMat);
                interstage.rotation.x = Math.PI / 2;
                interstage.position.z = 1.35;
                group.add(interstage);

                for (let f = 0; f < 4; f++) {
                    const ang = (f * Math.PI) / 2 + Math.PI / 4;
                    // 4 Nose Canards
                    const noseCanard = this.buildVerticalFin({
                        height: 0.52, rootChord: 0.55, tipChord: 0.22,
                        thickness: 0.06, sweepZ: -0.25, material: whiteMat
                    });
                    noseCanard.rotation.z = ang;
                    noseCanard.position.z = -3.85;
                    group.add(noseCanard);

                    // 4 Mid-body Sustainer Wings
                    const midWing = this.buildVerticalFin({
                        height: 1.25, rootChord: 1.95, tipChord: 0.65,
                        thickness: 0.07, sweepZ: -0.95, material: whiteMat
                    });
                    midWing.rotation.z = ang;
                    midWing.position.z = -0.65;
                    group.add(midWing);

                    // 4 Large Trapezoidal Booster Fins
                    const boosterFin = this.buildVerticalFin({
                        height: 1.68, rootChord: 1.85, tipChord: 0.75,
                        thickness: 0.08, sweepZ: -0.85, material: boosterFinMat
                    });
                    boosterFin.rotation.z = ang;
                    boosterFin.position.z = 3.85;
                    group.add(boosterFin);
                }

                return group;
            },

            createSM63LauncherBattery() {
                const root = new THREE.Group();
                const armorGreen = new THREE.MeshStandardMaterial({
                    color: 0x354230,
                    metalness: 0.68,
                    roughness: 0.38
                });
                const chromeMat = new THREE.MeshStandardMaterial({
                    color: 0xF4F4F6,
                    metalness: 0.95,
                    roughness: 0.12
                });
                const darkSteel = new THREE.MeshStandardMaterial({
                    color: 0x1E2024,
                    metalness: 0.75,
                    roughness: 0.4
                });

                for (let j = 0; j < 4; j++) {
                    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.42, 8.4), darkSteel);
                    arm.rotation.y = (j * Math.PI) / 2 + Math.PI / 4;
                    arm.position.y = 0.25;
                    root.add(arm);
                }

                const yawTurntable = new THREE.Group();
                const drum = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 3.2, 1.2, 28), armorGreen);
                drum.position.y = 0.8;
                yawTurntable.add(drum);

                [-1.35, 1.35].forEach(cx => {
                    const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.72, 2.0, 2.6), armorGreen);
                    cheek.position.set(cx, 1.9, 0.2);
                    yawTurntable.add(cheek);
                });

                const pitchBoom = new THREE.Group();
                pitchBoom.position.set(0, 2.45, 0);

                const rail = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.62, 9.8), armorGreen);
                pitchBoom.add(rail);

                [-0.68, 0.68].forEach(px => {
                    const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 2.6, 14), chromeMat);
                    piston.rotation.x = Math.PI / 5;
                    piston.position.set(px, -0.78, -1.5);
                    pitchBoom.add(piston);
                });

                const loadedMissile = this.createSAM2Missile();
                loadedMissile.position.set(0, 0.95, -0.4);
                pitchBoom.add(loadedMissile);

                yawTurntable.add(pitchBoom);
                root.add(yawTurntable);

                return { root, yawTurntable, pitchBoom, loadedMissile };
            },

            /**
             * 4. SNR-75 "FAN SONG" FIRE-CONTROL RADAR & P-35 EARLY WARNING RADAR
             */
            createFanSongRadar() {
                if (this.customGLBModels.RADAR) return this.customGLBModels.RADAR.clone();
                const group = new THREE.Group();
                const cabinMat = new THREE.MeshStandardMaterial({ color: 0x2D382C, metalness: 0.6, roughness: 0.45 });
                const dishMat = new THREE.MeshStandardMaterial({ color: 0x6B7280, metalness: 0.7, roughness: 0.4, side: THREE.DoubleSide });

                const van = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.1, 3.6), cabinMat);
                van.position.y = 1.55;
                group.add(van);

                const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 4.6, 16), cabinMat);
                tower.position.y = 4.4;
                group.add(tower);

                const scannerHead = new THREE.Group();
                scannerHead.name = 'scannerHead';
                scannerHead.position.y = 6.8;

                const horizDish = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 1.4, 20, 4, true, 0, Math.PI), dishMat);
                horizDish.rotation.z = Math.PI / 2;
                scannerHead.add(horizDish);

                const vertDish = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 1.3, 20, 4, true, 0, Math.PI), dishMat);
                vertDish.position.set(1.8, 0.6, 0);
                scannerHead.add(vertDish);

                const parabola = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.2, 0.5, 16, 2, true), dishMat);
                parabola.rotation.x = Math.PI / 2;
                parabola.position.set(-1.6, 0.4, 1.2);
                scannerHead.add(parabola);

                group.add(scannerHead);
                return group;
            },

            /**
             * 5. FOREGROUND DIORAMA PROPS FOR VIEWS 1A & 1B (TWIN RESERVE RACK, SANDBAGS, CRATES, ZIL TRUCK, CATHEDRAL)
             */
            createReserveMissileRack() {
                this.initTextures();
                const g = new THREE.Group();
                const rackMat = new THREE.MeshStandardMaterial({ color: 0x2F3B2B, metalness: 0.7, roughness: 0.4 });

                const deckBase = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.6, 12.5), rackMat);
                deckBase.position.y = 0.3;
                g.add(deckBase);

                [-1.65, 1.65].forEach(rx => {
                    const cradle = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 9.5), rackMat);
                    cradle.position.set(rx, 0.9, 0);
                    g.add(cradle);

                    const m = this.createSAM2Missile();
                    m.scale.set(0.88, 0.88, 0.88);
                    m.position.set(rx, 1.75, -0.3);
                    m.rotation.x = 0.08;
                    g.add(m);
                });
                return g;
            },

            createSandbagRevetmentAndCrates() {
                this.initTextures();
                const g = new THREE.Group();
                const bagMat = new THREE.MeshStandardMaterial({ color: 0x5C5343, roughness: 0.88, metalness: 0.08 });
                bagMat.userData.assetKey = 'sandbag';
                const crateMat = new THREE.MeshStandardMaterial({ map: this.textures.crateTex, roughness: 0.7, metalness: 0.15 });
                const concreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8, metalness: 0.15 });

                // Semi-circular Sandbag Wall
                for (let row = 0; row < 4; row++) {
                    for (let i = -8; i <= 8; i++) {
                        const bag = new THREE.Mesh(new THREE.SphereGeometry(0.58, 10, 8), bagMat);
                        bag.scale.set(1.5, 0.62, 0.95);
                        bag.position.set(i * 1.35 + (row % 2) * 0.4, 0.35 + row * 0.48, 28.5 + Math.abs(i) * 0.18);
                        g.add(bag);
                    }
                }

                // Stenciled "S-75 DVINA - SAM-2" Supply Crates on Right Foreground (Matches Image 4)
                const crate1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.25, 1.5), crateMat);
                crate1.position.set(6.8, 0.65, 29.8);
                crate1.rotation.y = -0.22;
                g.add(crate1);

                const crate2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 1.4), crateMat);
                crate2.position.set(6.5, 1.75, 29.9);
                crate2.rotation.y = -0.12;
                g.add(crate2);

                // Concrete Blast Barriers on Left
                for (let b = 0; b < 3; b++) {
                    const wall = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 0.6), concreteMat);
                    wall.position.set(-7.5 - b * 2.9, 0.9, 25.5);
                    wall.rotation.y = 0.18;
                    g.add(wall);
                }

                // ZIL-157 Military Command/Launcher Truck silhouette
                const truckGroup = new THREE.Group();
                const truckGreen = new THREE.MeshStandardMaterial({ color: 0x293624, roughness: 0.5, metalness: 0.4 });
                const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.1, 2.6), truckGreen);
                cab.position.set(0, 1.4, 2.2);
                const hood = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.4, 2.2), truckGreen);
                hood.position.set(0, 1.05, 4.2);
                const bed = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 5.2), truckGreen);
                bed.position.set(0, 0.9, -1.5);
                truckGroup.add(cab, hood, bed);
                truckGroup.position.set(7.5, 0, 18.5);
                truckGroup.rotation.y = -0.65;
                g.add(truckGroup);

                return g;
            },

            createHanoi1972SkylineProps() {
                const g = new THREE.Group();

                // 1. St. Joseph's Cathedral (Nhà thờ Lớn Hà Nội - Twin Gothic Towers glowing warm amber across river as in Image 3)
                const cathGroup = new THREE.Group();
                // Weathered stone, warmly up-lit from the street (not self-glowing)
                const cathMat = new THREE.MeshStandardMaterial({ color: 0x8A7560, emissive: 0x2A1405, emissiveIntensity: 0.6, roughness: 0.85 });
                const roofMatC = new THREE.MeshStandardMaterial({ color: 0x2B2622, roughness: 0.7 });
                const glowWin = new THREE.MeshBasicMaterial({ color: 0xFFB45C });
                const nave = new THREE.Mesh(new THREE.BoxGeometry(7.5, 9.0, 14.0), cathMat);
                nave.position.y = 4.5;
                cathGroup.add(nave);
                const naveRoof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 4.4, 3.2, 4, 1), roofMatC);
                naveRoof.rotation.y = Math.PI / 4;
                naveRoof.scale.set(1, 1, 2.2);
                naveRoof.position.y = 10.6;
                cathGroup.add(naveRoof);

                // facade: rose window + portal
                const rose = new THREE.Mesh(new THREE.CircleGeometry(1.1, 24), glowWin);
                rose.position.set(0, 7.2, 7.02);
                cathGroup.add(rose);
                const portal = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.2), glowWin);
                portal.position.set(0, 1.6, 7.02);
                cathGroup.add(portal);

                [-2.6, 2.6].forEach(tx => {
                    [[2.8, 7.0, 3.5], [2.5, 5.0, 9.5], [2.2, 3.6, 13.8]].forEach(([w, h, y]) => {
                        const tier = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), cathMat);
                        tier.position.set(tx, y, 6.2);
                        cathGroup.add(tier);
                    });
                    // tall lancet windows on each tower tier
                    [4.2, 9.6, 14.0].forEach(y => {
                        const lw = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 1.6), glowWin);
                        lw.position.set(tx, y, 7.62);
                        cathGroup.add(lw);
                    });
                    const spire = new THREE.Mesh(new THREE.ConeGeometry(1.25, 5.0, 8), roofMatC);
                    spire.position.set(tx, 18.1, 6.2);
                    cathGroup.add(spire);
                    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.08), glowWin);
                    cross.position.set(tx, 21.0, 6.2);
                    cathGroup.add(cross);
                });
                const upLight = new THREE.PointLight(0xFF9A3C, 2.2, 30, 1.6);
                upLight.position.set(0, 1.5, 12);
                cathGroup.add(upLight);
                cathGroup.position.set(-26, 0, -48);
                g.add(cathGroup);

                // 2. Traditional Hanoi Curved-Roof Houses (Nhà mái ngói cổ Hà Nội as in Image 4)
                const wallMat = new THREE.MeshStandardMaterial({ color: 0x27272A, roughness: 0.7 });
                const roofMat = new THREE.MeshStandardMaterial({ color: 0x18181B, roughness: 0.6 });
                const winGlow = new THREE.MeshBasicMaterial({ color: 0xFDE68A });

                for (let h = 0; h < 14; h++) {
                    const house = new THREE.Group();
                    const box = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.8, 4.2), wallMat);
                    box.position.y = 1.9;
                    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.2, 4), roofMat);
                    roof.rotation.y = Math.PI / 4;
                    roof.position.y = 4.9;
                    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.1), winGlow);
                    win.position.set(0, 1.8, 2.12);
                    house.add(box, roof, win);

                    house.position.set(-48 + h * 7.5, 0, -10 - (h % 3) * 8);
                    g.add(house);
                }

                return g;
            }
        };

