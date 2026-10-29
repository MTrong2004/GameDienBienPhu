        function loadProgress() {
            try {
                const raw = localStorage.getItem('hn12_progress');
                if (!raw) return { unlocked: 1, best: {} };
                const parsed = JSON.parse(raw);
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    return { unlocked: 1, best: {} };
                }
                const unlockedRaw = Number(parsed.unlocked);
                const unlocked = (Number.isFinite(unlockedRaw) && unlockedRaw >= 1)
                    ? Math.min(MISSIONS.length, Math.floor(unlockedRaw))
                    : 1;
                let best = {};
                if (parsed.best && typeof parsed.best === 'object' && !Array.isArray(parsed.best)) {
                    Object.entries(parsed.best).forEach(([k, v]) => {
                        if (v && typeof v === 'object' && !Array.isArray(v)) {
                            best[k] = v;
                        }
                    });
                }
                return { unlocked, best };
            } catch (e) {
                return { unlocked: 1, best: {} };
            }
        }
        function saveProgress(p) {
            try { localStorage.setItem('hn12_progress', JSON.stringify(p)); } catch (e) {}
        }

        function formatMMSS(sec) {
            const s = Math.max(0, Math.ceil(sec));
            return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
        }

        // ---- Screens ----
        function showScreen(name) {
            ['menu', 'campaign', 'briefing', 'pause', 'debrief', 'victory', 'archive'].forEach(n => {
                const el = document.getElementById(`screen-${n}`);
                if (el) el.classList.toggle('is-open', n === name);
            });
            document.body.classList.toggle('in-menu', name !== null && name !== 'pause');
            if (name === 'campaign') renderMissionList();
            if (name === 'menu') renderMenuProgress();
            if (name === 'archive' && typeof showArchiveNight === 'function') showArchiveNight('night-node-1');
        }

        function continueCampaign() {
            const prog = loadProgress();
            const completed = Object.keys(prog.best || {}).length;
            const lastMissionDone = !!(prog.best && prog.best[MISSIONS[MISSIONS.length - 1].id]);
            if (completed >= MISSIONS.length || lastMissionDone) {
                showVictoryEpilogue();
                return;
            }
            const nextIdx = Math.min(MISSIONS.length - 1, prog.unlocked - 1);
            openBriefing(nextIdx);
        }

        function renderMenuProgress() {
            const prog = loadProgress();
            const completed = Object.keys(prog.best || {}).length;
            let totalKills = 0;
            Object.values(prog.best || {}).forEach(b => { totalKills += (b.kills || 0); });
            const box = document.getElementById('menu-campaign-progress');
            const btnContinue = document.getElementById('btn-continue-campaign');
            const pipsEl = document.getElementById('menu-pips');

            if (box) {
                box.classList.remove('hidden');
                if (completed >= MISSIONS.length) {
                    document.getElementById('menu-prog-text').textContent = `${MISSIONS.length}/${MISSIONS.length} ĐÊM · TOÀN THẮNG`;
                    document.getElementById('menu-prog-sub').textContent = `Chiến dịch toàn thắng! Đã bắn hạ tổng cộng ${totalKills} Pháo đài bay B-52`;
                } else if (completed > 0 || prog.unlocked > 1) {
                    document.getElementById('menu-prog-text').textContent = `${completed}/${MISSIONS.length} ĐÊM HOÀN THÀNH`;
                    document.getElementById('menu-prog-sub').textContent = `Đang ở Màn ${prog.unlocked}: ${MISSIONS[prog.unlocked - 1].dateLabel} · Đã hạ ${totalKills} B-52`;
                } else {
                    document.getElementById('menu-prog-text').textContent = `0/${MISSIONS.length} ĐÊM · SẴN SÀNG CHIẾN ĐẤU`;
                    document.getElementById('menu-prog-sub').textContent = `Bảo vệ bầu trời Thủ đô trước siêu pháo đài bay B-52`;
                }
            }

            if (pipsEl) {
                pipsEl.innerHTML = MISSIONS.map((m, i) => {
                    const done = !!prog.best[m.id];
                    const curr = i === prog.unlocked - 1 && !done;
                    const bg = done ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]' : curr ? 'bg-emerald border border-emerald animate-pulse' : 'bg-white/15';
                    return `<div class="h-1.5 flex-1 rounded-sm ${bg}" title="Đêm ${i+1}: ${m.dateLabel}"></div>`;
                }).join('');
            }

            if (btnContinue) {
                btnContinue.classList.remove('hidden');
                if (completed >= MISSIONS.length) {
                    btnContinue.innerHTML = '<div class="flex items-center justify-between"><span class="btn-continue-label uppercase font-bold tracking-wider">★ Xem Đại Thắng Điện Biên Phủ ★</span><span class="btn-key-badge font-mono text-[11px] px-1.5 py-0.5 bg-black/40 text-amber-200 rounded">XEM</span></div><div class="text-[11px] font-mono text-black/80 font-medium mt-0.5">12/12 ĐÊM TOÀN THẮNG // 34 B-52 BẮN RƠI</div>';
                    btnContinue.style.background = '#D97706';
                    btnContinue.style.borderColor = '#F59E0B';
                    btnContinue.style.color = '#000';
                    btnContinue.style.fontWeight = '700';
                } else if (completed > 0 || prog.unlocked > 1) {
                    const nextM = MISSIONS[prog.unlocked - 1];
                    btnContinue.innerHTML = `<div class="flex items-center justify-between"><span class="btn-continue-label uppercase font-bold tracking-wider">Tiếp tục: ${nextM.title} →</span><span class="btn-key-badge font-mono text-[11px] px-1.5 py-0.5 bg-black/40 text-emerald-950 rounded">ENTER</span></div><div class="text-[11px] font-mono text-emerald-950 font-medium mt-0.5">MÀN ${prog.unlocked} // ${nextM.dateLabel.toUpperCase()}</div>`;
                    btnContinue.style.background = '';
                    btnContinue.style.borderColor = '';
                    btnContinue.style.color = '';
                    btnContinue.style.fontWeight = '';
                } else {
                    btnContinue.innerHTML = '<div class="flex items-center justify-between"><span class="btn-continue-label uppercase font-bold tracking-wider">Bắt đầu Chiến dịch: Đêm 18/12 →</span><span class="btn-key-badge font-mono text-[11px] px-1.5 py-0.5 bg-black/40 text-emerald-950 rounded">ENTER</span></div><div class="text-[11px] font-mono text-emerald-950 font-medium mt-0.5">MÀN 01 // ĐÒN PHỦ ĐẦU TẬP KÍCH ĐƯỜNG KHÔNG</div>';
                    btnContinue.style.background = '';
                    btnContinue.style.borderColor = '';
                    btnContinue.style.color = '';
                    btnContinue.style.fontWeight = '';
                }
            }
            const btnOpenCampaign = document.getElementById('btn-open-campaign');
            if (btnOpenCampaign) btnOpenCampaign.classList.remove('primary');
        }

        function backToMenuAttract() {
            Voice.stop();
            gameState = 'MENU';
            gamePaused = false;
            activeMission = null;
            clearCombatScene();
            if (currentMode !== 'SAM2') switchSimMode('SAM2');
            setAirArena(false);
            setCinematicCamera('DECK');
            setEccmSlider(2960);
            autoAIEnabled = true;
            resetAutoPilotUI();
            setBomberCount(3, 1);
            showScreen('menu');
            renderMenuProgress();
        }

        function openCampaign() {
            SoundEngine.init();
            showScreen('campaign');
        }

        function renderMissionList() {
            const prog = loadProgress();
            const completedCount = Object.keys(prog.best || {}).length;
            const badge = document.getElementById('campaign-progress-badge');
            if (badge) badge.textContent = `TIẾN ĐỘ: ${completedCount}/${MISSIONS.length} ĐÊM`;

            const track = document.getElementById('timeline-track');
            if (track) {
                const nodesHtml = MISSIONS.map((m, i) => {
                    const isDone = !!prog.best[m.id];
                    const isCurrent = i === prog.unlocked - 1 && !isDone;
                    const isLocked = i >= prog.unlocked;
                    const statusClass = isDone ? 'is-done' : isCurrent ? 'is-current' : isLocked ? 'is-locked' : '';
                    const dotText = isDone ? '★' : (i + 1);
                    return `
                        <button class="timeline-node ${statusClass}" ${isLocked ? 'disabled' : `onclick="openBriefing(${i})"`} title="Màn ${i+1}: ${m.dateLabel} - ${m.title}">
                            <div class="timeline-dot">${dotText}</div>
                            <span class="timeline-date">${m.date.slice(0, 5)}</span>
                        </button>
                    `;
                }).join('');

                const allWon = completedCount >= MISSIONS.length;
                const victoryNodeHtml = `
                    <button class="timeline-node ${allWon ? 'is-done is-epilogue' : 'is-locked'}" ${allWon ? 'onclick="showVictoryEpilogue()"' : 'disabled'} title="${allWon ? '30.12.1972: Toàn thắng & Ký Hiệp định Paris' : `Hoàn thành ${MISSIONS.length} đêm để mở Đại Thắng`}">
                        <div class="timeline-dot">★</div>
                        <span class="timeline-date">30.12</span>
                    </button>
                `;
                track.innerHTML = nodesHtml + victoryNodeHtml;
            }

            const allWon = completedCount >= MISSIONS.length;
            const victoryBannerHtml = allWon ? `
                <div class="mb-4 p-3.5 bg-gradient-to-r from-amber-950/70 to-black border border-amber-400/50 rounded-lg flex items-center justify-between flex-wrap gap-2 text-left">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl text-amber-400 font-bold">★</span>
                        <div>
                            <div class="font-mono text-xs text-amber-300 font-bold uppercase tracking-wider">CHIẾN DỊCH 12 NGÀY ĐÊM ĐÃ TOÀN THẮNG!</div>
                            <div class="text-[12px] text-muted">Bầu trời Hà Nội giữ vững trọn vẹn — Buộc Mỹ ký kết Hiệp định Paris 27/1/1973.</div>
                        </div>
                    </div>
                    <button class="menu-btn primary text-xs py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-black font-bold border-amber-300" onclick="showVictoryEpilogue()">
                        Xem Đại Thắng Epilogue →
                    </button>
                </div>
            ` : '';

            const cardsHtml = MISSIONS.map((m, i) => {
                const locked = i >= prog.unlocked;
                const best = prog.best[m.id];
                const status = locked ? 'Chưa mở' : best ? 'Đã hoàn thành' : 'Sẵn sàng tác chiến';
                const weapon = m.mode === 'MIG21' ? 'Tiêm kích MiG-21bis' : 'Tổ hợp Tên lửa SAM-2';
                return `
                    <button class="mission-card${locked ? ' is-locked' : ''}" ${locked ? 'disabled' : `onclick="openBriefing(${i})"`}>
                        <div class="flex items-center justify-between">
                            <span class="mission-num">ĐÊM ${i + 1} // ${m.date}</span>
                            <span class="text-xs font-mono ${best ? 'text-amber-400 font-bold' : locked ? 'text-muted' : 'text-emerald font-bold'}">${locked ? '[CHƯA MỞ]' : best ? '★ ĐẠT' : '[SẴN SÀNG]'}</span>
                        </div>
                        <span class="mission-date">${m.dateLabel} · ${String(m.clock[0]).padStart(2, '0')}:${String(m.clock[1]).padStart(2, '0')}</span>
                        <span class="mission-title">${m.title}</span>
                        <span class="mission-unit">${weapon}<br><span class="text-muted">${m.place}</span></span>
                        <div class="mt-auto pt-2 border-t border-white/10 flex items-center justify-between">
                            <span class="mission-status${best ? ' is-done' : ''}">${status}</span>
                            <span class="text-[11px] font-mono text-muted">MỤC TIÊU: ${m.kills} B-52</span>
                        </div>
                    </button>`;
            }).join('');

            document.getElementById('mission-list').innerHTML = victoryBannerHtml + cardsHtml;
        }

        function openBriefing(idx) {
            if (typeof idx !== 'number' || isNaN(idx) || idx < 0 || idx >= MISSIONS.length) return;
            const prog = loadProgress();
            const locked = idx >= prog.unlocked;
            if (!locked) {
                activeMissionIdx = idx;
            }
            const m = MISSIONS[idx];
            document.getElementById('brief-date').textContent = `MÀN ${idx + 1} · ${m.dateLabel} · ${String(m.clock[0]).padStart(2, '0')}:${String(m.clock[1]).padStart(2, '0')}`;
            document.getElementById('brief-title').textContent = m.title;
            document.getElementById('brief-unit').textContent = `${m.unit} — ${m.place}`;
            const quoteEl = document.getElementById('brief-story-quote');
            if (quoteEl) {
                quoteEl.innerHTML = `
                    <div class="flex items-center justify-between gap-2 mb-1">
                        <span class="text-[11px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                            BỐI CẢNH LỊCH SỬ &amp; Ý CHÍ CHIẾN ĐẤU
                        </span>
                        <button class="text-[11px] font-mono uppercase tracking-wider text-amber-300 hover:text-white px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 hover:bg-amber-500/40 transition-colors flex items-center gap-1" onclick="Voice.toggleBriefingStory()">
                            <span class="font-mono text-amber-300 mr-1">[AUDIO]</span> <span id="btn-brief-audio-label">Nghe bối cảnh (Giọng nữ AI)</span>
                        </button>
                    </div>
                    "${m.story}"
                `;
            }
            document.getElementById('brief-body').innerHTML = m.briefing.map(p => `<p>${p}</p>`).join('') +
                `<p class="brief-forces"><b>Lực lượng địch ${m.dateLabel.toLowerCase()}:</b> ${m.forces}</p>`;
            const onPads = Math.min(3, m.ammo);
            document.getElementById('brief-objectives').innerHTML = [
                `Bắn rơi <b>${m.kills} B-52</b>`,
                m.mode === 'MIG21' ? 'Vũ khí: <b>2 tên lửa tầm nhiệt K-13</b>, không nạp lại được'
                    : `Cơ số: <b>${m.ammo} đạn V-750</b> — ${onPads} quả trên bệ, ${m.ammo - onPads} quả trong kho (nạp ~${RELOAD_TIME} giây/quả)`,
                `Trong khu vực của bạn: <b>${m.waves.length} tốp × 3 B-52</b> (${m.waves.length * 3} chiếc)`,
                m.jam ? `Máy gây nhiễu dò lại tần số của bạn sau khoảng <b>${m.jam.lookThrough} giây</b>${m.jam.chaff ? '; có hành lang nhiễu tiêu cực (chaff)' : ''}` : null,
                `Thời gian tối đa: <b>${formatMMSS(m.timeLimit)}</b>`
            ].filter(Boolean).map(t => `<li>${t}</li>`).join('');
            const briefControlsEl = document.getElementById('brief-controls');
            if (briefControlsEl) {
                briefControlsEl.innerHTML = (m.controls || []).map(t => `<li>${t}</li>`).join('');
            }
            if (!locked) {
                showScreen('briefing');
                if (typeof Voice !== 'undefined' && Voice.playBriefingStory) {
                    Voice.playBriefingStory(m);
                }
            }
        }

        // ---- Mission lifecycle ----
        function clearCombatScene() {
            activeBombers.forEach(b => worldCombatGroup.remove(b.mesh));
            activeMissiles.forEach(m => worldCombatGroup.remove(m.mesh));
            fallingWrecks.forEach(w => worldCombatGroup.remove(w.mesh));
            explosionParticles.forEach(p => {
                worldCombatGroup.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
            });
            chaffClouds.forEach(c => { worldCombatGroup.remove(c.pts); c.pts.geometry.dispose(); c.pts.material.dispose(); });
            gunTracers.forEach(t => worldCombatGroup.remove(t.mesh));
            activeBombers = [];
            activeMissiles = [];
            fallingWrecks = [];
            explosionParticles = [];
            chaffClouds = [];
            gunTracers = [];
            jamCells = [];
            lockedBomber = null;
            selectedTarget = null;
            trackTimer = 0;
            guidedMissile = null;
            missileCamHold = 0;
            killCamWreck = null;
            camReturn = null;
            reloadingLauncher = null;
            clearAAA();
        }

        let missionBomberCount = 3, missionBomberSpeed = 1;
        function setBomberCount(n, speed) {
            missionBomberCount = n;
            missionBomberSpeed = speed;
        }

        function setEccmSlider(v) {
            const slider = document.getElementById('eccm-slider');
            slider.value = v;
            updateECCMFreq(v);
        }

        let guidePausedGame = false;
        function toggleTacticalGuide(open) {
            const modal = document.getElementById('modal-tactical-guide');
            if (!modal) return;
            const isOpen = modal.classList.contains('is-open');
            const target = open !== undefined ? open : !isOpen;
            if (target) {
                modal.classList.add('is-open');
                if (gameState === 'PLAYING' && !gamePaused) {
                    gamePaused = true;
                    guidePausedGame = true;
                }
            } else {
                modal.classList.remove('is-open');
                if (guidePausedGame) {
                    gamePaused = false;
                    guidePausedGame = false;
                }
            }
        }

        function showCombatAlert(m) {
            const banner = document.getElementById('combat-alert-banner');
            if (!banner) return;
            document.getElementById('alert-banner-title').textContent = `MÀN ${activeMissionIdx + 1}: ${m.title.toUpperCase()}`;
            document.getElementById('alert-banner-story').textContent = `${m.unit} · ${m.place}`;
            document.getElementById('alert-banner-obj').textContent = `MỤC TIÊU: TIÊU DIỆT ${m.kills} PHÁO ĐÀI BAY B-52 · BẢO VỆ BẦU TRỜI THỦ ĐÔ`;
            banner.classList.remove('is-visible');
            void banner.offsetWidth;
            banner.classList.add('is-visible');
            clearTimeout(showCombatAlert.timer);
            showCombatAlert.timer = setTimeout(() => banner.classList.remove('is-visible'), 3200);
            SoundFX.alertChime();
        }

        function showKillSplash(m, kills) {
            const splash = document.getElementById('kill-splash');
            if (!splash) return;
            const detail = document.getElementById('kill-splash-detail');
            const count = document.getElementById('kill-splash-count');
            if (detail) detail.textContent = `${m.unit.split(' · ')[0]} LẬP CÔNG — PHÁO ĐÀI BAY B-52 BỐC CHÁY RƠI TẠI CHỖ!`;
            if (count) count.textContent = `TIẾN ĐỘ: ĐÃ HẠ ${kills}/${m.kills} B-52`;
            splash.classList.remove('is-visible');
            void splash.offsetWidth;
            splash.classList.add('is-visible');
            clearTimeout(showKillSplash.timer);
            showKillSplash.timer = setTimeout(() => splash.classList.remove('is-visible'), 3200);
            SoundFX.fanfare();
        }

        function beginMission() {
            const m = MISSIONS[activeMissionIdx];
            activeMission = m;
            SoundEngine.init();
            clearCombatScene();
            if (typeof Voice === 'undefined' || !Voice.isStoryPlaying || !Voice.isStoryPlaying()) {
                Voice.stop();
                // Khau lenh xuat kich ngan gon, dut khoat (2 giay) de khong lam tre cac ban tin radar tiep theo
                const pilotCallsign = m.pilot || '5121';
                const combatCue = m.mode === 'MIG21'
                    ? `Tiêm kích ${pilotCallsign} bật tăng lực xuất kích, tiếp cận mục tiêu!`
                    : 'Tiểu đoàn vào cấp một! Tiêu diệt B-52 bảo vệ Hà Nội!';
                Voice.speak('SỞ CHỈ HUY', combatCue, true);
            }
            showCombatAlert(m);
            autoAIEnabled = false;
            resetAutoPilotUI();
            gamePaused = false;

            setBomberCount(m.bombers, m.speed);
            switchSimMode(m.mode);
            setCinematicCamera(m.camera);

            missionKills = 0;
            missionAmmo = m.ammo;
            missionShots = 0;
            missionTime = 0;
            missionRadioIdx = 0;
            missionEndTimer = 0;
            missionWon = false;
            missionFailReason = '';
            missionRadioLog = [];
            missionCleanAnnounced = false;
            lastFireTime = 0;
            missionWaveIdx = 0;
            missionStats = { damaged: 0, leaked: 0 };
            viewYaw = 0;
            viewPitch = VIEW_PITCH_DEFAULT;
            lastCleanCallout = lastJamCallout = -99;
            steerHintShown = false;
            lastFreqMove = -10;
            const onPads = Math.min(3, m.ammo);
            samLaunchers.forEach((l, k) => {
                l.loaded = k < onPads;
                l.reloadT = 0;
                l.battery.loadedMissile.visible = l.loaded;
            });
            missionReserve = m.mode === 'SAM2' ? m.ammo - onPads : 0;
            document.getElementById('eccm-row').style.display = m.jam ? '' : 'none';
            document.getElementById('launcher-row').style.display = m.mode === 'SAM2' ? '' : 'none';
            setEccmSlider(m.jam ? m.jam.startFreq : 2960);
            setAirArena(m.mode === 'MIG21');
            if (m.mode === 'MIG21') initMiGIntercept();

            campaignMinutes = m.clock[0] * 60 + m.clock[1];
            lastClockText = '';
            document.getElementById('poster-date').textContent = m.date;
            document.getElementById('poster-mission').textContent = `MÀN ${activeMissionIdx + 1}: ${m.title}`;
            document.getElementById('obj-line').textContent = `NHIỆM VỤ: HẠ ${m.kills} B-52`;
            updateObjectiveHud();
            setPosterLaunchState(false);
            document.getElementById('hud-role-label').textContent = m.mode === 'MIG21' ? `TIÊM KÍCH: MIG-21 #${m.pilot || '5121'}` : `${m.unit.split(' · ')[0].toUpperCase()}`;

            gameState = 'PLAYING';
            showScreen(null);
            if (m.mode === 'SAM2') SoundFX.siren();
        }

        function updateObjectiveHud() {
            if (!activeMission) return;
            if (activeMission.mode === 'SAM2') missionAmmo = missionReserve + samLaunchers.filter(l => l.loaded).length;
            document.getElementById('obj-kills').textContent = `${missionKills}/${activeMission.kills}`;
            document.getElementById('poster-ammo').textContent = missionAmmo;
            document.getElementById('obj-timer').textContent = formatMMSS(activeMission.timeLimit - missionTime);
            const weapon = activeMission.mode === "MIG21" ? `K-13: ${missionAmmo}/${activeMission.ammo} · PHÁO: ${mig.cannonAmmo !== undefined ? mig.cannonAmmo : 200}` : `V-750: ${missionAmmo}/${activeMission.ammo}`;
            document.getElementById("hud-ammo-badge").textContent = weapon;
        }

        // Spoken story narration and radio calls. Uses a Vietnamese voice when the system has one
        // (Windows "Microsoft An", or Edge's online HoaiMy / NamMinh voices).
        // ponytail: Audio file playback (vi-VN-HoaiMyNeural & vi-VN-NamMinhNeural) with seamless Web Speech fallback; upgrade to streaming Web Audio buffers if network CDN dynamic synthesis is needed.
        const Voice = {
            voice: null, checked: false, warned: false, pending: 0, currentAudio: null,
            PROFILES: {
                'DẪN TRUYỆN': { pitch: 0.95, rate: 1.08 }, 'SỞ CHỈ HUY': { pitch: 0.85, rate: 1.18 },
                'TRẮC THỦ': { pitch: 1.1, rate: 1.22 }, 'SĨ QUAN ĐIỀU KHIỂN': { pitch: 0.92, rate: 1.18 },
                'ĐÀI QUAN SÁT': { pitch: 1.0, rate: 1.15 }, '5121': { pitch: 1.05, rate: 1.2 }, '046': { pitch: 1.02, rate: 1.2 },
                'LOA PHÒNG KHÔNG': { pitch: 1.12, rate: 1.12 }, 'ĐÀI RADAR 291': { pitch: 0.9, rate: 1.18 },
                'ĐÀI QUAN SÁT GIA LÂM': { pitch: 1.0, rate: 1.15 }, 'HƯỚNG DẪN': { pitch: 1.0, rate: 1.18 }
            },
            init() {
                if (!('speechSynthesis' in window)) return;
                const synth = window.speechSynthesis;
                const pick = () => {
                    const vs = (synth.getVoices && synth.getVoices()) || [];
                    if (!vs.length) return;
                    this.voice = vs.find(v => /^vi/i.test(v.lang) && /hoaimy|female|nữ/i.test(v.name)) ||
                                 vs.find(v => /^vi/i.test(v.lang) && /natural|online/i.test(v.name)) ||
                                 vs.find(v => /^vi/i.test(v.lang)) ||
                                 vs.find(v => /vietnam/i.test(v.name)) || null;
                    this.checked = true;
                };
                pick();
                if (synth.addEventListener) synth.addEventListener('voiceschanged', pick);
                else synth.onvoiceschanged = pick;
            },
            clean(text) {
                return String(text).replace(/<[^>]+>/g, '').replace(/B-52/g, 'B 52').replace(/MiG-21/g, 'Mích 21')
                    .replace(/Q \/ E/g, 'Q hoặc E').replace(/[—–]/g, ', ').replace(/\(([^)]*)\)/g, ', $1,')
                    .replace(/F-4/g, 'Ép 4').replace(/F-111/g, 'Ép 111').replace(/SAM-2/g, 'Sam 2')
                    .replace(/V-750/g, 'Vê 750').replace(/K-13/g, 'Ca 13');
            },
            isStoryPlaying() {
                return !!(this.isStory && this.currentAudio && !this.currentAudio.paused && !this.currentAudio.ended);
            },
            stop() {
                this.isStory = false;
                this._wasPlayingOnPause = false;
                if (this.currentAudio) {
                    try { this.currentAudio.pause(); this.currentAudio.currentTime = 0; } catch(e) {}
                    this.currentAudio = null;
                }
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                this.pending = 0;
                Voice._currU = null;
                if (Voice._resumeTimer) { clearInterval(Voice._resumeTimer); Voice._resumeTimer = null; }
                const label = document.getElementById('btn-brief-audio-label');
                if (label) label.textContent = 'Nghe bối cảnh (Giọng nữ AI)';
                const dLabel = document.getElementById('btn-debrief-audio-label');
                if (dLabel) dLabel.textContent = 'Nghe diễn biến (Giọng nữ AI)';
            },
            playAudioFile(src, onEndCallback, isStory = false) {
                if (this.currentAudio) {
                    try { this.currentAudio.pause(); this.currentAudio.currentTime = 0; } catch(e) {}
                    this.currentAudio = null;
                }
                this.isStory = !!isStory;
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                this.pending = 0;
                try {
                    const audio = new Audio(src);
                    audio.volume = (typeof SoundFX !== 'undefined' && SoundFX.voiceVolume !== undefined) ? SoundFX.voiceVolume : 0.95;
                    this.currentAudio = audio;
                    const cleanup = () => {
                        this.currentAudio = null;
                        this.isStory = false;
                        const label = document.getElementById('btn-brief-audio-label');
                        if (label) label.textContent = 'Nghe bối cảnh (Giọng nữ AI)';
                        const dLabel = document.getElementById('btn-debrief-audio-label');
                        if (dLabel) dLabel.textContent = 'Nghe diễn biến (Giọng nữ AI)';
                    };
                    audio.onended = () => {
                        cleanup();
                        if (typeof onEndCallback === 'function') onEndCallback();
                    };
                    audio.onerror = (err) => {
                        cleanup();
                        if (typeof onEndCallback === 'function') onEndCallback(err || new Error('Audio load error'));
                    };
                    const p = audio.play();
                    if (p && typeof p.catch === 'function') {
                        p.catch(err => {
                            cleanup();
                            if (typeof onEndCallback === 'function') onEndCallback(err);
                        });
                    }
                    return true;
                } catch(e) {
                    return false;
                }
            },
            findAudioCue(who, text) {
                if (typeof Audio === 'undefined') return null;
                const m = (typeof activeMission !== 'undefined' && activeMission) || null;
                const lower = (text || '').toLowerCase();
                if (who === 'LOA PHÒNG KHÔNG') return 'assets/audio/cue_air_raid.mp3';
                if (who === 'SỞ CHỈ HUY') {
                    if (/xuất kích|cấp 1|tiêu diệt b[\s-]?52/i.test(lower)) {
                        return m && m.mode === 'MIG21'
                            ? (m.pilot === '046' ? 'assets/audio/cue_mig21_046.mp3' : 'assets/audio/cue_mig21_5121.mp3')
                            : 'assets/audio/cue_sam2.mp3';
                    }
                    if (/thắng|hoàn thành|bắn rơi|toàn thắng/i.test(lower)) return 'assets/audio/cue_win.mp3';
                }
                if (/bốc cháy|rơi tại chỗ|bắn rơi|bắn trúng/i.test(lower)) return 'assets/audio/cue_kill.mp3';
                if (who === 'TRẮC THỦ' && /nhiễu nặng/i.test(lower)) return 'assets/audio/cue_jam.mp3';
                if (/bám chắc|phóng đạn|khóa chặt/i.test(lower)) return 'assets/audio/cue_lock.mp3';
                return null;
            },
            speak(who, text, interrupt) {
                if (!SoundEngine.enabled) return;
                // Giữ voice dẫn chuyện bối cảnh không bị ngắt quãng giữa chừng
                if (this.isStoryPlaying()) return;
                // Bỏ hoàn toàn voice hướng dẫn / phím bấm / chuột / nạp đạn
                if (who === 'HƯỚNG DẪN' || /chuột|bấm|nhấn|phím|kéo thanh|vòng ngắm|lệch chuột|hướng dẫn|thanh tần số|cách đánh|nạp bệ|kho đã hết|cả ba bệ|xe vận tải/i.test(text)) return;

                // ponytail: offline/local audio cue router; upgrade to dynamic client TTS WASM if complete offline speech is required.
                const cueFile = this.findAudioCue(who, text);
                if (cueFile) {
                    const played = this.playAudioFile(cueFile);
                    if (played) {
                        if (who === 'LOA PHÒNG KHÔNG' && typeof SoundFX !== 'undefined' && SoundFX.loudspeakerChime) {
                            SoundFX.loudspeakerChime();
                        }
                        return;
                    }
                }

                if (!('speechSynthesis' in window)) return;
                const synth = window.speechSynthesis;
                this.init();
                const vs = (synth.getVoices && synth.getVoices()) || [];
                const v = this.voice || (vs.length ? (vs.find(v => /^vi/i.test(v.lang) && /natural|online/i.test(v.name)) ||
                                                      vs.find(v => /^vi/i.test(v.lang)) ||
                                                      vs.find(v => /vietnam/i.test(v.name))) : null);

                // Không bao giờ dùng giọng tiếng Anh (như David) để đọc tiếng Việt gây lỗi phát âm
                if (!v) {
                    if (typeof SoundFX !== 'undefined') {
                        if (who === 'LOA PHÒNG KHÔNG' && SoundFX.loudspeakerChime) SoundFX.loudspeakerChime();
                        else if (SoundFX.radio) SoundFX.radio(false);
                    }
                    return;
                }

                if (interrupt) {
                    synth.cancel();
                    this.pending = 0;
                    if (Voice._resumeTimer) { clearInterval(Voice._resumeTimer); Voice._resumeTimer = null; }
                } else if (this.pending > 1) return;

                const UtteranceClass = window.SpeechSynthesisUtterance || SpeechSynthesisUtterance;
                if (!UtteranceClass) return;

                const u = new UtteranceClass(this.clean(text));
                const p = this.PROFILES[who] || { pitch: 1, rate: 1.05 };
                u.voice = v;
                u.lang = v.lang || 'vi-VN';
                u.pitch = p.pitch;
                u.rate = p.rate;
                const vol = (typeof SoundFX !== 'undefined' && SoundFX.voiceVolume !== undefined) ? SoundFX.voiceVolume : 0.95;
                u.volume = vol;
                this.pending++;

                // Sound feedback cues
                if (typeof SoundFX !== 'undefined') {
                    if (who === 'DẪN TRUYỆN' && SoundFX.teletype) SoundFX.teletype();
                    else if (who === 'LOA PHÒNG KHÔNG' && SoundFX.loudspeakerChime) SoundFX.loudspeakerChime();
                }

                Voice._currU = u;
                if (!Voice._resumeTimer) {
                    Voice._resumeTimer = setInterval(() => {
                        if (window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
                            window.speechSynthesis.pause();
                            window.speechSynthesis.resume();
                        }
                    }, 4000);
                }

                u.onend = u.onerror = () => {
                    this.pending = Math.max(0, this.pending - 1);
                    Voice._currU = null;
                    if (Voice._resumeTimer) { clearInterval(Voice._resumeTimer); Voice._resumeTimer = null; }
                    const label = document.getElementById('btn-brief-audio-label');
                    if (label) label.textContent = 'Nghe bối cảnh (Giọng nữ AI)';
                    const dLabel = document.getElementById('btn-debrief-audio-label');
                    if (dLabel) dLabel.textContent = 'Nghe diễn biến (Giọng nữ AI)';
                };

                setTimeout(() => {
                    try {
                        if (synth.paused) synth.resume();
                        synth.speak(u);
                    } catch(e) {}
                }, 15);
            },
            playBriefingStory(mission) {
                const m = mission || (typeof activeMission !== 'undefined' && activeMission) || (typeof MISSIONS !== 'undefined' && MISSIONS[activeMissionIdx]) || null;
                if (!m || !m.story) return;

                this.stop();
                const label = document.getElementById('btn-brief-audio-label');
                if (label) label.textContent = 'Dừng đọc';

                // Ưu tiên phát file giọng đọc AI Hoài My chuẩn cả local lẫn deploy trên web
                const audioSrc = `assets/audio/story_${m.id}.mp3`;
                let played = false;
                if (typeof Audio !== 'undefined') {
                    played = this.playAudioFile(audioSrc, (err) => {
                        if (err) {
                            // Fallback sang SpeechSynthesis nếu không load được file
                            this.speak('DẪN TRUYỆN', m.story, true);
                        } else {
                            if (label) label.textContent = 'Nghe bối cảnh (Giọng nữ AI)';
                        }
                    }, true);
                }
                if (!played) {
                    this.speak('DẪN TRUYỆN', m.story, true);
                }
            },
            toggleBriefingStory() {
                if (this.isStoryPlaying()) {
                    this.stop();
                    return;
                }
                const m = (typeof activeMission !== 'undefined' && activeMission) || (typeof MISSIONS !== 'undefined' && MISSIONS[activeMissionIdx]) || null;
                if (m) this.playBriefingStory(m);
            },
            toggleDebriefHistory() {
                if (this.currentAudio || (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking)) {
                    this.stop();
                    return;
                }
                const m = (typeof activeMission !== 'undefined' && activeMission) || (typeof MISSIONS !== 'undefined' && MISSIONS[activeMissionIdx]) || null;
                if (!m) return;
                const label = document.getElementById('btn-debrief-audio-label');
                if (label) label.textContent = 'Dừng đọc';

                const audioSrc = `assets/audio/history_${m.id}.mp3`;
                let played = false;
                if (typeof Audio !== 'undefined') {
                    played = this.playAudioFile(audioSrc, (err) => {
                        const lbl = document.getElementById('btn-debrief-audio-label');
                        if (lbl) lbl.textContent = 'Nghe diễn biến (Giọng nữ AI)';
                    });
                }
                if (!played) {
                    const histText = Array.isArray(m.history) ? m.history.join(' ') : (m.history || '');
                    this.speak('DẪN TRUYỆN', histText, true);
                }
            }
        };

        if (typeof window !== 'undefined') {
            window.Voice = Voice;
        }

        let missionRadioLog = [];
        let radioLogPausedGame = false;
        function toggleRadioLog(open) {
            const modal = document.getElementById('modal-radio-log');
            if (!modal) return;
            const isOpen = modal.classList.contains('is-open');
            const target = open !== undefined ? open : !isOpen;
            if (target) {
                renderRadioLogList();
                modal.classList.add('is-open');
                if (gameState === 'PLAYING' && !gamePaused) {
                    gamePaused = true;
                    radioLogPausedGame = true;
                }
            } else {
                modal.classList.remove('is-open');
                if (radioLogPausedGame) {
                    gamePaused = false;
                    radioLogPausedGame = false;
                }
            }
        }

        function renderRadioLogList() {
            const container = document.getElementById('radio-log-list');
            if (!container) return;
            if (!missionRadioLog.length) {
                container.innerHTML = `<div class="p-8 text-center text-muted font-mono text-sm">Chưa có bức điện truyền tin nào được ghi nhận trong đêm nay.</div>`;
                return;
            }
            container.innerHTML = missionRadioLog.map(item => {
                const timeStr = formatMMSS(item.time);
                const isCmd = item.who.includes('SỞ CHỈ HUY');
                const isObs = item.who.includes('ĐÀI') || item.who.includes('LOA');
                const currentPilot = (activeMission && activeMission.pilot) ? String(activeMission.pilot) : '5121';
                const isPilot = item.who.includes('5121') || item.who.includes('046') || item.who.includes(currentPilot);
                const badgeClass = isCmd ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
                    : isPilot ? 'text-cyan-300 bg-cyan-400/10 border-cyan-400/30'
                    : isObs ? 'text-teal-300 bg-teal-400/10 border-teal-400/30'
                    : 'text-emerald bg-emerald/10 border-emerald/30';
                return `
                    <div class="p-3 bg-black/70 border border-white/10 rounded-lg text-left space-y-1">
                        <div class="flex items-center justify-between text-[11px] font-mono">
                            <span class="px-2 py-0.5 rounded border font-bold uppercase ${badgeClass}">${item.who}</span>
                            <span class="text-muted">[T+${timeStr}]</span>
                        </div>
                        <div class="text-xs sm:text-sm text-alabaster font-serif leading-relaxed">${item.text}</div>
                    </div>
                `;
            }).join('');
        }

        function hideRadio() {
            const box = document.getElementById('radio-box');
            if (box) box.classList.remove('is-visible');
            if (typeof SoundFX !== 'undefined' && SoundFX.radio) {
                SoundFX.radio(true);
            }
        }

        function showRadio(who, text) {
            missionRadioLog.push({ time: Math.round(missionTime), who, text });
            const box = document.getElementById('radio-box');
            document.getElementById('radio-who').textContent = who;
            document.getElementById('radio-text').textContent = text;
            box.classList.remove('is-visible');
            void box.offsetWidth;
            box.classList.add('is-visible');
            clearTimeout(showRadio.timer);
            showRadio.timer = setTimeout(() => hideRadio(), 6500);
            if (typeof SoundFX !== 'undefined' && SoundFX.radio) {
                SoundFX.radio(false);
            }
            // Truyen tin tuc thoi, ngat loi cu de khong bi tre nhip voi hien thi tren man hinh
            if (who !== 'HỆ THỐNG') Voice.speak(who, text, true);
        }

        function onBomberDowned() {
            if (gameState !== 'PLAYING' || !activeMission) return;
            missionKills++;
            updateObjectiveHud();
            showKillSplash(activeMission, missionKills);
            if (missionKills >= activeMission.kills) {
                endMission(true);
            } else if (activeMission.lines.kill) {
                showRadio('TRẮC THỦ', `${activeMission.lines.kill} (${missionKills}/${activeMission.kills})`);
            }
        }

        let missionFailReason = '';
        function endMission(won, reason) {
            if (gameState !== 'PLAYING') return;
            gameState = 'ENDING';
            missionWon = won;
            missionFailReason = !won ? (reason || 'Tốp B-52 đã ra khỏi vùng hỏa lực.') : '';
            missionEndTimer = 3.5;
            const m = activeMission;
            if (won) {
                showRadio('SỞ CHỈ HUY', m.lines.win);
                const prog = loadProgress();
                prog.unlocked = Math.max(prog.unlocked, Math.min(MISSIONS.length, activeMissionIdx + 2));
                const prev = prog.best[m.id];
                const bestKills = prev ? Math.max(prev.kills || 0, missionKills) : missionKills;
                const bestShots = (!prev || missionKills > (prev.kills || 0)) ? missionShots : Math.min(prev.shots || missionShots, missionShots);
                const bestTime = prev && prev.time ? Math.min(prev.time, Math.round(missionTime)) : Math.round(missionTime);
                prog.best[m.id] = { kills: bestKills, shots: bestShots, time: bestTime };
                saveProgress(prog);
            } else {
                showRadio('SỞ CHỈ HUY', reason || 'Tốp B-52 đã ra khỏi vùng hỏa lực.');
            }
        }

        function showDebrief() {
            gameState = 'DEBRIEF';
            resetAutoPilotUI();
            const m = activeMission;
            const idx = activeMissionIdx;
            document.getElementById('debrief-date').textContent = `MÀN ${idx + 1} · ${m.dateLabel} · ${m.title}`;
            const res = document.getElementById('debrief-result');
            res.textContent = missionWon ? 'Hoàn thành nhiệm vụ' : 'Chưa hoàn thành';
            res.classList.toggle('is-fail', !missionWon);

            let rankBadge = '';
            const failAnalysisEl = document.getElementById('debrief-fail-analysis');
            if (missionWon) {
                let rankTitle = 'HOÀN THÀNH NHIỆM VỤ';
                let stars = '★';
                let rankQuote = 'Bộ Tư lệnh ghi nhận chiến công xuất sắc bảo vệ vững chắc vùng trời Thủ đô.';
                if (missionShots <= m.kills * 2 || (m.mode === 'MIG21' && missionKills >= 1)) {
                    rankTitle = 'DŨNG SĨ DIỆT MỸ // HUÂN CHƯƠNG CHIẾN CÔNG HẠNG NHẤT';
                    stars = '★ ★ ★';
                    rankQuote = 'Bắn rơi tại chỗ Pháo đài bay B-52, lập chiến công vẻ vang trong trang sử hào hùng.';
                } else if (missionShots <= m.kills * 3) {
                    rankTitle = 'CHIẾN SĨ THI ĐUA // HUÂN CHƯƠNG QUÂN CÔNG';
                    stars = '★ ★';
                    rankQuote = 'Đánh trúng đội hình địch, kiên cường giữ vững trận địa.';
                }
                rankBadge = `
                    <div class="medal-hero-card">
                        <div class="flex items-center gap-3">
                            <div class="medal-badge" style="margin-bottom:0"><span>${stars}</span> ${rankTitle}</div>
                        </div>
                        <div class="text-xs text-amber-200/80 font-serif italic max-w-sm text-right hidden sm:block">
                            “${rankQuote}”
                        </div>
                    </div>
                `;
                if (failAnalysisEl) failAnalysisEl.innerHTML = '';
            } else {
                rankBadge = `
                    <div class="medal-hero-card is-fail">
                        <div class="medal-badge is-fail" style="margin-bottom:0">
                            <span class="font-mono text-rose-400 mr-1.5">[!]</span> RÚT KINH NGHIỆM CHIẾN ĐẤU — QUYẾT TÂM ĐÁNH LẠI
                        </div>
                        <div class="text-xs text-rose-300/80 font-mono text-right hidden sm:block">
                            TIẾP TỤC RÈN LUYỆN Ý CHÍ &amp; BẢN LĨNH
                        </div>
                    </div>
                `;
                let tacticalTip = '';
                if (missionFailReason.includes('Hết đạn') || missionFailReason.includes('K-13')) {
                    tacticalTip = m.mode === 'MIG21'
                        ? 'Tiết kiệm 2 quả tên lửa K-13. Tiếp cận góc đuôi ±35 độ, cự ly 1.5–3 km. Chờ đèn đỏ ЗАХВАТ sáng hẳn và tiếng rít đầu dò ổn định rồi mới phóng!'
                        : 'Hãy kiên nhẫn bám chắc mục tiêu bằng phương pháp Ba điểm (TT). Chỉ phóng khi chất lượng bám đạt trên 60%. Khi đạn áp sát B-52 (<65m), bấm Space kích nổ mảnh để đảm bảo tiêu diệt!';
                } else if (missionFailReason.includes('Hết thời gian') || missionFailReason.includes('thoát')) {
                    tacticalTip = 'Khẩn trương phát hiện mục tiêu từ xa. Khi radar SNR-75 bị bão nhiễu ALQ, bấm ngay Q / E để nhảy tần ra khỏi vùng đỉnh nhiễu đỏ, đón lõng đường bay B-52!';
                } else if (missionFailReason.includes('Mất mục tiêu')) {
                    tacticalTip = 'Giữ phím W tăng ga (trên 85% bật tăng lực Afterburner) để đuổi kịp tốp B-52, kết hợp chuột lái theo vệt khói và luồng phụt sáng động cơ của địch!';
                } else {
                    tacticalTip = 'Nắm vững nghệ thuật tác chiến: Vạch nhiễu tìm thù, chọn đúng thời cơ phóng đón và tập trung hỏa lực vào tốp mục tiêu nguy hiểm nhất!';
                }
                if (failAnalysisEl) {
                    failAnalysisEl.innerHTML = `
                        <div class="debrief-fail-box p-3.5 bg-red-950/40 border border-red-500/50 rounded-lg text-left my-2 space-y-1.5 shadow-md">
                            <div class="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
                                <span class="font-mono text-rose-400 mr-1.5">[!]</span> NGUYÊN NHÂN CHƯA HOÀN THÀNH:
                                <span class="text-alabaster font-semibold">${missionFailReason}</span>
                            </div>
                            <div class="text-xs text-amber-200/90 font-serif leading-relaxed">
                                <b>Chỉ đạo tác chiến của Bộ Tư lệnh:</b> ${tacticalTip}
                            </div>
                        </div>
                    `;
                }
            }

            const hitRatio = missionShots > 0 ? Math.min(100, Math.round((missionKills / missionShots) * 100)) : 0;

            const statCards = [
                ['B-52 bắn rơi', `${missionKills}/${m.kills}`, 'val-accent'],
                ['Đạn đã dùng', `${missionShots}/${m.ammo}`, 'val-muted'],
                ['Hiệu suất trúng', `${hitRatio}%`, 'val-accent'],
                ['Thời gian tác chiến', formatMMSS(missionTime), 'val-muted']
            ].map(([k, v, cls]) => `
                <div class="stat-kpi-card">
                    <span>${k}</span>
                    <b class="${cls}">${v}</b>
                </div>
            `).join('');

            document.getElementById('debrief-stats').innerHTML = `${rankBadge}${statCards}`;
            document.getElementById('debrief-history').innerHTML = m.history.map(p => `<p>${p}</p>`).join('');

            const isLast = idx === MISSIONS.length - 1;
            let primaryBtnHtml = '';
            if (missionWon && !isLast) {
                primaryBtnHtml = `<button class="menu-btn debrief-btn primary" onclick="openBriefing(${idx + 1})">
                    <span>Đêm tiếp theo: ${MISSIONS[idx + 1].dateLabel} →</span>
                    <span class="key-badge">Space / Enter</span>
                </button>`;
            } else if (missionWon && isLast) {
                primaryBtnHtml = `<button class="menu-btn debrief-btn primary" style="background:#D97706;border-color:#F59E0B;color:#000;font-weight:700;box-shadow:0 0 25px rgba(245,158,11,0.6);" onclick="showVictoryEpilogue()">
                    <span>★ ĐẠI THẮNG ĐIỆN BIÊN PHỦ TRÊN KHÔNG ★</span>
                    <span class="key-badge">Enter</span>
                </button>`;
            } else {
                primaryBtnHtml = `<button class="menu-btn debrief-btn primary" onclick="openBriefing(${idx})">
                    <span>Đánh lại đêm này</span>
                    <span class="key-badge">Space / R</span>
                </button>`;
            }

            const replayBtnHtml = missionWon ? `
                <button class="menu-btn debrief-btn secondary" onclick="openBriefing(${idx})">
                    <span>Đánh lại đêm này</span>
                    <span class="key-badge">R</span>
                </button>
            ` : '';

            const utilityButtons = `
                <div class="debrief-actions-group-secondary">
                    <button class="menu-btn debrief-btn utility" onclick="toggleRadioLog(true)" title="Xem toàn bộ điện văn liên lạc chiến đấu">
                        <span>Nhật ký đài [L]</span>
                        <span class="key-badge">L</span>
                    </button>
                    <button class="menu-btn debrief-btn utility" onclick="toggleTacticalGuide(true)" title="Cẩm nang tác chiến B-52">
                        <span>Cẩm nang [H]</span>
                        <span class="key-badge">H</span>
                    </button>
                    <button class="menu-btn debrief-btn utility" onclick="backToMenuAttract(); showScreen('campaign')" title="Bản đồ 12 ngày đêm chiến dịch">
                        <span>Bản đồ tác chiến</span>
                        <span class="key-badge">M</span>
                    </button>
                    <button class="menu-btn debrief-btn utility" onclick="backToMenuAttract(); showScreen('menu')" title="Về màn hình chính">
                        <span>Menu chính</span>
                        <span class="key-badge">Esc</span>
                    </button>
                </div>
            `;

            document.getElementById('debrief-actions').innerHTML = `
                <div class="debrief-actions-group-primary">
                    ${primaryBtnHtml}
                    ${replayBtnHtml}
                </div>
                ${utilityButtons}
            `;
            showScreen('debrief');
        }

        function showVictoryEpilogue() {
            SoundFX.fanfare();
            if (typeof SoundFX.salvo === 'function') SoundFX.salvo();
            const prog = loadProgress();
            let totalKills = 0, totalShots = 0;
            Object.values(prog.best || {}).forEach(b => {
                totalKills += (b.kills || 0);
                totalShots += (b.shots || 0);
            });
            const completed = Object.keys(prog.best || {}).length;
            const text = `Đã hoàn thành ${completed}/${MISSIONS.length} đêm chiến dịch (12/12 đêm toàn thắng) · Bắn hạ ${totalKills} B-52 · Cơ số tiêu hao: ${totalShots} đạn`;
            ['victory-player-stats', 'victory-stats', 'victory-stats-detail'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = text;
            });
            const vicEl = document.getElementById('screen-victory');
            if (vicEl && (!vicEl.innerHTML || !vicEl.innerHTML.includes('34'))) {
                vicEl.innerHTML = `
                    <div class="kicker text-amber-400 font-bold tracking-widest text-sm">CHIẾN DỊCH PHÒNG KHÔNG HÀ NỘI 18/12 – 29/12/1972</div>
                    <h1 class="screen-title text-amber-300 text-3xl sm:text-5xl">KỲ TÍCH ĐIỆN BIÊN PHỦ TRÊN KHÔNG</h1>
                    <div class="my-5 p-6 bg-black/80 border border-amber-400/40 rounded-xl space-y-4 text-left">
                        <p class="font-serif text-lg leading-relaxed text-alabaster">
                            Trải qua <b>12 ngày đêm chiến đấu ngoan cường</b>, quân và dân ta đã bắn hạ <b>34 chiếc B-52</b> (16 chiếc rơi tại chỗ) và tổng cộng <b>81 máy bay</b> các loại của Không quân Mỹ.
                        </p>
                    </div>
                    <div class="victory-player-stats text-alabaster font-mono text-sm">${text}</div>
                `;
            }
            showScreen('victory');
        }

        function pauseMission() {
            if (gameState !== 'PLAYING') return;
            gamePaused = true;
            if (typeof Voice !== 'undefined' && Voice.currentAudio && !Voice.currentAudio.paused) {
                try { Voice.currentAudio.pause(); Voice._wasPlayingOnPause = true; } catch(e) {}
            }
            if ('speechSynthesis' in window) speechSynthesis.pause();
            document.getElementById('pause-objective').textContent =
                `${activeMission.dateLabel} — ${activeMission.title}: đã hạ ${missionKills}/${activeMission.kills} B-52, còn ${missionAmmo} đạn, ${formatMMSS(activeMission.timeLimit - missionTime)}`;
            showScreen('pause');
        }
        function resumeMission() {
            gamePaused = false;
            if (typeof Voice !== 'undefined' && Voice.currentAudio && Voice._wasPlayingOnPause) {
                try { Voice.currentAudio.play(); } catch(e) {}
                Voice._wasPlayingOnPause = false;
            }
            if ('speechSynthesis' in window) speechSynthesis.resume();
            showScreen(null);
        }
        function restartMission() {
            showScreen(null);
            openBriefing(activeMissionIdx);
        }
        function quitToMenu() {
            backToMenuAttract();
        }

        function enterHangar() {
            SoundEngine.init();
            gameState = 'HANGAR';
            showScreen(null);
            document.body.classList.add('in-menu');
            switchSimMode('HANGAR');
        }
        function leaveHangar() {
            backToMenuAttract();
        }

        // Per-frame mission logic (dt already 0 while paused)
        function updateMission(dt) {
            if (gameState === 'ENDING') {
                missionEndTimer -= dt;
                if (missionEndTimer <= 0 && !guidedMissile && missileCamHold <= 0) showDebrief();
                return;
            }
            if (gameState !== 'PLAYING' || !activeMission) return;
            const m = activeMission;
            missionTime += dt;

            while (missionRadioIdx < m.radio.length) {
                const nextItem = m.radio[missionRadioIdx];
                const at = nextItem.at !== undefined ? nextItem.at : nextItem.t;
                if (missionTime < at) break;
                missionRadioIdx++;
                const who = nextItem.who !== undefined ? nextItem.who : nextItem.sender;
                showRadio(who, nextItem.text);
            }

            while (missionWaveIdx < m.waves.length && missionTime >= m.waves[missionWaveIdx]) {
                missionWaveIdx++;
                if (m.mode === 'MIG21') spawnB52Cell({ x: 0, y: 410, z: 0, dir: new THREE.Vector3(0, 0, -1), speed: 9 });
                else spawnB52Cell({ chaff: !!(m.jam && m.jam.chaff) });
            }

            updateObjectiveHud();
            const allIn = missionWaveIdx >= m.waves.length;
            if (missionTime >= m.timeLimit) {
                endMission(false, 'Hết thời gian — các tốp B-52 đã ra khỏi vùng hỏa lực.');
            } else if (m.mode === 'MIG21') {
                if (missionAmmo <= 0 && (!mig.cannonAmmo || mig.cannonAmmo <= 0) && !activeMissiles.length) endMission(false, 'Đã hết toàn bộ tên lửa K-13 và đạn pháo 23mm.');
                else if (mig.target && mig.dist > 1200) endMission(false, 'Mất mục tiêu — tốp B-52 đã bỏ xa.');
            } else {
                const noAmmo = !samLaunchers.some(l => l.loaded) && missionReserve <= 0 && !reloadingLauncher && !activeMissiles.length;
                if (noAmmo) endMission(false, 'Hết đạn! Các tốp B-52 còn lại đã thoát.');
                else if (allIn && !activeBombers.length && !activeMissiles.length) {
                    endMission(false, 'Các tốp B-52 đã cắt bom và ra khỏi vùng hỏa lực.');
                }
            }
        }

        window.onload = async function () {
            await loadOptionalGLBModels();
            init3DEngine();
            showArchiveNight('night-node-1');
            document.body.classList.add('in-menu');
            backToMenuAttract();
            renderMenuProgress();
            requestAnimationFrame(animateLoop);

            const handleUserGesture = () => {
                if (typeof SoundEngine !== 'undefined') SoundEngine.unlock();
            };
            ['click', 'keydown', 'pointerdown', 'touchstart'].forEach(evt => {
                window.addEventListener(evt, handleUserGesture, { passive: true });
            });

            document.addEventListener('click', (e) => {
                handleUserGesture();
                const btn = e.target.closest('.menu-btn, .tool-btn, .mission-card, .timeline-node, .btn-secondary, .archive-tab, button');
                if (btn && !btn.disabled) {
                    SoundFX.click();
                }
            });
        };
        function resetAutoPilotUI() {
            autoPilotActive = false;
            const btn = document.getElementById('btn-auto-pilot');
            if (btn) {
                btn.classList.remove('is-active');
                btn.innerHTML = 'Tự động: TẮT<kbd>P</kbd>';
            }
        }

