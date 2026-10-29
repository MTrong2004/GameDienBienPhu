        /* ============================================================================
           15. COMBAT SYSTEMS
           - B-52 cells of 3 arriving from ~40 km (1 unit ≈ 25 m, time compressed)
           - SNR-75 vs. B-52 jamming: echo S ∝ R⁻⁴, noise J ∝ R⁻² (burn-through when close),
             spot jammers that retune onto the radar frequency, barrage floor, chaff corridors
           - 3 launchers + reload, 2 s track before launch, command-guided missile camera
           - MiG-21 tail chase with K-13 rear-aspect IR lock, 3D cockpit
           ============================================================================ */
        const KM_PER_UNIT = 0.025;
        const BAND_MIN = 2900, BAND_MAX = 3100;
        const RADAR_POS = new THREE.Vector3(-13.5, 4, 15.5);
        const WORLD_UP = new THREE.Vector3(0, 1, 0);
        const TRACK_TIME = 2.0;
        const RELOAD_TIME = 12;
        const CELL_NAMES = ['IVORY', 'ROSE', 'LILAC', 'BRICK', 'CHERRY', 'SNUG', 'WINE', 'MAPLE', 'GOLD', 'PEACH', 'CREAM', 'SLATE'];

        let playerFreq = 2960, lastFreqMove = -10;
        let jamCells = [], chaffClouds = [], cellSeq = 1;
        let groundScenery = [], samLaunchers = [];
        let missionReserve = 0, reloadingLauncher = null, missionWaveIdx = 0;
        let selectedTarget = null, trackTimer = 0, targetQuality = 1, selectedScreenDist = 1;
        let guidedMissile = null, missileCamHold = 0, killCamWreck = null;
        const killCamOff = new THREE.Vector3();
        const missileCamHoldPos = new THREE.Vector3(), _holdQ = new THREE.Quaternion();
        let camReturn = null;
        let missionStats = { damaged: 0, leaked: 0 };
        let aimAzDeg = 0, aimElDeg = 30;
        // station line of sight: yaw + = turned left (counter-clockwise from above), pitch up to ~zenith
        const VIEW_PITCH_DEFAULT = 0.19, VIEW_PITCH_MAX = 1.54;
        let viewYaw = 0, viewPitch = VIEW_PITCH_DEFAULT;
        // Over-the-shoulder camera behind the missile on launcher #03: the rail follows the aim, so the
        // missile stays in the lower part of the frame at any heading and elevation, up to near-vertical.
        const _camTail = new THREE.Vector3(), _camLook = new THREE.Vector3();
        let camTailInit = false;
        function stationCamera(dt, back, lift, side, shakeVec) {
            const cp = Math.cos(viewPitch), sp = Math.sin(viewPitch), sy = Math.sin(viewYaw), cy = Math.cos(viewYaw);
            const look = _camLook.set(-sy * cp, sp, -cy * cp);
            const up = _tmpU.set(sy * sp, cp, cy * sp);
            const right = _tmpR.set(cy, 0, -sy);
            const lm = samLaunchers[0].battery.loadedMissile;
            lm.updateWorldMatrix(true, false);
            const tail = lm.localToWorld(_tmpV2.set(0, 0, -5.3));   // anchor on the nose
            if (!camTailInit) { _camTail.copy(tail); camTailInit = true; }
            else _camTail.lerp(tail, 1 - Math.exp(-dt * 5));   // rail slews; the camera follows it smoothly
            camera.position.copy(_camTail).addScaledVector(look, -back).addScaledVector(up, lift).addScaledVector(right, side);
            // too low (steep elevation): slide forward along the line of sight instead of rising, so the
            // missile keeps its place in the lower frame
            if (camera.position.y < 1.4 && look.y > 0.05) camera.position.addScaledVector(look, (1.4 - camera.position.y) / look.y);
            camera.position.add(shakeVec);
            camera.lookAt(_tmpV.copy(camera.position).addScaledVector(look, 100));
        }
        const aimDir = new THREE.Vector3(0, 0.3, -1);
        const aimRaycaster = new THREE.Raycaster();
        const keysDown = {};
        const mig = {
            yaw: 0, pitch: 0, bank: 0, speed: 13, throttle: 0.65, fwd: new THREE.Vector3(0, 0, -1),
            irLock: 0, hp: 100, gunTimer: 1, growlT: 0, underFire: 0, target: null, envelope: '', dist: 0
        };
        let gunTracers = [], tracerGeo = null, tracerMat = null;
        let cockpit3D = null, migCloudDeck = null, navLightMats = null, b52NavLayout = null;
        let lastCleanCallout = -99, lastJamCallout = -99, steerHintShown = false;
        const _tmpV = new THREE.Vector3(), _tmpV2 = new THREE.Vector3(), _tmpR = new THREE.Vector3(),
              _tmpU = new THREE.Vector3(), _tmpL = new THREE.Vector3();

        function distKm(b) { return b.mesh.position.distanceTo(RADAR_POS) * KM_PER_UNIT; }
        function deadzone(v, dz) { return Math.abs(v) < dz ? 0 : (v - Math.sign(v) * dz) / (1 - dz); }
        function jamOverlap(df) { return Math.exp(-(df / 22) * (df / 22)); }
        function aliveMembers(cell) { return cell.members.filter(b => activeBombers.includes(b)); }

        SoundEngine.playGrowl = function (locked) {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(locked ? 820 : 380, now);
            g.gain.setValueAtTime(0.03, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.09);
        };

        // ---- World set-up ----
        function buildOuterGroundAndAirArena() {
            // dark countryside beyond the 680-unit city map, so the far horizon has no edge
            const oc = document.createElement('canvas');
            oc.width = oc.height = 256;
            const octx = oc.getContext('2d');
            octx.fillStyle = '#15180F';
            octx.fillRect(0, 0, 256, 256);
            for (let y = 0; y < 256; y += 16 + Math.floor(Math.random() * 10)) for (let x = 0; x < 256; x += 18 + Math.floor(Math.random() * 14)) {
                octx.fillStyle = ['#171B11', '#1B1F13', '#13170F', '#1A1A12'][Math.floor(Math.random() * 4)];
                octx.fillRect(x + 1, y + 1, 20, 14);
            }
            const otex = new THREE.CanvasTexture(oc);
            otex.wrapS = otex.wrapT = THREE.RepeatWrapping;
            otex.repeat.set(160, 160);
            const outer = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), new THREE.MeshLambertMaterial({ map: otex, color: 0x8A8A8A }));
            outer.rotation.x = -Math.PI / 2;
            outer.position.y = -0.6;
            worldCombatGroup.add(outer);

            // MiG-21 arena: moonlit cloud tops ~2.5 km below the bombers
            const c = document.createElement('canvas');
            c.width = c.height = 512;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#262C36';
            ctx.fillRect(0, 0, 512, 512);
            for (let i = 0; i < 260; i++) {
                const x = Math.random() * 512, y = Math.random() * 512, r = 20 + Math.random() * 60;
                for (const ox of [-512, 0, 512]) for (const oy of [-512, 0, 512]) {
                    const g = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
                    g.addColorStop(0, `rgba(190,200,215,${0.05 + Math.random() * 0.12})`);
                    g.addColorStop(1, 'rgba(190,200,215,0)');
                    ctx.fillStyle = g;
                    ctx.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
                }
            }
            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(18, 18);
            migCloudDeck = new THREE.Mesh(
                new THREE.PlaneGeometry(12000, 12000),
                new THREE.MeshLambertMaterial({ map: tex, color: 0x9AA6B8, emissive: 0x0A0E15 })
            );
            migCloudDeck.rotation.x = -Math.PI / 2;
            migCloudDeck.position.y = 300;
            migCloudDeck.visible = false;
            scene.add(migCloudDeck);
        }

        function collectGroundScenery() {
            groundScenery = worldCombatGroup.children.filter(o => o !== playerMiG21 && o !== tacticalMap3DGroup);
        }

        function setAirArena(on) {
            groundScenery.forEach(o => { o.visible = !on; });
            if (migCloudDeck) migCloudDeck.visible = on;
            if (rainSystem) rainSystem.visible = !on && currentMode !== 'HANGAR';
            scene.fog.density = on ? 0.00042 : 0.0009;
        }

        // ---- B-52 cells ----
        function addB52NavLights(b, mesh) {
            if (!navLightMats) {
                const mk = c => new THREE.SpriteMaterial({ map: HighPolyFactory.textures.fireSprite, color: c, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false, sizeAttenuation: false });
                navLightMats = { red: mk(0xFF3B30), green: mk(0x34FF7A), white: mk(0xFFF6E0), engine: mk(0xFFA060) };
                const box = solidBounds(HighPolyFactory.createB52G());
                b52NavLayout = { min: box.min.clone(), max: box.max.clone(), c: box.getCenter(new THREE.Vector3()) };
            }
            const L = b52NavLayout;
            const add = (mat, x, y, z, s) => {
                const sp = new THREE.Sprite(mat);
                sp.position.set(x, y, z);
                sp.scale.set(s, s, 1);
                mesh.add(sp);
                return sp;
            };
            // nose is +Z, so the port (red) wingtip is +X
            add(navLightMats.red, L.max.x * 0.97, L.c.y, L.c.z, 0.006);
            add(navLightMats.green, L.min.x * 0.97, L.c.y, L.c.z, 0.006);
            add(navLightMats.white, 0, L.max.y * 0.9, L.min.z, 0.005);
            b.beacon = add(navLightMats.red, 0, L.max.y, L.c.z, 0.011);
            // dull engine glow so far-off cells still read against the night sky
            [0.55, 0.3].forEach(f => {
                add(navLightMats.engine, L.min.x * f, L.c.y - 0.6, L.c.z - 2.5, 0.004);
                add(navLightMats.engine, L.max.x * f, L.c.y - 0.6, L.c.z - 2.5, 0.004);
            });
        }

        function spawnB52Cell(opts = {}) {
            const attract = gameState !== 'PLAYING';
            const z0 = opts.z !== undefined ? opts.z : attract ? -560 - Math.random() * 160 : -1880 - Math.random() * 160;
            const x0 = opts.x !== undefined ? opts.x : (Math.random() - 0.5) * (attract ? 300 : 1000);
            const y0 = opts.y !== undefined ? opts.y : (attract ? 150 : 380) + Math.random() * 40;   // ~9.5–10.5 km
            const dir = opts.dir ? opts.dir.clone() : new THREE.Vector3((Math.random() - 0.5) * 240 - x0, 0, 220 - z0).normalize();
            const speed = (opts.speed || 15) * missionBomberSpeed;
            const cell = {
                id: cellSeq, name: CELL_NAMES[(cellSeq - 1) % CELL_NAMES.length],
                jamFreq: BAND_MIN + 25 + Math.random() * (BAND_MAX - BAND_MIN - 50),
                lostTimer: 0, onFreq: false, members: [], leaked: false
            };
            cellSeq++;
            const side = new THREE.Vector3(-dir.z, 0, dir.x);
            // in-trail cell: ~3 km between aircraft, ~700 m to either side, stepped up ~250 m
            [[0, 0, 0], [-0.4, 10, -1], [0.4, 20, -2]].forEach(([s, u, t], k) => {
                const mesh = HighPolyFactory.createB52G();
                mesh.scale.setScalar(1.5);
                const pos = new THREE.Vector3(x0, y0 + u, z0).addScaledVector(side, s * 70).addScaledVector(dir, t * 120);
                mesh.position.copy(pos);
                mesh.lookAt(pos.clone().add(dir));
                const aura = mesh.getObjectByName('jamAura');
                if (aura) aura.visible = false;
                worldCombatGroup.add(mesh);
                const b = {
                    id: bomberSeq++, callsign: `${cell.name} ${k + 1}`, mesh, hp: 100, damaged: false, leaked: false,
                    cell, aura, vel: dir.clone().multiplyScalar(speed), smokeT: 0, beacon: null, chaffOff: null
                };
                addB52NavLights(b, mesh);
                cell.members.push(b);
                activeBombers.push(b);
            });
            if (opts.chaff) layChaffCorridor(new THREE.Vector3(x0, y0, z0), dir);
            jamCells.push(cell);
            return cell;
        }

        function layChaffCorridor(start, dir) {
            // F-4s seeded chaff corridors ahead of the cells; the strips sink slowly
            for (let k = 0; k < 4; k++) {
                const center = start.clone().addScaledVector(dir, 260 + k * 230);
                center.y += 4 + Math.random() * 14;
                center.x += (Math.random() - 0.5) * 40;
                const n = 320, pos = new Float32Array(n * 3);
                for (let i = 0; i < n; i++) {
                    const r = 60 * Math.cbrt(Math.random()), a = Math.random() * Math.PI * 2;
                    pos[i * 3] = Math.cos(a) * r;
                    pos[i * 3 + 1] = (Math.random() - 0.5) * r * 0.5;
                    pos[i * 3 + 2] = Math.sin(a) * r * 1.6;
                }
                const geo = new THREE.BufferGeometry();
                geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
                const pts = new THREE.Points(geo, new THREE.PointsMaterial({
                    color: 0xC9D2DE, size: 2.4, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false
                }));
                pts.position.copy(center);
                pts.lookAt(center.clone().add(dir));
                worldCombatGroup.add(pts);
                chaffClouds.push({ pts, center: pts.position, radius: 62, life: 150 });
            }
        }
        function inChaff(pos) { return chaffClouds.some(c => c.center.distanceTo(pos) < c.radius); }
        function chaffOffset(b) {
            if (!b.chaffOff) b.chaffOff = new THREE.Vector3((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 60);
            return b.chaffOff;
        }

        function onBomberLeaked(b) {
            missionStats.leaked++;
            const c = b.cell;
            if (!c.leaked && aliveMembers(c).every(x => x.leaked)) {
                c.leaked = true;
                SoundFX.carpet();
                // Horizon orange blast reflection and ground tremor from carpet bombing
                skyFlashLight.position.set(0, 15, 350);
                skyFlashLight.color.setHex(0xFF5500);
                skyFlashLight.intensity = Math.max(skyFlashLight.intensity, 6);
                cameraShake = Math.max(cameraShake, 0.45);
                showRadio('ĐÀI QUAN SÁT', `Tốp ${c.name} đã cắt bom và quay ra! Bám sát vệt bay, quay bệ đón đánh!`);
            }
        }

        function killBomber(b) {
            const idx = activeBombers.indexOf(b);
            if (idx < 0) return;
            if (b.damaged) missionStats.damaged = Math.max(0, missionStats.damaged - 1);
            if (b.leaked) missionStats.leaked = Math.max(0, missionStats.leaked - 1);
            activeBombers.splice(idx, 1);
            worldCombatGroup.remove(b.mesh);
            detonateB52Bomber(b);
        }
        function damageBomber(b) {
            b.hp -= 55;
            if (b.hp <= 0) { killBomber(b); return true; }
            if (!b.damaged) { b.damaged = true; missionStats.damaged++; }
            b.vel.multiplyScalar(0.85);
            b.vel.y -= 1.2;
            return false;
        }

        function updateBombers(dt, now) {
            for (let i = activeBombers.length - 1; i >= 0; i--) {
                const b = activeBombers[i];
                b.mesh.position.addScaledVector(b.vel, dt);
                // SAM break: the targeted bomber weaves once the guided missile is inside ~16 km
                const gm = guidedMissile;
                if (gameState === 'PLAYING' && gm && gm.target === b && gm.t > 2.4 && !b.damaged &&
                    b.mesh.position.distanceTo(gm.mesh.position) < 650) {
                    b.evadeT = (b.evadeT || 0) + dt;
                    const turn = Math.sin(b.evadeT * 0.9 + b.id) * 0.16;
                    b.vel.applyAxisAngle(WORLD_UP, turn * dt);
                    b.vel.y = Math.max(-2, b.vel.y - dt * 0.4);
                    b.mesh.lookAt(_tmpV2.copy(b.mesh.position).add(b.vel));
                    b.mesh.rotateZ(-turn * 3);
                    b.evading = true;
                } else if (b.evading) {
                    b.evading = false;
                    b.vel.y = 0;
                    b.mesh.lookAt(_tmpV2.copy(b.mesh.position).add(b.vel));
                }
                if (b.beacon) b.beacon.visible = ((now * 0.001 + b.id * 0.37) % 1.1) < 0.12;
                if (b.damaged) {
                    b.smokeT -= dt;
                    if (b.smokeT <= 0) {
                        b.smokeT = 0.09;
                        spawnSmokePuff(b.mesh.position.clone().addScaledVector(b.vel, -0.15), 5 + Math.random() * 3, new THREE.Vector3(0, 0.5, 0), 3.5, 'blacksmoke');
                        if (Math.random() < 0.5) spawnSmokePuff(b.mesh.position.clone(), 3.2, new THREE.Vector3(), 0.3, 'fire');
                    }
                }
                if (currentMode === 'MIG21') continue;
                const z = b.mesh.position.z;
                if (gameState === 'PLAYING' && !b.leaked && z > 40) { b.leaked = true; onBomberLeaked(b); }
                if (z > (gameState === 'MENU' ? 160 : 1300)) {
                    worldCombatGroup.remove(b.mesh);
                    activeBombers.splice(i, 1);
                }
            }
            if (gameState === 'MENU' && activeBombers.length < 6) spawnB52Cell();
        }

        // ---- Jamming model ----
        // q = S / (S + J): S ∝ R⁻⁴ (echo), J ∝ R⁻² (noise), so a bomber "burns through" when close.
        // spotFree: the quality with the spot jammers off our frequency (barrage, side lobes and range only)
        function computeTargetQuality(b, spotFree) {
            const jam = activeMission && gameState === 'PLAYING' ? activeMission.jam : null;
            if (!jam || !b) return 1;
            const R = Math.max(1.5, distKm(b));
            const S = Math.pow(18 / R, 4) * (b.damaged ? 1.4 : 1);
            const toT = _tmpV2.copy(b.mesh.position).sub(RADAR_POS).normalize();
            let J = 0.02;
            jamCells.forEach(c => {
                const alive = aliveMembers(c);
                if (!alive.length) return;
                const toJ = alive[0].mesh.position.clone().sub(RADAR_POS);
                const Rc = Math.max(1.5, toJ.length() * KM_PER_UNIT);
                const angDeg = THREE.MathUtils.radToDeg(toJ.normalize().angleTo(toT));
                const beam = Math.max(0.035, Math.exp(-(angDeg / 5) * (angDeg / 5)));   // main lobe vs. side lobes
                J += jam.power * (alive.length / 3) * ((spotFree ? 0 : jamOverlap(playerFreq - c.jamFreq)) + jam.barrage) * Math.pow(18 / Rc, 2) * beam;
            });
            let q = S / (S + J);
            if (inChaff(b.mesh.position)) q *= 0.6;
            return q;
        }

        function updateJammers(dt) {
            const jam = activeMission && gameState === 'PLAYING' ? activeMission.jam : null;
            jamCells = jamCells.filter(c => aliveMembers(c).length > 0);
            for (let i = chaffClouds.length - 1; i >= 0; i--) {
                const c = chaffClouds[i];
                c.life -= dt;
                c.pts.position.y -= 0.5 * dt;
                c.pts.material.opacity = Math.min(0.5, c.life / 20);
                if (c.life <= 0) {
                    worldCombatGroup.remove(c.pts);
                    c.pts.geometry.dispose();
                    c.pts.material.dispose();
                    chaffClouds.splice(i, 1);
                }
            }
            let strongest = 0;
            jamCells.forEach(c => {
                if (jam) {
                    // the jammer's set-on receiver loses the radar while it hops, then chases it
                    if (missionTime - lastFreqMove < 0.5) c.lostTimer = jam.lookThrough;
                    else if (c.lostTimer > 0) c.lostTimer -= dt;
                    else {
                        const d = playerFreq - c.jamFreq;
                        c.jamFreq += Math.sign(d) * Math.min(Math.abs(d), jam.retune * dt);
                    }
                }
                const ov = jam ? jamOverlap(playerFreq - c.jamFreq) : 0;
                strongest = Math.max(strongest, ov);
                const on = ov > 0.5;
                if (on && !c.onFreq && selectedTarget && selectedTarget.cell === c && missionTime - lastJamCallout > 35) {
                    lastJamCallout = missionTime;
                    showRadio('TRẮC THỦ', 'Nhiễu nặng! ' + (activeMission.lines.shift || 'Chuyển ngay tần số dự phòng!'));
                }
                c.onFreq = on;
                c.members.forEach(b => { if (b.aura) b.aura.visible = on; });
            });
            jammingLevel = !jam ? 0.04 : selectedTarget ? 1 - targetQuality : 0.2 + strongest * 0.6;
            document.getElementById('jamming-scanlines').style.opacity = (jammingLevel * 0.55).toFixed(2);
        }

        function updateECCMFreq(val) {
            const f = Math.max(BAND_MIN, Math.min(BAND_MAX, parseInt(val, 10) || 2960));
            if (f !== playerFreq) lastFreqMove = missionTime;
            playerFreq = eccmFreq = f;
            document.getElementById('eccm-readout').textContent = `${f} MHz`;
            const freqTag = document.getElementById('radar-freq-tag');
            if (freqTag) freqTag.textContent = `${f} MHz`;
        }
        // ---- Lost-track coaching: show which way to hop, picked by where the jammers are ----
        function wrapFreq(f) { return f > BAND_MAX ? BAND_MIN + (f - BAND_MAX) : f < BAND_MIN ? BAND_MAX - (BAND_MIN - f) : f; }
        function jamAt(f) {
            let j = 0;
            jamCells.forEach(c => { if (aliveMembers(c).length) j += jamOverlap(f - c.jamFreq); });
            return j;
        }
        const jamPromptState = { show: false, info: false, title: '', hint: '', best: 0 };
        function updateJamPrompt() {
            const st = { show: false, info: false, title: '', hint: '', best: 0 };
            const jam = activeMission && activeMission.jam;
            if (currentMode === 'SAM2' && gameState === 'PLAYING' && !gamePaused && jam) {
                const m = guidedMissile;
                const tgt = m ? (activeBombers.includes(m.target) ? m.target : null) : selectedTarget;
                const hopping = missionTime - lastFreqMove < 0.5;
                // shown from the launch on: the jammer is usually closing in during the boost, and the link
                // only starts counting once the booster drops — hopping then is the cheapest moment
                if (tgt && !hopping && !(m && m.lost)) {
                    const d = distKm(tgt), qMin = d > FAR_TRACK_KM ? 0.12 : 0.3;
                    const here = jamAt(playerFreq);
                    const weak = m ? m.blind > 0.15 : targetQuality < qMin;
                    // with a missile up, warn while the jammer is still ~30 MHz away so a human has time to react
                    const closing = here > (m ? 0.15 : 0.45) && (m || trackTimer < TRACK_TIME + 0.5);
                    if ((weak && here > 0.15) || closing) {
                        st.show = true;
                        const dn = jamAt(wrapFreq(playerFreq - 45)), upJ = jamAt(wrapFreq(playerFreq + 45));
                        // keep the previous advice when both ways are about equally clean, so it doesn't flicker
                        st.best = Math.abs(dn - upJ) < 0.05 && jamPromptState.best ? jamPromptState.best : dn < upJ ? -1 : 1;
                        let peak = null;
                        jamCells.forEach(c => { if (aliveMembers(c).length && (!peak || Math.abs(c.jamFreq - playerFreq) < Math.abs(peak.jamFreq - playerFreq))) peak = c; });
                        st.title = m && m.blind > 0.15 ? `Mất tín hiệu dẫn — đạn lạc sau ${Math.max(0, BLIND_LIMIT - m.blind).toFixed(1)}s`
                            : weak ? 'Mất bám — nhiễu đè lên tần số phát' : 'Nhiễu đang bám tới tần số — nhảy tần ngay';
                        st.hint = `Đỉnh nhiễu ở ${Math.round(peak ? peak.jamFreq : playerFreq)} MHz, ta đang phát ${playerFreq} MHz → bấm ${st.best < 0 ? 'Q' : 'E'}`;
                    } else if (weak && m) {
                        // the frequency is clean: the echo is weak (range or chaff), hopping would only cost signal
                        st.show = st.info = true;
                        st.title = `Tín hiệu dẫn yếu — còn ${Math.max(0, BLIND_LIMIT - m.blind).toFixed(1)}s`;
                        st.hint = inChaff(tgt.mesh.position) ? 'Mục tiêu đang trong đám nhiễu tiêu cực (chaff) — tần số sạch, ĐỪNG nhảy tần, lái giữ hướng chờ ra khỏi đám'
                            : `Tần số đang sạch, mục tiêu còn ${Math.round(d)} km nên phản xạ yếu — ĐỪNG nhảy tần, giữ vòng ngắm trên mục tiêu`;
                    } else if (weak && !m) {
                        st.show = st.info = true;
                        st.title = 'Tín hiệu yếu — chưa bám được';
                        st.hint = d > FAR_TRACK_KM ? `Mục tiêu còn ${Math.round(d)} km: tần số đang sạch, chờ vào gần dưới ${FAR_TRACK_KM} km sẽ dễ bám hơn`
                            : 'Tần số đang sạch — giữ vòng ngắm trên mục tiêu, tín hiệu sẽ mạnh lên';
                    }
                }
            }
            const el = document.getElementById('jam-prompt'), p = jamPromptState;
            if (st.show !== p.show) el.style.display = st.show ? 'block' : 'none';
            if (st.info !== p.info) el.classList.toggle('is-info', st.info);
            if (st.title !== p.title) document.getElementById('jp-title').textContent = st.title;
            if (st.hint !== p.hint) document.getElementById('jp-hint').textContent = st.hint;
            if (st.best !== p.best) {
                document.getElementById('jp-q').classList.toggle('is-best', st.best < 0);
                document.getElementById('jp-e').classList.toggle('is-best', st.best > 0);
            }
            Object.assign(jamPromptState, st);
        }

        function hopFrequency(delta) {
            let f = playerFreq + delta;
            if (f > BAND_MAX) f = BAND_MIN + (f - BAND_MAX);
            if (f < BAND_MIN) f = BAND_MAX - (BAND_MIN - f);
            setEccmSlider(f);
        }
        window.hopFrequency = hopFrequency;

        // ---- SNR-75 target selection and tracking ----
        function updateSamTracking(dt) {
            camera.updateMatrixWorld();
            if (!guidedMissile && missileCamHold <= 0) {
                aimRaycaster.setFromCamera({ x: smoothAimX, y: smoothAimY }, camera);
                aimDir.copy(aimRaycaster.ray.direction);
                aimAzDeg = (THREE.MathUtils.radToDeg(Math.atan2(aimDir.x, -aimDir.z)) + 360) % 360;
                aimElDeg = THREE.MathUtils.radToDeg(Math.asin(Math.max(-1, Math.min(1, aimDir.y))));
            }
            if (guidedMissile) {
                selectedTarget = activeBombers.includes(guidedMissile.target) ? guidedMissile.target : null;
                targetQuality = selectedTarget ? computeTargetQuality(selectedTarget) : 0;
                return;
            }
            if (missileCamHold > 0) return;
            const v = _tmpV;
            const screenDist = b => {
                v.copy(b.mesh.position).project(camera);
                if (v.z <= 0 || v.z >= 1) return Infinity;
                return Math.hypot((v.x - smoothAimX) * camera.aspect, v.y - smoothAimY);
            };
            let best = null, bestD = Infinity;
            activeBombers.forEach(b => { const d = screenDist(b); if (d < bestD) { bestD = d; best = b; } });
            const prev = selectedTarget;
            const keepD = selectedTarget && activeBombers.includes(selectedTarget) ? screenDist(selectedTarget) : Infinity;
            if (keepD < 0.16) selectedScreenDist = keepD;
            else { selectedTarget = bestD < 0.1 ? best : null; selectedScreenDist = bestD; }
            if (selectedTarget !== prev) trackTimer = 0;

            const freqMoving = missionTime - lastFreqMove < 0.5;
            targetQuality = selectedTarget ? computeTargetQuality(selectedTarget) * (freqMoving ? 0.5 : 1) : 0;
            const dTgt = selectedTarget ? distKm(selectedTarget) : 0;
            const beyond = Math.max(0, dTgt - NOMINAL_RANGE_KM);
            const canTrack = gameState === 'PLAYING' && selectedTarget && selectedScreenDist < 0.07 &&
                dTgt < 80 && targetQuality >= (dTgt > FAR_TRACK_KM ? 0.12 : 0.3) && !freqMoving;
            // far out the weak echo is the obstacle; past the nominal zone the track also settles a bit slower
            if (canTrack) trackTimer = Math.min(TRACK_TIME + 0.5, trackTimer + dt * TRACK_TIME / (TRACK_TIME + beyond * 0.06));
            else trackTimer = Math.max(0, trackTimer - dt * 1.5);

            if (gameState === 'PLAYING' && activeMission && activeMission.jam && trackTimer >= TRACK_TIME &&
                missionTime - lastCleanCallout > 14 && activeMission.lines.clean) {
                lastCleanCallout = missionTime;
                showRadio('TRẮC THỦ', activeMission.lines.clean);
            }

            const snr = document.getElementById('radar-snr-tag');
            const tag = !activeMission || !activeMission.jam || gameState !== 'PLAYING' ? ['ECCM: SẠCH', 'text-emerald font-bold']
                : targetQuality >= 0.5 ? ['BÁM CỰ LY + GÓC', 'text-emerald font-bold']
                : targetQuality >= 0.3 ? ['CHỈ BÁM GÓC', 'text-amber-300 font-bold']
                : ['NHIỄU ÁP CHẾ', 'text-vermilion font-bold'];
            if (snr.textContent !== tag[0]) { snr.textContent = tag[0]; snr.className = tag[1]; }
        }

        function updateZeroLagTargetLockBracket() {
            const bracketEl = document.getElementById('hud-target-bracket');
            const reticleRange = document.getElementById('reticle-range-tag');
            updateMapLabels();
            const t = currentMode === 'HANGAR' ? null
                : currentMode === 'MIG21' ? mig.target
                : gameState === 'PLAYING' || gameState === 'ENDING' ? selectedTarget : activeBombers[0];
            lockedBomber = t || null;
            if (!t) {
                bracketEl.style.opacity = '0';
                if (reticleRange) reticleRange.classList.add('hidden');
                updateTargetTelemetry(null);
                return;
            }
            const v = _tmpV.copy(t.mesh.position).project(camera);
            if (v.z <= 0 || v.z >= 1) {
                bracketEl.style.opacity = '0';
                if (reticleRange) reticleRange.classList.add('hidden');
                return;
            }
            let px = (v.x * 0.5 + 0.5) * window.innerWidth;
            let py = (-(v.y * 0.5) + 0.5) * window.innerHeight;
            const samPlay = currentMode === 'SAM2' && gameState === 'PLAYING';
            if (samPlay) {
                const j = (1 - targetQuality) * 26;   // noisy angle error on the scope shows up as a jittery gate
                px += (Math.random() - 0.5) * j;
                py += (Math.random() - 0.5) * j;
            }
            bracketEl.style.opacity = '1';
            bracketEl.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
            document.getElementById('bracket-callsign').textContent = t.callsign + (t.damaged ? ' (BỊ THƯƠNG)' : '');

            let text = 'MỤC TIÊU', good = true;
            let rangeText = '-- KM';
            let rangeClass = 'px-1 py-0.5 bg-cyan-950/90 text-cyan-300 border border-cyan-400/50 font-bold';

            if (currentMode === 'MIG21') {
                const distU = playerMiG21 ? playerMiG21.position.distanceTo(t.mesh.position) : (mig.dist || 0);
                const dKm = distU * KM_PER_UNIT;
                rangeText = dKm < 1.0 ? `${Math.round(distU * 25)} M` : `${dKm.toFixed(2)} KM`;

                good = mig.irLock >= 1.5;
                text = good ? 'KHÓA NHIỆT' : mig.envelope || `ĐANG KHÓA ${mig.irLock.toFixed(1)}s`;

                // Tactical color accents based on MiG-21 engagement envelope
                if (distU < 40) {
                    rangeClass = 'px-1 py-0.5 bg-rose-950/90 text-rose-300 border border-rose-500/50 font-bold';
                } else if (distU <= 140) {
                    rangeClass = 'px-1 py-0.5 bg-emerald-950/90 text-emerald-300 border border-emerald-400/50 font-bold';
                } else if (distU <= 200) {
                    rangeClass = 'px-1 py-0.5 bg-cyan-950/90 text-cyan-300 border border-cyan-400/50 font-bold';
                } else {
                    rangeClass = 'px-1 py-0.5 bg-amber-950/90 text-amber-300 border border-amber-400/50 font-bold';
                }

                if (reticleRange) {
                    reticleRange.classList.remove('hidden');
                    const colorCls = distU < 40 ? 'text-rose-400' : distU <= 140 ? 'text-emerald-300' : distU <= 200 ? 'text-cyan-300' : 'text-amber-300';
                    reticleRange.innerHTML = `<span class="text-amber-400/80 drop-shadow">CỰ LY:</span> <span class="font-bold drop-shadow ${colorCls}">${rangeText}</span>`;
                }
            } else if (samPlay) {
                if (reticleRange) reticleRange.classList.add('hidden');
                const dKm = distKm(t);
                if (targetQuality < 0.3) {
                    rangeText = '— KM [NHIỄU]';
                    rangeClass = 'px-1 py-0.5 bg-rose-950/90 text-rose-300 border border-rose-500/50 font-bold';
                } else if (targetQuality < 0.5) {
                    rangeText = `~${Math.round(dKm)} KM`;
                    rangeClass = 'px-1 py-0.5 bg-amber-950/90 text-amber-300 border border-amber-400/50 font-bold';
                } else {
                    rangeText = `${dKm.toFixed(1)} KM`;
                    rangeClass = dKm <= NOMINAL_RANGE_KM
                        ? 'px-1 py-0.5 bg-emerald-950/90 text-emerald-300 border border-emerald-400/50 font-bold'
                        : 'px-1 py-0.5 bg-amber-950/90 text-amber-300 border border-amber-400/50 font-bold';
                }

                if (guidedMissile) { text = `DẪN ĐẠN ${Math.round(targetQuality * 100)}%`; good = targetQuality >= 0.3; }
                else if (targetQuality < (dKm > FAR_TRACK_KM ? 0.12 : 0.3)) { text = 'NHIỄU — MẤT BÁM'; good = false; }
                else if (trackTimer < TRACK_TIME) { text = `${dKm > NOMINAL_RANGE_KM ? 'NGOÀI TẦM · ' : ''}BÁM ${Math.round(trackTimer / TRACK_TIME * 100)}%`; good = false; }
                else text = dKm > NOMINAL_RANGE_KM ? 'BÁM CHẮC · NGOÀI TẦM' : 'BÁM CHẮC';
            } else {
                if (reticleRange) reticleRange.classList.add('hidden');
                const dKm = distKm(t);
                rangeText = `${dKm.toFixed(1)} KM`;
            }

            const rangeEl = document.getElementById('bracket-range');
            if (rangeEl) {
                rangeEl.textContent = rangeText;
                rangeEl.className = rangeClass;
            }

            const distEl = document.getElementById('bracket-dist');
            distEl.textContent = text;
            distEl.className = good ? 'px-1 py-0.5 bg-emerald text-canvas font-bold' : 'px-1 py-0.5 bg-vermilion text-alabaster font-bold';
            updateTargetTelemetry(t);
        }

        function updateTargetTelemetry(t) {
            const set = (id, txt) => { const el = document.getElementById(id); if (el && el.textContent !== txt) el.textContent = txt; };
            if (!t) {
                set('hud-tgt-name', '—'); set('hud-tgt-range', '—'); set('hud-tgt-alt', '—'); set('hud-tgt-q', '—');
                set('hud-lock-status', 'CHƯA CÓ MỤC TIÊU');
                return;
            }
            set('hud-tgt-name', t.callsign);
            if (currentMode === 'MIG21') {
                const distU = playerMiG21 ? playerMiG21.position.distanceTo(t.mesh.position) : (mig.dist || 0);
                const dKm = distU * KM_PER_UNIT;
                set('hud-tgt-range', dKm < 1.0 ? `${Math.round(distU * 25)} M` : `${dKm.toFixed(2)} KM`);
                set('hud-tgt-alt', `${Math.round(t.mesh.position.y * 25).toLocaleString('vi-VN')} M`);
                set('hud-tgt-q', mig.irLock >= 1.5 ? '100% [KHÓA]' : `${Math.round(mig.irLock / 1.5 * 100)}%`);
                const lock = document.getElementById('hud-lock-status');
                if (lock) {
                    const st = mig.irLock >= 1.5 ? ['KHÓA NHIỆT — SẴN SÀNG PHÓNG', 'emerald']
                        : mig.envelope ? [mig.envelope, 'amber-400']
                        : [`ĐANG KHÓA ${mig.irLock.toFixed(1)}s`, 'amber-400'];
                    if (lock.textContent !== st[0]) {
                        lock.textContent = st[0];
                        lock.className = `px-2 py-0.5 rounded bg-${st[1]}/20 border border-${st[1]} text-${st[1]} text-[10px] font-bold`;
                    }
                }
            } else {
                // SAM-2 mode
                // noise jamming denies range first: below q = 0.5 only the angle is known
                set('hud-tgt-range', targetQuality >= 0.5 ? `${distKm(t).toFixed(1)} KM` : '— (NHIỄU)');
                set('hud-tgt-alt', `${Math.round(t.mesh.position.y * 25).toLocaleString('vi-VN')} M`);
                set('hud-tgt-q', `${Math.round(targetQuality * 100)}%`);
                const lock = document.getElementById('hud-lock-status');
                if (lock) {
                    const st = targetQuality < (distKm(t) > FAR_TRACK_KM ? 0.12 : 0.3) ? ['MẤT BÁM [NHIỄU]', 'vermilion']
                        : trackTimer < TRACK_TIME ? [`ĐANG BÁM ${trackTimer.toFixed(1)}s`, 'amber-400']
                        : distKm(t) > NOMINAL_RANGE_KM ? ['NGOÀI TẦM — ĐẠN ĐẾN NƠI SẼ YẾU', 'amber-400']
                        : ['BÁM CHẮC — SẴN SÀNG PHÓNG', 'emerald'];
                    if (lock.textContent !== st[0]) {
                        lock.textContent = st[0];
                        lock.className = `px-2 py-0.5 rounded bg-${st[1]}/20 border border-${st[1]} text-${st[1]} text-[10px] font-bold`;
                    }
                }
            }
        }

        function updateMapLabels() {
            const mapLabelsContainer = document.getElementById('tactical-map-labels');
            if (currentMode === 'SAM2' && cameraPreset === 'MAP3D' && !guidedMissile) {
                mapLabelsContainer.classList.remove('hidden');
                const v = new THREE.Vector3();
                HANOI_MAP_PINS.forEach(lm => {
                    const el = document.getElementById(lm.id);
                    if (!el) return;
                    v.copy(lm.pos).project(camera);
                    if (v.z > 0 && v.z < 1) {
                        el.style.opacity = '1';
                        el.style.transform = `translate3d(${((v.x * 0.5 + 0.5) * window.innerWidth).toFixed(1)}px, ${((-(v.y * 0.5) + 0.5) * window.innerHeight).toFixed(1)}px, 0) translate(-50%, -100%)`;
                    } else {
                        el.style.opacity = '0';
                    }
                });
            } else {
                mapLabelsContainer.classList.add('hidden');
            }
        }

        // ---- Launchers and reload ----
        function startReload() {
            if (gameState !== 'PLAYING' || currentMode !== 'SAM2' || gamePaused) return;
            if (reloadingLauncher) { showRadio('TỔ NẠP ĐẠN', `Đang nạp bệ ${reloadingLauncher.name}, chờ xong mới nạp bệ khác.`); return; }
            const l = samLaunchers.find(x => !x.loaded);
            if (!l) { showRadio('TỔ NẠP ĐẠN', 'Cả ba bệ đã có đạn.'); return; }
            if (missionReserve <= 0) { showRadio('TỔ NẠP ĐẠN', 'Kho đã hết đạn!'); return; }
            missionReserve--;
            reloadingLauncher = l;
            l.reloadT = RELOAD_TIME;
            SoundFX.reloadStart();
            showRadio('TỔ NẠP ĐẠN', `Xe vận tải – nạp đạn đang lắp đạn lên bệ ${l.name}…`);
            updateObjectiveHud();
        }

        // ---- Anti-aircraft artillery: 37/57 mm guns with tracers, 100 mm firing flak bursts ----
        // Their shells top out well below the B-52s at ~10 km (as in 1972): a barrage, not a threat.
        const aaaSites = [];
        let aaaRounds = [], aaaTracerGeo = null, aaaTracerMat = null;
        let lastAAASoundTime = 0, lastFlakSoundTime = 0;

        function updateAAA(dt) {
            if (!aaaSites.length) {
                for (let i = 0; i < 8; i++) {
                    const a = Math.random() * Math.PI * 2, r = 70 + Math.random() * 220;
                    const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.8 + 20;
                    if (Math.hypot(x, z - 20) < 50) continue;
                    aaaSites.push({ pos: new THREE.Vector3(x, 1, z), cd: Math.random() * 5, heavy: Math.random() < 0.35 });
                }
                aaaTracerGeo = new THREE.BoxGeometry(0.22, 0.22, 4.5);
                aaaTracerMat = new THREE.MeshBasicMaterial({ color: 0xFF6A2A, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
            }

            const firing = currentMode === 'SAM2' && !gamePaused && (gameState === 'PLAYING' || gameState === 'MENU') &&
                activeBombers.some(b => distKm(b) < 42);
            if (firing) {
                const nowS = performance.now() / 1000;
                aaaSites.forEach(site => {
                    site.cd -= dt;
                    if (site.cd > 0 || aaaRounds.length > 160) return;
                    site.cd = (site.heavy ? 4.8 : 3.2) + Math.random() * 4.2;
                    const b = activeBombers[Math.floor(Math.random() * activeBombers.length)];
                    const burstAlt = site.heavy ? 150 + Math.random() * 110 : 70 + Math.random() * 80;
                    const aim = new THREE.Vector3(b.mesh.position.x + (Math.random() - 0.5) * 260, burstAlt, b.mesh.position.z * 0.55 + (Math.random() - 0.5) * 260);
                    const dir = aim.sub(site.pos).normalize();
                    const speed = site.heavy ? 70 : 55, n = site.heavy ? 2 : 3 + Math.floor(Math.random() * 2);
                    for (let k = 0; k < n; k++) {
                        const d = dir.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04)).normalize();
                        const mesh = site.heavy ? null : new THREE.Mesh(aaaTracerGeo, aaaTracerMat);
                        if (mesh) { mesh.visible = false; worldCombatGroup.add(mesh); }
                        aaaRounds.push({ mesh, pos: site.pos.clone(), vel: d.multiplyScalar(speed), delay: k * (site.heavy ? 0.45 : 0.09),
                            burstAlt, heavy: site.heavy, started: false });
                    }
                    if (nowS - lastAAASoundTime > 1.8 && (gameState === 'PLAYING' ? Math.random() < 0.35 : Math.random() < 0.15)) {
                        lastAAASoundTime = nowS;
                        SoundFX.aaa(site.pos.distanceTo(camera.position), site.heavy);
                    }
                });
            }

            for (let i = aaaRounds.length - 1; i >= 0; i--) {
                const r = aaaRounds[i];
                if (r.delay > 0) { r.delay -= dt; continue; }
                if (!r.started) {
                    r.started = true;
                    spawnSmokePuff(r.pos.clone(), r.heavy ? 3.2 : 1.6, new THREE.Vector3(0, 1, 0), 0.12, 'fire');
                    if (r.mesh) r.mesh.visible = true;
                }
                r.vel.y -= 2.2 * dt;
                r.pos.addScaledVector(r.vel, dt);
                if (r.mesh) { r.mesh.position.copy(r.pos); r.mesh.lookAt(_tmpV2.copy(r.pos).add(r.vel)); }
                if (r.pos.y >= r.burstAlt || r.vel.y < 0) {
                    spawnSmokePuff(r.pos.clone(), r.heavy ? 5 : 2.2, new THREE.Vector3(), 0.18, 'fire');
                    spawnSmokePuff(r.pos.clone(), r.heavy ? 7 : 3, new THREE.Vector3((Math.random() - 0.5) * 2, 0.4, 0), r.heavy ? 4 : 2.2, 'blacksmoke');
                    if (typeof SoundFX !== 'undefined' && SoundFX.flakBurst) {
                        const nowS = performance.now() / 1000;
                        if (nowS - lastFlakSoundTime > 1.4 && (r.heavy || Math.random() < 0.12)) {
                            lastFlakSoundTime = nowS;
                            SoundFX.flakBurst(r.pos.distanceTo(camera.position), r.heavy);
                        }
                    }
                    if (r.mesh) worldCombatGroup.remove(r.mesh);
                    aaaRounds.splice(i, 1);
                }
            }
        }

        function clearAAA() {
            aaaRounds.forEach(r => { if (r.mesh) worldCombatGroup.remove(r.mesh); });
            aaaRounds = [];
        }

        function updateReload(dt) {
            if (!reloadingLauncher) {
                // the loading crew starts on an empty rail by itself
                if (gameState === 'PLAYING' && currentMode === 'SAM2' && !gamePaused && missionReserve > 0 && samLaunchers.some(l => !l.loaded)) startReload();
                return;
            }
            const l = reloadingLauncher;
            l.reloadT -= dt;
            if (l.reloadT <= 0) {
                l.loaded = true;
                l.battery.loadedMissile.visible = true;
                reloadingLauncher = null;
                SoundFX.reloadDone();
                if (gameState === 'PLAYING') showRadio('TỔ NẠP ĐẠN', `Bệ ${l.name} đã sẵn sàng!`);
                updateObjectiveHud();
            }
        }

        let flameGlowTex = null;
        // Layered additive plume: hot core, orange body, faint outer flame, nozzle glow.
        // tailZ is the nozzle in model space; sign is +1 when the tail is on +Z.
        function attachBoosterFlame(missileMesh, tailZ = 5.3, sign = 1, size = 1) {
            if (!flameGlowTex) {
                const c = document.createElement('canvas');
                c.width = c.height = 64;
                const g = c.getContext('2d'), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
                grd.addColorStop(0, 'rgba(255,250,235,1)');
                grd.addColorStop(0.25, 'rgba(255,190,90,0.75)');
                grd.addColorStop(0.6, 'rgba(255,110,30,0.2)');
                grd.addColorStop(1, 'rgba(255,80,20,0)');
                g.fillStyle = grd;
                g.fillRect(0, 0, 64, 64);
                flameGlowTex = new THREE.CanvasTexture(c);
            }
            const fx = new THREE.Group();
            fx.name = 'motorFlame';
            fx.position.z = tailZ;
            if (sign < 0) fx.rotation.y = Math.PI;
            const cone = (r, len, color, opacity) => {
                const geo = new THREE.ConeGeometry(r * size, len * size, 20, 1, true);
                geo.translate(0, len * size / 2, 0);
                geo.rotateX(Math.PI / 2);   // base at the nozzle, tip trailing along +Z
                fx.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
                    color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
                })));
            };
            cone(0.24, 2.2, 0xFFF4D6, 0.7);
            cone(0.46, 4.4, 0xFFA040, 0.38);
            cone(0.66, 7.5, 0xFF6A1F, 0.14);
            const glow = new THREE.Sprite(new THREE.SpriteMaterial({
                map: flameGlowTex, color: 0xFFA860, opacity: 0.55, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
            }));
            glow.scale.setScalar(4.5 * size);
            glow.position.z = 0.4 * size;
            fx.add(glow);
            fx.userData.glow = glow;
            fx.userData.size = size;
            missileMesh.add(fx);
            return fx;
        }

        function triggerPrimaryWeaponFire() {
            if (currentMode === 'HANGAR' || gamePaused) return;
            if (gameState === 'MENU') {
                if (activeMissiles.length < 2 && activeBombers.length) launchSamMissile(samLaunchers[0], activeBombers[0], false);
                return;
            }
            if (gameState !== 'PLAYING') return;
            if (currentMode === 'MIG21') {
                if (missionAmmo > 0) fireK13();
                else fireMiGCannon();
                return;
            }
            if (guidedMissile) {
                if (guidedMissile.t > 2.4) guidedMissile.detonateNow = true;   // command detonation
                return;
            }
            if (missileCamHold > 0) return;
            const launcher = samLaunchers.find(l => l.loaded);
            if (!launcher) {
                showRadio('BỆ PHÓNG', missionReserve > 0 || reloadingLauncher ? 'Cả ba bệ đều trống — tổ nạp đạn đang lắp đạn, chờ chút!' : 'Hết đạn!');
                return;
            }
            if (!selectedTarget) { showRadio('TRẮC THỦ', 'Chưa bắt được mục tiêu — bám theo vệt phản xạ B-52 trên màn sóng.'); return; }
            if (trackTimer < TRACK_TIME) {
                showRadio('TRẮC THỦ', targetQuality < 0.3
                    ? 'Nhiễu quá nặng, chưa bám được! Đổi tần số tránh đỉnh nhiễu, hoặc chờ mục tiêu vào gần.'
                    : 'Chưa bám chắc — tiếp tục bám sát dải phản xạ thêm chút nữa.');
                return;
            }
            launcher.loaded = false;
            launcher.battery.loadedMissile.visible = false;
            missionShots++;
            launchSamMissile(launcher, selectedTarget, true);
            updateObjectiveHud();
            setPosterLaunchState(true);
            if (!steerHintShown) {
                steerHintShown = true;
                showRadio('SĨ QUAN ĐIỀU KHIỂN', 'Đạn rời bệ! Giữ chắc cánh sóng bám sát đường bay mục tiêu!');
            }
        }

        function launchSamMissile(launcher, target, guided) {
            SoundEngine.playLaunch(false);
            cameraShake = 0.52;
            const origin = launcher.battery.root.position.clone().add(new THREE.Vector3(0, 3.8, -1));
            const mesh = HighPolyFactory.createSAM2Missile();
            mesh.scale.setScalar(0.78);
            const flame = attachBoosterFlame(mesh);
            mesh.position.copy(origin);
            worldCombatGroup.add(mesh);
            launchPadLight.position.set(origin.x, 4, origin.z + 1);
            launchPadLight.intensity = 7;
            launchBlast(origin);
            const los = target ? target.mesh.position.clone().sub(origin).normalize() : new THREE.Vector3(0, 0.6, -1).normalize();
            const m = {
                kind: 'SAM', mesh, dir: los.clone().add(new THREE.Vector3(0, 0.5, 0)).normalize(),
                speed: 6, t: 0, life: 44, target, guided, q: 1, blind: 0, lost: false, smokeTick: 0, prevNear: Infinity, flame
            };
            activeMissiles.push(m);
            if (guided) guidedMissile = m;
            if (!guided) {
                launcher.battery.loadedMissile.visible = false;
                setTimeout(() => { if (gameState === 'MENU') launcher.battery.loadedMissile.visible = true; }, 1100);
            }
        }

        function getPilotCallsign() {
            return (activeMission && activeMission.pilot) ? String(activeMission.pilot) : '5121';
        }

        function fireK13() {
            const nowS = performance.now() / 1000;
            if (missionAmmo <= 0) { showRadio(getPilotCallsign(), 'Hết tên lửa!'); return; }
            if (nowS - lastFireTime < 1.2) return;
            if (!mig.target || mig.irLock < 1.5) { showRadio(getPilotCallsign(), `Chưa khóa được mục tiêu! ${mig.envelope}`); return; }
            lastFireTime = nowS;
            missionAmmo--;
            missionShots++;
            SoundEngine.playLaunch(true);
            cameraShake = 0.45;
            const mesh = HighPolyFactory.createK13Missile();
            mesh.scale.setScalar(2.2);
            const flame = attachBoosterFlame(mesh, -1.15, -1, 0.22);
            const right = _tmpR.crossVectors(mig.fwd, WORLD_UP).normalize();
            mesh.position.copy(playerMiG21.position).addScaledVector(right, missionAmmo % 2 ? 2.4 : -2.4).add(new THREE.Vector3(0, -0.6, 0));
            worldCombatGroup.add(mesh);
            // APU-13 launch rail smoke puff & rocket ignition flash
            spawnSmokePuff(mesh.position.clone(), 3.2, mig.fwd.clone().multiplyScalar(-5), 0.7, 'smoke');
            spawnSmokePuff(mesh.position.clone(), 2.2, mig.fwd.clone().multiplyScalar(-2), 0.25, 'fire');
            activeMissiles.push({
                kind: 'K13', mesh, dir: mig.fwd.clone(), speed: mig.speed + 6, speed0: mig.speed,
                t: 0, life: 7, target: mig.target, guided: false, smokeTick: 0, prevNear: Infinity, flame
            });
            updateObjectiveHud();
            showRadio(getPilotCallsign(), missionAmmo === 1 ? 'Phóng quả thứ nhất!' : 'Phóng quả thứ hai!');
        }

        // ponytail: twin-barrel GSh-23L autocannon for MiG-21 close-in dogfighting
        function fireMiGCannon() {
            if (gameState !== 'PLAYING' || currentMode !== 'MIG21') return;
            const nowS = performance.now() / 1000;
            if (nowS - (mig.lastCannonFire || 0) < 0.12) return;
            if ((mig.cannonAmmo || 0) <= 0) {
                showRadio(getPilotCallsign(), 'Đã hết đạn pháo 23mm!');
                return;
            }
            mig.lastCannonFire = nowS;
            mig.cannonAmmo = Math.max(0, mig.cannonAmmo - 10);
            cameraShake = Math.max(cameraShake, 0.22);
            SoundFX.gunBurst(0);

            if (!tracerGeo) {
                tracerGeo = new THREE.CylinderGeometry(0.06, 0.06, 4, 5);
                tracerMat = new THREE.MeshBasicMaterial({ color: 0xFFC46B, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
            }
            const p = playerMiG21.position;
            [-0.3, 0.3].forEach(offX => {
                const gunPos = p.clone().addScaledVector(mig.fwd, 3.5).add(new THREE.Vector3(offX, -0.6, 0).applyEuler(playerMiG21.rotation));
                const dir = mig.fwd.clone();
                dir.x += (Math.random() - 0.5) * 0.02;
                dir.y += (Math.random() - 0.5) * 0.02;
                dir.z += (Math.random() - 0.5) * 0.02;
                dir.normalize();
                const mesh = new THREE.Mesh(tracerGeo, tracerMat);
                mesh.position.copy(gunPos);
                mesh.quaternion.setFromUnitVectors(WORLD_UP, dir);
                worldCombatGroup.add(mesh);
                gunTracers.push({ mesh, vel: dir.multiplyScalar(220), life: 0.8 });
            });

            if (mig.target && activeBombers.includes(mig.target)) {
                const toT = _tmpV2.copy(mig.target.mesh.position).sub(p);
                const dist = toT.length();
                const offBore = THREE.MathUtils.radToDeg(mig.fwd.angleTo(toT));
                if (dist < 140 && offBore < 14) {
                    spawnSparks(mig.target.mesh.position, 15, 12, 0.2);
                    if (damageBomber(mig.target)) {
                        showRadio(getPilotCallsign(), 'Pháo 23mm bắn trúng thùng nhiên liệu! B-52 nổ tung!');
                    } else {
                        showRadio(getPilotCallsign(), `Pháo 23mm trúng thân! Còn ${mig.target.hp}% HP.`);
                    }
                }
            }
            updateObjectiveHud();
        }

        // ---- Missiles ----
        function leadDirection(m, tgt, chaffError) {
            const tgo = m.mesh.position.distanceTo(tgt.mesh.position) / Math.max(20, m.speed);
            const aimP = _tmpL.copy(tgt.mesh.position).addScaledVector(tgt.vel, tgo);
            if (chaffError) aimP.add(chaffOffset(tgt));   // chaff echoes pull the tracking gate off the bomber
            return aimP.sub(m.mesh.position).normalize();
        }

        const NOMINAL_RANGE_KM = 50;   // beyond this the V-750 arrives slow, after its sustainer burns out
        const FAR_TRACK_KM = 30;       // past this the echo is weak: the station accepts a noisier track
        const BLIND_LIMIT = 2.2;   // seconds without a usable track before the missile is lost
        function steerSamMissile(m, tgt, dt) {
            const hopping = missionTime - lastFreqMove < 0.5;
            m.q = tgt ? computeTargetQuality(tgt) * (hopping ? 0.7 : 1) : 0;
            if (m.t < 2.4) {
                // booster: climbs out along the rail, then turns onto the line of sight
                m.speed = Math.min(56, m.speed + 24 * dt);
                if (tgt) m.dir.lerp(leadDirection(m, tgt), Math.min(1, dt * 0.8)).normalize();
                return;
            }
            // sustainer burns ~26 s; after that the missile coasts, loses speed and answers the controls sluggishly
            if (m.t < 26) m.speed = Math.min(80, m.speed + 9 * dt);
            else m.speed = Math.max(28, m.speed - 4.5 * dt);
            const energy = Math.min(1, m.speed / 80);
            if (m.guided && !m.lost) {
                // the command link needs the station to see the target: a jammed track blinds it
                // at long range the echo is weak anyway, so the station accepts a noisier (angle-only) track
                // only the spot jammer sitting on our frequency may cut the link — that is the part a hop fixes;
                // barrage and range just make the missile mushier to steer (see ctl below)
                const blindQ = Math.min(tgt && distKm(tgt) > FAR_TRACK_KM ? 0.1 : 0.25, tgt ? computeTargetQuality(tgt, true) * 0.55 : 1);
                // the hop itself mustn't be what blinds the link: during the 0.5 s switch-over the count only holds
                if (hopping) { /* hold */ }
                else if (m.q < blindQ) m.blind += dt;
                else m.blind = Math.max(0, m.blind - dt * 1.2);   // a clean frequency wins the link back quickly
                if (m.blind > BLIND_LIMIT) {
                    m.lost = true;
                    m.life = Math.min(m.life, 3);
                    if (gameState === 'PLAYING') showRadio('SĨ QUAN ĐIỀU KHIỂN', 'Mất tín hiệu dẫn — đạn lạc! Phải nhảy tần trước khi máy gây nhiễu bám tới.');
                }
                const right = _tmpR.crossVectors(m.dir, WORLD_UP);
                if (right.lengthSq() < 1e-4) right.set(1, 0, 0);
                right.normalize();
                const up = _tmpU.crossVectors(right, m.dir).normalize();
                const ax = deadzone(smoothAimX, 0.06), ay = deadzone(smoothAimY, 0.06);
                const ctl = 1.15 * energy * (0.3 + 0.7 * Math.min(1, m.q / 0.6));   // mushy in noise or when slow
                m.dir.addScaledVector(right, ax * ctl * dt).addScaledVector(up, ay * ctl * dt);
                // terminal phase: stick strictly to designated target if active; fallback to nearest B-52 only if lost/destroyed
                m.seek = null;
                if (tgt && activeBombers.includes(tgt)) {
                    const d = tgt.mesh.position.distanceTo(m.mesh.position);
                    if (d < 110 && m.dir.angleTo(_tmpV2.copy(tgt.mesh.position).sub(m.mesh.position)) < 0.65) {
                        m.seek = tgt;
                    }
                } else {
                    let bestD = 110;
                    activeBombers.forEach(b => {
                        const d = b.mesh.position.distanceTo(m.mesh.position);
                        if (d < bestD && m.dir.angleTo(_tmpV2.copy(b.mesh.position).sub(m.mesh.position)) < 0.52) { bestD = d; m.seek = b; }
                    });
                }
                if (m.seek) {
                    m.dir.lerp(leadDirection(m, m.seek, inChaff(m.seek.mesh.position)), Math.min(1, dt * 2.4 * energy * (0.55 + 0.45 * m.q)));
                } else if (tgt && m.q >= 0.5) {
                    const gain = m.mesh.position.distanceTo(tgt.mesh.position) < 120 ? 1.1 : 0.12;
                    m.dir.lerp(leadDirection(m, tgt, inChaff(tgt.mesh.position)), Math.min(1, dt * gain * m.q));
                }
                const n = (1 - m.q) * 1.6 * dt;
                m.dir.x += (Math.random() - 0.5) * n;
                m.dir.y += (Math.random() - 0.5) * n;
                m.dir.z += (Math.random() - 0.5) * n;
            } else if (m.guided) {
                m.dir.y -= 0.08 * dt;   // no commands: the missile sags off the line
            } else if (tgt) {
                m.dir.lerp(leadDirection(m, tgt), Math.min(1, dt * 2.6));
            }
            m.dir.normalize();
        }

        function steerK13(m, tgt, dt) {
            m.speed = Math.min(m.speed0 + 34, m.speed + 40 * dt);
            if (tgt && m.dir.angleTo(_tmpV2.copy(tgt.mesh.position).sub(m.mesh.position)) < 0.6) {   // seeker gimbal limit
                m.dir.lerp(leadDirection(m, tgt), Math.min(1, dt * 2.4)).normalize();
            }
        }

        function updateMissiles(dt) {
            for (let i = activeMissiles.length - 1; i >= 0; i--) {
                const m = activeMissiles[i];
                m.t += dt;
                m.life -= dt;
                const tgt = m.target && activeBombers.includes(m.target) ? m.target : null;
                if (m.kind === 'SAM') steerSamMissile(m, tgt, dt);
                else steerK13(m, tgt, dt);
                m.mesh.position.addScaledVector(m.dir, m.speed * dt);
                // V-750 model has its nose on -Z (as on the launcher rail); K-13 on +Z
                // turn by the smallest rotation from last frame's heading: lookAt with world-up spins the
                // airframe wildly when the missile climbs near vertical
                const want = _tmpV.copy(m.dir).multiplyScalar(m.kind === 'SAM' ? -1 : 1);
                if (!m.fwd) {
                    if (Math.abs(want.y) < 0.98) m.mesh.lookAt(_tmpV2.copy(m.mesh.position).add(want));
                    else m.mesh.quaternion.setFromUnitVectors(MODEL_FWD, want);
                    m.fwd = want.clone();
                } else {
                    m.mesh.quaternion.premultiply(_turnQ.setFromUnitVectors(m.fwd, want)).normalize();
                    m.fwd.copy(want);
                }

                if (m.flame) {
                    // booster burns out at 2.4 s; the sustainer plume is shorter and paler
                    const boost = m.kind === 'SAM' && m.t < 2.4;
                    const w = boost ? 1.15 : 0.8, len = (boost ? 1.3 : 0.75) * (0.86 + Math.random() * 0.28);
                    m.flame.scale.set(w, w, len);
                    m.flame.userData.glow.scale.setScalar(m.flame.userData.size * (boost ? 2.4 : 1.5) * (0.9 + Math.random() * 0.2));
                }
                m.smokeTick += dt;
                if (m.smokeTick >= 0.03) {
                    m.smokeTick = 0;
                    const tail = m.mesh.position.clone().addScaledVector(m.dir, m.kind === 'SAM' ? -4.6 : -2.8);
                    const s = m.kind === 'SAM' ? 3 : 1.2;
                    spawnSmokePuff(tail, s + Math.random() * s * 0.5, new THREE.Vector3((Math.random() - 0.5) * 1.6, 0.6, (Math.random() - 0.5) * 1.6), 2.4 + Math.random(), 'trail');
                    if (Math.random() < 0.5) spawnSmokePuff(tail, s * 0.9, new THREE.Vector3(), 0.2, 'fire');
                }

                // radio proximity fuze: fires at the closest point of approach (jamming does not affect it)
                let nd = Infinity;
                activeBombers.forEach(b => { nd = Math.min(nd, b.mesh.position.distanceTo(m.mesh.position)); });
                const fuze = m.kind === 'SAM' ? 15 : 6;
                const passing = nd < fuze && nd > m.prevNear && m.t > 1.2;
                m.prevNear = nd;
                if (passing || m.detonateNow || m.life <= 0 || m.mesh.position.y < 0.5) {
                    explodeMissile(m, i, m.detonateNow ? 'command' : passing ? 'fuze' : 'self');
                }
            }
        }

        function explodeMissile(m, idx, reason) {
            const pos = m.mesh.position.clone();
            worldCombatGroup.remove(m.mesh);
            activeMissiles.splice(idx, 1);
            const big = m.kind === 'SAM';
            for (let k = 0; k < (big ? 10 : 6); k++) {
                spawnSmokePuff(pos, (big ? 9 : 4) + Math.random() * 6, new THREE.Vector3((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 18), 0.5 + Math.random() * 0.4, 'fire');
            }
            for (let k = 0; k < 5; k++) {
                spawnSmokePuff(pos, 10 + Math.random() * 6, new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4), 2.5, 'smoke');
            }
            spawnSparks(pos, big ? 90 : 40, 30, 0.2);
            skyFlashLight.position.copy(pos);
            skyFlashLight.intensity = Math.max(skyFlashLight.intensity, 4);
            SoundEngine.playExplosion(pos, false);

            let killed = 0, hurt = 0;
            activeBombers.slice().forEach(b => {
                const d = b.mesh.position.distanceTo(pos);
                if (d < (big ? 7 : 6)) { killBomber(b); killed++; }
                else if (big && d < 14) { if (damageBomber(b)) killed++; else hurt++; }
            });
            if (m === guidedMissile || (currentMode === 'MIG21' && m.kind === 'K13')) {
                if (m === guidedMissile) guidedMissile = null;
                // a kill gets a falling-wreck cam: long when it ends the mission, short when there's more to shoot
                missileCamHold = !killed ? 2.2 : gameState === 'ENDING' ? 10 : 4;
                missileCamHoldPos.copy(pos);
                if (!killed) killCamWreck = null;
                else killCamOff.copy(camera.position).sub(pos).setY(0).setLength(48).setY(14);
            }
            if (gameState === 'PLAYING' && !killed && (m.guided || m.kind === 'K13')) {
                showRadio(big ? 'SĨ QUAN ĐIỀU KHIỂN' : getPilotCallsign(), hurt ? 'Mục tiêu bị thương nhưng vẫn bay! Bám tiếp, phóng quả khác!'
                    : reason === 'self' ? 'Đạn tự hủy — trượt mục tiêu.' : 'Đạn nổ trượt mục tiêu.');
            }
        }

        // Chase cam: smoothly catches up behind the missile immediately on launch (0.4s)
        // and frames the missile in lower-third tracking toward target B-52
        function followMissileCamera(dt, shakeVec) {
            const m = guidedMissile, p = m.mesh.position;
            if (!m.cam) {
                const fwd = camera.getWorldDirection(new THREE.Vector3());
                m.cam = { t: 0, dir: m.dir.clone(), off: new THREE.Vector3(), lookOff: new THREE.Vector3(),
                          fromPos: camera.position.clone(), fromLook: camera.position.clone().addScaledVector(fwd, 70), init: false };
            }
            const c = m.cam;
            c.t += dt;
            if (!c.up) c.up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
            const prevDir = _tmpL.copy(c.dir);

            // Booster separation visual feedback at T+2.4s
            if (!m.staged && m.t >= 2.4) {
                m.staged = true;
                cameraShake = Math.max(cameraShake, 0.32);
                spawnSmokePuff(p.clone().addScaledVector(m.dir, -4.5), 5.5, new THREE.Vector3(0, -1.2, 0), 1.2, 'smoke');
                spawnSparks(p.clone().addScaledVector(m.dir, -4.5), 24, 18, 0.22);
            }

            // once out of the boost, sight along missile → target so the locked bomber stays in frame ahead
            // of the missile (the missile itself sits just below centre); without a target follow the heading
            const tgt = m.seek || (m.target && activeBombers.includes(m.target) ? m.target : null);
            const want = _tmpV.copy(m.dir);
            if (tgt && !m.lost) {
                const w = Math.min(1, Math.max(0, (c.t - 0.4) / 1.4));
                want.lerp(_tmpV2.copy(tgt.mesh.position).sub(p).normalize(), w * w * (3 - 2 * w)).normalize();
            }
            c.dir.lerp(want, 1 - Math.exp(-dt * 3.5)).normalize();
            // carry the camera's up along with the turn instead of rebuilding it from world-up (that flips
            // and spins the view when the missile goes vertical); ease it back to level when not steep
            c.up.applyQuaternion(_turnQ.setFromUnitVectors(prevDir, c.dir));
            const level = _tmpU.copy(WORLD_UP).addScaledVector(c.dir, -c.dir.y), lv = level.length();
            if (lv > 0.2) c.up.lerp(level.multiplyScalar(1 / lv), 1 - Math.exp(-dt * 2.5 * lv));
            c.up.addScaledVector(c.dir, -c.up.dot(c.dir)).normalize();
            const up = _tmpU.copy(c.up);
            const ease = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
            const e = ease(c.t / 0.42), settle = ease(c.t / 2.5);
            const back = 15 - 2.5 * settle, lift = 2.8 + 0.4 * settle;
            // offsets are relative to the missile, so its acceleration adds no lag; looking far down the axis
            // (rather than at a point near the missile) keeps the missile in the lower frame and the bomber clear above it
            const offWant = _tmpV.copy(c.dir).multiplyScalar(-back).addScaledVector(up, lift);
            const lookWant = _tmpV2.copy(c.dir).multiplyScalar(60 + 340 * settle);
            if (!c.init) { c.off.copy(offWant); c.lookOff.copy(lookWant); c.init = true; }
            const k = 1 - Math.exp(-dt * 6);
            c.off.lerp(offWant, k);
            c.lookOff.lerp(lookWant, k);
            camera.position.copy(c.fromPos).lerp(_tmpV.copy(p).add(c.off), e);
            camera.position.addScaledVector(shakeVec, 0.12);
            camera.up.copy(WORLD_UP).lerp(up, e).normalize();
            camera.lookAt(_tmpL.copy(c.fromLook).lerp(_tmpV2.copy(p).add(c.lookOff), e));
            camera.up.copy(WORLD_UP);   // every other view builds its lookAt on world-up
        }
        const _turnQ = new THREE.Quaternion(), MODEL_FWD = new THREE.Vector3(0, 0, 1);

        // ---- MiG-21 tail chase ----
        function migForward(out) {
            return out.set(-Math.sin(mig.yaw) * Math.cos(mig.pitch), Math.sin(mig.pitch), -Math.cos(mig.yaw) * Math.cos(mig.pitch));
        }

        function initMiGIntercept() {
            Object.assign(mig, {
                yaw: 0.06, pitch: 0.02, bank: 0, throttle: 0.7, speed: 14, irLock: 0,
                hp: 100, gunTimer: 1, underFire: 0, target: null, envelope: '', dist: 0,
                cannonAmmo: 200, lastCannonFire: -10
            });
            playerMiG21.position.set(-70, 396, 600);   // ~10 km behind the cell
            migForward(mig.fwd);
            playerMiG21.lookAt(playerMiG21.position.clone().add(mig.fwd));
            mouseAimX = mouseAimY = smoothAimX = smoothAimY = 0;
        }

        function updateMiGFlight(dt) {
            const ax = deadzone(smoothAimX, 0.05), ay = deadzone(smoothAimY, 0.05);
            mig.bank += (ax * 1.05 - mig.bank) * Math.min(1, dt * 3);
            mig.yaw -= Math.sin(mig.bank) * 0.6 * dt;                    // coordinated turn
            mig.pitch = Math.max(-0.55, Math.min(0.55, mig.pitch + ay * 0.55 * dt));
            const thr = (keysDown.KeyW ? 1 : 0) - (keysDown.KeyS ? 1 : 0);
            mig.throttle = Math.max(0.2, Math.min(1, mig.throttle + thr * dt * 0.45));
            mig.speed += (8 + mig.throttle * 10 - mig.speed) * Math.min(1, dt * 0.6);
            migForward(mig.fwd);
            const p = playerMiG21.position;
            p.addScaledVector(mig.fwd, mig.speed * dt);
            if (p.y < 315) { p.y = 315; mig.pitch = Math.max(mig.pitch, 0); }
            playerMiG21.lookAt(_tmpV.copy(p).add(mig.fwd));
            playerMiG21.rotateZ(mig.bank);
            const plume = playerMiG21.getObjectByName('afterburnerPlume');
            if (plume) plume.scale.set(1, 1, (mig.throttle > 0.85 ? 1.35 : 0.5 + mig.throttle * 0.5) * (0.92 + Math.random() * 0.12));
            if (migCloudDeck) {
                const period = 12000 / 18;
                migCloudDeck.position.x = Math.round(p.x / period) * period;
                migCloudDeck.position.z = Math.round(p.z / period) * period;
            }
            // Wingtip aerodynamic condensation vortices in high-G maneuvers
            if ((Math.abs(mig.bank) > 0.35 || Math.abs(smoothAimY) > 0.28) && Math.random() < 0.45) {
                [-4.8, 4.8].forEach(wx => {
                    const tipPos = p.clone().add(new THREE.Vector3(wx, -0.1, -1.8).applyEuler(playerMiG21.rotation));
                    spawnSmokePuff(tipPos, 0.9 + Math.random() * 0.4, mig.fwd.clone().multiplyScalar(-1.5), 0.4, 'trail');
                });
            }
            updateMiGWeapons(dt);
        }

        function updateMiGWeapons(dt) {
            const p = playerMiG21.position;
            let best = null, bestScore = Infinity;
            activeBombers.forEach(b => {
                const toB = _tmpV2.copy(b.mesh.position).sub(p);
                const d = toB.length();
                const angle = mig.fwd.angleTo(toB);
                // Weight distance heavily by angle off MiG-21 nose; give existing locked target 35% stickiness bonus
                let score = d * (1.0 + angle * 2.2);
                if (b === mig.target) score *= 0.65;
                if (score < bestScore) { bestScore = score; best = b; }
            });
            mig.target = best;
            mig.underFire = Math.max(0, mig.underFire - dt);
            if (!best) { mig.irLock = 0; mig.envelope = ''; return; }
            const toT = _tmpV2.copy(best.mesh.position).sub(p);
            const dist = toT.length();
            const offBore = THREE.MathUtils.radToDeg(mig.fwd.angleTo(toT));
            const aspect = THREE.MathUtils.radToDeg(best.vel.clone().negate().angleTo(toT.clone().negate()));
            // K-13 (R-3S): uncooled IR seeker, sees the engine exhaust only from behind, ~1–5 km
            let env = '';
            if (aspect > 35) env = 'VÒNG RA SAU ĐUÔI';
            else if (dist > 200) env = 'CÒN XA — TĂNG GA';
            else if (dist < 40) env = 'QUÁ GẦN — GIẢM GA';
            else if (offBore > 7) env = 'ĐƯA VÀO VÒNG NGẮM';
            mig.envelope = env;
            mig.irLock = env ? Math.max(0, mig.irLock - dt * 2) : Math.min(2.5, mig.irLock + dt);
            mig.dist = dist;
            if (mig.irLock > 0) {
                mig.growlT -= dt;
                if (mig.growlT <= 0) { mig.growlT = mig.irLock >= 1.5 ? 0.09 : 0.22; SoundEngine.playGrowl(mig.irLock >= 1.5); }
            }
            // tail gunner (4 × 12.7 mm, radar-laid) fires at a MiG sitting in the rear cone
            if (gameState === 'PLAYING' && aspect < 45 && dist < 120) {
                mig.gunTimer -= dt;
                if (mig.gunTimer <= 0) {
                    mig.gunTimer = 0.55 + Math.random() * 0.5;
                    mig.underFire = 1.2;
                    fireTailGunBurst(best, p);
                    if (Math.random() < 0.22 * (1 - dist / 120) + 0.03) {
                        mig.hp -= 20;
                        cameraShake = 0.6;
                        if (mig.hp <= 0) endMission(false, 'MiG-21 trúng đạn pháo đuôi B-52.');
                        else showRadio(getPilotCallsign(), `Trúng đạn pháo đuôi! Thân máy bay còn ${mig.hp}%.`);
                    }
                }
            }
        }

        function fireTailGunBurst(b, aimPos) {
            if (!tracerGeo) {
                tracerGeo = new THREE.CylinderGeometry(0.06, 0.06, 4, 5);
                tracerMat = new THREE.MeshBasicMaterial({ color: 0xFFC46B, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
            }
            const tailPos = b.mesh.position.clone().addScaledVector(b.vel.clone().normalize(), -16);
            SoundFX.gunBurst(aimPos.distanceTo(tailPos));
            for (let k = 0; k < 4; k++) {
                const dir = aimPos.clone().sub(tailPos).normalize();
                dir.x += (Math.random() - 0.5) * 0.08;
                dir.y += (Math.random() - 0.5) * 0.08;
                dir.z += (Math.random() - 0.5) * 0.08;
                dir.normalize();
                const mesh = new THREE.Mesh(tracerGeo, tracerMat);
                mesh.position.copy(tailPos).addScaledVector(dir, k * 3);
                mesh.quaternion.setFromUnitVectors(WORLD_UP, dir);
                worldCombatGroup.add(mesh);
                gunTracers.push({ mesh, vel: dir.multiplyScalar(140), life: 0.9 });
            }
        }

        function updateGunTracers(dt) {
            for (let i = gunTracers.length - 1; i >= 0; i--) {
                const t = gunTracers[i];
                t.life -= dt;
                t.mesh.position.addScaledVector(t.vel, dt);
                if (t.life <= 0) { worldCombatGroup.remove(t.mesh); gunTracers.splice(i, 1); }
            }
        }

        // ---- 3D MiG-21 cockpit (attached to the camera) ----
        function buildCockpit3D() {
            const g = new THREE.Group();
            const frameMat = new THREE.MeshStandardMaterial({ color: 0x2A3330, roughness: 0.55, metalness: 0.45 });
            const paintMat = new THREE.MeshStandardMaterial({ color: 0x1D6B5B, roughness: 0.7, metalness: 0.1 });
            const blackMat = new THREE.MeshStandardMaterial({ color: 0x0B0E0E, roughness: 0.9 });
            const tube = (a, b, r, mat, parent = g) => {
                const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
                const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, A.distanceTo(B), 10), mat);
                m.position.copy(A).add(B).multiplyScalar(0.5);
                m.quaternion.setFromUnitVectors(WORLD_UP, B.clone().sub(A).normalize());
                parent.add(m);
                return m;
            };
            const box = (w, h, d, mat, x, y, z, rx = 0) => {
                const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
                m.position.set(x, y, z);
                m.rotation.x = rx;
                g.add(m);
                return m;
            };

            // instrument panel with live gauges
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 400;
            const tex = new THREE.CanvasTexture(canvas);
            tex.anisotropy = 4;
            const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.56, 1.0), new THREE.MeshStandardMaterial({
                map: tex, emissiveMap: tex, emissive: 0xFFFFFF, emissiveIntensity: 0.55, roughness: 0.5, metalness: 0.15
            }));
            panel.position.set(0, -0.78, -2.35);
            panel.rotation.x = -0.32;
            g.add(panel);
            // raised bezels around the round instruments (positions match drawCockpitPanel)
            const bezelMat = new THREE.MeshStandardMaterial({ color: 0x1A1D1C, roughness: 0.35, metalness: 0.7 });
            [[110, 115, 76], [285, 115, 76], [110, 300, 62], [285, 300, 62], [735, 110, 66], [905, 110, 66], [512, 120, 106], [512, 318, 70]].forEach(([px, py, r]) => {
                const ring = new THREE.Mesh(new THREE.TorusGeometry((r + 6) / 400, 0.014, 8, 40), bezelMat);
                ring.position.set((px / 1024 - 0.5) * 2.56, (0.5 - py / 400), 0.012);
                panel.add(ring);
                for (let k = 0; k < 4; k++) {   // bezel screws
                    const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.01, 6), bezelMat);
                    const a = Math.PI / 4 + k * Math.PI / 2, rr = (r + 14) / 400;
                    sc.rotation.x = Math.PI / 2;
                    sc.position.set(ring.position.x + Math.cos(a) * rr, ring.position.y + Math.sin(a) * rr, 0.012);
                    panel.add(sc);
                }
            });
            box(2.72, 1.1, 0.1, paintMat, 0, -0.79, -2.42, -0.32);
            // glare shield coaming with a padded edge
            box(2.72, 0.07, 0.5, blackMat, 0, -0.27, -2.32, -0.05);
            tube([-1.36, -0.25, -2.08], [1.36, -0.25, -2.08], 0.04, blackMat);
            // ASP-PFD gyro gunsight body and reflector glass
            box(0.36, 0.24, 0.44, frameMat, 0, -0.17, -2.14);
            const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.36), new THREE.MeshBasicMaterial({
                color: 0xA7F3D0, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide
            }));
            glass.position.set(0, 0.07, -2.2);
            glass.rotation.x = -0.55;
            g.add(glass);
            const edge = new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry), new THREE.LineBasicMaterial({ color: 0x5B6563 }));
            edge.position.copy(glass.position);
            edge.rotation.copy(glass.rotation);
            g.add(edge);
            // windshield frame, canopy rails, rear-view periscope
            tube([-0.62, -0.26, -2.2], [-0.4, 0.72, -1.75], 0.035, frameMat);
            tube([0.62, -0.26, -2.2], [0.4, 0.72, -1.75], 0.035, frameMat);
            tube([-0.4, 0.72, -1.75], [0.4, 0.72, -1.75], 0.035, frameMat);
            tube([-0.62, -0.26, -2.2], [-1.05, -0.35, 0.2], 0.04, frameMat);
            tube([0.62, -0.26, -2.2], [1.05, -0.35, 0.2], 0.04, frameMat);
            box(0.2, 0.06, 0.05, blackMat, 0, 0.69, -1.74);
            // side consoles and throttle
            box(0.5, 0.25, 1.6, paintMat, -1.15, -1.0, -1.3);
            box(0.5, 0.25, 1.6, paintMat, 1.15, -1.0, -1.3);
            tube([-0.95, -0.88, -1.4], [-0.9, -0.62, -1.5], 0.03, frameMat);
            const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), blackMat);
            knob.position.set(-0.9, -0.6, -1.5);
            g.add(knob);
            // control stick that follows the mouse
            const stick = new THREE.Group();
            stick.position.set(0, -1.55, -1.25);
            tube([0, 0, 0], [0, 0.55, -0.12], 0.035, blackMat, stick);
            const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.18, 10), blackMat);
            grip.position.set(0, 0.6, -0.13);
            stick.add(grip);
            g.add(stick);
            // dim floodlight on the panel, plus the red night-lighting of the consoles
            const flood = new THREE.PointLight(0x9CFFD0, 0.45, 5);
            flood.position.set(0, -0.3, -1.6);
            g.add(flood);
            [-1, 1].forEach(sd => {
                const red = new THREE.PointLight(0xFF4A36, 0.35, 2.2);
                red.position.set(sd * 0.95, -0.55, -1.2);
                g.add(red);
            });

            // canopy bow and rear arch as smooth curved frames
            const arch = (pts, r) => {
                const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
                g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, r, 8, false), frameMat));
            };
            arch([[-1.08, -0.34, 0.15], [-0.85, 0.55, 0.05], [0, 0.95, 0.0], [0.85, 0.55, 0.05], [1.08, -0.34, 0.15]], 0.045);
            arch([[-0.64, -0.27, -2.18], [-0.52, 0.3, -1.98], [-0.4, 0.72, -1.75]], 0.03);
            arch([[0.64, -0.27, -2.18], [0.52, 0.3, -1.98], [0.4, 0.72, -1.75]], 0.03);
            // rear-view mirror on the bow
            const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.1, 0.02), new THREE.MeshStandardMaterial({ color: 0x9FB0B8, metalness: 1, roughness: 0.05 }));
            mirror.position.set(0, 0.8, -1.72);
            mirror.rotation.x = 0.35;
            g.add(mirror);

            // canopy glass with rain running over it
            const rc = document.createElement('canvas');
            rc.width = rc.height = 256;
            const rctx = rc.getContext('2d');
            for (let k = 0; k < 220; k++) {
                const x = Math.random() * 256, y = Math.random() * 256, r = 0.6 + Math.random() * 2.2;
                rctx.fillStyle = `rgba(200,220,235,${0.25 + Math.random() * 0.4})`;
                rctx.beginPath(); rctx.ellipse(x, y, r, r * (1.2 + Math.random() * 2), 0, 0, 6.283); rctx.fill();
                if (Math.random() < 0.3) { rctx.strokeStyle = 'rgba(200,220,235,0.12)'; rctx.lineWidth = r * 0.8; rctx.beginPath(); rctx.moveTo(x, y); rctx.lineTo(x + (Math.random() - 0.5) * 6, y - 20 - Math.random() * 40); rctx.stroke(); }
            }
            const rainTex = new THREE.CanvasTexture(rc);
            rainTex.wrapS = rainTex.wrapT = THREE.RepeatWrapping;
            rainTex.repeat.set(3, 2);
            const canopy = new THREE.Mesh(new THREE.SphereGeometry(2.4, 32, 16, Math.PI * 1.12, Math.PI * 0.76, Math.PI * 0.18, Math.PI * 0.42),
                new THREE.MeshStandardMaterial({ color: 0xC8D8E0, map: rainTex, transparent: true, opacity: 0.12, roughness: 0.08, metalness: 0.6, depthWrite: false, side: THREE.DoubleSide }));
            canopy.position.set(0, -0.45, -0.1);
            g.add(canopy);

            // cockpit sills and side walls
            [-1, 1].forEach(sd => {
                box(0.12, 0.14, 2.4, blackMat, sd * 1.12, -0.36, -1.0);
                box(0.08, 0.7, 2.2, paintMat, sd * 1.3, -0.75, -1.05);
            });
            // switch rows and circuit breakers on both consoles
            const swGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6);
            const switches = new THREE.InstancedMesh(swGeo, new THREE.MeshStandardMaterial({ color: 0xD8D8D0, metalness: 0.8, roughness: 0.3 }), 48);
            const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.4);
            let ns = 0;
            [-1, 1].forEach(sd => {
                for (let row = 0; row < 3; row++) for (let k = 0; k < 8; k++) {
                    m4.compose(new THREE.Vector3(sd * (0.98 + row * 0.12), -0.84, -1.95 + k * 0.17), qq, new THREE.Vector3(1, 1, 1));
                    switches.setMatrixAt(ns++, m4);
                }
            });
            g.add(switches);
            // annunciator lamps on the right console, blinking in renderMiG21CockpitDashboard
            const lamps = [];
            [0xEF4444, 0xFBBF24, 0x4ADE80, 0xFBBF24].forEach((c, k) => {
                const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.025, 0.05), new THREE.MeshStandardMaterial({ color: 0x220000, emissive: c, emissiveIntensity: 0.2 }));
                lamp.position.set(0.96 + (k % 2) * 0.1, -0.85, -0.55 - Math.floor(k / 2) * 0.09);
                g.add(lamp);
                lamps.push(lamp);
            });
            // ASP gunsight: glowing reticle on the reflector glass
            const sc2 = document.createElement('canvas');
            sc2.width = sc2.height = 128;
            const sctx = sc2.getContext('2d');
            sctx.strokeStyle = '#FF6A2A'; sctx.lineWidth = 3;
            sctx.beginPath(); sctx.arc(64, 64, 44, 0, 6.283); sctx.stroke();
            sctx.fillStyle = '#FFD27A'; sctx.beginPath(); sctx.arc(64, 64, 4, 0, 6.283); sctx.fill();
            for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; sctx.fillRect(64 + Math.cos(a) * 52 - 2, 64 + Math.sin(a) * 52 - 2, 4, 4); }
            const sightRet = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc2), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
            sightRet.position.set(0, 0.07, -2.19);
            sightRet.rotation.x = -0.55;
            g.add(sightRet);

            g.visible = false;
            camera.add(g);
            cockpit3D = { group: g, ctx: canvas.getContext('2d'), tex, stick, lastDraw: 0, rainTex, lamps };
        }

        function renderMiG21CockpitDashboard(now) {
            if (!cockpit3D) return;
            const show = cameraPreset === 'COCKPIT' && currentMode === 'MIG21';
            cockpit3D.group.visible = show;
            if (!show) return;
            cockpit3D.stick.rotation.set(-smoothAimY * 0.25, 0, -smoothAimX * 0.3);
            // rain streams back over the canopy faster at speed; annunciators flicker
            cockpit3D.rainTex.offset.y += (0.05 + mig.speed * 0.004) * 0.016;
            cockpit3D.rainTex.offset.x = Math.sin(now * 0.0003) * 0.02;
            cockpit3D.lamps.forEach((l, k) => { l.material.emissiveIntensity = (k === 0 ? mig.underFire > 0 && now % 400 < 200 : k === 2 ? mig.irLock >= 1.5 : (now * 0.001 + k) % 3 < 0.15) ? 2.2 : 0.15; });
            if (now - cockpit3D.lastDraw < 70) return;
            cockpit3D.lastDraw = now;
            drawCockpitPanel(cockpit3D.ctx, now);
            cockpit3D.tex.needsUpdate = true;
        }

        function drawCockpitPanel(ctx, now) {
            const W = 1024, H = 400;
            if (!drawCockpitPanel.base) {
                const b = document.createElement('canvas');
                b.width = W; b.height = H;
                const bx = b.getContext('2d');
                const bg = bx.createLinearGradient(0, 0, 0, H);
                bg.addColorStop(0, '#1F7464');
                bg.addColorStop(1, '#0D433A');
                bx.fillStyle = bg;
                bx.fillRect(0, 0, W, H);
                for (let k = 0; k < 9000; k++) {   // worn paint
                    bx.fillStyle = Math.random() < 0.6 ? `rgba(0,0,0,${Math.random() * 0.12})` : `rgba(160,200,180,${Math.random() * 0.06})`;
                    bx.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random() * 3, 1 + Math.random() * 2);
                }
                for (let k = 0; k < 40; k++) {   // scuffs along the edges
                    bx.strokeStyle = `rgba(190,190,170,${0.05 + Math.random() * 0.1})`;
                    bx.lineWidth = 1;
                    const x = Math.random() * W, y = Math.random() < 0.5 ? Math.random() * 30 : H - Math.random() * 30;
                    bx.beginPath(); bx.moveTo(x, y); bx.lineTo(x + 10 + Math.random() * 30, y + (Math.random() - 0.5) * 4); bx.stroke();
                }
                bx.fillStyle = 'rgba(0,0,0,0.45)';
                for (let x = 12; x < W; x += 34) { bx.beginPath(); bx.arc(x, 8, 2.4, 0, 6.283); bx.arc(x, H - 8, 2.4, 0, 6.283); bx.fill(); }
                bx.fillStyle = 'rgba(230,226,210,0.55)';
                bx.font = 'bold 11px "JetBrains Mono", monospace';
                bx.fillText('НЕ ВКЛЮЧАТЬ НА ЗЕМЛЕ', 650, 200);
                bx.fillText('ВЫП. ШАССИ', 20, 392);
                drawCockpitPanel.base = b;
            }
            ctx.drawImage(drawCockpitPanel.base, 0, 0);
            ctx.strokeStyle = 'rgba(0,0,0,0.35)';
            ctx.lineWidth = 3;
            [395, 630].forEach(x => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); });
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            for (let x = 14; x < W; x += 46) { ctx.beginPath(); ctx.arc(x, 10, 2.2, 0, 6.283); ctx.fill(); }

            const p = playerMiG21.position;
            const kmh = mig.speed * 60, alt = p.y * 25, vs = mig.fwd.y * mig.speed * 25;
            const fuel = Math.max(0, 2200 - missionTime * 5 - mig.throttle * 0);
            const gauge = (x, y, r, title, frac, unit) => {
                ctx.save();
                ctx.translate(x, y);
                ctx.fillStyle = '#0A0C0C';
                ctx.beginPath(); ctx.arc(0, 0, r + 7, 0, 6.283); ctx.fill();
                ctx.strokeStyle = '#3A4442'; ctx.lineWidth = 4; ctx.stroke();
                ctx.fillStyle = '#050606';
                ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fill();
                ctx.strokeStyle = '#E8E4D8';
                ctx.lineWidth = 2;
                for (let t = 0; t <= 10; t++) {
                    const a = -Math.PI * 1.25 + (t / 10) * Math.PI * 1.5;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(a) * (r - 10), Math.sin(a) * (r - 10));
                    ctx.lineTo(Math.cos(a) * (r - 2), Math.sin(a) * (r - 2));
                    ctx.stroke();
                }
                ctx.textAlign = 'center';
                ctx.fillStyle = '#C9F5D9';
                ctx.font = 'bold 13px "JetBrains Mono", monospace';
                ctx.fillText(title, 0, r * 0.42);
                ctx.fillStyle = '#9FB8AE';
                ctx.font = '11px "JetBrains Mono", monospace';
                ctx.fillText(unit, 0, r * 0.68);
                const a = -Math.PI * 1.25 + Math.max(0, Math.min(1, frac)) * Math.PI * 1.5;
                ctx.strokeStyle = '#FFF3C4';
                ctx.lineWidth = 3.5;
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * (r - 12), Math.sin(a) * (r - 12)); ctx.stroke();
                ctx.fillStyle = '#2A2F2E';
                ctx.beginPath(); ctx.arc(0, 0, 6, 0, 6.283); ctx.fill();
                ctx.restore();
            };
            gauge(110, 115, 76, 'УС', kmh / 1600, `${Math.round(kmh)} км/ч`);
            gauge(285, 115, 76, 'ВД-20', alt / 20000, `${Math.round(alt)} м`);
            gauge(110, 300, 62, 'ВАР', 0.5 + vs / 200, `${Math.round(vs)} м/с`);
            gauge(285, 300, 62, 'ТОПЛИВО', fuel / 2600, `${Math.round(fuel)} л`);
            gauge(735, 110, 66, 'ОБОРОТЫ', 0.55 + mig.throttle * 0.45, `${Math.round(70 + mig.throttle * 30)}%`);
            gauge(905, 110, 66, 'Т ГАЗОВ', 0.45 + mig.throttle * 0.4, `${Math.round(520 + mig.throttle * 230)}°`);

            // RP-22 "Sapfir-21" radar scope: target position in the horizontal plane of the aircraft
            ctx.save();
            ctx.translate(512, 120);
            ctx.fillStyle = '#0A0C0C';
            ctx.beginPath(); ctx.arc(0, 0, 106, 0, 6.283); ctx.fill();
            ctx.fillStyle = '#02160E';
            ctx.beginPath(); ctx.arc(0, 0, 98, 0, 6.283); ctx.fill();
            ctx.clip();

            // Tactical Graticule & Range Arcs
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.28)';
            ctx.lineWidth = 1;
            [45, 90, 135].forEach((rad) => {
                ctx.setLineDash([3, 3]);
                ctx.beginPath(); ctx.arc(0, 80, rad, Math.PI + 0.6, Math.PI * 2 - 0.6); ctx.stroke();
            });
            ctx.setLineDash([]);
            for (let y = -60; y <= 80; y += 35) { ctx.beginPath(); ctx.moveTo(-98, y); ctx.lineTo(98, y); ctx.stroke(); }
            ctx.beginPath(); ctx.moveTo(0, -98); ctx.lineTo(0, 98); ctx.stroke();

            // Animated Sapfir B-scan Sweep Bar
            const migSweep = Math.sin(t * 3.5) * 82;
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(migSweep, -90); ctx.lineTo(migSweep, 90); ctx.stroke();

            if (mig.target) {
                const toT = _tmpV2.copy(mig.target.mesh.position).sub(p);
                const right = _tmpR.crossVectors(mig.fwd, WORLD_UP).normalize();
                const lateral = toT.dot(right), ahead = toT.dot(mig.fwd);
                if (ahead > 0) {
                    const bx = Math.max(-90, Math.min(90, lateral / 260 * 90));
                    const by = Math.max(-92, 80 - (ahead / 260) * 170);
                    ctx.fillStyle = '#86EFAC';
                    ctx.shadowColor = '#4ADE80';
                    ctx.shadowBlur = 12;
                    ctx.fillRect(bx - 8, by - 4, 16, 7);
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = '#FEF08A';
                    ctx.lineWidth = 1.2;
                    ctx.strokeRect(bx - 10, by - 6, 20, 11);
                }
                ctx.fillStyle = '#4ADE80';
                ctx.font = 'bold 14px "JetBrains Mono", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`Д ${(mig.dist * KM_PER_UNIT).toFixed(1)} км`, 0, 92);
            }
            ctx.restore();
            ctx.fillStyle = '#C9F5D9';
            ctx.font = 'bold 12px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('РП-22 САПФИР', 512, 245);

            // AGD-1 artificial horizon
            ctx.save();
            ctx.translate(512, 318);
            ctx.beginPath(); ctx.arc(0, 0, 68, 0, 6.283); ctx.clip();
            ctx.rotate(-mig.bank);
            const off = mig.pitch * 120;
            ctx.fillStyle = '#3B6E9E'; ctx.fillRect(-140, -280 + off, 280, 280);
            ctx.fillStyle = '#6B4A2B'; ctx.fillRect(-140, off, 280, 280);
            ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-140, off); ctx.lineTo(140, off); ctx.stroke();
            ctx.lineWidth = 1;
            for (let k = -2; k <= 2; k++) {
                if (!k) continue;
                ctx.beginPath(); ctx.moveTo(-18, off - k * 22); ctx.lineTo(18, off - k * 22); ctx.stroke();
            }
            ctx.restore();
            ctx.strokeStyle = '#FB923C'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(470, 318); ctx.lineTo(500, 318); ctx.lineTo(512, 328); ctx.lineTo(524, 318); ctx.lineTo(554, 318); ctx.stroke();
            ctx.strokeStyle = '#3A4442'; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.arc(512, 318, 71, 0, 6.283); ctx.stroke();

            // warning / weapon lamps
            const blink = now % 400 < 200;
            const lamps = [
                ['ЗАХВАТ', mig.irLock >= 1.5 ? '#4ADE80' : mig.irLock > 0 && blink ? '#FBBF24' : null],
                ['ПУСК', mig.irLock >= 1.5 && missionAmmo > 0 ? '#4ADE80' : null],
                ['ФОРСАЖ', mig.throttle > 0.85 ? '#FB923C' : null],
                ['ОБСТРЕЛ', mig.underFire > 0 && blink ? '#EF4444' : null],
                ['Р-3С Л', missionAmmo >= 2 ? '#86EFAC' : null],
                ['Р-3С П', missionAmmo >= 1 ? '#86EFAC' : null]
            ];
            lamps.forEach(([label, col], k) => {
                const x = 665 + (k % 3) * 118, y = 215 + Math.floor(k / 3) * 78;
                ctx.fillStyle = '#120E0A';
                ctx.fillRect(x, y, 106, 62);
                if (col) {
                    ctx.fillStyle = col;
                    ctx.shadowColor = col;
                    ctx.shadowBlur = 16;
                    ctx.fillRect(x + 5, y + 5, 96, 52);
                    ctx.shadowBlur = 0;
                }
                ctx.fillStyle = col ? '#0B0B0B' : '#5B5F5E';
                ctx.font = 'bold 15px "JetBrains Mono", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(label, x + 53, y + 37);
            });
            ctx.fillStyle = '#C9F5D9';
            ctx.font = 'bold 12px "JetBrains Mono", monospace';
            ctx.fillText(`ТЯГА ${Math.round(mig.throttle * 100)}%  · ${getPilotCallsign()} ·  ПРОЧНОСТЬ ${mig.hp}%`, 820, 385);
        }

        // ---- Enhanced Tactical Dual Radar Scopes (P-35 PPI & SNR-75 B-Scope) ----
        let sectorScanPhase = 0;
        function renderDualRadarScopes(dt) {
            if (currentMode !== 'SAM2') return;
            const jam = activeMission && gameState === 'PLAYING' ? activeMission.jam : null;
            radarSweepAngle = (radarSweepAngle + dt * 2.4) % (Math.PI * 2);
            sectorScanPhase = (sectorScanPhase + dt * 16.0) % (Math.PI * 2);

            // 1. Primary 360° PPI Scope (Đài cảnh giới P-35 Bar Lock & SNR-75)
            const canvas = document.getElementById('radar-scope-canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2, r = cx - 5;
                const R_UNITS = 1800; // 45 km radius
                const toScope = p => [cx + ((p.x - RADAR_POS.x) / R_UNITS) * r, cy + ((p.z - RADAR_POS.z) / R_UNITS) * r];

                // Phosphor decay trail
                ctx.fillStyle = 'rgba(2, 12, 7, 0.22)';
                ctx.fillRect(0, 0, w, h);

                // Compass Rose & Outer Azimuth Graduations
                ctx.save();
                ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

                // Azimuth tick marks (every 30 deg) and cardinal letters
                ctx.fillStyle = 'rgba(52, 211, 153, 0.75)';
                ctx.font = 'bold 8px "JetBrains Mono", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const cardinals = { 0: 'B', 90: 'Đ', 180: 'N', 270: 'T' };
                for (let deg = 0; deg < 360; deg += 30) {
                    const rad = THREE.MathUtils.degToRad(deg - 90);
                    const isCard = cardinals[deg] !== undefined;
                    const len = isCard ? 5 : 3;
                    const x1 = cx + Math.cos(rad) * (r - len), y1 = cy + Math.sin(rad) * (r - len);
                    const x2 = cx + Math.cos(rad) * r, y2 = cy + Math.sin(rad) * r;
                    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
                    if (isCard) {
                        const tx = cx + Math.cos(rad) * (r - 10), ty = cy + Math.sin(rad) * (r - 10);
                        ctx.fillText(cardinals[deg], tx, ty);
                    }
                }

                // Range Rings (15 km, 30 km, 45 km) with dashed phosphor lines
                [1 / 3, 2 / 3, 1].forEach((f, idx) => {
                    ctx.setLineDash([2, 3]);
                    ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
                    ctx.beginPath(); ctx.arc(cx, cy, r * f, 0, Math.PI * 2); ctx.stroke();
                    ctx.setLineDash([]);
                    if (idx < 2) {
                        ctx.fillStyle = 'rgba(52, 211, 153, 0.6)';
                        ctx.font = '7px "JetBrains Mono", monospace';
                        ctx.fillText(`${(idx + 1) * 15}k`, cx + r * f * 0.707 + 7, cy - r * f * 0.707);
                    }
                });

                // Fine crosshairs (North-South, East-West)
                ctx.strokeStyle = 'rgba(16, 185, 129, 0.22)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
                ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
                ctx.stroke();

                // Fan Song Guided Missile Direction Sector (Antenna Aim Cone ±14°)
                const beamA = Math.atan2(aimDir.z, aimDir.x);
                ctx.fillStyle = 'rgba(16, 185, 129, 0.09)';
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, beamA - 0.22, beamA + 0.22); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(beamA - 0.22) * r, cy + Math.sin(beamA - 0.22) * r); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(beamA + 0.22) * r, cy + Math.sin(beamA + 0.22) * r); ctx.stroke();

                // Rotating Radar Sweep Beam with Phosphor Gradient Fade Wedge
                const wedgeSteps = 12;
                const wedgeSpan = 0.42; // ~24 degrees trailing wedge
                for (let i = 0; i < wedgeSteps; i++) {
                    const a0 = radarSweepAngle - (i / wedgeSteps) * wedgeSpan;
                    const a1 = radarSweepAngle - ((i + 1) / wedgeSteps) * wedgeSpan;
                    const alpha = (1 - i / wedgeSteps) * 0.18;
                    ctx.fillStyle = `rgba(16, 185, 129, ${alpha.toFixed(3)})`;
                    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a1, a0); ctx.closePath(); ctx.fill();
                }
                // Leading sweep beam with bloom
                ctx.shadowColor = '#34D399';
                ctx.shadowBlur = 6;
                ctx.strokeStyle = '#A7F3D0';
                ctx.lineWidth = 1.8;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(radarSweepAngle) * r, cy + Math.sin(radarSweepAngle) * r); ctx.stroke();
                ctx.shadowBlur = 0;

                // Active Noise Jamming Strobes (Dải nhiễu râu tôm ALQ-31 / ALQ-87)
                if (jam) jamCells.forEach(c => {
                    const alive = aliveMembers(c);
                    if (!alive.length) return;
                    const [jx, jy] = toScope(alive[0].mesh.position);
                    const baseA = Math.atan2(jy - cy, jx - cx);
                    const s = Math.min(1, (jamOverlap(playerFreq - c.jamFreq) + jam.barrage) * 1.25);
                    const rays = Math.floor(4 + s * 14);
                    const spread = 0.05 + s * 0.18;
                    for (let k = 0; k < rays; k++) {
                        const a = baseA + (Math.random() - 0.5) * spread;
                        const len = r * (0.4 + Math.random() * 0.6);
                        ctx.strokeStyle = `rgba(251, 191, 36, ${(0.15 + s * 0.55).toFixed(2)})`;
                        ctx.lineWidth = 1 + s * 1.5;
                        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); ctx.stroke();
                    }
                });

                // Chaff Clouds (Hành lang nhiễu tiêu cực sợi nhôm)
                const swept = (x, y) => ((radarSweepAngle - Math.atan2(y - cy, x - cx)) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) < 0.45;
                chaffClouds.forEach(c => {
                    const [x, y] = toScope(c.center);
                    if (!swept(x, y)) return;
                    ctx.fillStyle = 'rgba(203, 213, 225, 0.45)';
                    for (let k = 0; k < 8; k++) {
                        const ox = (Math.random() - 0.5) * 10, oy = (Math.random() - 0.5) * 10;
                        ctx.fillRect(x + ox, y + oy, 1.8, 1.8);
                    }
                });

                // Target Returns (B-52 Stratofortress Blips with Phosphor Bloom)
                activeBombers.forEach(b => {
                    const [x, y] = toScope(b.mesh.position);
                    if (!swept(x, y)) return;
                    const isSel = b === selectedTarget;
                    const distKmVal = distKm(b);
                    ctx.shadowColor = isSel ? '#FBBF24' : '#34D399';
                    ctx.shadowBlur = isSel ? 10 : 6;
                    ctx.fillStyle = isSel ? '#FEF08A' : '#6EE7B7';

                    // Elongated tangential blip reflecting CRT beamwidth
                    const ang = Math.atan2(y - cy, x - cx);
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(ang + Math.PI / 2);
                    ctx.fillRect(-3.5, -1.5, 7, 3);
                    ctx.restore();
                    ctx.shadowBlur = 0;

                    // Tactical Lock Box & Range Tag for Locked B-52
                    if (isSel) {
                        ctx.strokeStyle = '#FDE047';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(x - 6, y - 6, 12, 12);
                        ctx.fillStyle = '#FEF08A';
                        ctx.font = 'bold 7px "JetBrains Mono", monospace';
                        ctx.fillText(`${distKmVal.toFixed(0)}K`, x + 9, y + 3);
                    }
                });

                // Center SAM-2 Battery Position
                ctx.fillStyle = '#10B981';
                ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#34D399';
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.stroke();
                ctx.restore();
            }

            // 2. SNR-75 B-scope: Azimuth ±20° around antenna vs Range 0–45 km
            const sec = document.getElementById('sector-scope-canvas');
            if (sec) {
                const s = sec.getContext('2d');
                const sw = sec.width, sh = sec.height;
                s.fillStyle = 'rgba(2, 12, 7, 0.45)';
                s.fillRect(0, 0, sw, sh);

                // Grid Graticule (Range 15, 30, 45 km; Azimuth -10°, 0°, +10°)
                s.strokeStyle = 'rgba(16, 185, 129, 0.25)';
                s.lineWidth = 0.8;
                [1 / 3, 2 / 3].forEach(f => {
                    s.setLineDash([2, 2]);
                    s.beginPath(); s.moveTo(0, sh * f); s.lineTo(sw, sh * f); s.stroke();
                });
                s.setLineDash([]);
                [0.25, 0.5, 0.75].forEach((f, idx) => {
                    s.strokeStyle = idx === 1 ? 'rgba(52, 211, 153, 0.45)' : 'rgba(16, 185, 129, 0.2)';
                    s.beginPath(); s.moveTo(sw * f, 0); s.lineTo(sw * f, sh); s.stroke();
                });

                // Range labels
                s.fillStyle = 'rgba(52, 211, 153, 0.55)';
                s.font = '7px "JetBrains Mono", monospace';
                s.textAlign = 'left';
                s.fillText('30k', 2, sh * (1 / 3) - 2);
                s.fillText('15k', 2, sh * (2 / 3) - 2);

                // Fan Song High-frequency Flapping Scan Line (16 Hz oscillation)
                const flapX = sw / 2 + Math.sin(sectorScanPhase) * (sw / 2 - 4);
                s.strokeStyle = 'rgba(52, 211, 153, 0.35)';
                s.lineWidth = 1.2;
                s.beginPath(); s.moveTo(flapX, 0); s.lineTo(flapX, sh); s.stroke();

                const relAz = pos => {
                    const a = THREE.MathUtils.radToDeg(Math.atan2(pos.x - RADAR_POS.x, -(pos.z - RADAR_POS.z))) - aimAzDeg;
                    return ((a + 540) % 360) - 180;
                };
                const sx = a => sw / 2 + (a / 20) * (sw / 2);
                const sy = km => sh - (km / 45) * sh;

                // Jamming hash on sector scope
                if (jam) jamCells.forEach(c => {
                    const alive = aliveMembers(c);
                    if (!alive.length) return;
                    const a = relAz(alive[0].mesh.position);
                    if (Math.abs(a) > 22) return;
                    const st = Math.min(1, (jamOverlap(playerFreq - c.jamFreq) + jam.barrage) * 1.2);
                    s.fillStyle = `rgba(250, 204, 21, ${(0.12 + st * 0.4).toFixed(2)})`;
                    const bw = 4 + st * 10;
                    s.fillRect(sx(a) - bw / 2, 0, bw, sh);
                    for (let k = 0; k < 12 * st; k++) {
                        s.fillStyle = 'rgba(254, 240, 138, 0.75)';
                        s.fillRect(sx(a) + (Math.random() - 0.5) * bw * 1.5, Math.random() * sh, 2, 1.5);
                    }
                });

                // Chaff clouds on sector scope
                chaffClouds.forEach(c => {
                    const a = relAz(c.center);
                    if (Math.abs(a) > 20) return;
                    s.fillStyle = 'rgba(203, 213, 225, 0.3)';
                    s.fillRect(sx(a) - 4, sy(c.center.distanceTo(RADAR_POS) * KM_PER_UNIT) - 3, 8, 6);
                });

                // Target blips & tracking gates
                activeBombers.forEach(b => {
                    const a = relAz(b.mesh.position);
                    if (Math.abs(a) > 20) return;
                    const q = b === selectedTarget ? targetQuality : computeTargetQuality(b);
                    if (q < 0.22) return; // buried in noise
                    const x = sx(a), y = sy(distKm(b));
                    const isSel = b === selectedTarget;

                    s.shadowColor = isSel ? '#FDE047' : '#34D399';
                    s.shadowBlur = isSel ? 8 : 4;
                    s.fillStyle = isSel ? '#FEF08A' : '#6EE7B7';
                    s.fillRect(x - 3, y - 2, 6, 4);
                    s.shadowBlur = 0;

                    // Tracking gates (Cổng bám SNR-75)
                    if (isSel && trackTimer > 0) {
                        const locked = trackTimer >= TRACK_TIME;
                        s.strokeStyle = locked ? '#34D399' : '#FBBF24';
                        s.lineWidth = 1.2;
                        const gateSize = locked ? 5 : Math.max(5, 12 - (trackTimer / TRACK_TIME) * 7);
                        s.beginPath();
                        s.moveTo(x - gateSize, y - gateSize); s.lineTo(x + gateSize, y - gateSize);
                        s.moveTo(x - gateSize, y + gateSize); s.lineTo(x + gateSize, y + gateSize);
                        s.moveTo(x - gateSize, y - gateSize); s.lineTo(x - gateSize, y - gateSize + 3);
                        s.moveTo(x + gateSize, y - gateSize); s.lineTo(x + gateSize, y - gateSize + 3);
                        s.moveTo(x - gateSize, y + gateSize); s.lineTo(x - gateSize, y + gateSize - 3);
                        s.moveTo(x + gateSize, y + gateSize); s.lineTo(x + gateSize, y + gateSize - 3);
                        s.stroke();
                    }
                });
            }

            // 3. Receiver spectrum scope (ECCM "Vạch nhiễu tìm thù")
            const spec = document.getElementById('spectrum-canvas');
            if (spec && jam) {
                const c = spec.getContext('2d');
                const w = spec.width, h = spec.height;
                const fx = f => ((f - BAND_MIN) / (BAND_MAX - BAND_MIN)) * w;

                c.fillStyle = '#020b06';
                c.fillRect(0, 0, w, h);

                // Grid graticule lines
                c.strokeStyle = 'rgba(16, 185, 129, 0.15)';
                c.lineWidth = 0.8;
                for (let gx = 0; gx <= w; gx += w / 8) {
                    c.beginPath(); c.moveTo(gx, 0); c.lineTo(gx, h); c.stroke();
                }

                // Barrage noise floor fill
                c.fillStyle = 'rgba(250, 204, 21, 0.14)';
                c.fillRect(0, h - h * jam.barrage * 2.2, w, h * jam.barrage * 2.2);

                // Jammer peak curves with gradient fill
                jamCells.forEach(cell => {
                    const alive = aliveMembers(cell);
                    if (!alive.length) return;
                    const amp = Math.min(1, 0.3 + 9 / Math.max(3, distKm(alive[0]))) * (alive.length / 3);
                    const lost = cell.lostTimer > 0;
                    c.strokeStyle = lost ? 'rgba(251, 191, 36, 0.85)' : 'rgba(244, 63, 94, 0.95)';
                    c.lineWidth = 1.8;
                    c.beginPath();
                    for (let x = 0; x <= w; x += 2) {
                        const f = BAND_MIN + (x / w) * (BAND_MAX - BAND_MIN);
                        const y = h - 2 - jamOverlap(f - cell.jamFreq) * amp * (h - 6) + (Math.random() - 0.5) * 1.5;
                        x ? c.lineTo(x, y) : c.moveTo(x, y);
                    }
                    c.stroke();
                });

                // Player transmit cursor with lock indicator
                const bad = jamCells.some(cell => jamOverlap(playerFreq - cell.jamFreq) > 0.3);
                const curX = fx(playerFreq);
                c.shadowColor = bad ? '#F43F5E' : '#34D399';
                c.shadowBlur = 6;
                c.strokeStyle = bad ? '#F43F5E' : '#34D399';
                c.lineWidth = 2.2;
                c.beginPath(); c.moveTo(curX, 0); c.lineTo(curX, h); c.stroke();
                c.shadowBlur = 0;
            }
        }

        // ---- Bottom action bar + missile view HUD ----
        function updateActionBar() {
            const lbl = document.getElementById('fire-btn-label');
            const btn = document.getElementById('fire-btn');
            let text = 'Phóng', ready = true;
            if (gameState === 'PLAYING') {
                if (currentMode === 'MIG21') {
                    ready = (mig.irLock >= 1.5 && missionAmmo > 0) || ((mig.cannonAmmo || 0) > 0);
                    text = missionAmmo > 0
                        ? (mig.irLock >= 1.5 ? 'Phóng K-13 [Space]' : 'Chưa khóa nhiệt · [F] Pháo 23mm')
                        : ((mig.cannonAmmo || 0) > 0 ? `Bắn pháo 23mm (${mig.cannonAmmo}v) [F]` : 'Hết đạn');
                } else if (guidedMissile) {
                    text = 'Lệnh nổ'; ready = guidedMissile.t > 2.4;
                } else if (!samLaunchers.some(l => l.loaded)) {
                    text = reloadingLauncher ? 'Đang tự nạp đạn…' : 'Hết đạn'; ready = false;
                } else if (!selectedTarget) {
                    text = 'Chưa có mục tiêu'; ready = false;
                } else if (trackTimer < TRACK_TIME) {
                    text = targetQuality < 0.3 ? 'Nhiễu — chưa bám' : `Đang bám ${trackTimer.toFixed(1)}s`; ready = false;
                }
            }
            if (lbl.textContent !== text) lbl.textContent = text;
            btn.classList.toggle('is-blocked', !ready);

            if (currentMode === 'SAM2') {
                const pads = samLaunchers.map(l => l.loaded ? '●' : l === reloadingLauncher ? '◐' : '○').join(' ');
                const padsEl = document.getElementById('hud-launchers');
                if (padsEl.textContent !== pads) padsEl.textContent = pads;
                const rl = document.getElementById('hud-reload');
                const rtext = reloadingLauncher ? `BỆ ${reloadingLauncher.name}: ${Math.ceil(reloadingLauncher.reloadT)}s` : `KHO: ${missionReserve} QUẢ`;
                if (rl.textContent !== rtext) rl.textContent = rtext;
                document.getElementById('hud-reload-bar').style.width = reloadingLauncher
                    ? `${(100 * (1 - reloadingLauncher.reloadT / RELOAD_TIME)).toFixed(0)}%` : '0%';
            }
        }

        function updateMissileHud() {
            const el = document.getElementById('missile-hud');
            const on = !!guidedMissile && guidedMissile.t > 0.7;
            const disp = on ? 'block' : 'none';
            if (el.style.display !== disp) el.style.display = disp;
            const dot = document.getElementById('stick-dot');
            const showDot = on || (currentMode === 'MIG21' && gameState === 'PLAYING');
            dot.style.display = showDot ? 'block' : 'none';
            if (showDot) {
                dot.style.left = `${(smoothAimX * 0.5 + 0.5) * 100}%`;
                dot.style.top = `${(-smoothAimY * 0.5 + 0.5) * 100}%`;
            }
            if (!on) return;
            const m = guidedMissile;
            const tgt = m.target && activeBombers.includes(m.target) ? m.target : null;
            const distU = tgt ? m.mesh.position.distanceTo(tgt.mesh.position) : Infinity;
            const rng = tgt ? `${(distU * KM_PER_UNIT).toFixed(2)} km` : '—';
            const closeIn = distU < 36;
            const jammed = tgt && tgt.cell && tgt.cell.onFreq;
            const phase = m.lost ? '<span style="color:#F87171">MẤT DẪN — ĐẠN LẠC</span>'
                : m.detonateNow ? '<span style="color:#FDE047;font-weight:bold;">LỆNH NỔ ĐÃ PHÁT — CHỜ NỔ</span>'
                : closeIn ? `<span style="color:#34D399;font-weight:bold;background:rgba(16,185,129,0.25);padding:2px 8px;border-radius:3px;border:1px solid #10B981;">ĐÃ ÁP SÁT ${(distU * KM_PER_UNIT).toFixed(2)} KM — BẤM [SPACE] LỆNH NỔ NGAY!</span>`
                : m.blind > 0.15 ? `<span style="color:#F87171">[MẤT TÍN HIỆU] ${Math.max(0, BLIND_LIMIT - m.blind).toFixed(1)}s — ${jamAt(playerFreq) > 0.15 ? 'NHẢY TẦN Q / E' : 'TẦN SỐ SẠCH, ĐỪNG NHẢY'}</span>`
                : m.seek ? `<span style="color:#34D399">ĐẠN ĐÃ NHẬN DIỆN ${m.seek.callsign} — TỰ BÁM</span>`
                : m.t < 2.4 ? 'TẦNG ĐẨY — CHƯA VÀO LỆNH DẪN'
                : m.t > 26 ? '<span style="color:#FBBF24">HẾT NHIÊN LIỆU — ĐẠN ĐANG MẤT TỐC</span> · LÁI NHẸ TAY'
                : jammed ? '<span style="color:#FBBF24">NHIỄU ĐANG BÁM TẦN — CHUẨN BỊ NHẢY TẦN</span> · LỆCH CHUỘT ĐỂ LÁI'
                : 'ĐANG DẪN — LỆCH CHUỘT ĐỂ LÁI · [SPACE] LỆNH NỔ';
            const html = `V-750 · T+${m.t.toFixed(1)}s · M${(m.speed / 80 * 3.5).toFixed(1)} · CÁCH MỤC TIÊU ${rng} · TÍN HIỆU ${Math.round(m.q * 100)}%<br>${phase}`;
            const txt = document.getElementById('missile-hud-text');
            if (txt.innerHTML !== html) txt.innerHTML = html;
        }
        /* ============================================================================
           10B. AI AUTO-PILOT / AUTO-COMBAT COMBAT ASSIST SYSTEM
           ============================================================================ */
        function toggleAutoPilot(forceState) {
            if (gameState !== 'PLAYING') return;
            autoPilotActive = typeof forceState === 'boolean' ? forceState : !autoPilotActive;
            const btn = document.getElementById('btn-auto-pilot');
            if (btn) {
                btn.classList.toggle('is-active', autoPilotActive);
                btn.innerHTML = `Tự động: ${autoPilotActive ? 'BẬT' : 'TẮT'}<kbd>P</kbd>`;
            }
            if (autoPilotActive) {
                if (typeof showRadio === 'function') {
                    showRadio('SỞ CHỈ HUY', 'Kích hoạt hệ thống hỗ trợ tác chiến tự động (AI Auto-Pilot)!');
                }
            } else {
                if (typeof showRadio === 'function') {
                    showRadio('SỞ CHỈ HUY', 'Đã chuyển về chế độ tác chiến thủ công.');
                }
                mouseAimX = smoothAimX = 0;
                mouseAimY = smoothAimY = 0;
            }
        }
        window.toggleAutoPilot = toggleAutoPilot;

        function updateAutoPilotSimulation(dt) {
            if (!autoPilotActive || gameState !== 'PLAYING' || gamePaused) return;

            const aliveBombers = activeBombers.filter(b => !b.downed);
            if (aliveBombers.length === 0) return;

            if (currentMode === 'SAM2') {
                // Priority 1: Keep tracking current guided missile target if alive
                let tgt = (guidedMissile && guidedMissile.target && !guidedMissile.target.downed) ? guidedMissile.target : null;
                // Priority 2: Currently selected target if alive
                if (!tgt && selectedTarget && !selectedTarget.downed && activeBombers.includes(selectedTarget)) {
                    tgt = selectedTarget;
                }
                // Priority 3: Nearest alive bomber
                if (!tgt) {
                    let bestD = Infinity;
                    aliveBombers.forEach(b => {
                        const d = distKm(b);
                        if (d < bestD) { bestD = d; tgt = b; }
                    });
                }
                if (!tgt) tgt = aliveBombers[0];

                // Turn station or aim towards target
                const p = _tmpV.copy(tgt.mesh.position).project(camera);
                if (p.z > 0 && p.z < 1) {
                    mouseAimX += (p.x - mouseAimX) * Math.min(1, dt * 8);
                    mouseAimY += (p.y - mouseAimY) * Math.min(1, dt * 8);
                } else if (!guidedMissile && missileCamHold <= 0) {
                    const targetYaw = Math.atan2(-tgt.mesh.position.x, -tgt.mesh.position.z);
                    const horizD = Math.hypot(tgt.mesh.position.x, tgt.mesh.position.z);
                    const targetPitch = Math.atan2(tgt.mesh.position.y, horizD);
                    let diffYaw = ((targetYaw - viewYaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
                    viewYaw += Math.sign(diffYaw) * Math.min(Math.abs(diffYaw), dt * 2.2);
                    let clampedPitch = Math.max(0.04, Math.min(VIEW_PITCH_MAX, targetPitch));
                    viewPitch += (clampedPitch - viewPitch) * Math.min(1, dt * 2.2);
                    mouseAimX += (0 - mouseAimX) * Math.min(1, dt * 5);
                    mouseAimY += (0 - mouseAimY) * Math.min(1, dt * 5);
                }

                // Anti-jamming (ECCM Frequency Hopping)
                if (autoHopCooldown <= 0) {
                    if (jamPromptState && jamPromptState.show) {
                        hopFrequency(jamPromptState.best < 0 ? -45 : 45);
                        autoHopCooldown = 0.65;
                    }
                } else {
                    autoHopCooldown -= dt;
                }

                // Fire & Guidance & Reloading
                if (!guidedMissile && missileCamHold <= 0) {
                    const launcher = samLaunchers.find(l => l.loaded);
                    const canFire = launcher && trackTimer >= TRACK_TIME && distKm(tgt) <= 55 && targetQuality >= 0.28;
                    if (canFire) {
                        triggerPrimaryWeaponFire();
                    } else if (!launcher && missionReserve > 0 && !reloadingLauncher) {
                        startReload();
                    }
                } else if (guidedMissile && guidedMissile.target) {
                    const mPos = guidedMissile.mesh.position;
                    const tPos = guidedMissile.target.mesh.position;
                    const d = mPos.distanceTo(tPos);
                    if (guidedMissile.t > 2.2 && d < 28) {
                        triggerPrimaryWeaponFire(); // Proximity command detonation
                    }
                }
            } else if (currentMode === 'MIG21') {
                let tgt = (mig.target && !mig.target.downed) ? mig.target : aliveBombers[0];
                if (!tgt) return;

                const pMig = playerMiG21.position;
                const toTgt = _tmpV2.copy(tgt.mesh.position).sub(pMig);
                const dist = toTgt.length();

                const desiredYaw = Math.atan2(-toTgt.x, -toTgt.z);
                let diffYaw = ((desiredYaw - mig.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
                const horizD = Math.hypot(toTgt.x, toTgt.z);
                const desiredPitch = Math.atan2(toTgt.y, horizD);
                let diffPitch = desiredPitch - mig.pitch;

                mouseAimX = Math.max(-1, Math.min(1, diffYaw * 2.2));
                mouseAimY = Math.max(-0.85, Math.min(0.85, diffPitch * 2.8));

                if (dist > 150) {
                    mig.throttle = Math.min(1.0, mig.throttle + dt * 0.7);
                } else if (dist < 50) {
                    mig.throttle = Math.max(0.35, mig.throttle - dt * 0.7);
                }

                mig.target = tgt;
                if (mig.irLock >= 1.5 && missionAmmo > 0) {
                    fireK13();
                } else if (dist < 130 && (mig.cannonAmmo || 0) > 0) {
                    const offBore = THREE.MathUtils.radToDeg(mig.fwd.angleTo(toTgt));
                    if (offBore < 15) {
                        fireMiGCannon();
                    }
                }
            }
        }

