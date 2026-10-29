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
                        if (Math.random() < 0.04 && typeof SoundFX !== 'undefined' && SoundFX.secondaryBoom) {
                            SoundFX.secondaryBoom(p);
                        }
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
            const btnJpQ = document.getElementById('jp-q');
            const btnJpE = document.getElementById('jp-e');
            if (btnJpQ) {
                btnJpQ.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof hopFrequency === 'function') hopFrequency(-45);
                });
            }
            if (btnJpE) {
                btnJpE.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof hopFrequency === 'function') hopFrequency(45);
                });
            }

            window.addEventListener('keydown', e => {
                keysDown[e.code] = true;
                const archiveScreen = document.getElementById('screen-archive');
                const archiveDrawer = document.getElementById('archive-drawer');
                const archiveOpen = !!(
                    (archiveScreen && archiveScreen.classList.contains('is-open')) ||
                    (archiveDrawer && !archiveDrawer.classList.contains('hidden') && !archiveDrawer.classList.contains('translate-x-full'))
                );
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
                    if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R') {
                        restartMission();
                    } else if (e.code === 'Enter' || e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
                        e.preventDefault();
                        if (missionWon) {
                            if (activeMissionIdx < MISSIONS.length - 1) openBriefing(activeMissionIdx + 1);
                            else showVictoryEpilogue();
                        } else {
                            restartMission();
                        }
                    } else if (e.code === 'KeyM' || e.key === 'm' || e.key === 'M') {
                        backToMenuAttract();
                        showScreen('campaign');
                    } else if (e.code === 'Escape') {
                        backToMenuAttract();
                        showScreen('menu');
                    }
                } else if (gameState !== 'PLAYING' || gamePaused || archiveOpen || guideOpen || radioLogOpen) {
                    return;
                } else if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    if (!e.repeat) triggerPrimaryWeaponFire();
                } else if ((e.code === 'KeyF' || e.code === 'KeyC') && currentMode === 'MIG21') {
                    e.preventDefault();
                    fireMiGCannon();
                } else if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R') {
                    e.preventDefault();
                    startReload();
                } else if (currentMode === 'SAM2' && (e.code === 'KeyQ' || e.key === 'q' || e.key === 'Q' || e.code === 'KeyE' || e.key === 'e' || e.key === 'E')) {
                    e.preventDefault();
                    const isDown = (e.code === 'KeyQ' || e.key === 'q' || e.key === 'Q');
                    if (typeof hopFrequency === 'function') hopFrequency(isDown ? -45 : 45);
                }
            });
        }

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            if (composer) composer.setSize(window.innerWidth, window.innerHeight);
        }

        const ARCHIVE_NIGHTS_HTML = `<div class="space-y-4">

                        <!-- ĐÊM 1 -->
                        <div id="night-node-1" class="p-4 rounded-lg bg-black/70 border border-amber-400/40 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-amber-400/20 pb-2">
                                <div class="flex items-center gap-2">
                                    <span class="font-mono text-xs font-bold text-amber-400">ĐÊM 1 // 18.12.1972 · ĐÒN PHỦ ĐẦU TẠI PHÙ LỖ</span>
                                </div>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40">HẠ 3 B-52 (2 RƠI TẠI CHỖ)</span>
                            </div>
                            <div class="space-y-4">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> 90 lần chiếc B-52 (phía Mỹ ghi 129 lần chiếc) cùng 135 máy bay chiến thuật ném bom dồn dập vào Đông Anh, Gia Lâm, Yên Viên và đài phát thanh Mễ Trì.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Lúc <strong>20 giờ 13 phút</strong>, kíp chiến đấu <strong>Tiểu đoàn 59 (Trung đoàn Tên lửa 261)</strong> dưới sự chỉ huy của Tiểu đoàn trưởng Nguyễn Văn Phiệt đã phóng 2 quả tên lửa SAM-2, bắn rơi tại chỗ chiếc B-52G đầu tiên trên cánh đồng Chuôm (xã Phù Lỗ, Đông Anh cũ). Cả đêm ta bắn rơi 3 B-52.</div>
                                    <div class="text-amber-300 font-mono italic text-[11px] bg-amber-950/20 p-2 rounded border border-amber-400/20">“Báo cáo Sở chỉ huy: Tiểu đoàn 59 đã bắn rơi B-52 đầu tiên! Pháo đài bay cháy đỏ rực bầu trời phía Bắc!”</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Tượng đài Chiến thắng B-52 Phù Lỗ</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Ngã ba Phù Lỗ, Quốc lộ 2, xã Phù Lỗ, huyện Sóc Sơn, TP. Hà Nội.</div>
                                    <div class="text-zinc-400 text-[11px]">Hiện vật: Xác chiếc B-52 đầu tiên được trục vớt, trưng bày tại Bảo tàng Lịch sử Quân sự Việt Nam.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Tuong+dai+Chien+thang+B52+Phu+Lo+Soc+Son+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                    <div class="pt-2 mt-1 border-t border-white/10 space-y-2">
                                        <div class="text-zinc-200 font-semibold">Trận địa Cổ Loa – Tráng Việt (Tiểu đoàn 59)</div>
                                        <div class="text-zinc-400 text-[11px]">Vị trí: Xã Cổ Loa, huyện Đông Anh &amp; xã Tráng Việt, huyện Mê Linh, TP. Hà Nội.</div>
                                        <div class="text-zinc-400 text-[11px]">Nơi Tiểu đoàn 59 phóng 2 quả đạn hạ chiếc B-52 đầu tiên đêm 18/12; xác máy bay rơi tại cánh đồng Phù Lỗ.</div>
                                        <div class="pt-1 flex flex-wrap gap-1.5">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Co+Loa+Dong+Anh+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
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
                                <span class="font-mono text-xs font-bold text-amber-400">ĐÊM 2 // 19.12.1972 · LƯỚI LỬA TẦM THẤP &amp; TIẾNG NÓI VIỆT NAM</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15">HẠ 2 B-52</span>
                            </div>
                            <div class="space-y-4">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> 93 lần chiếc B-52 (theo phía Mỹ) dội bom Đài phát thanh Mễ Trì, Ga Hàng Cỏ, các khu dân cư An Dương, Gia Lâm nhằm bẻ gãy hệ thống truyền thông quốc gia.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Địch bay thấp dọc triền sông Hồng để luồn tránh radar. <strong>Tiểu đoàn 77 (Trung đoàn 257)</strong> tại trận địa Chèm áp dụng phương pháp bắn đón nửa góc, bắn rơi 1 B-52; Đài Mễ Trì bị đánh sập nhưng chỉ gián đoạn phát sóng 9 phút rồi tiếp tục phát đi từ trạm dự phòng.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Trận địa tên lửa Chèm &amp; Đài Tiếng nói Việt Nam Mễ Trì</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Đình Chèm, phường Thụy Phương, quận Bắc Từ Liêm &amp; Khu vực Mễ Trì, Nam Từ Liêm, Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Dinh+Chem+Thuy+Phuong+Bac+Tu+Liem+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
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
                            <div class="space-y-4">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> Mỹ tung 99 lần chiếc B-52 (theo phía Mỹ) ném bom hủy diệt trung tâm đầu mối giao thông Yên Viên, Cầu Đuống, kho xăng Đức Giang và khu dân cư Gia Lâm.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Vận dụng xuất sắc “Cẩm nang bìa đỏ”, các <strong>Tiểu đoàn 57, 77, 79, 93</strong> đan lưới lửa SAM-2 tiêu diệt kỷ lục <strong>7 pháo đài bay B-52 trong 1 đêm</strong> (5 chiếc rơi tại chỗ). Đêm đánh xuất thần bẻ gãy đợt tập kích thứ nhất của Mỹ.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Ga Yên Viên &amp; Di tích Cầu Đuống</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Thị trấn Yên Viên, huyện Gia Lâm, TP. Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Ga+Yen+Vien+Gia+Lam+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 4 -->
                        <div id="night-node-4" class="p-4 rounded-lg bg-black/70 border border-white/15 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2">
                                <span class="font-mono text-xs font-bold text-amber-400">ĐÊM 4 // 21.12.1972 · VẠCH NHIỄU TÌM THÙ GIỮA BÃO ĐIỆN TỬ</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15">HẠ 3 B-52</span>
                            </div>
                            <div class="space-y-4">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> Không quân Mỹ tăng cường độ phát nhiễu cực đại và phóng hàng chục quả tên lửa Shrike vào các trận địa radar đài phát sóng của ta.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Các trắc thủ linh hoạt nhảy tần số, sử dụng phương pháp 3 điểm (T/T), phát hiện dải nhiễu bản chất của B-52 và bắn rơi 3 chiếc tại khu vực Phúc Yên, Thanh Trì.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Trận địa Tên lửa An Khánh</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Xã An Khánh, huyện Hoài Đức, TP. Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=An+Khanh+Hoai+Duc+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 5 -->
                        <div id="night-node-5" class="p-4 rounded-lg bg-black/70 border border-amber-400/40 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-amber-400/40 pb-2">
                                <span class="font-mono text-xs font-bold text-amber-400">ĐÊM 5 // 22.12.1972 · TỘI ÁC BẠCH MAI &amp; LỜI TUYÊN THỆ TRẢ THÙ</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40">HẠ 3 B-52 · 1 F-111</span>
                            </div>
                            <div class="space-y-4">
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
                                        <a href="https://www.google.com/maps/search/?api=1&query=Benh+vien+Bach+Mai+78+Giai+Phong+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 6 -->
                        <div id="night-node-6" class="p-4 rounded-lg bg-black/70 border border-white/15 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2">
                                <span class="font-mono text-xs font-bold text-amber-400">ĐÊM 6 // 23.12.1972 · CHẶN ĐỨNG ĐÒN CHIA CẮT HUYẾT MẠCH PHÍA NAM</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15">HẠ 2 B-52</span>
                            </div>
                            <div class="space-y-4">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> 30 lần chiếc B-52 (theo phía Mỹ) tập trung oanh tạc các ga hàng hóa phía Nam: Giáp Bát, Văn Điển, Thường Tín nhằm cắt đứt nguồn vận chuyển lương thực, đạn dược chi viện.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Các trận địa SAM-2 bố trí vòng ngoài phối hợp cao xạ bảo vệ ga tàu, bắn rơi 2 B-52, giữ vững mạch máu tiếp tế cho Thủ đô.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Khu vực Ga Giáp Bát &amp; Văn Điển</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Đường Giải Phóng, phường Thịnh Liệt, quận Hoàng Mai, Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Ga+Giap+Bat+Hoang+Mai+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 7 -->
                        <div id="night-node-7" class="p-4 rounded-lg bg-black/70 border border-white/15 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2">
                                <span class="font-mono text-xs font-bold text-amber-400">ĐÊM 7 // 24.12.1972 · TRẬN ĐÁNH ÁP CHÓT TRƯỚC GIÁNG SINH</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15">HẠ 2 B-52</span>
                            </div>
                            <div class="space-y-4">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> Địch oanh tạc ga Kép, Yên Viên và Thái Nguyên nhằm cô lập các cứ điểm phòng không vòng ngoài.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Lực lượng phòng không Hà Nội và Hải Phòng bắn rơi 2 B-52. Tổn thất tăng vọt buộc Nixon phải ra lệnh tạm ngừng ném bom 36 giờ từ nửa đêm 24/12 nhân dịp Noel để củng cố tinh thần phi công Mỹ đang hoang mang tột độ.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Trận địa Phòng không Đan Phượng</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Thị trấn Phùng, huyện Đan Phượng, TP. Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Thi+tran+Phung+Dan+Phuong+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- NGÀY 8 -->
                        <div id="night-node-8" class="p-4 rounded-lg bg-black/70 border border-white/15 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2">
                                <span class="font-mono text-xs font-bold text-amber-400">NGÀY 8 // 25.12.1972 · 36 GIỜ QUÝ HƠN VÀNG: THẦN TỐC LẮP RÁP ĐẠN TÊN LỬA</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15">CƠ ĐỘNG KHÍ TÀI</span>
                            </div>
                            <div class="space-y-4">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[TÌNH HUỐNG CHIẾN DỊCH]</strong> 36 giờ địch tạm ngừng ném bom là cơ hội vàng có một không hai. Lượng đạn SAM-2 tại Hà Nội sau 7 ngày chiến đấu đã cạn kiệt đến mức báo động.</div>
                                    <div><strong class="text-alabaster font-mono">[HÀNH ĐỘNG CỦA TA]</strong> Cục Kỹ thuật Quân chủng PK-KQ, các xưởng quân giới làm việc liên tục 24/24 giờ để kiểm định, nạp nhiên liệu và lắp ráp tên lửa; đoàn xe vận tải cơ động thần tốc kéo đạn tên lửa từ Quân khu 4 ra bổ sung kịp thời cho các bệ phóng bảo vệ Thủ đô.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Nhà máy A31 &amp; Nhà máy Z119 (Cục Kỹ thuật PK-KQ)</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Huyện Chương Mỹ &amp; Đường Trường Chinh, quận Thanh Xuân, Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Nha+may+A31+Cuc+Ky+thuat+Phong+khong+Khong+quan" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 9 -->
                        <div id="night-node-9" class="p-4 rounded-lg bg-black/70 border border-amber-400/40 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-amber-400/40 pb-2">
                                <span class="font-mono text-xs font-bold text-amber-400">ĐÊM 9 // 26.12.1972 · KHÂM THIÊN CĂM HỜN: TRẬN QUYẾT CHIẾN ĐÁNH QUỴ B-52</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40">HẠ 8 B-52 (4 RƠI TẠI CHỖ)</span>
                            </div>
                            <div class="space-y-4">
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
                                        <a href="https://www.google.com/maps/search/?api=1&query=Dai+tuong+niem+Kham+Thien+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                    <div class="pt-2 mt-1 border-t border-white/10 space-y-2">
                                        <div class="text-zinc-200 font-semibold">Khu lao động An Dương</div>
                                        <div class="text-zinc-400 text-[11px]">Vị trí: Phố An Dương, quận Tây Hồ, TP. Hà Nội.</div>
                                        <div class="text-zinc-400 text-[11px]">Cùng đêm 26/12, khu lao động An Dương cũng bị bom B-52 rải thảm cùng lúc với Khâm Thiên và Bạch Mai.</div>
                                        <div class="pt-1 flex flex-wrap gap-1.5">
                                        <a href="https://www.google.com/maps/search/?api=1&query=An+Duong+Tay+Ho+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 10 -->
                        <div id="night-node-10" class="p-4 rounded-lg bg-black/70 border border-amber-400/40 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-amber-400/20 pb-2">
                                <span class="font-mono text-xs font-bold text-amber-400">ĐÊM 10 // 27.12.1972 · KỲ TÍCH PHẠM TUÂN &amp; B-52 RƠI HỒ HỮU TIỆP</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40">HẠ 1 B-52 BẰNG MIG-21 · 1 RƠI HỒ HỮU TIỆP</span>
                            </div>
                            <div class="space-y-4">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> 60 lần chiếc B-52 (theo phía Mỹ) tiếp tục ném bom rải thảm khu vực Đông Anh, Yên Viên và ngoại vi Thủ đô.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> 22h20, Anh hùng <strong>Phạm Tuân</strong> điều khiển tiêm kích MiG-21MF (số hiệu 5121) xuất kích từ sân bay dã chiến Yên Bái, bay luồn dưới trần mây, bất ngờ vút lên tiếp cận tốp B-52 ở cự ly 4 km và phóng 2 quả tên lửa K-13 bắn hạ B-52 trên bầu trời Mộc Châu. Đêm đó, <strong>Tiểu đoàn tên lửa 72</strong> cũng lập công bắn rơi 1 B-52 cắm xác xuống hồ Hữu Tiệp.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Di tích Xác máy bay B-52 Hồ Hữu Tiệp</div>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/B52_wreckage%2C_H%E1%BB%AFu_Ti%E1%BB%87p_Lake%2C_Hanoi.jpg/500px-B52_wreckage%2C_H%E1%BB%AFu_Ti%E1%BB%87p_Lake%2C_Hanoi.jpg?_=20230712062215" alt="Xác máy bay B-52 trong hồ Hữu Tiệp" loading="lazy" onerror="this.style.display='none'" class="w-full h-36 object-cover rounded border border-white/10">
                                    <div class="text-zinc-400 text-[11px]">Ảnh: Xác B-52 trong hồ Hữu Tiệp. Nguồn: Wikimedia Commons.</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Ngõ 55 phố Hoàng Hoa Thám, làng hoa Ngọc Hà, quận Ba Đình, TP. Hà Nội.</div>
                                    <div class="text-zinc-400 text-[11px]">Hiện vật: Xác máy bay B-52 còn nguyên phần đuôi và động cơ nằm giữa lòng hồ nước giữa lòng Thủ đô.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Ho+Huu+Tiep+B52+Ngoc+Ha+Ba+Dinh+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                    <div class="pt-2 mt-1 border-t border-white/10 space-y-2">
                                        <div class="text-zinc-200 font-semibold">Vùng trời Yên Bái</div>
                                        <div class="text-zinc-400 text-[11px]">Vị trí: TP. Yên Bái, tỉnh Yên Bái.</div>
                                        <div class="text-zinc-400 text-[11px]">Nơi Phạm Tuân xuất kích đêm 27/12, bắn rơi B-52 rồi hạ cánh an toàn.</div>
                                        <div class="pt-1 flex flex-wrap gap-1.5">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Yen+Bai" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 11 -->
                        <div id="night-node-11" class="p-4 rounded-lg bg-black/70 border border-amber-400/40 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-amber-400/20 pb-2">
                                <span class="font-mono text-xs font-bold text-amber-400">ĐÊM 11 // 28.12.1972 · QUẢ TÊN LỬA THỨ BA: ANH HÙNG VŨ XUÂN THIỀU</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40">HẠ 1 B-52 (CẢM TỬ)</span>
                            </div>
                            <div class="space-y-4">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> Địch huy động B-52 đánh phá vòng ngoài hướng Tây Bắc.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Phi công <strong>Vũ Xuân Thiều</strong> lái tiêm kích MiG-21 (số hiệu 046) xuất kích từ sân bay Cẩm Thủy (Thanh Hóa), vượt qua màn nhiễu tiếp cận B-52 trên bầu trời Yên Châu (Sơn La). Sau khi phóng 2 tên lửa K-13 ở cự ly quá gần, anh đã quả cảm lao thẳng chiếc MiG-21 vào thân pháo đài bay địch, cùng chiếc B-52 nổ tung giữa bầu trời Tổ quốc.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Tượng đài &amp; Nhà lưu niệm Anh hùng Vũ Xuân Thiều</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Phố Vũ Xuân Thiều, phường Sài Đồng, quận Long Biên, TP. Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Tuong+dai+Liet+si+Vu+Xuan+Thieu+Sai+Dong+Long+Bien" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                    <div class="pt-2 mt-1 border-t border-white/10 space-y-2">
                                        <div class="text-zinc-200 font-semibold">Vùng trời Yên Châu, Sơn La</div>
                                        <div class="text-zinc-400 text-[11px]">Vị trí: Huyện Yên Châu, tỉnh Sơn La.</div>
                                        <div class="text-zinc-400 text-[11px]">Nơi Vũ Xuân Thiều hy sinh sau khi bắn cháy B-52 đêm 28/12 (xác B-52 và MiG-21 rơi tại xã Tạ Khoa); ban đầu an táng tại Sơn La, sau đưa về nghĩa trang Văn Điển, Hà Nội.</div>
                                        <div class="pt-1 flex flex-wrap gap-1.5">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Yen+Chau+Son+La" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐÊM 12 -->
                        <div id="night-node-12" class="p-4 rounded-lg bg-black/70 border border-amber-400/40 space-y-3">
                            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-amber-400/40 pb-2">
                                <span class="font-mono text-xs font-bold text-amber-400">ĐÊM 12 // 29.12.1972 · TRẬN ĐÁNH CUỐI CÙNG: KHÚC KHẢI HOÀN TOÀN THẮNG</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40">HẠ 2 B-52 · THẮNG LỢI TRỌN VẸN</span>
                            </div>
                            <div class="space-y-4">
                                <div class="lg:col-span-7 space-y-2 text-zinc-300 leading-relaxed">
                                    <div><strong class="text-alabaster font-mono">[LỰC LƯỢNG ĐỊCH]</strong> Đợt oanh tạc tuyệt vọng của Mỹ vào các trận địa phòng không và kho tàng xung quanh Hà Nội, Thái Nguyên.</div>
                                    <div><strong class="text-alabaster font-mono">[DIỄN BIẾN TÁC CHIẾN]</strong> Lúc 23h29, <strong>Tiểu đoàn 79 (Trung đoàn 257)</strong> tại trận địa Đa Phúc phóng 2 quả đạn, bắn rơi tại chỗ chiếc B-52 thứ 34 của chiến dịch, rơi tại Phúc Yên. Đây là chiếc pháo đài bay cuối cùng bị tiêu diệt trong 12 ngày đêm. Thất bại thảm hại buộc Nhà Trắng phải đầu hàng trên bầu trời Hà Nội.</div>
                                </div>
                                <div class="lg:col-span-5 p-3 rounded bg-zinc-900/80 border border-white/10 space-y-2">
                                    <div class="font-mono text-[11px] text-amber-300 uppercase font-bold tracking-wider">// ĐỊA DANH HÔM NAY &amp; DI TÍCH:</div>
                                    <div class="text-zinc-200 font-semibold">Bảo tàng Chiến thắng B-52 &amp; Bảo tàng PK-KQ</div>
                                    <div class="text-zinc-400 text-[11px]">Vị trí: Số 157 Đội Cấn, Ba Đình &amp; Số 171 Trường Chinh, Thanh Xuân, Hà Nội.</div>
                                    <div class="pt-1">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Bao+tang+Chien+thang+B52+157+Doi+Can+Ba+Dinh+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [BẢN ĐỒ VỆ TINH GOOGLE MAPS ↗]
                                        </a>
                                    </div>
                                    <div class="pt-2 mt-1 border-t border-white/10 space-y-2">
                                        <div class="text-zinc-200 font-semibold">Các khu vực bị đánh đêm 29/12</div>
                                        <div class="text-zinc-400 text-[11px]">Vị trí: Gang thép Thái Nguyên – Trại Cau (Đồng Hỷ, Thái Nguyên); Đồng Mỏ (Chi Lăng, Lạng Sơn); Kim Anh (Vĩnh Phúc).</div>
                                        <div class="text-zinc-400 text-[11px]">Đợt 60 lần chiếc B-52 lúc 23h16 chia 3 hướng: 30 đánh Thái Nguyên–Trại Cau, 18 đánh Đồng Mỏ, 12 đánh Kim Anh (Wikipedia tiếng Việt ghi 54 lần chiếc chia 24/9/21).</div>
                                        <div class="pt-1 flex flex-wrap gap-1.5">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Trai+Cau+Dong+Hy+Thai+Nguyen" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [TRẠI CAU ↗ ↗]
                                        </a>
                                        <a href="https://www.google.com/maps/search/?api=1&query=Dong+Mo+Chi+Lang+Lang+Son" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
                                            [ĐỒNG MỎ ↗ ↗]
                                        </a>
                                        <a href="https://www.google.com/maps/search/?api=1&query=Kim+Anh+Vinh+Phuc" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">
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
                                <span class="font-mono text-xs font-bold text-amber-400">NGÀY 30.12.1972 → 27.01.1973 · ĐẠI THẮNG ĐIỆN BIÊN PHỦ TRÊN KHÔNG &amp; HIỆP ĐỊNH PARIS</span>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/50">TOÀN THẮNG LỊCH SỬ</span>
                            </div>
                            <div class="text-xs text-zinc-200 leading-relaxed space-y-2">
                                <div>Sáng 30/12/1972, Tổng thống Nixon buộc phải tuyên bố ngừng hoàn toàn ném bom miền Bắc từ bắc vĩ tuyến 20 và chấp nhận nối lại đàm phán tại Paris trên cơ sở dự thảo của Việt Nam.</div>
                                <div>Ngày 27/01/1973, <strong>Hiệp định Paris</strong> chính thức được ký kết tại Trung tâm Hội nghị Quốc tế Kléber (Paris, Pháp), buộc toàn bộ quân đội viễn chinh Mỹ phải rút khỏi Việt Nam, hoàn thành mục tiêu <strong>“Đánh cho Mỹ cút”</strong> của Bác Hồ, tạo tiền đề quyết định giải phóng hoàn toàn miền Nam năm 1975.</div>
                            </div>
                        </div>

                    </div>
`;
        const ARCHIVE_NIGHT_ORDER = ['night-node-1', 'night-node-2', 'night-node-3', 'night-node-4', 'night-node-5', 'night-node-6', 'night-node-7', 'night-node-8', 'night-node-9', 'night-node-10', 'night-node-11', 'night-node-12', 'night-node-13'];
        const ARCHIVE_MEMORIAL_EXTRA = {
            'night-node-2': `<figure class="rounded-lg overflow-hidden border border-white/10 bg-black/50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/23-04-177-40mm-gun.jpg" alt="Pháo phòng không 40mm" loading="lazy" onerror="this.style.display='none'" class="w-full h-56 object-cover">
                <figcaption class="px-3 py-2 text-[13px] text-zinc-400 leading-relaxed">Minh họa: pháo phòng không 40mm — một mắt lưới trong lưới lửa tầm thấp bảo vệ Hà Nội. Ảnh: Wikimedia Commons.</figcaption>
            </figure>`,
            'night-node-3': `<figure class="rounded-lg overflow-hidden border border-white/10 bg-black/50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/SA-2-Guideline-1-1.jpg" alt="Tên lửa SAM-2 trên bệ phóng" loading="lazy" onerror="this.style.display='none'" class="w-full h-56 object-cover">
                <figcaption class="px-3 py-2 text-[13px] text-zinc-400 leading-relaxed">Minh họa: tên lửa SAM-2 trên bệ phóng — vũ khí lập kỷ lục hạ 7 B-52 đêm 20/12. Ảnh: Wikimedia Commons.</figcaption>
            </figure>`, 
            'night-node-1': `<figure class="rounded-lg overflow-hidden border border-white/10 bg-black/50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/SA-2_Guideline_surface-to-air_missile.JPEG/1280px-SA-2_Guideline_surface-to-air_missile.JPEG" alt="Tổ hợp tên lửa SAM-2" loading="lazy" onerror="this.style.display='none'" class="w-full h-56 object-cover">
                <figcaption class="px-3 py-2 text-[13px] text-zinc-400 leading-relaxed">Minh họa: tổ hợp tên lửa SAM-2 — vũ khí của Tiểu đoàn 59 khi hạ chiếc B-52 đầu tiên đêm 18/12. Ảnh: Wikimedia Commons.</figcaption>
            </figure>`,
            'night-node-5': `<div class="p-4 rounded-lg bg-black/70 border border-white/10 space-y-2">
                <div class="font-mono text-[11px] text-amber-300 uppercase font-bold">TƯỞNG NIỆM — BỆNH VIỆN BẠCH MAI, ĐÊM 22/12/1972</div>
                <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed">Bom B-52 đánh trúng bệnh viện tuyến cuối đang cứu chữa thương bệnh binh và dân thường: <b class="text-amber-300">28 cán bộ y tế hy sinh</b> trong ca trực (theo Liên hiệp các tổ chức hữu nghị Việt Nam). Tấm bia tưởng niệm trong khuôn viên bệnh viện vẫn ghi tên họ.</p>
                <a href="https://www.google.com/maps/search/?api=1&query=Benh+vien+Bach+Mai+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">[BẢN ĐỒ GOOGLE MAPS ↗]</a>
            </div>`,
            'night-node-9': `<div class="p-4 rounded-lg bg-black/70 border border-white/10 space-y-2">
                <div class="font-mono text-[11px] text-amber-300 uppercase font-bold">TƯỞNG NIỆM — PHỐ KHÂM THIÊN, ĐÊM 26/12/1972</div>
                <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed">Đợt rải thảm tàn bạo nhất: bia tưởng niệm tại số nhà 51 Khâm Thiên ghi <b class="text-amber-300">287 đồng bào thiệt mạng</b>; bảng thống kê chi tiết ghi 278 người chết, 290 người bị thương, <b class="text-amber-300">178 trẻ mồ côi</b>. Ngôi nhà 51 Khâm Thiên — nơi 7 người trong một gia đình tử nạn — nay là đài tưởng niệm.</p>
                <a href="https://www.google.com/maps/search/?api=1&query=Dai+tuong+niem+Kham+Thien+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">[BẢN ĐỒ GOOGLE MAPS ↗]</a>
            </div>
            <div class="p-4 rounded-lg bg-black/70 border border-white/10 space-y-2">
                <div class="font-mono text-[11px] text-amber-300 uppercase font-bold">KHU LAO ĐỘNG AN DƯƠNG — CÙNG ĐÊM 26/12/1972</div>
                <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed">Cùng đêm với Khâm Thiên, khu lao động nghèo An Dương (nay thuộc quận Tây Hồ) cũng bị bom rải thảm. Thẻ đêm này có chỉ đường tới phố An Dương hôm nay.</p>
                <a href="https://www.google.com/maps/search/?api=1&query=An+Duong+Tay+Ho+Ha+Noi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors">[BẢN ĐỒ GOOGLE MAPS ↗]</a>
            </div>`,
            'night-node-10': `<figure class="rounded-lg overflow-hidden border border-white/10 bg-black/50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/MIG21F94_so_5020.JPG/1280px-MIG21F94_so_5020.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail" alt="Tiêm kích MiG-21" loading="lazy" onerror="this.style.display='none'" class="w-full h-56 object-cover">
                <figcaption class="px-3 py-2 text-[13px] text-zinc-400 leading-relaxed">Minh họa: tiêm kích MiG-21 — loại máy bay Phạm Tuân lái khi bắn rơi B-52 đêm 27/12. Ảnh: Wikimedia Commons.</figcaption>
            </figure>`,
            'night-node-13': `<figure class="rounded-lg overflow-hidden border border-white/10 bg-black/50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Wreckage_of_B52_bomber%2C_downtown_Hanoi%2C_Vietnam.jpg" alt="Xác một chiếc B-52 tại Hà Nội sau 12 ngày đêm" loading="lazy" onerror="this.style.display='none'" class="w-full h-56 object-cover">
                <figcaption class="px-3 py-2 text-[13px] text-zinc-400 leading-relaxed">Xác một chiếc B-52 tại Hà Nội sau 12 ngày đêm. Ảnh: Wikimedia Commons.</figcaption>
            </figure>
            <div class="p-4 rounded-lg bg-black/70 border border-amber-400/40 space-y-2">
                <div class="font-mono text-[11px] text-amber-300 uppercase font-bold">CON SỐ CHUNG CỦA HÀ NỘI</div>
                <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed">Cả chiến dịch: Hà Nội có <b class="text-amber-300">2.368 người chết, 1.355 người bị thương</b> (Đề cương tuyên truyền 50 năm, trang .gov.vn); Tạp chí Quốc phòng toàn dân ghi 2.380 người chết. Hơn 50 vạn đồng bào đã sơ tán khỏi thành phố trước và trong chiến dịch.</p>
                <p class="text-xs sm:text-sm text-zinc-400 italic leading-relaxed">Chiến thắng này được gọi là “Điện Biên Phủ trên không” — không phải bằng bom đạn, mà bằng ý chí không chịu khuất phục của cả một thành phố.</p>
            </div>`
        };
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

        let _archiveNodesDoc = null;
        let _archiveCurrent = 'night-node-1';
        let _archiveTimelineBuilt = false;
        function archiveNodes() {
            if (_archiveNodesDoc) return _archiveNodesDoc;
            const holder = document.createElement('div');
            holder.innerHTML = ARCHIVE_NIGHTS_HTML;
            _archiveNodesDoc = holder;
            return holder;
        }
        function buildArchiveTimeline() {
            if (_archiveTimelineBuilt) return;
            const nav = document.getElementById('archive-timeline');
            if (!nav) return;
            const holder = archiveNodes();
            let html = '';
            ARCHIVE_NIGHT_ORDER.forEach(nid => {
                const node = holder.querySelector('#' + nid);
                let date = nid.replace('night-node-', ''), title = nid, badge = '';
                if (node) {
                    const spans = node.querySelectorAll('span');
                    const titleText = spans.length ? (spans[0].textContent || '') : '';
                    const m = titleText.match(/(\d{1,2})\.12/);
                    if (m) date = m[1] + '/12';
                    const tp = titleText.split('·');
                    title = tp.length > 1 ? tp[tp.length - 1].trim() : titleText;
                    if (spans.length > 1) badge = spans[spans.length - 1].textContent || '';
                }
                html += `<button onclick="showArchiveNight('${nid}')" id="tl-ms-${nid}" class="tl-ms"><span class="tl-ms-text"><span class="tl-ms-date">${date}</span><span class="tl-ms-title">${title}</span>${badge ? `<span class="tl-ms-badge">${badge}</span>` : ''}</span></button>`;
            });
            nav.innerHTML = html;
            _archiveTimelineBuilt = true;
        }
        function showArchiveNight(id) {
            const holder = archiveNodes();
            const node = holder.querySelector('#' + id);
            const area = document.getElementById('archive-content-area');
            if (!node || !area) return;
            _archiveCurrent = id;
            buildArchiveTimeline();
            const header = node.children[0];
            const body = node.children[1];
            let narrative = null, site = null;
            if (body) {
                if (body.classList.contains('space-y-4')) { narrative = body.children[0]; site = body.children[1] || null; }
                else { narrative = body; }
            }
            const figs = [];
            const extra = ARCHIVE_MEMORIAL_EXTRA[id] || '';
            const tmp = document.createElement('div');
            tmp.innerHTML = extra;
            Array.from(tmp.children).forEach(el => {
                if (el.tagName === 'FIGURE') figs.push(el.outerHTML);
            });
            const extraBoxes = Array.from(tmp.children).filter(el => el.tagName === 'DIV').map(el => el.outerHTML).join('');
            let siteHTML = '';
            if (site) {
                const siteClone = site.cloneNode(true);
                siteClone.querySelectorAll('img').forEach(img => {
                    const cap = img.nextElementSibling;
                    let fig = '<figure class="rounded-lg overflow-hidden border border-white/10 bg-black/50">';
                    fig += img.outerHTML;
                    if (cap && cap.tagName === 'DIV' && (cap.textContent || '').trim().startsWith('Ảnh:')) { fig += cap.outerHTML; cap.remove(); }
                    fig += '</figure>';
                    figs.push(fig);
                    img.remove();
                });
                siteHTML = siteClone.outerHTML;
            }
            const colNarr = narrative ? narrative.outerHTML : '';
            const colImg = figs.length ? `<div class="space-y-4">${figs.join('')}</div>` : '';
            const colPlace = (siteHTML || extraBoxes) ? `<div class="space-y-4">${siteHTML}${extraBoxes}</div>` : '';
            const nCols = [colNarr, colImg, colPlace].filter(Boolean).length;
            const placeLabel = siteHTML ? 'ĐỊA ĐIỂM & DI TÍCH' : 'TƯỞNG NIỆM';
            let colsHTML = `<div class="${nCols >= 3 ? 'archive-cols-3' : 'archive-cols-2'}">`;
            colsHTML += `<div class="archive-col-card archive-narrative"><div class="archive-col-header">// DIỄN BIẾN</div>${colNarr}</div>`;
            if (colImg) colsHTML += `<div class="archive-col-card"><div class="archive-col-header">// HÌNH ẢNH</div>${colImg}</div>`;
            if (colPlace) colsHTML += `<div class="archive-col-card"><div class="archive-col-header">// ${placeLabel}</div>${colPlace}</div>`;
            colsHTML += '</div>';
            const order = ARCHIVE_NIGHT_ORDER;
            const idx = order.indexOf(id);
            const prev = idx > 0 ? order[idx - 1] : null;
            const next = (idx >= 0 && idx < order.length - 1) ? order[idx + 1] : null;
            let nav = '<div class="flex items-center justify-between gap-3 pt-1">';
            nav += prev ? `<button onclick="showArchiveNight('${prev}')" class="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-white/15 text-sm font-mono">← Đêm trước</button>` : '<span></span>';
            nav += next ? `<button onclick="showArchiveNight('${next}')" class="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black border border-amber-300/60 text-sm font-mono font-bold">Đêm sau →</button>` : '<span></span>';
            nav += '</div>';
            area.innerHTML = `<div class="archive-detail">${header ? header.outerHTML : ''}${colsHTML}</div>` + nav;
            area.scrollTop = 0;
            order.forEach(nid => {
                const btn = document.getElementById('tl-ms-' + nid);
                if (btn) btn.classList.toggle('is-active', nid === id);
            });
        }
        window.showArchiveNight = showArchiveNight;


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

