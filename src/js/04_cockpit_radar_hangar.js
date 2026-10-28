        /* ============================================================================
           4. MIG-21BIS FIRST-PERSON COCKPIT RENDERER (EXACT REPLICA OF IMAGE 1)
           ============================================================================ */
        /* ============================================================================
           5. DUAL CRT RADAR SCOPES (SECTOR SCAN + 360° P-35 SCOPE AS IN IMAGE 3)
           ============================================================================ */
        /* ============================================================================
           6. SPAWN B-52G SQUADRON & ZERO-LAG SCREEN-SPACE PROJECTION LOCK-ON
           ============================================================================ */
        let bomberSeq = 1;

        /* ============================================================================
           7. MODE & CINEMATIC CAMERA SWITCHER (MATCHING ALL 4 REFERENCE IMAGES)
           ============================================================================ */
        function switchSimMode(mode) {
            SoundEngine.init();
            currentMode = mode;

            const hangarBar = document.getElementById('hangar-floating-bar');
            const reticle = document.getElementById('hud-reticle');
            const leftHud = document.getElementById('hud-left-telemetry');
            const rightRadar = document.getElementById('hud-right-radar');
            const cockpitCanvas = document.getElementById('mig21-cockpit-canvas');
            skyDome.visible = rainSystem.visible = mode !== 'HANGAR';
            // Tailwind's sm:flex outranks .hidden, so toggle these panels inline
            leftHud.style.display = rightRadar.style.display = mode === 'HANGAR' ? 'none' : '';
            hangarBar.style.display = mode === 'HANGAR' ? 'flex' : 'none';
            if (mode === 'HANGAR') document.getElementById('hud-target-bracket').style.opacity = '0';

            if (mode === 'HANGAR') {
                worldCombatGroup.visible = false;
                hangarStudioGroup.visible = true;
                hangarBar.classList.remove('hidden');
                hangarBar.classList.add('flex');
                reticle.style.display = 'none';
                leftHud.classList.add('hidden');
                rightRadar.classList.add('hidden');
                cockpitCanvas.classList.add('hidden');
                if (cockpit3D) cockpit3D.group.visible = false;
                const actBar = document.getElementById('action-bar');
                if (actBar) actBar.style.display = 'none';
                const poster = document.getElementById('poster-status');
                if (poster) poster.style.display = 'none';
                const jamP = document.getElementById('jam-prompt');
                if (jamP) jamP.style.display = 'none';
                const stickDot = document.getElementById('stick-dot');
                if (stickDot) stickDot.style.display = 'none';
                document.getElementById('tactical-map-labels').classList.add('hidden');
                loadHangarShowcaseModel(currentHangarKey);
            } else {
                worldCombatGroup.visible = true;
                hangarStudioGroup.visible = false;
                hangarBar.classList.add('hidden');
                hangarBar.classList.remove('flex');
                reticle.style.display = 'block';
                const actBar = document.getElementById('action-bar');
                if (actBar) actBar.style.display = '';
                const poster = document.getElementById('poster-status');
                if (poster) poster.style.display = '';

                if (mode === 'SAM2' && !['DECK', 'REVETMENT', 'MAP3D'].includes(cameraPreset)) {
                    setCinematicCamera('DECK');
                } else if (mode === 'MIG21' && !['COCKPIT', 'CHASE'].includes(cameraPreset)) {
                    setCinematicCamera('COCKPIT');
                }
            }
        }


        function setCinematicCamera(preset) {
            SoundEngine.init();
            cameraPreset = preset;

            // Sync top mode pill if switching between SAM-2 and MiG-21 presets
            if (preset === 'COCKPIT' || preset === 'CHASE') {
                currentMode = 'MIG21';
            } else {
                currentMode = 'SAM2';
            }

            const cockpitCanvas = document.getElementById('mig21-cockpit-canvas');
            const leftHud = document.getElementById('hud-left-telemetry');
            const rightRadar = document.getElementById('hud-right-radar');

            if (tacticalMap3DGroup) {
                tacticalMap3DGroup.visible = (preset === 'MAP3D');
            }

            cockpitCanvas.classList.add('hidden');
            if (preset === 'COCKPIT') {
                playerMiG21.visible = false;
                leftHud.style.display = rightRadar.style.display = 'none';
                updateReticleTheme('MIG21');
            } else {
                playerMiG21.visible = preset === 'CHASE';
                leftHud.style.display = rightRadar.style.display = (preset === 'CHASE') ? 'none' : '';
                updateReticleTheme(preset === 'CHASE' ? 'MIG21' : 'SAM2');
            }
        }

        function cycleAllCinematicViews() {
            return;   // one fixed view per weapon: station view (SAM-2), cockpit (MiG-21)
            const order = currentMode === 'MIG21' ? ['COCKPIT', 'CHASE'] : ['DECK', 'REVETMENT', 'MAP3D'];
            const nextIdx = (order.indexOf(cameraPreset) + 1) % order.length;
            setCinematicCamera(order[nextIdx]);
        }

        function updateReticleTheme(mode) {
            const svg = document.getElementById('reticle-svg');
            if (mode === 'MIG21') {
                // Glowing Orange-Red ASP-PFD Gyro Sight Circle & Crosshair from Image 1
                svg.innerHTML = `
                    <circle cx="48" cy="48" r="32" stroke="#FF5522" stroke-width="2.2"/>
                    <circle cx="48" cy="48" r="11" stroke="#FF5522" stroke-width="1.5"/>
                    <line x1="48" y1="8" x2="48" y2="34" stroke="#FF5522" stroke-width="1.8"/>
                    <line x1="48" y1="62" x2="48" y2="88" stroke="#FF5522" stroke-width="1.8"/>
                    <line x1="8" y1="48" x2="34" y2="48" stroke="#FF5522" stroke-width="1.8"/>
                    <line x1="62" y1="48" x2="88" y2="48" stroke="#FF5522" stroke-width="1.8"/>
                    <circle cx="48" cy="48" r="2.5" fill="#FEF08A"/>
                `;
            } else {
                svg.innerHTML = `
                    <circle cx="48" cy="48" r="28" stroke="rgba(16,185,129,0.75)" stroke-width="1.4" stroke-dasharray="5 3"/>
                    <circle cx="48" cy="48" r="12" stroke="rgba(250,250,250,0.45)" stroke-width="1"/>
                    <line x1="48" y1="8" x2="48" y2="32" stroke="#10B981" stroke-width="1.4"/>
                    <line x1="48" y1="64" x2="48" y2="88" stroke="#10B981" stroke-width="1.4"/>
                    <line x1="8" y1="48" x2="32" y2="48" stroke="#10B981" stroke-width="1.4"/>
                    <line x1="64" y1="48" x2="88" y2="48" stroke="#10B981" stroke-width="1.4"/>
                    <circle cx="48" cy="48" r="2.5" fill="#E11D48"/>
                `;
            }
        }

        /* ============================================================================
           8. HANGAR 3D SHOWCASE & EXTERNAL .GLB / .GLTF LOADER
           ============================================================================ */
        const HANGAR_META = {
            MIG21: {
                name: 'TIÊM KÍCH MIG-21BIS (#5121 — 5 NGÔI SAO ĐỎ CHIẾN CÔNG)',
                specs: [
                    { k: 'KÍCH THƯỚC', v: 'Dài 15.5m · Sải cánh 7.15m' },
                    { k: 'TỐC ĐỘ MAX', v: '2.175 km/h (Mach 2.05)' },
                    { k: 'VŨ KHÍ', v: '2× K-13 Atoll · Pháo 23mm GSh-23L' },
                    { k: 'CHIẾN CÔNG', v: 'Hạ B-52 đêm 27/12/1972 (Phạm Tuân)' }
                ],
                desc: 'Chiếc tiêm kích huyền thoại số hiệu 5121 thuộc Trung đoàn Sao Đỏ (921). Cánh tam giác xuôi 57°, trang bị động cơ phản lực R-25-300 tạo chuỗi kim cương Mach rực sáng. Mang 5 ngôi sao đỏ trên mũi ghi dấu 5 chiến công bắn rơi máy bay Mỹ.'
            },
            B52: {
                name: 'PHÁO ĐÀI BAY B-52G STRATOFORTRESS // KHÔNG QUÂN MỸ',
                specs: [
                    { k: 'KÍCH THƯỚC', v: 'Dài 48.5m · Sải cánh 56.4m' },
                    { k: 'TẢI BOM', v: 'Đến 31.5 tấn bom rải thảm' },
                    { k: 'TÁC CHIẾN ĐIỆN TỬ', v: '15 máy gây nhiễu ALQ chủ động' },
                    { k: 'HỎA LỰC PHÒNG VỆ', v: 'Tháp pháo đuôi 4× 12.7mm radar' }
                ],
                desc: 'Pháo đài bay ném bom chiến lược hạng nặng của Không quân Mỹ. Mỗi phi vụ bay theo tốp 3 chiếc tạo dải nhiễu dày đặc che chắn cho nhau. Trong 12 ngày đêm, Mỹ đã tổn thất 34 chiếc B-52 trước lưới lửa phòng không ba thứ quân miền Bắc.'
            },
            SAM2: {
                name: 'TỔ HỢP TÊN LỬA SAM-2 (S-75 DVINA / ĐẠN V-750 & BỆ SM-63)',
                specs: [
                    { k: 'CHIỀU DÀI ĐẠN', v: '10.6m · Trọng lượng 2.3 tấn' },
                    { k: 'TẦM BẮN / TRẦN', v: 'Tầm xa 34 km · Độ cao 22.000m' },
                    { k: 'ĐẦU NỔ', v: '196 kg mảnh văng sát thương cao' },
                    { k: 'BỆ PHÓNG', v: 'SM-63 xoay 360°, nâng hạ thủy lực' }
                ],
                desc: 'Đạn tên lửa hai tầng V-750 phóng từ bệ SM-63 điều khiển bằng sóng vô tuyến từ đài SNR-75. Đòn hỏa lực chủ công của Bộ đội Tên lửa Việt Nam, làm nên nòng cốt kỳ tích bắn rơi hàng chục siêu pháo đài bay B-52.'
            },
            RADAR: {
                name: 'ĐÀI RADAR ĐIỀU KHIỂN HỎA LỰC SNR-75 "FAN SONG"',
                specs: [
                    { k: 'CẤU TẠO ĂNG-TEN', v: '2 máng quét góc tà/phương vị + chảo' },
                    { k: 'DẢI TẦN SỐ', v: '2900 – 3100 MHz (Nhảy tần ECCM)' },
                    { k: 'TẦM THEO DÕI', v: 'Đến 60 – 75 km' },
                    { k: 'NGHỆ THUẬT TÁC CHIẾN', v: 'Cẩm nang bìa đỏ — Vạch nhiễu tìm thù' }
                ],
                desc: '"Đôi mắt thần" chỉ huy của mỗi tiểu đoàn tên lửa SAM-2. Nơi các kíp trắc thủ phương vị, góc tà và cự ly dày dạn kinh nghiệm phân biệt vệt phản xạ thật của B-52 ẩn sâu trong rừng nhiễu tích cực và tiêu cực.'
            }
        };

        function loadHangarShowcaseModel(key) {
            currentHangarKey = key;
            while (hangarPivot.children.length > 0) {
                hangarPivot.remove(hangarPivot.children[0]);
            }

            let obj;
            if (key === 'MIG21') {
                obj = HighPolyFactory.createMiG21Bis();
                obj.scale.set(1.25, 1.25, 1.25);
                hangarDist = 16;
            } else if (key === 'B52') {
                obj = HighPolyFactory.createB52G();
                const aura = obj.getObjectByName('jamAura');
                if (aura) aura.visible = false;
                hangarDist = 23;
            } else if (key === 'SAM2') {
                const b = HighPolyFactory.createSM63LauncherBattery();
                b.pitchBoom.rotation.x = 0.52;
                obj = b.root;
                obj.position.y = -2.2;
                obj.scale.set(1.25, 1.25, 1.25);
                hangarDist = 16;
            } else if (key === 'RADAR') {
                obj = HighPolyFactory.createFanSongRadar();
                obj.position.y = -2.8;
                obj.scale.set(1.35, 1.35, 1.35);
                hangarDist = 16;
            }

            if (hangarWireframe) {
                obj.traverse(c => { if (c.isMesh && c.material) c.material.wireframe = true; });
            }
            hangarPivot.add(obj);

            ['MIG21', 'B52', 'SAM2', 'RADAR'].forEach(k => {
                const btn = document.getElementById(`h-model-${k}`);
                if (!btn) return;
                btn.className = (k === key)
                    ? 'hangar-dock-btn flex-1 p-2 rounded-lg border text-left transition bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_16px_rgba(16,185,129,0.35)]'
                    : 'hangar-dock-btn flex-1 p-2 rounded-lg border border-white/10 bg-black/60 text-zinc-400 hover:text-white hover:border-white/30 text-left transition';
            });

            document.getElementById('hangar-model-name').textContent = HANGAR_META[key].name;
            document.getElementById('hangar-model-desc').textContent = HANGAR_META[key].desc;
            const specsEl = document.getElementById('hangar-model-specs');
            if (specsEl && HANGAR_META[key].specs) {
                specsEl.innerHTML = HANGAR_META[key].specs.map(s => `
                    <div class="p-1.5 rounded bg-black/60 border border-emerald-500/20">
                        <span class="text-emerald-400 block text-[9px] uppercase tracking-wider font-semibold font-mono">${s.k}</span>
                        <span class="text-alabaster font-mono text-[11px] font-medium">${s.v}</span>
                    </div>
                `).join('');
            }
        }

        function handleExternalGLBUpload(event) {
            const file = event.target.files && event.target.files[0];
            if (!file || typeof THREE.GLTFLoader === 'undefined') return;

            const url = URL.createObjectURL(file);
            const loader = makeGLTFLoader();
            loader.load(url, gltf => {
                const cfg = GLB_MODEL_FILES[currentHangarKey];
                HighPolyFactory.customGLBModels[currentHangarKey] = normalizeGLBModel(currentHangarKey, gltf.scene, cfg && cfg.rotate);
                loadHangarShowcaseModel(currentHangarKey);
                document.getElementById('hangar-model-name').textContent =
                    `MODEL 3D TÙY CHỈNH ĐÃ NẠP: ${file.name.toUpperCase()}`;
                URL.revokeObjectURL(url);
            });
        }

        function toggleHangarWireframe() {
            hangarWireframe = !hangarWireframe;
            hangarPivot.traverse(c => {
                if (c.isMesh && c.material && c.name !== 'jamAura') {
                    c.material.wireframe = hangarWireframe;
                }
            });
            const btn = document.getElementById('btn-wireframe');
            btn.textContent = hangarWireframe ? 'KHUNG DÂY ĐA GIÁC: BẬT' : 'KHUNG DÂY ĐA GIÁC: TẮT';
            btn.className = hangarWireframe
                ? 'px-2.5 py-1 rounded bg-emerald text-canvas font-mono text-[10px] font-bold'
                : 'px-2.5 py-1 rounded bg-canvas border hairline-border font-mono text-[10px] text-muted hover:text-alabaster';
        }

        /* ============================================================================
           9. VOLUMETRIC LIT SMOKE PLUME & MULTI-STAGE B-52 BREAKUP PHYSICS
           ============================================================================ */
        // kind: 'fire' (additive glow), 'smoke' (launch billow), 'trail' (missile exhaust), 'blacksmoke' (burning B-52)
        function spawnSmokePuff(origin, size, vel, life, kind) {
            const tex = HighPolyFactory.textures;
            let mat;
            if (kind === 'fire') {
                mat = new THREE.MeshBasicMaterial({
                    map: tex.fireSprite, transparent: true, opacity: 0.95,
                    blending: THREE.AdditiveBlending, depthWrite: false
                });
            } else {
                const shade = kind === 'blacksmoke' ? 0x1E1E22 : kind === 'trail' ? 0xB8BCC4 : 0x8A8F98;
                mat = new THREE.MeshLambertMaterial({
                    map: tex.smokeSprite, color: shade, emissive: 0x000000,
                    transparent: true, opacity: 0, depthWrite: false
                });
            }
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
            mesh.position.copy(origin);
            mesh.rotation.z = Math.random() * Math.PI * 2;
            worldCombatGroup.add(mesh);
            explosionParticles.push({
                mesh, vel, life, maxLife: life, kind,
                spin: (Math.random() - 0.5) * 0.6,
                grow: kind === 'fire' ? 0.8 : kind === 'trail' ? 2.2 : 1.6,
                baseOpacity: kind === 'blacksmoke' ? 0.9 : kind === 'trail' ? 0.5 : 0.62
            });
        }

        // SAM-2 launch: ground-hugging billows pushed out from the pad, fire core, sparks
        function launchBlast(origin) {
            const ground = new THREE.Vector3(origin.x, 1.0, origin.z);
            for (let b = 0; b < 22; b++) {
                // billow sideways and away from the deck camera so the shot stays readable
                const a = Math.PI + (Math.random() - 0.5) * Math.PI * 1.3 + Math.PI / 2;
                const sp = 2.5 + Math.random() * 5;
                const p = ground.clone().add(new THREE.Vector3(Math.cos(a) * 1.5, Math.random() * 2, Math.sin(a) * 1.5));
                spawnSmokePuff(p, 4 + Math.random() * 4, new THREE.Vector3(Math.cos(a) * sp, 0.8 + Math.random() * 2.5, Math.sin(a) * sp), 3.5 + Math.random() * 2.5, 'smoke');
            }
            for (let b = 0; b < 12; b++) {
                const p = ground.clone().add(new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 2.5, (Math.random() - 0.5) * 3));
                spawnSmokePuff(p, 3.5 + Math.random() * 3, new THREE.Vector3((Math.random() - 0.5) * 6, 1 + Math.random() * 3, (Math.random() - 0.5) * 6), 0.5 + Math.random() * 0.4, 'fire');
            }
            spawnSparks(ground, 160, 22, 0.8);
        }

        function updatePosterClock(dt) {
            campaignMinutes += dt / 6;
            const m = Math.floor(campaignMinutes) % 1440;
            const text = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
            if (text !== lastClockText) {
                lastClockText = text;
                document.getElementById('poster-clock').textContent = text;
            }
        }

        let posterStateTimer = null;
        function setPosterLaunchState(firing) {
            const st = document.getElementById('poster-state');
            st.textContent = firing ? 'PHÓNG - ĐANG KÍCH HOẠT' : 'SẴN SÀNG';
            st.classList.toggle('poster-state-live', firing);
            clearTimeout(posterStateTimer);
            if (firing) posterStateTimer = setTimeout(() => setPosterLaunchState(false), 1800);
        }

        function detonateB52Bomber(bomber) {
            SoundEngine.playExplosion(bomber.mesh.position, true);
            cameraShake = 1.35;
            onBomberDowned();

            const pos = bomber.mesh.position.clone();
            skyFlashLight.position.copy(pos);
            skyFlashLight.intensity = 8.5;

            const flashEl = document.getElementById('explosion-flash');
            flashEl.style.opacity = '1';
            setTimeout(() => { flashEl.style.opacity = '0'; }, 140);

            // Fireball + rolling black smoke + sparks, then a few chunks of debris
            for (let i = 0; i < 22; i++) {
                const v = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.4), (Math.random() - 0.5)).multiplyScalar(26);
                spawnSmokePuff(pos, 7 + Math.random() * 6, v, 0.7 + Math.random() * 0.6, 'fire');
            }
            for (let i = 0; i < 16; i++) {
                const v = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.2) * 0.6, (Math.random() - 0.5)).multiplyScalar(12);
                spawnSmokePuff(pos, 9 + Math.random() * 7, v, 3 + Math.random() * 2, 'blacksmoke');
            }
            spawnSparks(pos, 140, 46, 0.3);
            for (let i = 0; i < 12; i++) {
                const pMesh = new THREE.Mesh(
                    new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.6, 0),
                    new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xFF8A3D : 0x1C1C1F, transparent: true, opacity: 1 })
                );
                pMesh.position.copy(pos);
                worldCombatGroup.add(pMesh);
                explosionParticles.push({
                    mesh: pMesh,
                    vel: new THREE.Vector3((Math.random() - 0.5) * 42, (Math.random() - 0.3) * 34, (Math.random() - 0.5) * 42),
                    life: 1.4 + Math.random() * 0.7
                });
            }

            const wreck = HighPolyFactory.createB52G();
            wreck.position.copy(pos);
            wreck.scale.copy(bomber.mesh.scale);
            wreck.quaternion.copy(bomber.mesh.quaternion);
            const aura = wreck.getObjectByName('jamAura');
            if (aura) aura.visible = false;
            worldCombatGroup.add(wreck);
            const side = Math.random() < 0.5 ? -1 : 1;
            const hull = {
                mesh: wreck, kind: 'hull',
                vel: bomber.vel.clone().multiplyScalar(0.9).add(new THREE.Vector3(0, -1.5, 0)),
                roll: 0, rollRate: side * (0.15 + Math.random() * 0.2), side,
                life: 45, trailT: 0
            };
            fallingWrecks.push(hull);
            killCamWreck = hull;
            // a wing panel tears off and flutters down on its own
            const panel = new THREE.Mesh(new THREE.BoxGeometry(9, 0.35, 3.2),
                new THREE.MeshStandardMaterial({ color: 0x2B2F33, metalness: 0.4, roughness: 0.7 }));
            panel.position.copy(pos).add(new THREE.Vector3(side * 6, 0, 0));
            worldCombatGroup.add(panel);
            fallingWrecks.push({
                mesh: panel, kind: 'panel',
                vel: bomber.vel.clone().multiplyScalar(0.4).add(new THREE.Vector3(side * 6, 2, 0)),
                spin: new THREE.Vector3(1.5 + Math.random(), 0.6, 2.2 + Math.random()),
                life: 45, trailT: 0
            });
        }

        /* ============================================================================
           10. TIMELINE MILESTONES & "VẠCH NHIỄU TÌM THÙ" ECCM INTERACTION
           ============================================================================ */
        function toggleSoundEngine() {
            SoundEngine.enabled = !SoundEngine.enabled;
            if (SoundEngine.enabled && typeof SoundEngine.unlock === 'function') {
                SoundEngine.unlock();
            }
            document.querySelectorAll('[data-sound-label]').forEach(b => {
                b.textContent = SoundEngine.enabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt';
            });
        }

        /* ============================================================================
           11. MAIN 60FPS ANIMATION LOOP
           ============================================================================ */
        let prevTime = performance.now();
        const _shakeVec = new THREE.Vector3(), _slDir = new THREE.Vector3();

        function animateLoop(now) {
            requestAnimationFrame(animateLoop);
            const dt = gamePaused ? 0 : Math.min(0.05, (now - prevTime) / 1000);
            prevTime = now;

            if (currentMode === 'HANGAR') {
                if (!hangarDrag) hangarYaw += dt * 0.35;
                camera.position.set(
                    Math.sin(hangarYaw) * Math.cos(hangarPitch) * hangarDist,
                    Math.sin(hangarPitch) * hangarDist,
                    Math.cos(hangarYaw) * Math.cos(hangarPitch) * hangarDist
                );
                camera.lookAt(0, 0, 0);
                SoundFX.update();
                if (composer) composer.render();
                else renderer.render(scene, camera);
                return;
            }

            if (currentMode === 'SAM2' && gameState === 'PLAYING' && !gamePaused && !guidedMissile && missileCamHold <= 0) {
                // cursor in the outer band of the screen turns the station, faster the closer to the edge
                const edge = v => { const a = Math.abs(v); return a > 0.62 ? Math.sign(v) * Math.pow((a - 0.62) / 0.38, 1.4) : 0; };
                viewYaw -= edge(smoothAimX) * 1.6 * dt;
                viewPitch = Math.max(0.04, Math.min(VIEW_PITCH_MAX, viewPitch + edge(smoothAimY) * 1.1 * dt));
            }
            smoothAimX += (mouseAimX - smoothAimX) * Math.min(1, dt * 8);
            smoothAimY += (mouseAimY - smoothAimY) * Math.min(1, dt * 8);

            if (autoAIEnabled && activeBombers.length > 0 && gameState === 'MENU') {
                const tgt = activeBombers[0];
                const p = tgt.mesh.position.clone().project(camera);
                if (p.z > 0 && p.z < 1) {
                    mouseAimX += (p.x - mouseAimX) * dt * 2.5;
                    mouseAimY += (p.y - mouseAimY) * dt * 2.5;
                }
                aiFireTimer -= dt;
                if (aiFireTimer <= 0) {
                    triggerPrimaryWeaponFire();
                    aiFireTimer = 5.5;
                }
            }

            const ret = document.getElementById('hud-reticle');
            const boresight = currentMode === 'MIG21' && gameState === 'PLAYING';   // ASP sight is fixed to the nose
            ret.style.left = boresight ? '50%' : `${(smoothAimX * 0.5 + 0.5) * 100}%`;
            ret.style.top = boresight ? '50%' : `${(-smoothAimY * 0.5 + 0.5) * 100}%`;
            ret.style.visibility = guidedMissile && guidedMissile.t > 0.7 ? 'hidden' : 'visible';

            document.getElementById('hud-azimuth').textContent = `${String(Math.round(aimAzDeg) % 360).padStart(3, '0')}°`;
            document.getElementById('hud-elevation').textContent = `${Math.round(aimElDeg)}°`;

            if (!guidedMissile) {
                samLaunchers.forEach(l => {
                    l.battery.yawTurntable.rotation.y = Math.atan2(-aimDir.x, -aimDir.z);
                    l.battery.pitchBoom.rotation.x = Math.max(0.3, Math.min(1.3, THREE.MathUtils.degToRad(aimElDeg)));
                });
            }
            if (fanSongObj) {
                const head = fanSongObj.getObjectByName('scannerHead');
                if (head) head.rotation.y = now * 0.0018;
            }

            if (currentMode === 'MIG21' && (gameState === 'PLAYING' || gameState === 'ENDING')) updateMiGFlight(dt);

            _shakeVec.set(0, 0, 0);
            if (cameraShake > 0) {
                _shakeVec.set(
                    (Math.random() - 0.5) * cameraShake,
                    (Math.random() - 0.5) * cameraShake,
                    (Math.random() - 0.5) * cameraShake
                );
                cameraShake = Math.max(0, cameraShake - dt * 2.8);
            }

            // 5 CINEMATIC CAMERA PRESETS MATCHING ALL 4 REFERENCE IMAGES
            if (guidedMissile) {
                followMissileCamera(dt, _shakeVec);
            } else if (missileCamHold > 0) {
                // turn smoothly onto the burst, then glide back to the launch view
                missileCamHold -= dt;
                if (killCamWreck) {
                    if (fallingWrecks.includes(killCamWreck)) {
                        // drift along beside the burning hull as it goes down
                        const wp = killCamWreck.mesh.position;
                        missileCamHoldPos.copy(wp);
                        _tmpV.copy(wp).add(killCamOff);
                        _tmpV.y = Math.max(4, _tmpV.y);
                        camera.position.lerp(_tmpV, 1 - Math.exp(-dt * 1.6));
                    } else {
                        killCamWreck = null;   // it hit the ground: watch the impact briefly, then return
                        missileCamHold = Math.min(missileCamHold, 2.5);
                    }
                }
                _holdQ.copy(camera.quaternion);
                camera.lookAt(missileCamHoldPos);
                camera.quaternion.copy(_holdQ.slerp(camera.quaternion, 1 - Math.exp(-dt * 5)));
                if (missileCamHold <= 0) camReturn = { t: 0, pos: camera.position.clone(), quat: camera.quaternion.clone() };
            } else if (cameraPreset === 'DECK') {
                // View 1A: Elevated SAM-2 #03 Deck View with Twin Reserve Missiles on Left & Cathedral across River (Matches Image 3)
                stationCamera(dt, 15, 3.0, -2.6, _shakeVec);
            } else if (cameraPreset === 'REVETMENT') {
                // View 1B: Low Sandbag Revetment Trench View with S-75 Crates & Converging Searchlights (Matches Image 4)
                stationCamera(dt, 18, 1.6, -4.2, _shakeVec);
            } else if (cameraPreset === 'MAP3D') {
                // View 1C: High-Altitude 3D Tactical Command Map over Hanoi (Matches Image 2)
                camera.position.set(smoothAimX * 18, 98, 76).applyAxisAngle(WORLD_UP, viewYaw).add(_shakeVec);
                camera.lookAt(_tmpV.set(0, 2, -26).applyAxisAngle(WORLD_UP, viewYaw));
            } else if (cameraPreset === 'COCKPIT') {
                // View 2A: pilot's eye inside the 3D cockpit, rolling with the aircraft
                const p = playerMiG21.position;
                camera.position.copy(p).addScaledVector(mig.fwd, 2.2).addScaledVector(WORLD_UP, 1.05).addScaledVector(_shakeVec, 0.3);
                camera.lookAt(_tmpV.copy(p).addScaledVector(mig.fwd, 120).addScaledVector(WORLD_UP, 1.05));
                camera.rotateZ(-mig.bank);
            } else if (cameraPreset === 'CHASE') {
                // View 2B: exterior chase view behind Phạm Tuân's #5121
                const p = playerMiG21.position;
                camera.position.copy(p).addScaledVector(mig.fwd, -17).addScaledVector(WORLD_UP, 4.2).add(_shakeVec);
                camera.lookAt(_tmpV.copy(p).addScaledVector(mig.fwd, 40));
            }
            if (camReturn && !guidedMissile && missileCamHold <= 0) {
                camReturn.t += dt;
                const x = Math.min(1, camReturn.t / 1.4), e = x * x * (3 - 2 * x);
                camera.position.lerpVectors(camReturn.pos, camera.position, e);
                camera.quaternion.copy(_holdQ.copy(camReturn.quat).slerp(camera.quaternion, e));
                if (x >= 1) camReturn = null;
            } else if (guidedMissile) camReturn = null;

            // Animate Searchlights (Converge toward Lead B-52 or Sweep)
            searchlightCones.forEach((c, idx) => {
                const tgt = idx % 2 === 0 && activeBombers.length ? activeBombers[(idx / 2) % activeBombers.length] : null;
                if (tgt && tgt.mesh.position.distanceTo(c.position) < 1100) {
                    _slDir.copy(tgt.mesh.position).sub(c.position).normalize();
                } else {
                    const ph = c.userData.phase + now * 0.001 * c.userData.speed;
                    _slDir.set(Math.sin(ph) * 0.45, 1, Math.cos(ph * 0.8) * 0.35 - 0.3).normalize();
                }
                c.userData.dir = (c.userData.dir || _slDir.clone()).lerp(_slDir, Math.min(1, dt * 1.5)).normalize();
                c.quaternion.setFromUnitVectors(WORLD_UP, c.userData.dir);
            });

            // Animate wind-slanted rain in a box around the camera
            if (rainGeo) {
                rainSystem.position.set(camera.position.x, Math.max(0, camera.position.y - 35), camera.position.z);
                const rPos = rainGeo.attributes.position.array;
                const rLen = rainGeo.userData.len;
                for (let i = 0, d = 0; i < rPos.length; i += 6, d++) {
                    const fall = (38 + rLen[d] * 6) * dt;
                    rPos[i] -= fall * 0.18; rPos[i + 3] -= fall * 0.18;
                    rPos[i + 1] -= fall; rPos[i + 4] -= fall;
                    if (rPos[i + 1] < 0) {
                        const nx = (Math.random() - 0.5) * 120;
                        const ny = 62 + Math.random() * 8;
                        rPos[i] = nx; rPos[i + 1] = ny;
                        rPos[i + 3] = nx - rLen[d] * 0.18; rPos[i + 4] = ny - rLen[d];
                    }
                }
                rainGeo.attributes.position.needsUpdate = true;
            }

            // Sky: follow camera, thunderstorm lightning + explosion flashes light the clouds
            const tSec = now * 0.001;
            skyDome.position.copy(camera.position);
            skyUniforms.uTime.value = tSec;
            lightningTimer -= dt;
            if (lightningTimer <= 0) {
                lightningLevel = 0.6 + Math.random() * 0.5;
                lightningTimer = 5 + Math.random() * 9;
            }
            lightningLevel = Math.max(0, lightningLevel - dt * (2.5 + Math.random() * 6));
            const flash = Math.max(lightningLevel * (Math.random() > 0.3 ? 1 : 0.3), skyFlashLight.intensity / 12);
            skyUniforms.uFlash.value = flash;
            volumetricClouds.forEach(c => {
                c.position.x += c.userData.drift * dt;
                if (c.position.x > 900) c.position.x = -900;
                c.material.emissive.setRGB(0.04 + flash * 0.35, 0.05 + flash * 0.33, 0.08 + flash * 0.38);
            });
            searchlightCones.forEach(c => { c.material.uniforms.uTime.value = tSec; });
            if (cinematicGradePass) cinematicGradePass.uniforms.uTime.value = tSec;
            updateSparks(dt);

            aaaTracerLines.forEach(t => {
                t.position.x += t.userData.vx * dt;
                t.position.y += t.userData.vy * dt;
                t.position.z += t.userData.vz * dt;
                t.lookAt(t.position.x + t.userData.vx, t.position.y + t.userData.vy, t.position.z + t.userData.vz);
                t.rotateX(Math.PI / 2);
                if (t.position.y > 190) resetAAATracer(t);
            });

            if (skyFlashLight.intensity > 0) {
                skyFlashLight.intensity = Math.max(0, skyFlashLight.intensity - dt * 16);
            }
            if (launchPadLight.intensity > 0) {
                launchPadLight.intensity = Math.max(0, launchPadLight.intensity - dt * 12);
            }

            updateBombers(dt, now);
            updateMissiles(dt);

            // Update Falling B-52 Wreckages & Volumetric Smoke Color Transition (White/Yellow -> Fiery Orange -> Charcoal Smoke)
            for (let i = fallingWrecks.length - 1; i >= 0; i--) {
                const w = fallingWrecks[i];
                w.life -= dt;
                // gravity (game-scaled), air drag on the horizontal speed, terminal descent rate
                const drag = Math.exp(-(w.kind === 'panel' ? 0.6 : 0.12) * dt);
                w.vel.x *= drag;
                w.vel.z *= drag;
                w.vel.y = Math.max(w.kind === 'panel' ? -14 : -42, w.vel.y - (w.kind === 'panel' ? 3 : 5) * dt);
                w.mesh.position.addScaledVector(w.vel, dt);
                if (w.kind === 'hull') {
                    // nose follows the flight path down while the missing wing rolls it into a spiral
                    w.rollRate = Math.sign(w.rollRate) * Math.min(1.4, Math.abs(w.rollRate) + 0.12 * dt);
                    w.roll += w.rollRate * dt;
                    w.vel.applyAxisAngle(WORLD_UP, w.rollRate * 0.08 * dt);
                    w.mesh.lookAt(_tmpV2.copy(w.mesh.position).add(w.vel));
                    w.mesh.rotateZ(w.roll);
                } else {
                    w.mesh.rotation.x += w.spin.x * dt;
                    w.mesh.rotation.y += w.spin.y * dt;
                    w.mesh.rotation.z += w.spin.z * dt;
                }
                w.trailT -= dt;
                if (w.trailT <= 0) {
                    const hull = w.kind === 'hull';
                    w.trailT = hull ? 0.06 : 0.14;
                    const p = w.mesh.position;
                    if (hull) {
                        // fire streams from the torn wing root, smoke thickens as it falls
                        const root = _tmpV2.set(w.side * 4, 0, 0).applyQuaternion(w.mesh.quaternion).multiplyScalar(w.mesh.scale.x).add(p);
                        spawnSmokePuff(root.clone(), 6 + Math.random() * 3, new THREE.Vector3(0, 0.5, 0), 0.6, 'fire');
                        spawnSmokePuff(root.clone(), 10 + (45 - w.life) * 0.25, new THREE.Vector3((Math.random() - 0.5) * 2, 1.5, (Math.random() - 0.5) * 2), 5, 'blacksmoke');
                    } else {
                        spawnSmokePuff(p.clone(), 4, new THREE.Vector3(0, 1, 0), 2.5, 'blacksmoke');
                    }
                }
                if (w.mesh.position.y <= 0.8 || w.life <= 0) {
                    if (w.kind === 'hull' && w.mesh.position.y <= 0.8) {
                        // ground impact: fireball and a rising smoke column
                        const g = w.mesh.position.clone().setY(1);
                        for (let k = 0; k < 14; k++) {
                            spawnSmokePuff(g, 9 + Math.random() * 8, new THREE.Vector3((Math.random() - 0.5) * 20, Math.random() * 14, (Math.random() - 0.5) * 20), 0.9 + Math.random() * 0.6, 'fire');
                        }
                        for (let k = 0; k < 8; k++) {
                            spawnSmokePuff(g, 14 + Math.random() * 8, new THREE.Vector3((Math.random() - 0.5) * 4, 4 + Math.random() * 4, (Math.random() - 0.5) * 4), 6 + Math.random() * 3, 'blacksmoke');
                        }
                        skyFlashLight.position.copy(g).setY(20);
                        skyFlashLight.intensity = Math.max(skyFlashLight.intensity, 5);
                        SoundEngine.playExplosion(g, true);
                    }
                    worldCombatGroup.remove(w.mesh);
                    fallingWrecks.splice(i, 1);
                }
            }

            for (let i = explosionParticles.length - 1; i >= 0; i--) {
                const p = explosionParticles[i];
                p.life -= dt;
                p.mesh.position.addScaledVector(p.vel, dt);

                if (p.kind) {
                    p.mesh.lookAt(camera.position);
                    p.mesh.rotation.z += p.spin * dt;
                    p.vel.multiplyScalar(1 - dt * 0.9);
                    const age = 1 - Math.max(0, p.life / p.maxLife);
                    p.mesh.scale.setScalar(1 + age * p.grow);
                    if (p.kind === 'fire') {
                        p.mesh.material.opacity = (1 - age) * 0.95;
                        p.mesh.material.color.setRGB(1, 0.75 - age * 0.45, 0.4 - age * 0.35);
                    } else {
                        // smoke starts hot-tinted, then fades to lit grey
                        const hot = Math.max(0, 1 - age * 4);
                        p.mesh.material.emissive.setRGB(0.55 * hot, 0.22 * hot, 0.04 * hot);
                        p.mesh.material.opacity = Math.min(1, age * 8) * (1 - age) * p.baseOpacity;
                    }
                } else if (p.isVolumetricSmoke) {
                    p.mesh.lookAt(camera.position);
                    const ratio = Math.max(0, p.life / (p.maxLife || 1.2));
                    p.mesh.scale.addScalar(dt * 2.4);
                    p.mesh.material.opacity = ratio * 0.78;
                } else {
                    p.mesh.material.opacity = Math.max(0, p.life);
                }

                if (p.life <= 0) {
                    worldCombatGroup.remove(p.mesh);
                    p.mesh.geometry.dispose();
                    p.mesh.material.dispose();
                    explosionParticles.splice(i, 1);
                }
            }

            updatePosterClock(dt);
            updateMission(dt);
            updateJammers(dt);
            updateReload(dt);
            updateAAA(dt);
            updateGunTracers(dt);
            if (currentMode === 'SAM2') updateSamTracking(dt);
            updateZeroLagTargetLockBracket();
            renderDualRadarScopes(dt);
            renderMiG21CockpitDashboard(now);
            updateActionBar();
            updateMissileHud();
            updateJamPrompt();
            SoundFX.update();

            if (composer) composer.render();
            else renderer.render(scene, camera);
        }

        /* ============================================================================
           12. INPUT HANDLERS & 4 CAMPAIGN ARCHIVE CARDS (TƯ LIỆU CHIẾN DỊCH 12/1972)
           ============================================================================ */
        function setupEventHandlers() {
            const vp = document.getElementById('webgl-viewport');

            vp.addEventListener('mousemove', e => {
                if (currentMode === 'HANGAR') {
                    if (hangarDrag) {
                        hangarYaw -= (e.clientX - prevHX) * 0.0085;
                        hangarPitch = Math.max(-0.55, Math.min(0.85, hangarPitch + (e.clientY - prevHY) * 0.007));
                        prevHX = e.clientX;
                        prevHY = e.clientY;
                    }
                    return;
                }
                mouseAimX = (e.clientX / window.innerWidth) * 2 - 1;
                mouseAimY = -(e.clientY / window.innerHeight) * 2 + 1;
            });

            vp.addEventListener('mousedown', e => {
                SoundEngine.init();
                if (e.button === 2) {
                    if (gameState === 'PLAYING' && currentMode === 'MIG21') {
                        e.preventDefault();
                        fireMiGCannon();
                    }
                    return;
                }
                if (e.button !== 0) return;
                if (currentMode === 'HANGAR') {
                    hangarDrag = true;
                    prevHX = e.clientX;
                    prevHY = e.clientY;
                } else if (gameState === 'PLAYING') {
                    triggerPrimaryWeaponFire();
                }
            });

            vp.addEventListener('contextmenu', e => {
                if (gameState === 'PLAYING' && currentMode === 'MIG21') e.preventDefault();
            });

            window.addEventListener('mouseup', () => { hangarDrag = false; });

            vp.addEventListener('wheel', e => {
                if (currentMode === 'HANGAR') {
                    e.preventDefault();
                    hangarDist = Math.max(9, Math.min(36, hangarDist + e.deltaY * 0.014));
                }
            }, { passive: false });

            window.addEventListener('keyup', e => { keysDown[e.code] = false; });
            window.addEventListener('blur', () => { Object.keys(keysDown).forEach(k => { keysDown[k] = false; }); });
            window.addEventListener('keydown', e => {
                keysDown[e.code] = true;
                const archiveOpen = !document.getElementById('archive-drawer').classList.contains('translate-x-full');
                const guideEl = document.getElementById('modal-tactical-guide');
                const guideOpen = guideEl && guideEl.classList.contains('is-open');
                const radioLogEl = document.getElementById('modal-radio-log');
                const radioLogOpen = radioLogEl && radioLogEl.classList.contains('is-open');

                if (e.code === 'Escape') {
                    if (archiveOpen) toggleCampaignArchive(false);
                    else if (guideOpen) toggleTacticalGuide(false);
                    else if (radioLogOpen) toggleRadioLog(false);
                    else if (gameState === 'PLAYING') gamePaused ? resumeMission() : pauseMission();
                } else if (e.code === 'KeyB') {
                    if (typeof MusicSystem !== 'undefined') MusicSystem.toggle();
                } else if (e.code === 'KeyH') {
                    toggleTacticalGuide();
                } else if (e.code === 'KeyL') {
                    toggleRadioLog();
                } else if (gameState === 'DEBRIEF') {
                    if (e.code === 'KeyR') {
                        restartMission();
                    } else if (e.code === 'Enter' || e.code === 'Space') {
                        e.preventDefault();
                        if (missionWon) {
                            if (activeMissionIdx < MISSIONS.length - 1) openBriefing(activeMissionIdx + 1);
                            else showVictoryEpilogue();
                        } else {
                            restartMission();
                        }
                    } else if (e.code === 'KeyM') {
                        backToMenuAttract();
                        showScreen('campaign');
                    } else if (e.code === 'Escape') {
                        backToMenuAttract();
                        showScreen('menu');
                    }
                } else if (gameState !== 'PLAYING' || gamePaused || archiveOpen || guideOpen || radioLogOpen) {
                    return;
                } else if (e.code === 'Space') {
                    e.preventDefault();
                    if (!e.repeat) triggerPrimaryWeaponFire();
                } else if ((e.code === 'KeyF' || e.code === 'KeyC') && currentMode === 'MIG21') {
                    e.preventDefault();
                    fireMiGCannon();
                } else if (e.code === 'KeyR') {
                    startReload();
                } else if ((e.code === 'KeyQ' || e.code === 'KeyE') && currentMode === 'SAM2' && activeMission && activeMission.jam) {
                    hopFrequency(e.code === 'KeyQ' ? -45 : 45);
                }
            });
        }

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            if (composer) composer.setSize(window.innerWidth, window.innerHeight);
        }

        const CAMPAIGN_ARCHIVE_CARDS = {
            'card1': `
                <div class="space-y-4">
                    <!-- Sticky Timeline Jump Navigator -->
                    <div class="p-2.5 bg-black/85 border border-emerald-500/40 rounded-lg flex items-center gap-2 sticky top-0 z-20 backdrop-blur-md shadow-lg">
                        <div class="flex items-center gap-2">
                            <span class="font-mono text-[11px] text-emerald-400 font-bold uppercase tracking-wider">// TRỤC 12 ĐÊM:</span>
                            <span class="font-mono text-[10px] text-zinc-400 hidden sm:inline shrink-0">18.12 → 30.12.1972</span>
                        </div>
                        <div class="flex flex-nowrap gap-1 overflow-x-auto pb-1">
                            <button onclick="document.getElementById('night-node-1').scrollIntoView({behavior: 'smooth'})" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-500/30 text-[10px] font-mono text-zinc-300 border border-white/10 hover:border-emerald-400">Đ1</button>
                            <button onclick="document.getElementById('night-node-2').scrollIntoView({behavior: 'smooth'})" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-500/30 text-[10px] font-mono text-zinc-300 border border-white/10 hover:border-emerald-400">Đ2</button>
                            <button onclick="document.getElementById('night-node-3').scrollIntoView({behavior: 'smooth'})" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-500/30 text-[10px] font-mono text-amber-300 border border-amber-400/40 hover:border-emerald-400 font-bold">Đ3</button>
                            <button onclick="document.getElementById('night-node-4').scrollIntoView({behavior: 'smooth'})" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-500/30 text-[10px] font-mono text-zinc-300 border border-white/10 hover:border-emerald-400">Đ4</button>
                            <button onclick="document.getElementById('night-node-5').scrollIntoView({behavior: 'smooth'})" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-500/30 text-[10px] font-mono text-red-300 border border-red-500/40 hover:border-emerald-400">Đ5</button>
                            <button onclick="document.getElementById('night-node-6').scrollIntoView({behavior: 'smooth'})" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-500/30 text-[10px] font-mono text-zinc-300 border border-white/10 hover:border-emerald-400">Đ6</button>
                            <button onclick="document.getElementById('night-node-7').scrollIntoView({behavior: 'smooth'})" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-500/30 text-[10px] font-mono text-zinc-300 border border-white/10 hover:border-emerald-400">Đ7</button>
                            <button onclick="document.getElementById('night-node-8').scrollIntoView({behavior: 'smooth'})" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-500/30 text-[10px] font-mono text-zinc-300 border border-white/10 hover:border-emerald-400">Đ8</button>
                            <button onclick="document.getElementById('night-node-9').scrollIntoView({behavior: 'smooth'})" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-500/30 text-[10px] font-mono text-red-300 border border-red-500/40 hover:border-emerald-400 font-bold">Đ9</button>
                            <button onclick="document.getElementById('night-node-10').scrollIntoView({behavior: 'smooth'})" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-500/30 text-[10px] font-mono text-cyan-300 border border-cyan-400/40 hover:border-emerald-400 font-bold">Đ10</button>
                            <button onclick="document.getElementById('night-node-11').scrollIntoView({behavior: 'smooth'})" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-500/30 text-[10px] font-mono text-cyan-300 border border-cyan-400/40 hover:border-emerald-400 font-bold">Đ11</button>
                            <button onclick="document.getElementById('night-node-12').scrollIntoView({behavior: 'smooth'})" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-500/30 text-[10px] font-mono text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 font-bold">Đ12</button>
                            <button onclick="document.getElementById('night-node-13').scrollIntoView({behavior: 'smooth'})" class="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[10px] font-mono text-amber-300 border border-amber-400/50 font-bold">30/12</button>
                        </div>
                    </div>

                    <!-- 12 Nights Timeline Cards with Modern Day Site & Direct Google Maps Direction Link -->
                    <div class="space-y-4">

                        <!-- ĐÊM 1 -->
                        <div id="night-node-1" class="p-4 rounded-lg bg-black/70 border border-emerald-500/35 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-emerald-500/20 pb-2">
                                <div class="flex items-center gap-2">
                                    <span class="font-mono text-xs font-bold text-amber-400">ĐÊM 1 // 18.12.1972 · ĐÒN PHỦ ĐẦU TẠI PHÙ LỖ</span>
                                </div>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">HẠ 3 B-52 (2 RƠI TẠI CHỖ)</span>
                            </div>
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> 90 lần chiếc B-52 (phía Mỹ ghi 129 lần chiếc) cùng 135 máy bay chiến thuật ném bom dồn dập vào Đông Anh, Gia Lâm, Yên Viên và đài phát thanh Mễ Trì.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Lúc <strong>20 giờ 13 phút</strong>, kíp chiến đấu <strong>Tiểu đoàn 59 (Trung đoàn Tên lửa 261)</strong> dưới sự chỉ huy của Tiểu đoàn trưởng Nguyễn Văn Phiệt đã phóng 2 quả tên lửa SAM-2, bắn rơi tại chỗ chiếc B-52G đầu tiên trên cánh đồng Chuôm (xã Phù Lỗ, Đông Anh cũ). Cả đêm ta bắn rơi 3 B-52.</div>
                                    <div class="text-emerald-300 font-mono italic text-[11px] bg-emerald-950/30 p-2 rounded border border-emerald-500/20">“Báo cáo Sở chỉ huy: Tiểu đoàn 59 đã bắn rơi B-52 đầu tiên! Pháo đài bay cháy đỏ rực bầu trời phía Bắc!”</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Tượng đài Chiến thắng B-52 Phù Lỗ</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Ngã ba Phù Lỗ, Quốc lộ 2, xã Phù Lỗ, huyện Sóc Sơn, TP. Hà Nội.</div>
                                    <div class="text-zinc-400 text-[11px]">Hiện vật: Xác chiếc B-52 đầu tiên được trục vớt, trưng bày tại Bảo tàng Lịch sử Quân sự Việt Nam.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Tuong+dai+Chien+thang+B52+Phu+Lo+Soc+Son+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                    <div class="pt-2 mt-1 border-t border-white/10 space-y-2">
                                        <div class="text-zinc-200 font-semibold">Trận địa Cổ Loa – Tráng Việt (Tiểu đoàn 59)</div>
                                        <div class="text-zinc-400 text-[11px]">Vị trí: Xã Cổ Loa, huyện Đông Anh &amp; xã Tráng Việt, huyện Mê Linh, TP. Hà Nội.</div>
                                        <div class="text-zinc-400 text-[11px]">Nơi Tiểu đoàn 59 phóng 2 quả đạn hạ chiếc B-52 đầu tiên đêm 18/12; xác máy bay rơi tại cánh đồng Phù Lỗ.</div>
                                        <div class="pt-1 flex flex-wrap gap-1.5">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Co+Loa+Dong+Anh+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 2 -->
                        <div id="night-node-2" class="p-4 rounded-lg bg-black/70 border border-white/15 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2">
                                <span class="font-mono text-xs font-bold text-zinc-200">ĐÊM 2 // 19.12.1972 · LƯỚI LỬA TẦM THẤP &amp; TIẾNG NÓI VIỆT NAM</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15">HẠ 2 B-52</span>
                            </div>
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> 93 lần chiếc B-52 (theo phía Mỹ) dội bom Đài phát thanh Mễ Trì, Ga Hàng Cỏ, các khu dân cư An Dương, Gia Lâm nhằm bẻ gãy hệ thống truyền thông quốc gia.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Địch bay thấp dọc triền sông Hồng để luồn tránh radar. <strong>Tiểu đoàn 77 (Trung đoàn 257)</strong> tại trận địa Chèm áp dụng phương pháp bắn đón nửa góc, bắn rơi 1 B-52; Đài Mễ Trì bị đánh sập nhưng chỉ gián đoạn phát sóng 9 phút rồi tiếp tục phát đi từ trạm dự phòng.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Trận địa tên lửa Chèm &amp; Đài Tiếng nói Việt Nam Mễ Trì</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Đình Chèm, phường Thụy Phương, quận Bắc Từ Liêm &amp; Khu vực Mễ Trì, Nam Từ Liêm, Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Dinh+Chem+Thuy+Phuong+Bac+Tu+Liem+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 3 -->
                        <div id="night-node-3" class="p-4 rounded-lg bg-black/70 border border-amber-400/40 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-amber-400/20 pb-2">
                                <span class="font-mono text-xs font-bold text-amber-400">ĐÊM 3 // 20.12.1972 · ĐÊM RỰC LỬA YÊN VIÊN – KỶ LỤC HẠ 7 B-52</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40">HẠ 7 B-52 (5 RƠI TẠI CHỖ)</span>
                            </div>
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> Mỹ tung 99 lần chiếc B-52 (theo phía Mỹ) ném bom hủy diệt trung tâm đầu mối giao thông Yên Viên, Cầu Đuống, kho xăng Đức Giang và khu dân cư Gia Lâm.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Vận dụng xuất sắc “Cẩm nang bìa đỏ”, các <strong>Tiểu đoàn 57, 77, 79, 93</strong> đan lưới lửa SAM-2 tiêu diệt kỷ lục <strong>7 pháo đài bay B-52 trong 1 đêm</strong> (5 chiếc rơi tại chỗ). Đêm đánh xuất thần bẻ gãy đợt tập kích thứ nhất của Mỹ.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Ga Yên Viên &amp; Di tích Cầu Đuống</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Thị trấn Yên Viên, huyện Gia Lâm, TP. Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Ga+Yen+Vien+Gia+Lam+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 4 -->
                        <div id="night-node-4" class="p-4 rounded-lg bg-black/70 border border-white/15 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2">
                                <span class="font-mono text-xs font-bold text-zinc-200">ĐÊM 4 // 21.12.1972 · VẠCH NHIỄU TÌM THÙ GIỮA BÃO ĐIỆN TỬ</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15">HẠ 3 B-52</span>
                            </div>
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> Không quân Mỹ tăng cường độ phát nhiễu cực đại và phóng hàng chục quả tên lửa Shrike vào các trận địa radar đài phát sóng của ta.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Các trắc thủ linh hoạt nhảy tần số, sử dụng phương pháp 3 điểm (T/T), phát hiện dải nhiễu bản chất của B-52 và bắn rơi 3 chiếc tại khu vực Phúc Yên, Thanh Trì.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Trận địa Tên lửa An Khánh</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Xã An Khánh, huyện Hoài Đức, TP. Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=An+Khanh+Hoai+Duc+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 5 -->
                        <div id="night-node-5" class="p-4 rounded-lg bg-black/70 border border-red-500/40 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-red-500/20 pb-2">
                                <span class="font-mono text-xs font-bold text-red-400">ĐÊM 5 // 22.12.1972 · TỘI ÁC BẠCH MAI &amp; LỜI TUYÊN THỆ TRẢ THÙ</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-400/40">HẠ 3 B-52 · 1 F-111</span>
                            </div>
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> Lúc 04h45 rạng sáng 22/12, bom rải thảm phá hủy gần như toàn bộ Bệnh viện Bạch Mai — bệnh viện lớn nhất miền Bắc, sát hại 28 y bác sĩ, điều dưỡng và bệnh nhân.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Biến căm thù thành hành động, các trận địa tên lửa hạ gục 3 pháo đài bay B-52; pháo cao xạ đan lưới tầm thấp bắn rơi 1 máy bay cánh cụp cánh xòe F-111 tối tân của Mỹ tại bến phà Khuyến Lương.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Khu Bia Tưởng Niệm Bệnh Viện Bạch Mai</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Khuôn viên Bệnh viện Bạch Mai, số 78 Giải Phóng, phường Phương Mai, quận Đống Đa, Hà Nội.</div>
                                    <div class="text-zinc-400 text-[11px]">Dấu tích: Tượng đài đá tạc hình người phụ nữ bế con đau thương bất khuất.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Benh+vien+Bach+Mai+78+Giai+Phong+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 6 -->
                        <div id="night-node-6" class="p-4 rounded-lg bg-black/70 border border-white/15 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2">
                                <span class="font-mono text-xs font-bold text-zinc-200">ĐÊM 6 // 23.12.1972 · CHẶN ĐỨNG ĐÒN CHIA CẮT HUYẾT MẠCH PHÍA NAM</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15">HẠ 2 B-52</span>
                            </div>
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> 30 lần chiếc B-52 (theo phía Mỹ) tập trung oanh tạc các ga hàng hóa phía Nam: Giáp Bát, Văn Điển, Thường Tín nhằm cắt đứt nguồn vận chuyển lương thực, đạn dược chi viện.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Các trận địa SAM-2 bố trí vòng ngoài phối hợp cao xạ bảo vệ ga tàu, bắn rơi 2 B-52, giữ vững mạch máu tiếp tế cho Thủ đô.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Khu vực Ga Giáp Bát &amp; Văn Điển</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Đường Giải Phóng, phường Thịnh Liệt, quận Hoàng Mai, Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Ga+Giap+Bat+Hoang+Mai+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 7 -->
                        <div id="night-node-7" class="p-4 rounded-lg bg-black/70 border border-white/15 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2">
                                <span class="font-mono text-xs font-bold text-zinc-200">ĐÊM 7 // 24.12.1972 · TRẬN ĐÁNH ÁP CHÓT TRƯỚC GIÁNG SINH</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15">HẠ 2 B-52</span>
                            </div>
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> Địch oanh tạc ga Kép, Yên Viên và Thái Nguyên nhằm cô lập các cứ điểm phòng không vòng ngoài.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Lực lượng phòng không Hà Nội và Hải Phòng bắn rơi 2 B-52. Tổn thất tăng vọt buộc Nixon phải ra lệnh tạm ngừng ném bom 36 giờ từ nửa đêm 24/12 nhân dịp Noel để củng cố tinh thần phi công Mỹ đang hoang mang tột độ.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Trận địa Phòng không Đan Phượng</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Thị trấn Phùng, huyện Đan Phượng, TP. Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Thi+tran+Phung+Dan+Phuong+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- NGÀY 8 -->
                        <div id="night-node-8" class="p-4 rounded-lg bg-black/70 border border-white/15 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2">
                                <span class="font-mono text-xs font-bold text-zinc-200">NGÀY 8 // 25.12.1972 · 36 GIỜ QUÝ HƠN VÀNG: THẦN TỐC LẮP RÁP ĐẠN TÊN LỬA</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15">CƠ ĐỘNG KHÍ TÀI</span>
                            </div>
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[TÌNH HUỐNG CHIẾN DỊCH]</strong> 36 giờ địch tạm ngừng ném bom là cơ hội vàng có một không hai. Lượng đạn SAM-2 tại Hà Nội sau 7 ngày chiến đấu đã cạn kiệt đến mức báo động.</div>
                                    <div><strong class="text-alabaster font-mono">[HÀNH ĐỘNG CỦA TA]</strong> Cục Kỹ thuật Quân chủng PK-KQ, các xưởng quân giới làm việc liên tục 24/24 giờ để kiểm định, nạp nhiên liệu và lắp ráp tên lửa; đoàn xe vận tải cơ động thần tốc kéo đạn tên lửa từ Quân khu 4 ra bổ sung kịp thời cho các bệ phóng bảo vệ Thủ đô.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Nhà máy A31 &amp; Nhà máy Z119 (Cục Kỹ thuật PK-KQ)</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Huyện Chương Mỹ &amp; Đường Trường Chinh, quận Thanh Xuân, Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Nha+may+A31+Cuc+Ky+thuat+Phong+khong+Khong+quan" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 9 -->
                        <div id="night-node-9" class="p-4 rounded-lg bg-black/70 border border-red-500/50 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-red-500/30 pb-2">
                                <span class="font-mono text-xs font-bold text-red-400">ĐÊM 9 // 26.12.1972 · KHÂM THIÊN CĂM HỜN: TRẬN QUYẾT CHIẾN ĐÁNH QUỴ B-52</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-400/50">HẠ 8 B-52 (4 RƠI TẠI CHỖ)</span>
                            </div>
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> Đợt tập kích quy mô tàn bạo nhất trong lịch sử: Mỹ huy động <strong>105 lần chiếc B-52</strong> theo một số tài liệu phía Việt Nam (phía Mỹ ghi 120 lần chiếc B-52 và 113 lần chiếc cường kích yểm hộ) đồng loạt ném bom rải thảm phố Khâm Thiên, khu dân cư An Dương, Bệnh viện Bạch Mai; làm 287 đồng bào vô tội thiệt mạng (bảng thống kê chi tiết ghi 278 người chết, 290 người bị thương, 178 trẻ mồ côi).</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Trong hơn 1 giờ đồng hồ giao tranh ác liệt, toàn bộ lực lượng phòng không ba thứ quân đã trút bão lửa giáng trả: bắn rơi <strong>8 pháo đài bay B-52</strong> (4 chiếc rơi tại chỗ), đập tan hoàn toàn mưu toan khuất phục nhân dân ta bằng bom đạn hủy diệt.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Đài Tưởng Niệm Khâm Thiên</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Số 47 – 49 – 51 phố Khâm Thiên, phường Khâm Thiên, quận Đống Đa, Hà Nội.</div>
                                    <div class="text-zinc-400 text-[11px]">Dấu tích: Tượng đài người mẹ ôm con bị bom Mỹ sát hại — biểu tượng bất tử của nỗi đau và ý chí quật cường.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Dai+tuong+niem+Kham+Thien+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                    <div class="pt-2 mt-1 border-t border-white/10 space-y-2">
                                        <div class="text-zinc-200 font-semibold">Khu lao động An Dương</div>
                                        <div class="text-zinc-400 text-[11px]">Vị trí: Phố An Dương, quận Tây Hồ, TP. Hà Nội.</div>
                                        <div class="text-zinc-400 text-[11px]">Cùng đêm 26/12, khu lao động An Dương cũng bị bom B-52 rải thảm cùng lúc với Khâm Thiên và Bạch Mai.</div>
                                        <div class="pt-1 flex flex-wrap gap-1.5">
                                        <a href="https://www.google.com/maps/search/?api=1&query=An+Duong+Tay+Ho+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 10 -->
                        <div id="night-node-10" class="p-4 rounded-lg bg-black/70 border border-cyan-400/40 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-cyan-400/20 pb-2">
                                <span class="font-mono text-xs font-bold text-cyan-300">ĐÊM 10 // 27.12.1972 · KỲ TÍCH PHẠM TUÂN &amp; B-52 RƠI HỒ HỮU TIỆP</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40">HẠ 1 B-52 BẰNG MIG-21 · 1 RƠI HỒ HỮU TIỆP</span>
                            </div>
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> 60 lần chiếc B-52 (theo phía Mỹ) tiếp tục ném bom rải thảm khu vực Đông Anh, Yên Viên và ngoại vi Thủ đô.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> 22h20, Anh hùng <strong>Phạm Tuân</strong> điều khiển tiêm kích MiG-21MF (số hiệu 5121) xuất kích từ sân bay dã chiến Yên Bái, bay luồn dưới trần mây, bất ngờ vút lên tiếp cận tốp B-52 ở cự ly 4 km và phóng 2 quả tên lửa K-13 bắn hạ B-52 trên bầu trời Mộc Châu. Đêm đó, <strong>Tiểu đoàn tên lửa 72</strong> cũng lập công bắn rơi 1 B-52 cắm xác xuống hồ Hữu Tiệp.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Di tích Xác máy bay B-52 Hồ Hữu Tiệp</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Ngõ 55 phố Hoàng Hoa Thám, làng hoa Ngọc Hà, quận Ba Đình, TP. Hà Nội.</div>
                                    <div class="text-zinc-400 text-[11px]">Hiện vật: Xác máy bay B-52 còn nguyên phần đuôi và động cơ nằm giữa lòng hồ nước giữa lòng Thủ đô.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Ho+Huu+Tiep+B52+Ngoc+Ha+Ba+Dinh+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                    <div class="pt-2 mt-1 border-t border-white/10 space-y-2">
                                        <div class="text-zinc-200 font-semibold">Vùng trời Yên Bái</div>
                                        <div class="text-zinc-400 text-[11px]">Vị trí: TP. Yên Bái, tỉnh Yên Bái.</div>
                                        <div class="text-zinc-400 text-[11px]">Nơi Phạm Tuân xuất kích đêm 27/12, bắn rơi B-52 rồi hạ cánh an toàn.</div>
                                        <div class="pt-1 flex flex-wrap gap-1.5">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Yen+Bai" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 11 -->
                        <div id="night-node-11" class="p-4 rounded-lg bg-black/70 border border-cyan-400/40 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-cyan-400/20 pb-2">
                                <span class="font-mono text-xs font-bold text-cyan-300">ĐÊM 11 // 28.12.1972 · QUẢ TÊN LỬA THỨ BA: ANH HÙNG VŨ XUÂN THIỀU</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40">HẠ 1 B-52 (CẢM TỬ)</span>
                            </div>
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> Địch huy động B-52 đánh phá vòng ngoài hướng Tây Bắc.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Phi công <strong>Vũ Xuân Thiều</strong> lái tiêm kích MiG-21 (số hiệu 046) xuất kích từ sân bay Cẩm Thủy (Thanh Hóa), vượt qua màn nhiễu tiếp cận B-52 trên bầu trời Yên Châu (Sơn La). Sau khi phóng 2 tên lửa K-13 ở cự ly quá gần, anh đã quả cảm lao thẳng chiếc MiG-21 vào thân pháo đài bay địch, cùng chiếc B-52 nổ tung giữa bầu trời Tổ quốc.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Tượng đài &amp; Nhà lưu niệm Anh hùng Vũ Xuân Thiều</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Phố Vũ Xuân Thiều, phường Sài Đồng, quận Long Biên, TP. Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Tuong+dai+Liet+si+Vu+Xuan+Thieu+Sai+Dong+Long+Bien" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                    <div class="pt-2 mt-1 border-t border-white/10 space-y-2">
                                        <div class="text-zinc-200 font-semibold">Vùng trời Yên Châu, Sơn La</div>
                                        <div class="text-zinc-400 text-[11px]">Vị trí: Huyện Yên Châu, tỉnh Sơn La.</div>
                                        <div class="text-zinc-400 text-[11px]">Nơi Vũ Xuân Thiều hy sinh sau khi bắn cháy B-52 đêm 28/12 (xác B-52 và MiG-21 rơi tại xã Tạ Khoa); ban đầu an táng tại Sơn La, sau đưa về nghĩa trang Văn Điển, Hà Nội.</div>
                                        <div class="pt-1 flex flex-wrap gap-1.5">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Yen+Chau+Son+La" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 12 -->
                        <div id="night-node-12" class="p-4 rounded-lg bg-black/70 border border-emerald-500/50 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-emerald-500/30 pb-2">
                                <span class="font-mono text-xs font-bold text-emerald-400">ĐÊM 12 // 29.12.1972 · TRẬN ĐÁNH CUỐI CÙNG: KHÚC KHẢI HOÀN TOÀN THẮNG</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/50">HẠ 2 B-52 · THẮNG LỢI TRỌN VẸN</span>
                            </div>
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> Đợt oanh tạc tuyệt vọng của Mỹ vào các trận địa phòng không và kho tàng xung quanh Hà Nội, Thái Nguyên.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Lúc 23h29, <strong>Tiểu đoàn 79 (Trung đoàn 257)</strong> tại trận địa Đa Phúc phóng 2 quả đạn, bắn rơi tại chỗ chiếc B-52 thứ 34 của chiến dịch, rơi tại Phúc Yên. Đây là chiếc pháo đài bay cuối cùng bị tiêu diệt trong 12 ngày đêm. Thất bại thảm hại buộc Nhà Trắng phải đầu hàng trên bầu trời Hà Nội.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Bảo tàng Chiến thắng B-52 &amp; Bảo tàng PK-KQ</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Số 157 Đội Cấn, Ba Đình &amp; Số 171 Trường Chinh, Thanh Xuân, Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Bao+tang+Chien+thang+B52+157+Doi+Can+Ba+Dinh+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                    <div class="pt-2 mt-1 border-t border-white/10 space-y-2">
                                        <div class="text-zinc-200 font-semibold">Các khu vực bị đánh đêm 29/12</div>
                                        <div class="text-zinc-400 text-[11px]">Vị trí: Gang thép Thái Nguyên – Trại Cau (Đồng Hỷ, Thái Nguyên); Đồng Mỏ (Chi Lăng, Lạng Sơn); Kim Anh (Vĩnh Phúc).</div>
                                        <div class="text-zinc-400 text-[11px]">Đợt 60 lần chiếc B-52 lúc 23h16 chia 3 hướng: 30 đánh Thái Nguyên–Trại Cau, 18 đánh Đồng Mỏ, 12 đánh Kim Anh (Wikipedia tiếng Việt ghi 54 lần chiếc chia 24/9/21).</div>
                                        <div class="pt-1 flex flex-wrap gap-1.5">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Trai+Cau+Dong+Hy+Thai+Nguyen" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [TRẠI CAU ↗ ↗]
                                        </a>
                                        <a href="https://www.google.com/maps/search/?api=1&query=Dong+Mo+Chi+Lang+Lang+Son" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [ĐỒNG MỎ ↗ ↗]
                                        </a>
                                        <a href="https://www.google.com/maps/search/?api=1&query=Kim+Anh+Vinh+Phuc" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [KIM ANH ↗ ↗]
                                        </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- KHẢI HOÀN 30/12 -->
                        <div id="night-node-13" class="p-4 rounded-lg bg-amber-950/20 border border-amber-400/50 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-amber-400/30 pb-2">
                                <span class="font-mono text-xs font-bold text-amber-300">NGÀY 30.12.1972 → 27.01.1973 · ĐẠI THẮNG ĐIỆN BIÊN PHỦ TRÊN KHÔNG &amp; HIỆP ĐỊNH PARIS</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold border border-amber-400/50">TOÀN THẮNG LỊCH SỬ</span>
                            </div>
                            <div class="text-xs text-zinc-200 leading-relaxed space-y-2">
                                <div>Sáng 30/12/1972, Tổng thống Nixon buộc phải tuyên bố ngừng hoàn toàn ném bom miền Bắc từ bắc vĩ tuyến 20 và chấp nhận nối lại đàm phán tại Paris trên cơ sở dự thảo của Việt Nam.</div>
                                <div>Ngày 27/01/1973, <strong>Hiệp định Paris</strong> chính thức được ký kết tại Trung tâm Hội nghị Quốc tế Kléber (Paris, Pháp), buộc toàn bộ quân đội viễn chinh Mỹ phải rút khỏi Việt Nam, hoàn thành mục tiêu <strong>“Đánh cho Mỹ cút”</strong> của Bác Hồ, tạo tiền đề quyết định giải phóng hoàn toàn miền Nam năm 1975.</div>
                            </div>
                        </div>

                    </div>
                </div>
            `,
            'card2': `
                <div class="space-y-4">
                    <div class="p-4 rounded-lg bg-zinc-900/80 border border-emerald-500/30 space-y-2">
                        <div class="flex items-center justify-between flex-wrap gap-2">
                            <span class="font-mono text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                                BỐI CẢNH LỊCH SỬ &amp; TẦM NHÌN DỰ BÁO CHIẾN LƯỢC
                            </span>
                            <span class="font-mono text-[10px] text-zinc-400">10/1972 – 12/1972</span>
                        </div>
                        <h3 class="font-serif text-lg sm:text-xl text-alabaster font-semibold">
                            Bế Tắc Tại Paris &amp; Đòn Tập Kích Đường Không Chiến Lược Linebacker II
                        </h3>
                        <p class="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                            Mùa thu năm 1972, sau thất bại nặng nề trên chiến trường miền Nam, chính quyền Tổng thống Mỹ Richard Nixon buộc phải chấp thuận dự thảo Hiệp định Paris vào tháng 10/1972. Tuy nhiên, ngay sau khi tái đắc cử, chính quyền Nixon đã lật lọng, trì hoãn ký kết và đòi sửa đổi 69 điều khoản cốt lõi.
                        </p>
                        <p class="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                            Ngày 14/12/1972, Nixon chính thức phê chuẩn kế hoạch tập kích đường không chiến lược hủy diệt mang mật danh <strong class="text-emerald-400">Linebacker II (18/12 – 29/12/1972)</strong>. Mục tiêu của Mỹ là dùng pháo đài bay B-52 rải thảm tàn phá thủ đô Hà Nội, Hải Phòng nhằm đưa Việt Nam trở về “thời kỳ đồ đá” để ép ta ký hiệp định theo điều kiện của Mỹ.
                        </p>
                    </div>

                    <div class="p-4 rounded-lg bg-amber-950/20 border border-amber-400/40 space-y-2">
                        <span class="font-mono text-[11px] text-amber-400 uppercase font-bold tracking-wider block">
                            ★ TẦM NHÌN THIÊN TÀI CỦA CHỦ TỊCH HỒ CHÍ MINH (THÁNG 12/1967)
                        </span>
                        <blockquote class="font-serif text-sm sm:text-base italic text-amber-100 border-l-2 border-amber-400 pl-3 leading-relaxed">
                            “Sớm muộn rồi đế quốc Mỹ cũng sẽ đưa B-52 ra đánh Hà Nội, rồi có thua nó mới chịu thua. Phải dự kiến trước mọi tình huống càng sớm càng tốt để có thời gian mà suy nghĩ, chuẩn bị... Ở Việt Nam, Mỹ nhất định thua, nhưng nó chỉ chịu thua sau khi thua trên bầu trời Hà Nội.”
                        </blockquote>
                        <div class="text-[11px] text-zinc-400 font-mono text-right">
                            — Chỉ thị cho Tư lệnh kiêm Chính ủy Quân chủng PK-KQ Phùng Thế Tài (12/1967)
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="p-3.5 rounded-lg bg-black/60 border border-red-500/30 space-y-2">
                            <span class="font-mono text-[11px] text-red-400 font-bold uppercase tracking-wider block">
                                LỰC LƯỢNG HUY ĐỘNG CỦA MỸ
                            </span>
                            <ul class="list-disc pl-4 space-y-1.5 text-xs text-zinc-300">
                                <li><strong class="text-alabaster">193 pháo đài bay B-52:</strong> Chiếm gần 50% tổng số máy bay B-52 toàn không quân chiến lược Mỹ (tại căn cứ U-Tapao, Thái Lan và Andersen, đảo Guam).</li>
                                <li><strong class="text-alabaster">1.077 máy bay chiến thuật:</strong> Gồm F-111A cánh cụp cánh xòe, F-4 Phantom, A-7 Corsair, A-6 Intruder, EB-66 gây nhiễu.</li>
                                <li><strong class="text-alabaster">6 tàu sân bay:</strong> Cùng hàng chục tàu khu trục hạm đội 7 thường trực tại vịnh Bắc Bộ.</li>
                                <li><strong class="text-alabaster">&gt; 36.000 tấn bom:</strong> Ném xuống các khu dân cư, bệnh viện, trường học.</li>
                            </ul>
                        </div>

                        <div class="p-3.5 rounded-lg bg-black/60 border border-emerald-500/30 space-y-2">
                            <span class="font-mono text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
                                CÔNG TÁC CHUẨN BỊ CHỦ ĐỘNG TỪ SỚM
                            </span>
                            <ul class="list-disc pl-4 space-y-1.5 text-xs text-zinc-300">
                                <li><strong class="text-alabaster">Cuốn “Cẩm nang bìa đỏ”:</strong> Từ 1968 đến tháng 5/1972, kíp trắc thủ ưu tú vào chiến trường Vĩnh Linh, Khu 4 nghiên cứu dải nhiễu B-52, đúc kết phương pháp đánh B-52 trong tài liệu mật 30 trang.</li>
                                <li><strong class="text-alabaster">Sơ tán thần tốc 50 vạn nhân dân:</strong> Thủ đô khẩn trương sơ tán người già, trẻ em ra ngoại thành trước 18/12, hạn chế tối đa thương vong đồng bào.</li>
                                <li><strong class="text-alabaster">Hệ thống phòng vệ đa tầng:</strong> Hơn 400.000 hố tránh bom cá nhân và 90.000 hầm trú ẩn tập thể kiên cố khắp phố phường Hà Nội.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `,
            'card3': `
                <div class="space-y-4">
                    <div class="p-4 rounded-lg bg-zinc-900/80 border border-emerald-500/30 space-y-2">
                        <span class="font-mono text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
                            NGHỆ THUẬT QUÂN SỰ ĐỘC ĐÁO // VẠCH NHIỄU TÌM THÙ
                        </span>
                        <h3 class="font-serif text-lg sm:text-xl text-alabaster font-semibold">
                            Bản Chất Cuộc Đấu Trí Tác Chiến Điện Tử Giữa Màn Nhiễu Radar
                        </h3>
                        <p class="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                            Mỗi tốp 3 chiếc B-52 được trang bị từ 15 đến 18 máy phát nhiễu tích cực công suất lớn (máy ALQ-31, ALQ-87...), kết hợp máy bay hộ tống gây nhiễu chuyên dụng EB-66, EA-6B tạo thành màn nhiễu điện tử dày đặc che lấp hoàn toàn tín hiệu phản xạ trên màn hiện sóng đài radar SNR-75 (tổ hợp tên lửa SAM-2). Đồng thời, máy bay Mỹ rải hàng chục triệu sợi kim loại mạ nhôm (nhiễu tiêu cực - chaff) tạo hành lang nhiễu khổng lồ trôi lơ lửng trên bầu trời.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="p-3.5 rounded-lg bg-black/60 border border-amber-400/40 space-y-2">
                            <span class="font-mono text-[11px] text-amber-400 font-bold uppercase tracking-wider block">
                                SÁNG TẠO CỦA TRẮC THỦ VIỆT NAM
                            </span>
                            <ul class="list-disc pl-4 space-y-2 text-xs text-zinc-300">
                                <li><strong class="text-alabaster">Phân biệt dải nhiễu bản chất:</strong> Trắc thủ góc tà, cự ly và phương vị đài SNR-75 nhận diện: nhiễu rải chaff thì mịn, tản mát và trôi theo gió; trong khi nhiễu tích cực của B-52 có độ sáng nhấp nháy, chuyển động có vận tốc và đường bay nhất quán.</li>
                                <li><strong class="text-alabaster">Phương pháp bám sát 3 điểm (T/T):</strong> Khi màn nhiễu quá dày, kíp chỉ huy chọn phương pháp dẫn đạn 3 điểm (Trắc thủ – Tên lửa – Tâm dải nhiễu), giữ tên lửa luôn ngắm thẳng vào giữa bụng pháo đài bay.</li>
                                <li><strong class="text-alabaster">Bắn đón nửa góc:</strong> Đón đầu đường bay của tốp B-52 để đầu đạn nổ mảnh (8.000 mảnh văng) bao trùm diện tích cánh và động cơ máy bay.</li>
                            </ul>
                        </div>

                        <div class="p-3.5 rounded-lg bg-black/60 border border-cyan-400/40 space-y-2">
                            <span class="font-mono text-[11px] text-cyan-300 font-bold uppercase tracking-wider block">
                                VÔ HIỆU HÓA TÊN LỬA SHRIKE (AGM-45)
                            </span>
                            <ul class="list-disc pl-4 space-y-2 text-xs text-zinc-300">
                                <li><strong class="text-alabaster">Hiểm họa Shrike:</strong> Tên lửa AGM-45 Shrike tự dẫn theo cánh sóng radar của ta để đánh thẳng vào cabin điều khiển.</li>
                                <li><strong class="text-alabaster">Phát sóng ngắn tức thời:</strong> Kíp trắc thủ chỉ bật phát sóng đài radar dưới 10 giây để ngắm bám sơ bộ rồi tắt sóng ngay, khiến tên lửa Shrike mất tín hiệu và cắm xuống ruộng hoang.</li>
                                <li><strong class="text-alabaster">Phóng đạn giả &amp; Ngụy trang sóng:</strong> Bật các đài phát sóng nghi binh ở cự ly khác để thu hút Shrike, bảo toàn tuyệt đối trận địa tên lửa chủ lực.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `,
            'card4': `
                <div class="space-y-4">
                    <!-- 4 KPI Metric Cards -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div class="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-center">
                            <div class="font-serif text-2xl sm:text-3xl font-bold text-emerald-400">81</div>
                            <div class="font-mono text-[10px] text-zinc-300 uppercase tracking-wider mt-0.5">Máy bay Mỹ bị hạ</div>
                        </div>
                        <div class="p-3 rounded-lg bg-amber-500/15 border border-amber-400/40 text-center">
                            <div class="font-serif text-2xl sm:text-3xl font-bold text-amber-300">34</div>
                            <div class="font-mono text-[10px] text-zinc-300 uppercase tracking-wider mt-0.5">Pháo đài bay B-52</div>
                        </div>
                        <div class="p-3 rounded-lg bg-cyan-500/15 border border-cyan-400/40 text-center">
                            <div class="font-serif text-2xl sm:text-3xl font-bold text-cyan-300">5</div>
                            <div class="font-mono text-[10px] text-zinc-300 uppercase tracking-wider mt-0.5">F-111 cụp xòe</div>
                        </div>
                        <div class="p-3 rounded-lg bg-red-500/15 border border-red-400/40 text-center">
                            <div class="font-serif text-2xl sm:text-3xl font-bold text-red-400">17,6%</div>
                            <div class="font-mono text-[10px] text-zinc-300 uppercase tracking-wider mt-0.5">Tỷ lệ tổn thất B-52</div>
                        </div>
                    </div>

                    <div class="p-4 rounded-lg bg-zinc-900/80 border border-emerald-500/30 space-y-2">
                        <span class="font-mono text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
                            TỔNG KẾT CHIẾN CÔNG 12 NGÀY ĐÊM // QUÂN CHỦNG PHÒNG KHÔNG - KHÔNG QUÂN
                        </span>
                        <h3 class="font-serif text-lg sm:text-xl text-alabaster font-semibold">
                            Đập Tan Huyền Thoại B-52 — Thất Bại Lớn Nhất Của Không Lực Hoa Kỳ
                        </h3>
                        <p class="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                            Trong suốt 12 ngày đêm chiến đấu ngoan cường, quân và dân miền Bắc (nòng cốt là Quân chủng Phòng không – Không quân và nhân dân Hà Nội, Hải Phòng) đã bắn rơi <strong class="text-emerald-400">81 máy bay hiện đại các loại của Mỹ</strong>:
                        </p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300 pt-1">
                            <div class="space-y-1">
                                <div>• <strong class="text-amber-300">34 siêu pháo đài bay B-52</strong> (Quân chủng PK-KQ bắn rơi 32 chiếc, 16 chiếc rơi tại chỗ; 2 chiếc còn lại do MiG-21 của Không quân hạ)</div>
                                <div>• <strong class="text-alabaster">5 máy bay cánh cụp cánh xòe F-111A</strong></div>
                                <div>• <strong class="text-zinc-200">21 tiêm kích F-4 Phantom</strong></div>
                                <div>• <strong class="text-zinc-200">12 cường kích A-7 Corsair</strong></div>
                            </div>
                            <div class="space-y-1">
                                <div>• <strong class="text-zinc-200">1 tiêm kích F-105 Thunderchief</strong></div>
                                <div>• <strong class="text-zinc-200">4 cường kích A-6 Intruder</strong></div>
                                <div>• <strong class="text-zinc-200">2 máy bay trinh sát RA-5C</strong></div>
                                <div>• <strong class="text-zinc-200">1 trực thăng HH-53 &amp; 1 trinh sát không người lái</strong></div>
                            </div>
                        </div>
                        <div class="p-2.5 rounded bg-black/50 border border-white/10 text-xs text-zinc-400 mt-2">
                            *Tỷ lệ 17,6%: 34 chiếc B-52 theo phía Việt Nam so với tổng số B-52 Mỹ ở Đông Nam Á — Bảo tàng Lịch sử Quốc gia ghi “gần 18%”.
                        </div>
                        <div class="p-2.5 rounded bg-black/50 border border-white/10 text-xs text-zinc-300 mt-2">
                            Bắt sống <strong class="text-amber-300">hàng chục phi công giặc lái Mỹ</strong> (trong đó có nhiều chỉ huy, hoa tiêu kỳ cựu B-52), giam giữ nhân đạo tại trại giam Hỏa Lò (“Hà Nội Hilton”).
                        </div>
                    </div>

                    <div class="p-4 rounded-lg bg-black/60 border border-amber-400/40 space-y-2">
                        <span class="font-mono text-[11px] text-amber-400 font-bold uppercase tracking-wider block">
                            Ý NGHĨA LỊCH SỬ BƯỚC NGOẶT
                        </span>
                        <ul class="list-disc pl-4 space-y-2 text-xs text-zinc-300">
                            <li><strong class="text-amber-200">Buộc Mỹ ký kết Hiệp định Paris (27/01/1973):</strong> Thất bại thảm hại của chiến dịch Linebacker II đè bẹp ý chí xâm lược của chính quyền Nixon, buộc Mỹ phải chấp nhận toàn bộ các điều khoản cốt lõi mà ta đề ra.</li>
                            <li><strong class="text-amber-200">Hoàn thành mục tiêu “Đánh cho Mỹ cút”:</strong> Thực hiện trọn vẹn lời căn dặn thiêng liêng của Bác Hồ, chấm dứt hoàn toàn sự hiện diện quân sự của Mỹ trên đất nước ta.</li>
                            <li><strong class="text-amber-200">Mở đường cho đại thắng mùa Xuân 1975:</strong> Tạo so sánh tương quan lực lượng hoàn toàn có lợi để quân dân ta tiến lên thực hiện mục tiêu <strong class="text-emerald-400">“Đánh cho Ngụy nhào”</strong>, giải phóng hoàn toàn miền Nam, thống nhất non sông.</li>
                        </ul>
                    </div>
                </div>
            `,
            'card5': `
                <div class="space-y-4">
                    <div class="p-3 bg-zinc-900/90 border border-amber-400/30 rounded-lg flex items-center justify-between flex-wrap gap-2">
                        <span class="font-mono text-xs text-amber-300 font-bold uppercase">
                            // SỔ TAY 5 ĐỊA CHỈ BẢO TÀNG &amp; DI TÍCH CHIẾN TÍCH B-52 THỰC TẾ TẠI HÀ NỘI
                        </span>
                        <span class="font-mono text-[11px] text-zinc-400">Tham Quan Thực Tế Ngoài Đời</span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <!-- Địa điểm 1 -->
                        <div class="p-3.5 rounded-lg bg-black/70 border border-emerald-500/30 space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="font-mono text-[11px] text-emerald-400 font-bold uppercase">[01] BẢO TÀNG CHIẾN THẮNG B-52</span>
                                <span class="text-[10px] font-mono text-zinc-400">BA ĐÌNH · HÀ NỘI</span>
                            </div>
                            <div class="text-xs text-zinc-300 leading-relaxed">
                                Nơi trưng bày xác máy bay B-52 khổng lồ bị bắn rơi và hệ thống sa bàn điện tử tái hiện sống động toàn cảnh 12 ngày đêm lịch sử.
                            </div>
                            <div class="text-[11px] font-mono text-zinc-400">Địa chỉ: Số 157 phố Đội Cấn, phường Đội Cấn, quận Ba Đình, Hà Nội.</div>
                            <div class="pt-1">
                                <a href="https://www.google.com/maps/search/?api=1&query=Bao+tang+Chien+thang+B52+157+Doi+Can+Ba+Dinh+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold uppercase">
                                    [CHỈ ĐƯỜNG GOOGLE MAPS ↗]
                                </a>
                            </div>
                        </div>

                        <!-- Địa điểm 2 -->
                        <div id="relic-huu-tiep" class="p-3.5 rounded-lg bg-black/70 border border-cyan-400/30 space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="font-mono text-[11px] text-cyan-300 font-bold uppercase">[02] XÁC MÁY BAY B-52 HỒ HỮU TIỆP</span>
                                <span class="text-[10px] font-mono text-zinc-400">LÀNG HOA NGỌC HÀ</span>
                            </div>
                            <div class="text-xs text-zinc-300 leading-relaxed">
                                Dấu tích sống động duy nhất trên thế giới: Xác pháo đài bay B-52 bị bắn hạ đêm 27/12/1972 vẫn nằm nguyên vẹn giữa lòng hồ nước trong khu dân cư.
                            </div>
                            <div class="text-[11px] font-mono text-zinc-400">Địa chỉ: Ngõ 55 phố Hoàng Hoa Thám, phường Ngọc Hà, quận Ba Đình, Hà Nội.</div>
                            <div class="pt-1">
                                <a href="https://www.google.com/maps/search/?api=1&query=Ho+Huu+Tiep+B52+Ngoc+Ha+Ba+Dinh+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-[11px] font-mono font-bold uppercase">
                                    [CHỈ ĐƯỜNG GOOGLE MAPS ↗]
                                </a>
                            </div>
                        </div>

                        <!-- Địa điểm 3 -->
                        <div class="p-3.5 rounded-lg bg-black/70 border border-amber-400/30 space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="font-mono text-[11px] text-amber-300 font-bold uppercase">[03] BẢO TÀNG PHÒNG KHÔNG – KHÔNG QUÂN</span>
                                <span class="text-[10px] font-mono text-zinc-400">THANH XUÂN · HÀ NỘI</span>
                            </div>
                            <div class="text-xs text-zinc-300 leading-relaxed">
                                Trưng bày khí tài anh hùng: Bệ phóng tên lửa SAM-2, đài radar P-35, pháo cao xạ 100mm và bộ sưu tập máy bay tiêm kích MiG-21, MiG-17.
                            </div>
                            <div class="text-[11px] font-mono text-zinc-400">Địa chỉ: Số 171 đường Trường Chinh, phường Khương Mai, quận Thanh Xuân, Hà Nội.</div>
                            <div class="pt-1">
                                <a href="https://www.google.com/maps/search/?api=1&query=Bao+tang+Phong+khong+Khong+quan+171+Truong+Chinh+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold uppercase">
                                    [CHỈ ĐƯỜNG GOOGLE MAPS ↗]
                                </a>
                            </div>
                        </div>

                        <!-- Địa điểm 4 -->
                        <div class="p-3.5 rounded-lg bg-black/70 border border-red-500/30 space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="font-mono text-[11px] text-red-400 font-bold uppercase">[04] ĐÀI TƯỞNG NIỆM KHÂM THIÊN</span>
                                <span class="text-[10px] font-mono text-zinc-400">ĐỐNG ĐA · HÀ NỘI</span>
                            </div>
                            <div class="text-xs text-zinc-300 leading-relaxed">
                                Khu tưởng niệm 287 đồng bào bị bom B-52 tàn sát đêm 26/12/1972, lưu giữ hố bom và tượng đài người mẹ bế con bất khuất.
                            </div>
                            <div class="text-[11px] font-mono text-zinc-400">Địa chỉ: Số 47 – 49 – 51 phố Khâm Thiên, phường Khâm Thiên, quận Đống Đa, Hà Nội.</div>
                            <div class="pt-1">
                                <a href="https://www.google.com/maps/search/?api=1&query=Dai+tuong+niem+Kham+Thien+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-mono font-bold uppercase">
                                    [CHỈ ĐƯỜNG GOOGLE MAPS ↗]
                                </a>
                            </div>
                        </div>

                        <!-- Địa điểm 5 -->
                        <div class="p-3.5 rounded-lg bg-black/70 border border-white/15 space-y-2 md:col-span-2">
                            <div class="flex items-center justify-between">
                                <span class="font-mono text-[11px] text-zinc-200 font-bold uppercase">[05] BẢO TÀNG LỊCH SỬ QUÂN SỰ VIỆT NAM (MỚI)</span>
                                <span class="text-[10px] font-mono text-zinc-400">ĐẠI LỘ THĂNG LONG</span>
                            </div>
                            <div class="text-xs text-zinc-300 leading-relaxed">
                                Lưu giữ 2 Bảo vật Quốc gia vô giá: Tiêm kích MiG-21MF số hiệu 5121 của Anh hùng Phạm Tuân và mảnh xác pháo đài bay B-52 đầu tiên rơi tại Phù Lỗ.
                            </div>
                            <div class="text-[11px] font-mono text-zinc-400">Địa chỉ: Đại lộ Thăng Long, phường Tây Mỗ, quận Nam Từ Liêm, TP. Hà Nội.</div>
                            <div class="pt-1">
                                <a href="https://www.google.com/maps/search/?api=1&query=Bao+tang+Lich+su+Quan+su+Viet+Nam+Dai+lo+Thang+Long" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/20 text-[11px] font-mono font-bold uppercase">
                                    [CHỈ ĐƯỜNG GOOGLE MAPS ↗]
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `            ,
            'card6': `
                <div class="space-y-4">
                    <div class="p-4 rounded-lg bg-black/70 border border-amber-400/40 space-y-3">
                        <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// NGUỒN THAM KHẢO &amp; GHI CHÚ NGUỒN</div>
                        <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed">Chỉ 3 nguồn chính thống nhất của Việt Nam, đủ bao quát các số liệu chính trong game. Số liệu phía Mỹ được ghi riêng trong các ghi chú, không chọn một chiều.</p>
                        <ul class="text-xs sm:text-sm text-zinc-300 space-y-2 list-disc pl-5">
                            <li>Đề cương tuyên truyền kỷ niệm 50 năm chiến thắng “Hà Nội – Điện Biên Phủ trên không” (Hội Cựu chiến binh tỉnh Khánh Hòa, trang .gov.vn) — tổng kết 81 máy bay: 34 B-52, 5 F-111A, 21 F-4CE, 4 A-6A, 12 A-7, 1 F-105D, 2 RA-5C, 1 HH-53, 1 UAV 147-SC; 663 lần chiếc B-52, 3.920 lần chiếc chiến thuật; riêng Hà Nội 441 lần chiếc B-52, 5.480 nhà sập, 2.368 dân chết, 1.355 bị thương; 7 giờ sáng 30/12/1972 Mỹ tuyên bố ngừng ném bom từ vĩ tuyến 20 trở ra. <a class="text-amber-300 underline" href="https://cuuchienbinh.khanhhoa.gov.vn/article/thong-bao/de-cuong-tuyen-truyen-ky-niem-50-nam-chien-thang-ha-noi-dien-bien-phu-tren-khong-121972-122022.html" target="_blank" rel="noopener">cuuchienbinh.khanhhoa.gov.vn</a></li>
                            <li>Tạp chí Quốc phòng toàn dân (Bộ Quốc phòng) — lời tiên đoán của Chủ tịch Hồ Chí Minh năm 1967 (“Sớm muộn rồi đế quốc Mỹ cũng sẽ đưa B-52 ra đánh Hà Nội, rồi có thua nó mới chịu thua”); Hà Nội 2.380 người chết, 1.355 bị thương; 81 máy bay, 34 B-52. <a class="text-amber-300 underline" href="https://tapchiqptd.vn/vi/an-pham-tap-chi-in/tu-chien-thang-dien-bien-phu-tren-khong-suy-nghi-ve-cong-tac-phong-khong-nhan-dan-bao-ve-t/3295.html" target="_blank" rel="noopener">tapchiqptd.vn</a></li>
                            <li>Bảo tàng Lịch sử Quốc gia — Phạm Tuân cất cánh 22h20 từ Yên Bái (đêm 27/12); Vũ Xuân Thiều cất cánh 21h40 từ Cẩm Thủy (đêm 28/12); đêm 26/12: 8 B-52; tổng kết 81/34. <a class="text-amber-300 underline" href="https://baotanglichsu.vn/vi/Articles/2001/68211/dje-dji-djen-tran-thang-b52-thang-12-nam-1972-cua-bo-djoi-ten-lua-viet-nam-phan-2-va-het.html" target="_blank" rel="noopener">baotanglichsu.vn</a></li>
                        </ul>
                        <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed"><b class="text-amber-300">Ghi chú các số liệu vênh nhau:</b> (1) Khâm Thiên: game ghi 287 theo bia tưởng niệm tại 51 Khâm Thiên; bảng thống kê chi tiết ghi 278 chết, 290 bị thương, 178 trẻ mồ côi. (2) B-52: phía Việt Nam 34; phía Mỹ ghi 15 bị bắn rơi, một số tổng kết ghi 16; tính cả hỏng nặng: 22–27. (3) 43 giặc lái là số quân dân Hà Nội bắt sống theo TTXVN (trưng bày 50 năm), không phải tổng toàn miền Bắc; phía Mỹ ghi 49 người bị bắt trong toàn chiến dịch. (4) Đêm 29/12: bản game ghi Tiểu đoàn 79 (Đa Phúc) bắn rơi B-52 thứ 34 lúc 23h29, rơi tại Phúc Yên; một bản tường thuật khác của phía Việt Nam ghi các tiểu đoàn 72, 78, 79 ở vòng ngoài bắn rơi 1 B-52 + 1 F-4 trong đợt 60 lần chiếc chia 30 Thái Nguyên–Trại Cau / 18 Đồng Mỏ / 12 Kim Anh; Wikipedia tiếng Việt ghi 54 lần chiếc chia 24/9/21; phía Mỹ không ghi nhận tổn thất đêm đó. (5) Đêm 28/12: phía Việt Nam ghi Vũ Xuân Thiều bắn rơi B-52 và hy sinh; phía Mỹ không ghi nhận B-52 mất đêm đó. (6) Các nhãn mô hình 3D và khí tài trong game vẫn ghi MiG-21bis theo thiết kế; về lịch sử, chiếc 5121 của Phạm Tuân là MiG-21MF. (7) Số B-52 rơi tại Hà Nội còn vênh nhau giữa các nguồn — game hiện không nêu con số này nên không sửa gì thêm. (8) Trước khi xuất bản chính thức nên đối chiếu thêm với sách của NXB Quân đội nhân dân và qdnd.vn. (9) Đêm 27/12: phía Việt Nam ghi Phạm Tuân (MiG-21MF 5121) bắn rơi B-52; phía Mỹ khẳng định không có B-52 nào bị MiG bắn rơi trong chiến tranh Việt Nam và quy cả 2 chiếc mất đêm đó cho SAM (phân tích sau chiến tranh cho rằng chiếc rơi tại chỗ trúng SAM của Tiểu đoàn 72).</p>
                    </div>
                </div>
            `            ,
            'card7': `
                <div class="space-y-4">
                    <div class="p-4 rounded-lg bg-black/70 border border-amber-400/40 space-y-3">
                        <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// TƯỞNG NIỆM — NHỮNG NGƯỜI ĐÃ NGÃ XUỐNG</div>
                        <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed">12 ngày đêm không chỉ là những con số chiến công. Đằng sau mỗi trận địa là những mái nhà, bệnh viện, trường học bị bom san phẳng và những người dân vô tội. Trang này dành cho họ.</p>
                    </div>
                    <div class="p-4 rounded-lg bg-black/70 border border-white/10 space-y-2">
                        <div class="font-mono text-[11px] text-amber-300 uppercase font-bold">PHỐ KHÂM THIÊN — ĐÊM 26/12/1972</div>
                        <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed">Đợt rải thảm tàn bạo nhất: bia tưởng niệm tại số nhà 51 Khâm Thiên ghi <b class="text-amber-300">287 đồng bào thiệt mạng</b>; bảng thống kê chi tiết ghi 278 người chết, 290 người bị thương, <b class="text-amber-300">178 trẻ mồ côi</b>. Ngôi nhà 51 Khâm Thiên — nơi 7 người trong một gia đình tử nạn — nay là đài tưởng niệm.</p>
                        <a href="https://www.google.com/maps/search/?api=1&query=Dai+tuong+niem+Kham+Thien+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">[BẢN ĐỒ GOOGLE MAPS ↗]</a>
                    </div>
                    <div class="p-4 rounded-lg bg-black/70 border border-white/10 space-y-2">
                        <div class="font-mono text-[11px] text-amber-300 uppercase font-bold">BỆNH VIỆN BẠCH MAI — ĐÊM 22/12/1972</div>
                        <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed">Bom B-52 đánh trúng bệnh viện tuyến cuối đang cứu chữa thương bệnh binh và dân thường: <b class="text-amber-300">28 cán bộ y tế hy sinh</b> trong ca trực (theo Liên hiệp các tổ chức hữu nghị Việt Nam). Tấm bia tưởng niệm trong khuôn viên bệnh viện vẫn ghi tên họ.</p>
                        <a href="https://www.google.com/maps/search/?api=1&query=Benh+vien+Bach+Mai+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">[BẢN ĐỒ GOOGLE MAPS ↗]</a>
                    </div>
                    <div class="p-4 rounded-lg bg-black/70 border border-white/10 space-y-2">
                        <div class="font-mono text-[11px] text-amber-300 uppercase font-bold">KHU LAO ĐỘNG AN DƯƠNG — ĐÊM 26/12/1972</div>
                        <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed">Cùng đêm với Khâm Thiên và Bạch Mai, khu lao động nghèo An Dương (nay thuộc quận Tây Hồ) cũng bị bom rải thảm. Thẻ đêm 26/12 có chỉ đường tới phố An Dương hôm nay.</p>
                        <a href="https://www.google.com/maps/search/?api=1&query=An+Duong+Tay+Ho+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">[BẢN ĐỒ GOOGLE MAPS ↗]</a>
                    </div>
                    <div class="p-4 rounded-lg bg-black/70 border border-amber-400/40 space-y-2">
                        <div class="font-mono text-[11px] text-amber-300 uppercase font-bold">CON SỐ CHUNG CỦA HÀ NỘI</div>
                        <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed">Cả chiến dịch: Hà Nội có <b class="text-amber-300">2.368 người chết, 1.355 người bị thương</b> (Đề cương tuyên truyền 50 năm, trang .gov.vn); Tạp chí Quốc phòng toàn dân ghi 2.380 người chết. Hơn 50 vạn đồng bào đã sơ tán khỏi thành phố trước và trong chiến dịch.</p>
                        <p class="text-xs sm:text-sm text-zinc-400 italic leading-relaxed">Chiến thắng này được gọi là “Điện Biên Phủ trên không” — không phải bằng bom đạn, mà bằng ý chí không chịu khuất phục của cả một thành phố.</p>
                    </div>
                </div>
            `            ,
            'card8': `
                <div class="space-y-4">
                    <div class="p-4 rounded-lg bg-black/70 border border-cyan-400/40 flex items-center justify-between flex-wrap gap-2">
                        <div class="font-mono text-[11px] text-cyan-300 uppercase font-bold tracking-wider">// TRẮC NGHIỆM — 7 CÂU VỀ 12 NGÀY ĐÊM</div>
                        <div class="flex items-center gap-2">
                            <span id="quiz-score" class="font-mono text-[11px] text-zinc-300">Điểm: 0/7 · Đã trả lời: 0/7</span>
                            <button onclick="quizReset()" class="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/15 text-[11px] font-mono">Chơi lại</button>
                        </div>
                    </div>
                    <div data-quiz-q="0" class="p-4 rounded-lg bg-black/70 border border-white/10 space-y-2">
                        <div class="font-mono text-[11px] text-cyan-300 uppercase font-bold">CÂU 1</div>
                        <div class="text-xs sm:text-sm text-zinc-100 font-semibold leading-relaxed">Chiếc B-52 đầu tiên bị bắn rơi lúc mấy giờ, đêm nào?</div>
                        <button onclick="quizAnswer(0,0,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">20h13, đêm 18/12</button>
                        <button onclick="quizAnswer(0,1,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">22h20, đêm 27/12</button>
                        <button onclick="quizAnswer(0,2,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">21h40, đêm 28/12</button>
                        <button onclick="quizAnswer(0,3,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">23h16, đêm 29/12</button>
                        <div class="quiz-expl hidden text-xs text-emerald-300 leading-relaxed bg-emerald-950/30 p-2 rounded border border-emerald-500/20">Tiểu đoàn 59 (Trung đoàn Tên lửa 261) phóng 2 quả SAM-2, hạ B-52G đầu tiên tại cánh đồng Chuôm, Phù Lỗ.</div>
                    </div>
                    <div data-quiz-q="1" class="p-4 rounded-lg bg-black/70 border border-white/10 space-y-2">
                        <div class="font-mono text-[11px] text-cyan-300 uppercase font-bold">CÂU 2</div>
                        <div class="text-xs sm:text-sm text-zinc-100 font-semibold leading-relaxed">Đêm nào phòng không ta bắn rơi nhiều B-52 nhất?</div>
                        <button onclick="quizAnswer(1,0,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">Đêm 18/12 (3 chiếc)</button>
                        <button onclick="quizAnswer(1,1,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">Đêm 20/12 (7 chiếc)</button>
                        <button onclick="quizAnswer(1,2,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">Đêm 26/12 (8 chiếc)</button>
                        <button onclick="quizAnswer(1,3,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">Đêm 29/12 (1 chiếc)</button>
                        <div class="quiz-expl hidden text-xs text-emerald-300 leading-relaxed bg-emerald-950/30 p-2 rounded border border-emerald-500/20">Hơn 1 giờ giao tranh đêm 26/12, lưới lửa ba thứ quân bắn rơi 8 B-52, trong đó 4 chiếc rơi tại chỗ.</div>
                    </div>
                    <div data-quiz-q="2" class="p-4 rounded-lg bg-black/70 border border-white/10 space-y-2">
                        <div class="font-mono text-[11px] text-cyan-300 uppercase font-bold">CÂU 3</div>
                        <div class="text-xs sm:text-sm text-zinc-100 font-semibold leading-relaxed">Anh hùng Phạm Tuân lái máy bay nào bắn rơi B-52 đêm 27/12?</div>
                        <button onclick="quizAnswer(2,0,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">MiG-21bis số hiệu 5121</button>
                        <button onclick="quizAnswer(2,1,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">MiG-21MF số hiệu 5121</button>
                        <button onclick="quizAnswer(2,2,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">MiG-21MF số hiệu 5046</button>
                        <button onclick="quizAnswer(2,3,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">F-4</button>
                        <div class="quiz-expl hidden text-xs text-emerald-300 leading-relaxed bg-emerald-950/30 p-2 rounded border border-emerald-500/20">Cất cánh từ Yên Bái lúc 22h20, bắn rơi B-52 trên vùng trời Mộc Châu (Sơn La). Lưu ý: nhãn mô hình trong game vẫn ghi “bis” theo thiết kế, nhưng chiếc 5121 lịch sử là MiG-21MF.</div>
                    </div>
                    <div data-quiz-q="3" class="p-4 rounded-lg bg-black/70 border border-white/10 space-y-2">
                        <div class="font-mono text-[11px] text-cyan-300 uppercase font-bold">CÂU 4</div>
                        <div class="text-xs sm:text-sm text-zinc-100 font-semibold leading-relaxed">Bia tưởng niệm phố Khâm Thiên ghi bao nhiêu đồng bào thiệt mạng đêm 26/12?</div>
                        <button onclick="quizAnswer(3,0,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">178 người</button>
                        <button onclick="quizAnswer(3,1,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">290 người</button>
                        <button onclick="quizAnswer(3,2,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">278 người</button>
                        <button onclick="quizAnswer(3,3,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">287 người</button>
                        <div class="quiz-expl hidden text-xs text-emerald-300 leading-relaxed bg-emerald-950/30 p-2 rounded border border-emerald-500/20">287 là số trên bia tại 51 Khâm Thiên; bảng thống kê chi tiết ghi 278 chết, 290 bị thương, 178 trẻ mồ côi.</div>
                    </div>
                    <div data-quiz-q="4" class="p-4 rounded-lg bg-black/70 border border-white/10 space-y-2">
                        <div class="font-mono text-[11px] text-cyan-300 uppercase font-bold">CÂU 5</div>
                        <div class="text-xs sm:text-sm text-zinc-100 font-semibold leading-relaxed">36 giờ ngừng ném bom dịp Giáng sinh, ta dùng để làm gì?</div>
                        <button onclick="quizAnswer(4,0,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">Sơ tán dân khỏi Hà Nội</button>
                        <button onclick="quizAnswer(4,1,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">Cơ động trận địa, lắp ráp đạn SAM-2</button>
                        <button onclick="quizAnswer(4,2,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">Đàm phán ở Paris</button>
                        <button onclick="quizAnswer(4,3,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">Nghỉ ngơi đón lễ</button>
                        <div class="quiz-expl hidden text-xs text-emerald-300 leading-relaxed bg-emerald-950/30 p-2 rounded border border-emerald-500/20">“36 giờ quý hơn vàng”: thần tốc lắp ráp đạn, cơ động trận địa, sẵn sàng cho đợt đánh lớn đêm 26/12.</div>
                    </div>
                    <div data-quiz-q="5" class="p-4 rounded-lg bg-black/70 border border-white/10 space-y-2">
                        <div class="font-mono text-[11px] text-cyan-300 uppercase font-bold">CÂU 6</div>
                        <div class="text-xs sm:text-sm text-zinc-100 font-semibold leading-relaxed">Tổng kết chiến dịch: ta bắn rơi bao nhiêu máy bay, trong đó bao nhiêu B-52?</div>
                        <button onclick="quizAnswer(5,0,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">81 máy bay, 34 B-52</button>
                        <button onclick="quizAnswer(5,1,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">81 máy bay, 15 B-52</button>
                        <button onclick="quizAnswer(5,2,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">34 máy bay, 5 F-111</button>
                        <button onclick="quizAnswer(5,3,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">129 máy bay, 90 B-52</button>
                        <div class="quiz-expl hidden text-xs text-emerald-300 leading-relaxed bg-emerald-950/30 p-2 rounded border border-emerald-500/20">Đầy đủ: 34 B-52, 5 F-111A, 21 F-4CE, 4 A-6A, 12 A-7, 1 F-105D, 2 RA-5C, 1 HH-53, 1 UAV 147-SC. (15 là số phía Mỹ thừa nhận.)</div>
                    </div>
                    <div data-quiz-q="6" class="p-4 rounded-lg bg-black/70 border border-white/10 space-y-2">
                        <div class="font-mono text-[11px] text-cyan-300 uppercase font-bold">CÂU 7</div>
                        <div class="text-xs sm:text-sm text-zinc-100 font-semibold leading-relaxed">Sau chiến dịch, Hiệp định Paris được ký ngày nào?</div>
                        <button onclick="quizAnswer(6,0,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">30/12/1972</button>
                        <button onclick="quizAnswer(6,1,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">8/1/1973</button>
                        <button onclick="quizAnswer(6,2,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">27/1/1973</button>
                        <button onclick="quizAnswer(6,3,this)" class="quiz-opt block w-full text-left p-2 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-xs text-zinc-200 transition-colors">29/12/1972</button>
                        <div class="quiz-expl hidden text-xs text-emerald-300 leading-relaxed bg-emerald-950/30 p-2 rounded border border-emerald-500/20">Mỹ ngừng ném bom từ vĩ tuyến 20 trở ra ngày 30/12/1972; đàm phán nối lại 8/1/1973; Hiệp định ký ngày 27/1/1973.</div>
                    </div>
                </div>
            `
        };

        let archivePausedGame = false;
        function toggleCampaignArchive(open) {
            const screen = document.getElementById('screen-archive');
            const isOpen = screen && screen.classList.contains('is-open');
            const target = open !== undefined ? open : !isOpen;
            if (target) {
                if (typeof gameState !== 'undefined' && gameState === 'PLAYING' && !gamePaused) {
                    gamePaused = true;
                    archivePausedGame = true;
                }
                showScreen('archive');
            } else {
                if (archivePausedGame) {
                    gamePaused = false;
                    archivePausedGame = false;
                    showScreen(null);
                } else {
                    showScreen('menu');
                }
            }
        }

        function renderArchiveTab(tabKey) {
            ['card1', 'card2', 'card3', 'card4', 'card5', 'card6', 'card7', 'card8'].forEach(k => {
                const btn = document.getElementById(`tab-btn-${k}`);
                if (btn) {
                    const isActive = (k === tabKey);
                    btn.classList.toggle('border-emerald-500/60', isActive);
                    btn.classList.toggle('bg-emerald-500/20', isActive);
                    btn.classList.toggle('text-emerald-300', isActive);
                    btn.classList.toggle('border-white/10', !isActive);
                    btn.classList.toggle('bg-black/40', !isActive);
                    btn.classList.toggle('text-zinc-400', !isActive);
                }
            });
            const contentArea = document.getElementById('archive-content-area');
            if (contentArea && CAMPAIGN_ARCHIVE_CARDS[tabKey]) {
                contentArea.innerHTML = CAMPAIGN_ARCHIVE_CARDS[tabKey];
                contentArea.scrollTop = 0;
                initArchiveCards();
            }
        }


        function normVi(s) {
            return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
        }
        function initArchiveCards() {
            const area = document.getElementById('archive-content-area');
            if (!area) return;
            area.querySelectorAll('[id^="night-node-"]').forEach(card => {
                if (card.dataset.collapseInit) return;
                card.dataset.collapseInit = '1';
                const header = card.children[0];
                if (!header) return;
                const body = document.createElement('div');
                body.className = 'night-body';
                while (card.children.length > 1) body.appendChild(card.children[1]);
                card.appendChild(body);
                body.style.display = 'none';
                const chev = document.createElement('span');
                chev.className = 'night-chev font-mono text-emerald-300 text-xs';
                chev.textContent = ' ▼';
                header.appendChild(chev);
                header.style.cursor = 'pointer';
                header.title = 'Bấm để mở / thu gọn';
                header.addEventListener('click', () => toggleNight(card.id));
            });
            area.querySelectorAll('button[onclick*="night-node-"]').forEach(btn => {
                const m = (btn.getAttribute('onclick') || '').match(/night-node-\d+/);
                if (!m) return;
                btn.onclick = () => {
                    const inp = document.getElementById('archive-search');
                    if (inp) inp.value = '';
                    filterArchive('');
                    expandNight(m[0]);
                    const el = document.getElementById(m[0]);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                };
            });
            const inp = document.getElementById('archive-search');
            if (inp && inp.value) filterArchive(inp.value);
            updateArchiveCount();
        }
        function toggleNight(id) {
            const card = document.getElementById(id);
            if (!card) return;
            const body = card.querySelector('.night-body');
            const chev = card.querySelector('.night-chev');
            if (!body) return;
            const open = body.style.display === 'none';
            body.style.display = open ? '' : 'none';
            if (chev) chev.textContent = open ? ' ▲' : ' ▼';
        }
        function expandNight(id) {
            const card = document.getElementById(id);
            if (!card) return;
            const body = card.querySelector('.night-body');
            const chev = card.querySelector('.night-chev');
            if (body) body.style.display = '';
            if (chev) chev.textContent = ' ▲';
        }
        function setAllNights(open) {
            document.querySelectorAll('#archive-content-area [id^="night-node-"]').forEach(card => {
                const body = card.querySelector('.night-body');
                const chev = card.querySelector('.night-chev');
                if (body) body.style.display = open ? '' : 'none';
                if (chev) chev.textContent = open ? ' ▲' : ' ▼';
            });
        }
        function filterArchive(q) {
            const query = normVi(q).trim();
            const cards = document.querySelectorAll('#archive-content-area [id^="night-node-"]');
            let shown = 0;
            cards.forEach(card => {
                const match = !query || normVi(card.textContent).includes(query);
                card.style.display = match ? '' : 'none';
                if (match) {
                    shown++;
                    if (query) expandNight(card.id);
                }
            });
            updateArchiveCount(shown, cards.length);
        }
        function updateArchiveCount(shown, total) {
            const el = document.getElementById('archive-search-count');
            if (!el) return;
            const cards = document.querySelectorAll('#archive-content-area [id^="night-node-"]');
            if (!cards.length) { el.textContent = 'Tìm áp dụng cho thẻ 12 đêm'; return; }
            const s = (shown === undefined) ? cards.length : shown;
            const t = (total === undefined) ? cards.length : total;
            el.textContent = s + '/' + t + ' đêm';
        }

        const QUIZ_ANSWERS = [0, 2, 1, 3, 1, 0, 2];
        function quizAnswer(q, o, el) {
            const box = el ? el.closest('[data-quiz-q]') : null;
            if (!box || box.dataset.done) return;
            box.dataset.done = '1';
            const correct = QUIZ_ANSWERS[q];
            box.dataset.correct = (o === correct) ? '1' : '0';
            box.querySelectorAll('.quiz-opt').forEach((b, j) => {
                b.disabled = true;
                b.classList.remove('hover:border-emerald-400');
                if (j === correct) b.classList.add('bg-emerald-500/20', 'border-emerald-400', 'text-emerald-200');
                else if (b === el) b.classList.add('bg-red-500/20', 'border-red-400', 'text-red-200');
            });
            const expl = box.querySelector('.quiz-expl');
            if (expl) expl.classList.remove('hidden');
            const boxes = document.querySelectorAll('#archive-content-area [data-quiz-q]');
            let done = 0, score = 0;
            boxes.forEach(b => { if (b.dataset.done) { done++; if (b.dataset.correct === '1') score++; } });
            const sc = document.getElementById('quiz-score');
            if (sc) sc.textContent = 'Điểm: ' + score + '/7 · Đã trả lời: ' + done + '/7';
        }
        function quizReset() {
            document.querySelectorAll('#archive-content-area [data-quiz-q]').forEach(box => {
                delete box.dataset.done;
                delete box.dataset.correct;
                box.querySelectorAll('.quiz-opt').forEach(b => {
                    b.disabled = false;
                    b.classList.remove('bg-emerald-500/20', 'border-emerald-400', 'text-emerald-200', 'bg-red-500/20', 'border-red-400', 'text-red-200');
                    b.classList.add('hover:border-emerald-400');
                });
                const expl = box.querySelector('.quiz-expl');
                if (expl) expl.classList.add('hidden');
            });
            const sc = document.getElementById('quiz-score');
            if (sc) sc.textContent = 'Điểm: 0/7 · Đã trả lời: 0/7';
        }
        window.quizAnswer = quizAnswer;
        window.quizReset = quizReset;
        window.filterArchive = filterArchive;
        window.setAllNights = setAllNights;
        window.expandNight = expandNight;
        window.toggleNight = toggleNight;

        function copyCampaignSummary() {
            const text = `TÓM TẮT CHIẾN DỊCH: HÀ NỘI 12 NGÀY ĐÊM (18/12 – 29/12/1972) — KỲ TÍCH ĐIỆN BIÊN PHỦ TRÊN KHÔNG
1. BỐI CẢNH LỊCH SỬ & TẦM NHÌN DỰ BÁO CHIẾN LƯỢC:
- Sau bế tắc trên bàn đàm phán Paris cuối năm 1972, Mỹ phát động chiến dịch tập kích đường không chiến lược hủy diệt Linebacker II bằng pháo đài bay B-52 nhằm hủy diệt Hà Nội, Hải Phòng để ép ta ký hiệp định theo điều kiện của Mỹ.
- Lời tiên tri thiên tài của Bác Hồ (12/1967): "Ở Việt Nam, Mỹ nhất định thua, nhưng nó chỉ chịu thua sau khi thua trên bầu trời Hà Nội". Quân dân ta đã sớm chuẩn bị cuốn "Cẩm nang bìa đỏ" và sơ tán hơn 50 vạn đồng bào.

2. BIÊN NIÊN CHIẾN CÔNG 12 NGÀY ĐÊM:
- Đêm 18/12: Tiểu đoàn 59 bắn rơi tại chỗ chiếc B-52 đầu tiên tại Phù Lỗ (Đông Anh); hạ 3 B-52 trong đêm đầu.
- Đêm 19/12: Bảo vệ Đài phát thanh Mễ Trì; bắn rơi 2 B-52.
- Đêm 20/12: Kỷ lục tiêu diệt 7 pháo đài bay B-52 chỉ trong một đêm (5 chiếc rơi tại chỗ).
- Đêm 21/12: Vạch nhiễu tìm thù trên màn hiện sóng, bắn rơi 3 B-52.
- Đêm 22/12: Mỹ ném bom Bệnh viện Bạch Mai; ta bắn rơi 3 B-52 và 1 máy bay cánh cụp cánh xòe F-111.
- Đêm 23/12: Bắn rơi 2 B-52, bảo vệ huyết mạch giao thông phía Nam.
- Đêm 24/12: Hạ 2 B-52; buộc Mỹ phải tuyên bố tạm ngừng ném bom 36 giờ dịp Giáng sinh.
- Ngày 25-26/12: 36 giờ quý hơn vàng cơ động trận địa, thần tốc lắp ráp đạn tên lửa SAM-2.
- Đêm 26/12: Đợt tập kích lớn nhất (105 B-52) hủy diệt phố Khâm Thiên; lưới lửa ba thứ quân bắn rơi 8 chiếc B-52 trong hơn 1 giờ.
- Đêm 27/12: Anh hùng Phạm Tuân lái MiG-21 bắn rơi B-52 tại Mộc Châu; Tiểu đoàn 72 bắn rơi B-52 xuống hồ Hữu Tiệp (Ngọc Hà).
- Đêm 28/12: Anh hùng Vũ Xuân Thiều lái MiG-21 quả cảm cảm tử lao thẳng vào B-52 tiêu diệt địch tại Sơn La.
- Đêm 29/12: Tiểu đoàn 79 bắn rơi chiếc B-52 thứ 34; buộc Mỹ tuyên bố ngừng ném bom hoàn toàn.

3. TỔNG KẾT CHIẾN CÔNG & Ý NGHĨA THỜI ĐẠI:
- Bắn rơi 81 máy bay Mỹ các loại (gồm 34 siêu pháo đài bay B-52 và 5 chiếc F-111).
- Buộc Mỹ phải ký Hiệp định Paris (27/01/1973), rút toàn bộ quân viễn chinh về nước ("Đánh cho Mỹ cút"), tạo tiền đề quyết định giải phóng hoàn toàn miền Nam mùa Xuân 1975 ("Đánh cho Ngụy nhào").`;

            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                const toast = document.getElementById('copy-toast');
                if (toast) {
                    toast.textContent = '✓ Đã sao chép toàn bộ bản tóm tắt chiến dịch vào bộ nhớ tạm!';
                    toast.classList.add('text-emerald');
                    setTimeout(() => {
                        toast.textContent = 'Nguồn: Đề cương .gov.vn · Tạp chí Quốc phòng toàn dân · Bảo tàng Lịch sử Quốc gia';
                    }, 3500);
                }
            } catch (e) {}
            document.body.removeChild(ta);
        }

