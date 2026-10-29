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

                // 1b. Authentic SAC SEA Vietnam Camouflage + USAF Roundels + Stencils + Wing Walkways for B-52
                const makeB52CamoSkin = () => {
                    const c = document.createElement('canvas');
                    c.width = 1024;
                    c.height = 1024;
                    const ctx = c.getContext ? c.getContext('2d') : null;
                    if (!ctx) return new THREE.CanvasTexture(c);

                    // Base coat: SAC Olive Drab
                    ctx.fillStyle = '#2A3623';
                    ctx.fillRect(0, 0, 1024, 1024);

                    // Organic disruptive camo patches: Field Drab Tan (#4F4331) & Dark Forest Green (#1B2517)
                    ctx.fillStyle = '#4F4331';
                    ctx.beginPath();
                    ctx.moveTo(0, 70);
                    ctx.bezierCurveTo(220, 30, 360, 190, 560, 130);
                    ctx.bezierCurveTo(720, 80, 870, 250, 1024, 200);
                    ctx.lineTo(1024, 450);
                    ctx.bezierCurveTo(840, 480, 700, 370, 510, 420);
                    ctx.bezierCurveTo(330, 470, 180, 330, 0, 380);
                    ctx.closePath();
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(100, 590);
                    ctx.bezierCurveTo(280, 530, 430, 710, 670, 650);
                    ctx.bezierCurveTo(850, 600, 940, 790, 1024, 750);
                    ctx.lineTo(1024, 980);
                    ctx.bezierCurveTo(790, 930, 640, 830, 450, 880);
                    ctx.bezierCurveTo(270, 930, 140, 810, 0, 850);
                    ctx.lineTo(0, 710);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = '#1B2517';
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(330, 0);
                    ctx.bezierCurveTo(380, 130, 240, 270, 310, 370);
                    ctx.bezierCurveTo(200, 450, 70, 310, 0, 350);
                    ctx.closePath();
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(670, 0);
                    ctx.lineTo(1024, 0);
                    ctx.lineTo(1024, 170);
                    ctx.bezierCurveTo(880, 140, 790, 300, 650, 250);
                    ctx.bezierCurveTo(560, 210, 610, 70, 670, 0);
                    ctx.closePath();
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(370, 410);
                    ctx.bezierCurveTo(510, 390, 630, 510, 770, 470);
                    ctx.bezierCurveTo(870, 440, 950, 550, 1024, 520);
                    ctx.lineTo(1024, 680);
                    ctx.bezierCurveTo(850, 710, 730, 600, 570, 630);
                    ctx.bezierCurveTo(410, 660, 310, 540, 230, 570);
                    ctx.closePath();
                    ctx.fill();

                    // Subtle metallic sheen gradient
                    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
                    grad.addColorStop(0, 'rgba(255,255,255,0.08)');
                    grad.addColorStop(0.5, 'rgba(0,0,0,0.12)');
                    grad.addColorStop(1, 'rgba(255,255,255,0.05)');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, 1024, 1024);

                    // Panel seams & rivet lines
                    ctx.strokeStyle = 'rgba(10, 14, 12, 0.55)';
                    ctx.lineWidth = 2;
                    for (let x = 64; x < 1024; x += 64) {
                        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke();
                    }
                    for (let y = 64; y < 1024; y += 80) {
                        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
                    }

                    // Rivet dots
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
                    for (let x = 64; x < 1024; x += 128) {
                        for (let y = 8; y < 1024; y += 16) {
                            ctx.fillRect(x - 1, y - 1, 2, 2);
                        }
                    }

                    // Dashed Wing Walkways & "NO STEP" / "WALKWAY" stencils
                    ctx.strokeStyle = 'rgba(12, 14, 16, 0.85)';
                    ctx.lineWidth = 3;
                    if (ctx.setLineDash) ctx.setLineDash([12, 8]);
                    ctx.strokeRect(96, 110, 380, 260);
                    ctx.strokeRect(548, 110, 380, 260);
                    if (ctx.setLineDash) ctx.setLineDash([]);

                    ctx.fillStyle = 'rgba(15, 18, 20, 0.75)';
                    ctx.font = 'bold 13px "JetBrains Mono", monospace';
                    ctx.fillText('NO STEP', 110, 132);
                    ctx.fillText('WALKWAY', 360, 132);
                    ctx.fillText('NO STEP', 562, 132);
                    ctx.fillText('WALKWAY', 812, 132);

                    // USAF Star-and-Bar Roundel on wings
                    const drawUSAFRoundel = (cx, cy, r) => {
                        ctx.save();
                        ctx.translate(cx, cy);

                        // Insignia Blue circle
                        ctx.fillStyle = '#0F275A';
                        ctx.beginPath();
                        ctx.arc(0, 0, r, 0, Math.PI * 2);
                        ctx.fill();

                        // Side bars
                        const bw = r * 1.5;
                        const bh = r * 0.48;
                        ctx.fillStyle = '#F8FAFC';
                        ctx.fillRect(-bw - r * 0.4, -bh / 2, bw * 2 + r * 0.8, bh);

                        // Blue border
                        ctx.strokeStyle = '#0F275A';
                        ctx.lineWidth = r * 0.08;
                        ctx.strokeRect(-bw - r * 0.4, -bh / 2, bw * 2 + r * 0.8, bh);

                        // Red horizontal stripe
                        ctx.fillStyle = '#BA1B1D';
                        const rh = bh * 0.32;
                        ctx.fillRect(-bw - r * 0.4, -rh / 2, bw * 2 + r * 0.8, rh);

                        // Circle core
                        ctx.fillStyle = '#0F275A';
                        ctx.beginPath();
                        ctx.arc(0, 0, r, 0, Math.PI * 2);
                        ctx.fill();

                        // White 5-pointed star
                        ctx.fillStyle = '#FFFFFF';
                        ctx.beginPath();
                        for (let s = 0; s < 5; s++) {
                            const a1 = (s * 72 - 90) * Math.PI / 180;
                            const a2 = ((s * 72 + 36) - 90) * Math.PI / 180;
                            ctx.lineTo(Math.cos(a1) * r * 0.88, Math.sin(a1) * r * 0.88);
                            ctx.lineTo(Math.cos(a2) * r * 0.35, Math.sin(a2) * r * 0.35);
                        }
                        ctx.closePath();
                        ctx.fill();

                        ctx.restore();
                    };

                    drawUSAFRoundel(280, 240, 46);
                    drawUSAFRoundel(740, 240, 46);

                    // SAC Stencils & Serial Number
                    ctx.fillStyle = '#CBD5E1';
                    ctx.font = 'bold 24px "JetBrains Mono", monospace';
                    ctx.fillText('U.S. AIR FORCE', 130, 470);
                    ctx.fillText('U.S. AIR FORCE', 590, 470);

                    ctx.fillStyle = '#F59E0B';
                    ctx.font = 'bold 20px "JetBrains Mono", monospace';
                    ctx.fillText('AF 56-676', 190, 508);
                    ctx.fillText('AF 56-676', 650, 508);

                    // Aerial Refueling Receptacle Guide Marking (Chevron)
                    ctx.strokeStyle = '#FACC15';
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.moveTo(512 - 36, 75);
                    ctx.lineTo(512, 35);
                    ctx.lineTo(512 + 36, 75);
                    ctx.stroke();

                    // Engine exhaust soot weathering
                    const sootGrad = ctx.createLinearGradient(0, 450, 0, 750);
                    sootGrad.addColorStop(0, 'rgba(10, 12, 14, 0)');
                    sootGrad.addColorStop(0.5, 'rgba(12, 14, 16, 0.42)');
                    sootGrad.addColorStop(1, 'rgba(12, 14, 16, 0)');
                    ctx.fillStyle = sootGrad;
                    ctx.fillRect(180, 450, 160, 300);
                    ctx.fillRect(360, 450, 160, 300);
                    ctx.fillRect(520, 450, 160, 300);
                    ctx.fillRect(700, 450, 160, 300);

                    const tex = new THREE.CanvasTexture(c);
                    tex.anisotropy = 4;
                    return tex;
                };

                // 1c. Satin Night Black Underbelly + Bomb Bay Doors & Hinges
                const makeB52BellySkin = () => {
                    const c = document.createElement('canvas');
                    c.width = 512;
                    c.height = 512;
                    const ctx = c.getContext ? c.getContext('2d') : null;
                    if (!ctx) return new THREE.CanvasTexture(c);

                    // Night Black base
                    ctx.fillStyle = '#111417';
                    ctx.fillRect(0, 0, 512, 512);

                    const grad = ctx.createLinearGradient(0, 0, 512, 512);
                    grad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
                    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.15)');
                    grad.addColorStop(1, 'rgba(255, 255, 255, 0.03)');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, 512, 512);

                    // Panel seams
                    ctx.strokeStyle = '#080A0D';
                    ctx.lineWidth = 2;
                    for (let y = 32; y < 512; y += 48) {
                        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
                    }

                    // Bomb bay door outline & center split line
                    ctx.strokeStyle = '#040608';
                    ctx.lineWidth = 4;
                    ctx.strokeRect(128, 40, 256, 432);
                    ctx.beginPath(); ctx.moveTo(256, 40); ctx.lineTo(256, 472); ctx.stroke();

                    // Red warning markers & hinge points
                    ctx.fillStyle = 'rgba(220, 38, 38, 0.55)';
                    [60, 250, 440].forEach(hy => {
                        ctx.fillRect(132, hy, 14, 7);
                        ctx.fillRect(366, hy, 14, 7);
                    });

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

                // 1d. Authentic MiG-21bis Duralumin Skin + Panel Lines + Titanium Shroud + Markings
                const makeMiGFuselageTexture = () => {
                    const c = document.createElement('canvas');
                    c.width = 1024;
                    c.height = 1024;
                    const ctx = c.getContext ? c.getContext('2d') : null;
                    if (!ctx) return new THREE.CanvasTexture(c);

                    // Base Soviet Duralumin metallic gradient
                    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
                    grad.addColorStop(0, '#DDE3EA');
                    grad.addColorStop(0.35, '#C8D1DC');
                    grad.addColorStop(0.7, '#D4DCE6');
                    grad.addColorStop(1, '#BAC4D0');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, 1024, 1024);

                    // Longitudinal panel seams & circumferential bulkhead frames
                    ctx.lineWidth = 1.8;
                    for (let y = 32; y < 1024; y += 48) {
                        ctx.strokeStyle = '#64748B';
                        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
                        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
                        ctx.beginPath(); ctx.moveTo(0, y + 1.5); ctx.lineTo(1024, y + 1.5); ctx.stroke();
                    }
                    for (let x = 64; x < 1024; x += 80) {
                        ctx.strokeStyle = '#64748B';
                        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke();
                        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
                        ctx.beginPath(); ctx.moveTo(x + 1.5, 0); ctx.lineTo(x + 1.5, 1024); ctx.stroke();
                    }

                    // Flush rivet rows along seams
                    ctx.fillStyle = '#475569';
                    for (let x = 64; x < 1024; x += 80) {
                        for (let y = 16; y < 1024; y += 16) {
                            ctx.fillRect(x - 1, y, 2, 2);
                        }
                    }

                    // Rear engine bay titanium heat shield (normZ < 0.22 -> y < 225)
                    const heatGrad = ctx.createLinearGradient(0, 0, 0, 225);
                    heatGrad.addColorStop(0, '#2D323E');
                    heatGrad.addColorStop(0.4, '#3F4656');
                    heatGrad.addColorStop(0.75, '#4B5565');
                    heatGrad.addColorStop(1, '#5B677A');
                    ctx.fillStyle = heatGrad;
                    ctx.fillRect(0, 0, 1024, 225);

                    // Titanium heat-tint discoloration bands
                    const tintGrad = ctx.createLinearGradient(0, 60, 0, 180);
                    tintGrad.addColorStop(0, 'rgba(124, 58, 237, 0.25)'); // violet
                    tintGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.25)'); // bronze
                    tintGrad.addColorStop(1, 'rgba(37, 99, 235, 0.2)');   // blue
                    ctx.fillStyle = tintGrad;
                    ctx.fillRect(0, 60, 1024, 120);

                    // Heavy rivet bands on titanium shroud
                    ctx.fillStyle = '#1E293B';
                    for (let y = 20; y < 220; y += 24) {
                        for (let x = 8; x < 1024; x += 16) {
                            ctx.fillRect(x, y, 2, 2);
                        }
                    }

                    // Inspection hatches & service stencils
                    ctx.strokeStyle = '#475569';
                    ctx.fillStyle = 'rgba(255,255,255,0.08)';
                    [320, 520, 720].forEach(hx => {
                        ctx.strokeRect(hx, 400, 54, 38);
                        ctx.fillRect(hx, 400, 54, 38);
                    });

                    // Red warning stencils
                    ctx.fillStyle = '#EF4444';
                    ctx.font = 'bold 18px monospace';
                    ctx.fillText('ОПАСНО', 820, 520);
                    ctx.fillText('НЕ СТАНОВИТЬСЯ', 450, 310);

                    const tex = new THREE.CanvasTexture(c);
                    tex.anisotropy = 4;
                    return tex;
                };

                const makeMiGWingTexture = () => {
                    const c = document.createElement('canvas');
                    c.width = 1024;
                    c.height = 1024;
                    const ctx = c.getContext ? c.getContext('2d') : null;
                    if (!ctx) return new THREE.CanvasTexture(c);

                    // Base metallic duralumin gradient along chord (0=LE, 1024=TE)
                    const grad = ctx.createLinearGradient(0, 0, 1024, 0);
                    grad.addColorStop(0, '#E2E8F0');
                    grad.addColorStop(0.35, '#CBD5E1');
                    grad.addColorStop(0.70, '#D8DFE8');
                    grad.addColorStop(1, '#94A3B8');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, 1024, 1024);

                    // Spanwise spars (vertical lines: main spar @ 360, flap spar @ 720)
                    ctx.lineWidth = 2.0;
                    [360, 720].forEach(sx => {
                        ctx.strokeStyle = '#64748B';
                        ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, 1024); ctx.stroke();
                        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
                        ctx.beginPath(); ctx.moveTo(sx + 1.5, 0); ctx.lineTo(sx + 1.5, 1024); ctx.stroke();
                    });

                    // Flap / Aileron divider at mid-span
                    ctx.strokeStyle = '#475569';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath(); ctx.moveTo(720, 512); ctx.lineTo(1024, 512); ctx.stroke();

                    // Chordwise rib seams (horizontal lines along chord)
                    ctx.strokeStyle = '#64748B';
                    ctx.lineWidth = 1.4;
                    for (let y = 80; y < 1024; y += 96) {
                        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
                    }

                    // Flush rivet rows along seams
                    ctx.fillStyle = '#475569';
                    for (let y = 80; y < 1024; y += 96) {
                        for (let x = 24; x < 1000; x += 32) {
                            ctx.fillRect(x, y - 1, 2, 2);
                        }
                    }
                    for (let x = 360; x <= 720; x += 360) {
                        for (let y = 16; y < 1024; y += 24) {
                            ctx.fillRect(x - 1, y, 2, 2);
                        }
                    }

                    // Red dashed walkway border lines near root
                    ctx.strokeStyle = '#DC2626';
                    ctx.lineWidth = 2.5;
                    if (ctx.setLineDash) ctx.setLineDash([12, 8]);
                    ctx.strokeRect(180, 50, 480, 240);
                    if (ctx.setLineDash) ctx.setLineDash([]);
                    ctx.fillStyle = '#DC2626';
                    ctx.font = 'bold 18px monospace';
                    ctx.fillText('НЕ СТАНОВИТЬСЯ // NO STEP', 210, 85);

                    // Authentic VPAF National Roundel baked flush on the wing skin
                    ctx.save();
                    ctx.translate(520, 600);
                    ctx.fillStyle = '#DC2626';
                    ctx.beginPath(); ctx.arc(0, 0, 135, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 16; ctx.stroke();
                    ctx.strokeStyle = '#B91C1C';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath(); ctx.arc(0, 0, 143, 0, Math.PI * 2); ctx.stroke();
                    ctx.fillStyle = '#FACC15';
                    ctx.beginPath();
                    for (let s = 0; s < 5; s++) {
                        const a1 = (s * 72 - 90) * Math.PI / 180;
                        const a2 = ((s * 72 + 36) - 90) * Math.PI / 180;
                        ctx.lineTo(Math.cos(a1) * 110, Math.sin(a1) * 110);
                        ctx.lineTo(Math.cos(a2) * 44, Math.sin(a2) * 44);
                    }
                    ctx.closePath(); ctx.fill();
                    ctx.restore();

                    const tex = new THREE.CanvasTexture(c);
                    tex.anisotropy = 4;
                    return tex;
                };

                const makeVPAFDecalTexture = (type) => {
                    const c = document.createElement('canvas');
                    const ctx = c.getContext ? c.getContext('2d') : null;
                    if (!ctx) return new THREE.CanvasTexture(c);

                    if (type === 'roundel') {
                        c.width = c.height = 256;
                        ctx.save();
                        ctx.translate(128, 128);
                        ctx.fillStyle = '#DC2626';
                        ctx.beginPath();
                        ctx.arc(0, 0, 116, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.lineWidth = 14;
                        ctx.stroke();
                        ctx.strokeStyle = '#B91C1C';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(0, 0, 123, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.fillStyle = '#FACC15';
                        ctx.beginPath();
                        for (let s = 0; s < 5; s++) {
                            const a1 = (s * 72 - 90) * Math.PI / 180;
                            const a2 = ((s * 72 + 36) - 90) * Math.PI / 180;
                            ctx.lineTo(Math.cos(a1) * 94, Math.sin(a1) * 94);
                            ctx.lineTo(Math.cos(a2) * 38, Math.sin(a2) * 38);
                        }
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    } else if (type === 'port5121') {
                        c.width = 512;
                        c.height = 256;
                        ctx.fillStyle = '#DC2626';
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.lineWidth = 4;
                        ctx.font = 'bold 92px "JetBrains Mono", monospace';
                        ctx.strokeText('5121', 40, 110);
                        ctx.fillText('5121', 40, 110);
                        for (let k = 0; k < 5; k++) {
                            ctx.save();
                            ctx.translate(56 + k * 84, 185);
                            ctx.fillStyle = '#DC2626';
                            ctx.strokeStyle = '#FACC15';
                            ctx.lineWidth = 2.5;
                            ctx.beginPath();
                            for (let s = 0; s < 5; s++) {
                                const a1 = (s * 72 - 90) * Math.PI / 180;
                                const a2 = ((s * 72 + 36) - 90) * Math.PI / 180;
                                ctx.lineTo(Math.cos(a1) * 28, Math.sin(a1) * 28);
                                ctx.lineTo(Math.cos(a2) * 11, Math.sin(a2) * 11);
                            }
                            ctx.closePath();
                            ctx.fill();
                            ctx.stroke();
                            ctx.restore();
                        }
                    } else if (type === 'stbd5121') {
                        c.width = 512;
                        c.height = 256;
                        ctx.fillStyle = '#DC2626';
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.lineWidth = 4;
                        ctx.font = 'bold 92px "JetBrains Mono", monospace';
                        ctx.strokeText('5121', 40, 140);
                        ctx.fillText('5121', 40, 140);
                    }
                    const tex = new THREE.CanvasTexture(c);
                    tex.anisotropy = 4;
                    return tex;
                };

                this.textures.migFuselageSkin = makeMiGFuselageTexture();
                this.textures.migWingSkin = makeMiGWingTexture();
                this.textures.vpafRoundel = makeVPAFDecalTexture('roundel');
                this.textures.mig5121Port = makeVPAFDecalTexture('port5121');
                this.textures.mig5121Stbd = makeVPAFDecalTexture('stbd5121');
                this.textures.migPolishedAlum = this.textures.migFuselageSkin;
                this.textures.migStarWing = this.textures.migWingSkin;
                this.textures.b52Camo = makeB52CamoSkin();
                this.textures.b52Belly = makeB52BellySkin();
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

                // 4. Stenciled Soviet SNR-75 "Fan Song" Radar Cabin & Perforated Mesh Reflectors
                const makeRadarTextures = () => {
                    const c = document.createElement('canvas');
                    c.width = 512;
                    c.height = 512;
                    const ctx = c.getContext('2d');
                    ctx.fillStyle = '#2C3829';
                    ctx.fillRect(0, 0, 512, 512);

                    ctx.strokeStyle = '#1D251C';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(8, 8, 496, 496);
                    ctx.beginPath(); ctx.moveTo(256, 8); ctx.lineTo(256, 504); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(8, 256); ctx.lineTo(504, 256); ctx.stroke();

                    // Louvers
                    ctx.fillStyle = '#182017';
                    for (let y = 60; y < 190; y += 12) {
                        ctx.fillRect(40, y, 160, 6);
                    }
                    ctx.strokeStyle = '#3C4D39';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(36, 54, 168, 144);

                    // Stencils
                    ctx.fillStyle = '#E5E7EB';
                    ctx.font = 'bold 22px monospace';
                    ctx.fillText('СНР-75 ДВИНА', 260, 80);
                    ctx.font = 'bold 16px monospace';
                    ctx.fillStyle = '#A7F3D0';
                    ctx.fillText('ĐÀI RADAR 291', 260, 115);
                    ctx.fillStyle = '#CBD5E1';
                    ctx.fillText('TẦN SỐ: 2900-3100 MHz', 260, 140);
                    ctx.fillText('TIỂU ĐOÀN 77', 260, 165);

                    // Hazard symbol
                    ctx.fillStyle = '#EF4444';
                    ctx.beginPath();
                    ctx.moveTo(380, 290); ctx.lineTo(430, 380); ctx.lineTo(330, 380); ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = '#FDE047';
                    ctx.lineWidth = 4;
                    ctx.stroke();
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = 'bold 28px monospace';
                    ctx.fillText('!', 374, 370);

                    // Dish perforated grid
                    const cDish = document.createElement('canvas');
                    cDish.width = 256;
                    cDish.height = 256;
                    const dCtx = cDish.getContext('2d');
                    dCtx.fillStyle = '#5A6572';
                    dCtx.fillRect(0, 0, 256, 256);
                    dCtx.strokeStyle = '#3A424C';
                    dCtx.lineWidth = 1.5;
                    for (let i = 0; i <= 256; i += 16) {
                        dCtx.beginPath(); dCtx.moveTo(0, i); dCtx.lineTo(256, i); dCtx.stroke();
                        dCtx.beginPath(); dCtx.moveTo(i, 0); dCtx.lineTo(i, 256); dCtx.stroke();
                    }
                    for (let r = 24; r < 128; r += 26) {
                        dCtx.beginPath(); dCtx.arc(128, 128, r, 0, Math.PI * 2); dCtx.stroke();
                    }

                    return {
                        cabinTex: new THREE.CanvasTexture(c),
                        dishTex: new THREE.CanvasTexture(cDish)
                    };
                };
                const radarTex = makeRadarTextures();
                this.textures.radarCabin = radarTex.cabinTex;
                this.textures.radarDish = radarTex.dishTex;

                // 5. Stenciled Soviet/VPAF SM-63 SAM-2 Launcher Textures & Tread Plate
                const makeLauncherTextures = () => {
                    const c = document.createElement('canvas');
                    c.width = 512;
                    c.height = 256;
                    const ctx = c.getContext('2d');
                    ctx.fillStyle = '#2C3A28';
                    ctx.fillRect(0, 0, 512, 256);

                    // Weathered metal gradient & panel seams
                    ctx.strokeStyle = '#1B2418';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(6, 6, 500, 244);
                    ctx.beginPath(); ctx.moveTo(256, 6); ctx.lineTo(256, 250); ctx.stroke();
                    for (let x = 32; x < 512; x += 64) {
                        ctx.fillStyle = '#1A2218';
                        ctx.fillRect(x - 2, 8, 4, 4);
                        ctx.fillRect(x - 2, 244, 4, 4);
                    }

                    // Stencils
                    ctx.fillStyle = '#E2E8F0';
                    ctx.font = 'bold 22px monospace';
                    ctx.fillText('ПУ СМ-63 // S-75 ĐVINA', 20, 48);
                    ctx.font = 'bold 15px monospace';
                    ctx.fillStyle = '#A7F3D0';
                    ctx.fillText('TIỂU ĐOÀN 78 · BỆ PHÓNG #03', 20, 80);
                    ctx.fillStyle = '#CBD5E1';
                    ctx.fillText('ĐIỆN ÁP: 220V / 400Hz · P = 150 atm', 20, 108);

                    // Hazard warning box
                    ctx.fillStyle = '#DC2626';
                    ctx.fillRect(20, 130, 220, 36);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = 'bold 14px monospace';
                    ctx.fillText('ОПАСНО ПРИ ПУСКЕ!', 28, 154);

                    // Red tactical star
                    ctx.save();
                    ctx.translate(450, 70);
                    ctx.fillStyle = '#DC2626';
                    ctx.beginPath();
                    for (let s = 0; s < 5; s++) {
                        const a1 = (s * 72 - 90) * Math.PI / 180;
                        const a2 = ((s * 72 + 36) - 90) * Math.PI / 180;
                        ctx.lineTo(Math.cos(a1) * 32, Math.sin(a1) * 32);
                        ctx.lineTo(Math.cos(a2) * 13, Math.sin(a2) * 13);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();

                    // Hazard diagonal stripes band (yellow/black)
                    ctx.fillStyle = '#EAB308';
                    ctx.fillRect(0, 190, 512, 66);
                    ctx.fillStyle = '#18181B';
                    for (let sx = -50; sx < 550; sx += 48) {
                        ctx.beginPath();
                        ctx.moveTo(sx, 256);
                        ctx.lineTo(sx + 32, 256);
                        ctx.lineTo(sx + 72, 190);
                        ctx.lineTo(sx + 40, 190);
                        ctx.closePath();
                        ctx.fill();
                    }

                    // 5b. Industrial Diamond Tread Plate (Turntable deck & Catwalk)
                    const cTread = document.createElement('canvas');
                    cTread.width = 128;
                    cTread.height = 128;
                    const tCtx = cTread.getContext('2d');
                    tCtx.fillStyle = '#263023';
                    tCtx.fillRect(0, 0, 128, 128);
                    tCtx.strokeStyle = '#384634';
                    tCtx.lineWidth = 2;
                    for (let tx = 0; tx < 128; tx += 16) {
                        for (let ty = 0; ty < 128; ty += 16) {
                            tCtx.beginPath();
                            tCtx.moveTo(tx + 4, ty + 8);
                            tCtx.lineTo(tx + 8, ty + 4);
                            tCtx.lineTo(tx + 12, ty + 8);
                            tCtx.lineTo(tx + 8, ty + 12);
                            tCtx.closePath();
                            tCtx.fillStyle = '#323E2F';
                            tCtx.fill();
                            tCtx.stroke();
                        }
                    }

                    // 5c. Heat-scorched flame deflector soot texture
                    const cBlast = document.createElement('canvas');
                    cBlast.width = 256;
                    cBlast.height = 256;
                    const bCtx = cBlast.getContext('2d');
                    bCtx.fillStyle = '#202224';
                    bCtx.fillRect(0, 0, 256, 256);
                    const sootGrad = bCtx.createRadialGradient(128, 128, 20, 128, 128, 120);
                    sootGrad.addColorStop(0, 'rgba(10, 10, 12, 0.95)');
                    sootGrad.addColorStop(0.5, 'rgba(30, 26, 22, 0.7)');
                    sootGrad.addColorStop(1, 'rgba(32, 34, 36, 0.1)');
                    bCtx.fillStyle = sootGrad;
                    bCtx.fillRect(0, 0, 256, 256);
                    bCtx.fillStyle = 'rgba(15, 15, 17, 0.4)';
                    for (let i = 0; i < 256; i += 12) {
                        bCtx.fillRect(0, i, 256, 3);
                    }

                    const t1 = new THREE.CanvasTexture(c);
                    const t2 = new THREE.CanvasTexture(cTread);
                    t2.wrapS = t2.wrapT = THREE.RepeatWrapping;
                    t2.repeat.set(4, 4);
                    const t3 = new THREE.CanvasTexture(cBlast);

                    return { stencils: t1, tread: t2, blast: t3 };
                };
                const lTex = makeLauncherTextures();
                this.textures.launcherStencils = lTex.stencils;
                this.textures.treadPlate = lTex.tread;
                this.textures.blastSoot = lTex.blast;
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

            /**
             * Precision analytical swept wing generator for Boeing B-52 Stratofortress.
             * Eliminates backface culling inversion, normal flipping, and texture stretching.
             * Generates a watertight NACA 6-series cambered airfoil grid with correct CCW winding.
             */
            buildB52SweptWing({
                side = 1, rootX = 0.65, span = 16.5,
                rootChord = 3.6, tipChord = 1.08,
                rootZ_LE = 3.8, sweepLE = 6.6,
                rootThick = 0.38, tipThick = 0.12,
                anhedralDroop = 1.25, material
            }) {
                const spanSteps = 24;
                const chordSteps = 20;
                const verts = [];
                const uvs = [];
                const indices = [];

                // Cambered transonic airfoil profile (NACA 63-219 style)
                const getAirfoil = (v) => {
                    const t = 4 * Math.sqrt(Math.max(0, v)) * (1 - v);
                    const camber = Math.sin(v * Math.PI) * 0.16 * (1 - v);
                    const yTop = t * 0.60 + camber;
                    const yBot = -t * 0.40 + camber;
                    return { yTop, yBot };
                };

                // Top surface
                for (let i = 0; i <= spanSteps; i++) {
                    const u = i / spanSteps;
                    const x = side * (rootX + u * span);
                    const yBase = -anhedralDroop * Math.pow(u, 1.75);
                    const chord = rootChord + (tipChord - rootChord) * u;
                    const zLE = rootZ_LE - u * sweepLE;
                    const thick = (rootThick + (tipThick - rootThick) * u) * 0.5;

                    for (let j = 0; j <= chordSteps; j++) {
                        const v = j / chordSteps;
                        const z = zLE - v * chord;
                        const af = getAirfoil(v);
                        const y = yBase + thick * af.yTop;
                        verts.push(x, y, z);
                        uvs.push(v, u);
                    }
                }

                // Bottom surface
                const botOffset = (spanSteps + 1) * (chordSteps + 1);
                for (let i = 0; i <= spanSteps; i++) {
                    const u = i / spanSteps;
                    const x = side * (rootX + u * span);
                    const yBase = -anhedralDroop * Math.pow(u, 1.75);
                    const chord = rootChord + (tipChord - rootChord) * u;
                    const zLE = rootZ_LE - u * sweepLE;
                    const thick = (rootThick + (tipThick - rootThick) * u) * 0.5;

                    for (let j = 0; j <= chordSteps; j++) {
                        const v = j / chordSteps;
                        const z = zLE - v * chord;
                        const af = getAirfoil(v);
                        const y = yBase + thick * af.yBot;
                        verts.push(x, y, z);
                        uvs.push(v, 1 - u);
                    }
                }

                const row = chordSteps + 1;
                // Top surface quads
                for (let i = 0; i < spanSteps; i++) {
                    for (let j = 0; j < chordSteps; j++) {
                        const a = i * row + j;
                        const b = (i + 1) * row + j;
                        const c = (i + 1) * row + (j + 1);
                        const d = i * row + (j + 1);
                        if (side > 0) indices.push(a, b, c, a, c, d);
                        else indices.push(a, c, b, a, d, c);
                    }
                }

                // Bottom surface quads
                for (let i = 0; i < spanSteps; i++) {
                    for (let j = 0; j < chordSteps; j++) {
                        const a = botOffset + i * row + j;
                        const b = botOffset + (i + 1) * row + j;
                        const c = botOffset + (i + 1) * row + (j + 1);
                        const d = botOffset + i * row + (j + 1);
                        if (side > 0) indices.push(a, c, b, a, d, c);
                        else indices.push(a, b, c, a, c, d);
                    }
                }

                // Tip cap
                const topTipStart = spanSteps * row;
                const botTipStart = botOffset + spanSteps * row;
                for (let j = 0; j < chordSteps; j++) {
                    const t1 = topTipStart + j, t2 = topTipStart + j + 1;
                    const b1 = botTipStart + j, b2 = botTipStart + j + 1;
                    if (side > 0) indices.push(t1, b1, b2, t1, b2, t2);
                    else indices.push(t1, b2, b1, t1, t2, b2);
                }

                // Root cap
                for (let j = 0; j < chordSteps; j++) {
                    const t1 = j, t2 = j + 1;
                    const b1 = botOffset + j, b2 = botOffset + j + 1;
                    if (side > 0) indices.push(t1, b2, b1, t1, t2, b2);
                    else indices.push(t1, b1, b2, t1, b2, t2);
                }

                // Trailing edge cap
                for (let i = 0; i < spanSteps; i++) {
                    const t1 = i * row + chordSteps, t2 = (i + 1) * row + chordSteps;
                    const b1 = botOffset + i * row + chordSteps, b2 = botOffset + (i + 1) * row + chordSteps;
                    if (side > 0) indices.push(t1, t2, b2, t1, b2, b1);
                    else indices.push(t1, b2, t2, t1, b1, b2);
                }

                // Leading edge cap
                for (let i = 0; i < spanSteps; i++) {
                    const t1 = i * row, t2 = (i + 1) * row;
                    const b1 = botOffset + i * row, b2 = botOffset + (i + 1) * row;
                    if (side > 0) indices.push(t1, b2, b1, t1, t2, b2);
                    else indices.push(t1, b1, b2, t1, b2, t2);
                }

                const geom = new THREE.BufferGeometry();
                geom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
                geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
                geom.setIndex(indices);
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
             * Dedicated Supersonic Biconvex Delta Wing for MiG-21 (TsAGI S-12 Profile)
             * Generates closed manifold surface with outward normals (top +Y, bot -Y) and planar UVs.
             */
            buildMiG21SupersonicWing({
                side = 1, rootX = 0.60, span = 4.35,
                rootChord = 4.85, tipChord = 0.58,
                rootZ_LE = 2.50, sweepLE = 4.45,
                rootThick = 0.16, tipThick = 0.035,
                anhedral = 0.08, material
            }) {
                const spanSteps = 16;
                const chordSteps = 16;
                const verts = [];
                const uvs = [];
                const indices = [];

                // Top surface (Biconvex profile: max thickness at mid-chord)
                for (let i = 0; i <= spanSteps; i++) {
                    const u = i / spanSteps; // 0=root, 1=tip
                    const x = side * (rootX + u * span);
                    const yBase = -0.05 - u * anhedral;
                    const chord = rootChord + (tipChord - rootChord) * u;
                    const zLE = rootZ_LE - u * sweepLE;
                    const maxT = (rootThick + (tipThick - rootThick) * u) * 0.5;

                    for (let j = 0; j <= chordSteps; j++) {
                        const v = j / chordSteps; // 0=LE, 1=TE
                        const z = zLE - v * chord;
                        const y = yBase + maxT * 4 * v * (1 - v);
                        verts.push(x, y, z);
                        uvs.push(v, u);
                    }
                }

                // Bottom surface
                const botOffset = (spanSteps + 1) * (chordSteps + 1);
                for (let i = 0; i <= spanSteps; i++) {
                    const u = i / spanSteps;
                    const x = side * (rootX + u * span);
                    const yBase = -0.05 - u * anhedral;
                    const chord = rootChord + (tipChord - rootChord) * u;
                    const zLE = rootZ_LE - u * sweepLE;
                    const maxT = (rootThick + (tipThick - rootThick) * u) * 0.5;

                    for (let j = 0; j <= chordSteps; j++) {
                        const v = j / chordSteps;
                        const z = zLE - v * chord;
                        const y = yBase - maxT * 4 * v * (1 - v);
                        verts.push(x, y, z);
                        uvs.push(v, 1 - u);
                    }
                }

                const row = chordSteps + 1;
                // Top surface quads
                for (let i = 0; i < spanSteps; i++) {
                    for (let j = 0; j < chordSteps; j++) {
                        const a = i * row + j;
                        const b = (i + 1) * row + j;
                        const c = (i + 1) * row + (j + 1);
                        const d = i * row + (j + 1);
                        if (side > 0) indices.push(a, b, c, a, c, d);
                        else indices.push(a, c, b, a, d, c);
                    }
                }

                // Bottom surface quads
                for (let i = 0; i < spanSteps; i++) {
                    for (let j = 0; j < chordSteps; j++) {
                        const a = botOffset + i * row + j;
                        const b = botOffset + (i + 1) * row + j;
                        const c = botOffset + (i + 1) * row + (j + 1);
                        const d = botOffset + i * row + (j + 1);
                        if (side > 0) indices.push(a, c, b, a, d, c);
                        else indices.push(a, b, c, a, c, d);
                    }
                }

                // Tip cap
                const topTipStart = spanSteps * row;
                const botTipStart = botOffset + spanSteps * row;
                for (let j = 0; j < chordSteps; j++) {
                    const t1 = topTipStart + j, t2 = topTipStart + j + 1;
                    const b1 = botTipStart + j, b2 = botTipStart + j + 1;
                    if (side > 0) indices.push(t1, b1, b2, t1, b2, t2);
                    else indices.push(t1, b2, b1, t1, t2, b2);
                }

                // Root cap
                for (let j = 0; j < chordSteps; j++) {
                    const t1 = j, t2 = j + 1;
                    const b1 = botOffset + j, b2 = botOffset + j + 1;
                    if (side > 0) indices.push(t1, b2, b1, t1, t2, b2);
                    else indices.push(t1, b1, b2, t1, b2, t2);
                }

                // Trailing edge cap
                for (let i = 0; i < spanSteps; i++) {
                    const t1 = i * row + chordSteps, t2 = (i + 1) * row + chordSteps;
                    const b1 = botOffset + i * row + chordSteps, b2 = botOffset + (i + 1) * row + chordSteps;
                    if (side > 0) indices.push(t1, t2, b2, t1, b2, b1);
                    else indices.push(t1, b2, t2, t1, b1, b2);
                }

                // Leading edge cap
                for (let i = 0; i < spanSteps; i++) {
                    const t1 = i * row, t2 = (i + 1) * row;
                    const b1 = botOffset + i * row, b2 = botOffset + (i + 1) * row;
                    if (side > 0) indices.push(t1, b2, t2, t1, b1, b2);
                    else indices.push(t1, t2, b2, t1, b2, b1);
                }

                const geom = new THREE.BufferGeometry();
                geom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
                geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
                geom.setIndex(indices);
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

                // High-End PBR Materials
                const alumMat = new THREE.MeshStandardMaterial({
                    map: this.textures.migFuselageSkin || this.textures.migPolishedAlum,
                    bumpMap: this.textures.migFuselageSkin || this.textures.migPolishedAlum,
                    bumpScale: 0.025,
                    metalness: 0.85,
                    roughness: 0.22
                });
                const wingMat = new THREE.MeshStandardMaterial({
                    map: this.textures.migWingSkin || this.textures.migStarWing,
                    bumpMap: this.textures.migWingSkin || this.textures.migStarWing,
                    bumpScale: 0.025,
                    metalness: 0.82,
                    roughness: 0.24
                });
                const titaniumMat = new THREE.MeshStandardMaterial({
                    color: 0x475569,
                    metalness: 0.88,
                    roughness: 0.35
                });
                const darkMat = new THREE.MeshStandardMaterial({
                    color: 0x18181B,
                    metalness: 0.8,
                    roughness: 0.3
                });
                const antiGlareMat = new THREE.MeshStandardMaterial({
                    color: 0x1E2229,
                    metalness: 0.08,
                    roughness: 0.88
                });
                const coneGreenMat = new THREE.MeshStandardMaterial({
                    color: 0x065F46,
                    metalness: 0.30,
                    roughness: 0.26
                });
                const chromeLipMat = new THREE.MeshStandardMaterial({
                    color: 0xCBD5E1,
                    metalness: 0.95,
                    roughness: 0.12
                });
                const canopyGlassMat = new THREE.MeshStandardMaterial({
                    color: 0x34D399,
                    emissive: 0x059669,
                    emissiveIntensity: 0.15,
                    metalness: 0.95,
                    roughness: 0.04,
                    transparent: true,
                    opacity: 0.40
                });
                const canopyFrameMat = new THREE.MeshStandardMaterial({
                    color: 0x94A3B8,
                    metalness: 0.88,
                    roughness: 0.25
                });
                const cockpitTubMat = new THREE.MeshStandardMaterial({
                    color: 0x0891B2,
                    metalness: 0.20,
                    roughness: 0.60
                });
                const gunPodMat = new THREE.MeshStandardMaterial({
                    color: 0x1E293B,
                    metalness: 0.85,
                    roughness: 0.25
                });

                // ponytail: procedural lathe & extrusions; upgrade path: baked PBR glTF via assets/models/mig21.glb
                // 1. Aerodynamic Lathe Fuselage with MiG-21bis Dorsal Spine
                const fuselage = this.buildLatheFuselage({
                    length: 12.8,
                    stations: [
                        [0.00, 0.52], // exhaust rim
                        [0.08, 0.56], // rear titanium shroud
                        [0.20, 0.67], // rear fuselage transition
                        [0.38, 0.77], // aft wing root
                        [0.56, 0.83], // wing mid / center of lift
                        [0.72, 0.81], // cockpit base / forward wing
                        [0.86, 0.68], // nose taper
                        [0.96, 0.54], // intake outer cowl
                        [1.00, 0.49]  // sharp intake lip
                    ],
                    radialSegments: 48,
                    ovalX: 0.96,
                    ovalY: 1.04,
                    spineFn: (normZ, x) => {
                        const mask = Math.max(0, 1 - Math.pow(Math.abs(x) * 2.2, 2));
                        if (normZ > 0.18 && normZ < 0.70) {
                            const t = (normZ - 0.18) / 0.52;
                            const h = Math.sin(t * Math.PI) * 0.44 + (1 - t) * 0.08;
                            return h * mask;
                        }
                        return 0;
                    },
                    material: alumMat
                });
                group.add(fuselage);

                // Rear Fuselage Titanium Heat Shield Shroud
                const heatShroud = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.53, 0.59, 1.8, 36, 1, true),
                    titaniumMat
                );
                heatShroud.rotation.x = Math.PI / 2;
                heatShroud.position.set(0, 0, -5.5);
                group.add(heatShroud);

                // Articulated 24-Petal Exhaust Nozzle Assembly
                const nozzleGroup = new THREE.Group();
                nozzleGroup.position.set(0, 0, -6.4);
                const nozzleInterior = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.48, 0.45, 0.9, 24, 1, true),
                    darkMat
                );
                nozzleInterior.rotation.x = Math.PI / 2;
                nozzleInterior.position.z = 0.45;
                nozzleGroup.add(nozzleInterior);

                // Turbine center bullet & flameholder ring inside nozzle
                const flameRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.02, 8, 24), titaniumMat);
                flameRing.position.z = 0.35;
                const turbineCone = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.5, 16), titaniumMat);
                turbineCone.rotation.x = Math.PI / 2;
                turbineCone.position.z = 0.25;
                nozzleGroup.add(flameRing, turbineCone);

                // 24 convergent-divergent nozzle petals around the rim
                for (let p = 0; p < 24; p++) {
                    const ang = (p / 24) * Math.PI * 2;
                    const petal = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.016, 0.38), titaniumMat);
                    petal.rotation.z = ang;
                    petal.rotation.x = -0.12;
                    petal.position.set(Math.cos(ang) * 0.51, Math.sin(ang) * 0.51, -0.18);
                    nozzleGroup.add(petal);
                }
                group.add(nozzleGroup);

                // Hollow Engine Intake Duct & Green Radar Shock Cone
                const intakeDuct = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.46, 0.46, 0.9, 32, 1, true),
                    darkMat
                );
                intakeDuct.rotation.x = Math.PI / 2;
                intakeDuct.position.set(0, 0, 5.95);
                group.add(intakeDuct);

                const lip = new THREE.Mesh(new THREE.TorusGeometry(0.485, 0.035, 16, 48), chromeLipMat);
                lip.position.set(0, 0, 6.38);
                group.add(lip);

                const shockCone = this.buildLatheFuselage({
                    length: 2.3,
                    stations: [[0, 0.36], [0.35, 0.30], [0.72, 0.18], [1, 0.01]],
                    radialSegments: 32,
                    material: coneGreenMat
                });
                shockCone.position.set(0, 0, 6.6);
                group.add(shockCone);

                // Matte Black Anti-Glare Deck Panel
                const antiGlare = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.02, 1.6), antiGlareMat);
                antiGlare.position.set(0, 0.64, 4.4);
                antiGlare.rotation.x = -0.09;
                group.add(antiGlare);

                // PVD-7 Pitot Boom + Flow Vanes
                const pitot = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.024, 2.3, 12), chromeLipMat);
                pitot.rotation.x = Math.PI / 2;
                pitot.position.set(0.18, -0.26, 7.5);
                group.add(pitot);

                const vaneH = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.004, 0.04), chromeLipMat);
                vaneH.position.set(0.18, -0.26, 8.35);
                const vaneV = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.09, 0.04), chromeLipMat);
                vaneV.position.set(0.18, -0.26, 8.35);
                group.add(vaneH, vaneV);

                // Auxiliary blow-in intake doors & DUAS AoA sensors
                [-1, 1].forEach(side => {
                    const door = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, 0.28), darkMat);
                    door.position.set(side * 0.66, 0.02, 4.2);
                    const aoa = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.12, 8), chromeLipMat);
                    aoa.rotation.z = side * -Math.PI / 2;
                    aoa.position.set(side * 0.65, 0.10, 5.0);
                    group.add(door, aoa);
                });

                // Canopy, Windscreen Framing & TSh-16V Rearview Periscope
                const canopy = this.buildLatheFuselage({
                    length: 2.85,
                    stations: [[0, 0.02], [0.2, 0.36], [0.55, 0.52], [0.82, 0.46], [1, 0.02]],
                    radialSegments: 32,
                    flattenBelly: 0.85,
                    material: canopyGlassMat
                });
                canopy.position.set(0, 0.70, 2.45);
                group.add(canopy);

                // Windscreen and mid-canopy structural frame arches
                const frameArch1 = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.024, 8, 24, Math.PI), canopyFrameMat);
                frameArch1.rotation.y = Math.PI;
                frameArch1.position.set(0, 0.62, 3.35);
                const frameArch2 = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.024, 8, 24, Math.PI), canopyFrameMat);
                frameArch2.rotation.y = Math.PI;
                frameArch2.position.set(0, 0.68, 2.45);
                group.add(frameArch1, frameArch2);

                const periscope = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.20), canopyFrameMat);
                periscope.position.set(0, 1.25, 2.45);
                const periscopeLens = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.04), darkMat);
                periscopeLens.position.set(0, 1.25, 2.34);
                group.add(periscope, periscopeLens);

                // Cockpit Interior Tub, Glare Shield, ASP-PFD Gunsight & KM-1M Ejection Seat
                const cockpitTub = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 1.6), cockpitTubMat);
                cockpitTub.position.set(0, 0.55, 2.6);
                const glareShield = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.35), darkMat);
                glareShield.position.set(0, 0.82, 3.3);
                const hudGlass = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.14, 0.12),
                    new THREE.MeshBasicMaterial({ color: 0xFB923C, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
                );
                hudGlass.rotation.x = -Math.PI / 4;
                hudGlass.position.set(0, 0.90, 3.25);
                group.add(cockpitTub, glareShield, hudGlass);

                // KM-1M Ejection Seat
                const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.55, 0.18), darkMat);
                seatBack.position.set(0, 0.72, 2.2);
                seatBack.rotation.x = 0.18;
                const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.16), darkMat);
                headrest.position.set(0, 1.02, 2.14);
                const pullRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.009, 8, 16), new THREE.MeshBasicMaterial({ color: 0xF97316 }));
                pullRing1.position.set(-0.06, 1.15, 2.14);
                const pullRing2 = pullRing1.clone();
                pullRing2.position.x = 0.06;
                group.add(seatBack, headrest, pullRing1, pullRing2);

                // Pilot with ZSh-3 Helmet, Sun Visor, Flight Suit & KM-32 Oxygen Mask
                const pilotTorso = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.24), new THREE.MeshStandardMaterial({ color: 0x2D3728, roughness: 0.8 }));
                pilotTorso.position.set(0, 0.66, 2.45);
                const helmet = new THREE.Mesh(
                    new THREE.SphereGeometry(0.22, 20, 20),
                    new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.18 })
                );
                helmet.position.set(0, 0.86, 2.58);
                const visor = new THREE.Mesh(
                    new THREE.SphereGeometry(0.17, 16, 16, 0, Math.PI, 0, Math.PI * 0.65),
                    new THREE.MeshStandardMaterial({ color: 0x090D16, metalness: 0.98, roughness: 0.03 })
                );
                visor.rotation.x = -Math.PI / 2;
                visor.position.set(0, 0.88, 2.66);
                const oxygenMask = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.12, 10), darkMat);
                oxygenMask.rotation.x = Math.PI / 2.3;
                oxygenMask.position.set(0, 0.80, 2.74);
                group.add(pilotTorso, helmet, visor, oxygenMask);

                // GSh-23L 23mm Twin-Barrel Autocannon Pod under Forward Belly
                const gunFairing = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 1.6), gunPodMat);
                gunFairing.position.set(0, -0.66, 1.35);
                [-0.055, 0.055].forEach((gx, idx) => {
                    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.25, 10), gunPodMat);
                    barrel.rotation.x = Math.PI / 2;
                    barrel.position.set(gx, -0.05, 0.90 + (idx === 0 ? 0 : 0.08));
                    gunFairing.add(barrel);
                    const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 10), chromeLipMat);
                    muzzle.rotation.x = Math.PI / 2;
                    muzzle.position.set(gx, -0.05, 1.50 + (idx === 0 ? 0 : 0.08));
                    gunFairing.add(muzzle);
                });
                group.add(gunFairing);

                // Centerline 490L External Fuel Tank with 3 Tail Stabilizer Fins
                const tankGroup = new THREE.Group();
                tankGroup.position.set(0, -1.05, 0.2);
                const dropTank = this.buildLatheFuselage({
                    length: 3.8,
                    stations: [[0, 0.02], [0.15, 0.20], [0.5, 0.28], [0.85, 0.24], [1, 0.02]],
                    radialSegments: 24,
                    material: alumMat
                });
                tankGroup.add(dropTank);
                const tankPylon = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 1.6), alumMat);
                tankPylon.position.set(0, 0.16, 0);
                tankGroup.add(tankPylon);
                [Math.PI / 2, Math.PI * 1.25, Math.PI * 1.75].forEach(ang => {
                    const tFin = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.18, 0.35), alumMat);
                    tFin.rotation.z = ang;
                    tFin.position.set(Math.cos(ang) * 0.16, Math.sin(ang) * 0.16, -1.6);
                    tankGroup.add(tFin);
                });
                group.add(tankGroup);

                // 57° Delta Wings + Wing Fences + APU-13 Pylons + K-13 Missiles (Baked VPAF Roundels on Wing Skin)
                [-1, 1].forEach(side => {
                    const delta = this.buildMiG21SupersonicWing({
                        side, rootX: 0.60, span: 4.35,
                        rootChord: 4.85, tipChord: 0.58,
                        rootZ_LE: 2.50, sweepLE: 4.45,
                        rootThick: 0.16, tipThick: 0.035,
                        anhedral: 0.08, material: wingMat
                    });
                    group.add(delta);

                    // Iconic Aerodynamic Wing Boundary Layer Fence
                    const fence = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.13, 1.85), alumMat);
                    fence.position.set(side * 3.10, 0.02, -0.55);
                    group.add(fence);

                    // Flap actuator fairing pod under wing trailing edge
                    const flapPod = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.65), alumMat);
                    flapPod.position.set(side * 1.85, -0.15, -2.15);
                    group.add(flapPod);

                    // Horizontal all-moving stabilator with -2° anhedral
                    const hStab = this.buildMiG21SupersonicWing({
                        side, rootX: 0.54, span: 2.05,
                        rootChord: 1.65, tipChord: 0.45,
                        rootZ_LE: -4.10, sweepLE: 1.15,
                        rootThick: 0.08, tipThick: 0.02,
                        anhedral: 0.05, material: alumMat
                    });
                    group.add(hStab);

                    // Wingtip Nav Light + Static Discharger Wicks
                    const navLight = new THREE.Mesh(
                        new THREE.SphereGeometry(0.10, 12, 12),
                        new THREE.MeshBasicMaterial({ color: side < 0 ? 0xEF4444 : 0x10B981 })
                    );
                    navLight.position.set(side * 4.95, -0.12, -2.10);
                    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.35, 6), chromeLipMat);
                    wick.rotation.x = Math.PI / 2;
                    wick.position.set(side * 4.98, -0.12, -2.35);
                    group.add(navLight, wick);

                    // APU-13 Launch Rail + Enhanced K-13 Missile
                    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.22, 1.4), alumMat);
                    pylon.position.set(side * 2.45, -0.22, -0.80);
                    group.add(pylon);

                    const k13 = this.createK13Missile();
                    k13.position.set(side * 2.45, -0.40, -0.80);
                    group.add(k13);
                });

                // Swept Vertical Stabilizer with Emerald Dielectric Radome Cap
                const vFin = this.buildVerticalFin({
                    height: 2.65, rootChord: 3.65, tipChord: 1.2,
                    thickness: 0.1, sweepZ: 1.95, material: alumMat
                });
                vFin.position.set(0, 0.62, -3.7);
                group.add(vFin);

                const finCap = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.45, 0.75), coneGreenMat);
                finCap.position.set(0, 3.05, -4.6);
                const tailWick = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.3, 6), chromeLipMat);
                tailWick.rotation.x = Math.PI / 2;
                tailWick.position.set(0, 3.2, -5.1);
                group.add(finCap, tailWick);

                // Roundels on vertical fin sides (Flush at mid-chord, zero protrusion)
                const roundelMat = new THREE.MeshBasicMaterial({
                    map: this.textures.vpafRoundel,
                    transparent: true,
                    polygonOffset: true,
                    polygonOffsetFactor: -1,
                    polygonOffsetUnits: -1,
                    side: THREE.DoubleSide
                });
                [-1, 1].forEach(side => {
                    const finRoundel = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.48), roundelMat);
                    finRoundel.rotation.y = side < 0 ? -Math.PI / 2 : Math.PI / 2;
                    finRoundel.position.set(side * 0.088, 1.95, -4.68);
                    group.add(finRoundel);
                });

                // Ventral Stabilizing Strake Fin under Aft Belly + PT-21UK Drag Chute Pod
                const ventralFin = this.buildVerticalFin({
                    height: 0.72, rootChord: 1.8, tipChord: 0.4,
                    thickness: 0.06, sweepZ: 0.85, material: alumMat
                });
                ventralFin.rotation.z = Math.PI;
                ventralFin.position.set(0, -0.58, -4.2);
                const chutePod = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.75, 14), alumMat);
                chutePod.rotation.x = Math.PI / 2;
                chutePod.position.set(0, -0.65, -5.2);
                group.add(ventralFin, chutePod);

                // Tactical "5121" & 5 Red Victory Stars Placards on Forward Fuselage
                const portDecalMat = new THREE.MeshBasicMaterial({
                    map: this.textures.mig5121Port,
                    transparent: true,
                    polygonOffset: true,
                    polygonOffsetFactor: -1,
                    polygonOffsetUnits: -1,
                    side: THREE.DoubleSide
                });
                const stbdDecalMat = new THREE.MeshBasicMaterial({
                    map: this.textures.mig5121Stbd,
                    transparent: true,
                    polygonOffset: true,
                    polygonOffsetFactor: -1,
                    polygonOffsetUnits: -1,
                    side: THREE.DoubleSide
                });

                const planePort = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.65), portDecalMat);
                planePort.rotation.y = -Math.PI / 2 - 0.12;
                planePort.position.set(-0.54, 0.08, 4.75);
                const planeStbd = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), stbdDecalMat);
                planeStbd.rotation.y = Math.PI / 2 + 0.12;
                planeStbd.position.set(0.54, 0.08, 4.75);
                group.add(planePort, planeStbd);

                // Multi-Layered Mach-Diamond Afterburner Assembly (Preserves name='afterburnerPlume')
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
                const whiteMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, metalness: 0.25, roughness: 0.35 });
                const darkMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.85, roughness: 0.2 });
                const yellowBandMat = new THREE.MeshStandardMaterial({ color: 0xEAB308, roughness: 0.4 });
                const seekerMat = new THREE.MeshStandardMaterial({ color: 0x090D16, metalness: 0.95, roughness: 0.05 });

                // Missile body cylinder (+Z is forward)
                const body = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 2.3, 16), whiteMat);
                body.rotation.x = Math.PI / 2;
                g.add(body);

                // Yellow live ordnance warhead identification band
                const warheadBand = new THREE.Mesh(new THREE.CylinderGeometry(0.083, 0.083, 0.16, 16), yellowBandMat);
                warheadBand.rotation.x = Math.PI / 2;
                warheadBand.position.z = 0.52;
                g.add(warheadBand);

                // Black seeker collar & optical infrared dome
                const seekerCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.082, 0.12, 16), darkMat);
                seekerCollar.rotation.x = Math.PI / 2;
                seekerCollar.position.z = 1.18;
                const seekerDome = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), seekerMat);
                seekerDome.rotation.x = -Math.PI / 2;
                seekerDome.position.z = 1.24;
                g.add(seekerCollar, seekerDome);

                // 4 Forward triangular steering canards at 90°
                [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(ang => {
                    const canard = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.18, 0.22), darkMat);
                    canard.rotation.z = ang;
                    canard.position.set(Math.cos(ang) * 0.12, Math.sin(ang) * 0.12, 0.76);
                    g.add(canard);
                });

                // 4 Rear swept delta stabilizer fins with rollerons
                [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(ang => {
                    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.32, 0.42), whiteMat);
                    fin.rotation.z = ang;
                    fin.position.set(Math.cos(ang) * 0.20, Math.sin(ang) * 0.20, -0.88);
                    const rolleron = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.022, 10), darkMat);
                    rolleron.position.set(Math.cos(ang) * 0.34, Math.sin(ang) * 0.34, -1.04);
                    g.add(fin, rolleron);
                });

                // Rocket motor nozzle exhaust cavity
                const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.072, 0.14, 14, 1, true), darkMat);
                nozzle.rotation.x = Math.PI / 2;
                nozzle.position.z = -1.18;
                g.add(nozzle);

                return g;
            },

            /**
             * 2. BOEING B-52G STRATOFORTRESS // OPERATION LINEBACKER II (12.1972)
             * Detailed 3D model: SEA Vietnam Camo, stepped greenhouse cockpit, EVS chin blisters,
             * belly bomb bay, swept pylons with 8 TF33 turbofans (titanium cowl lips, spinner cones,
             * dual-layer exhaust plumes), 4x 12.7mm tail gun turret & AN/ASG-15 radar, wingtip tanks & outriggers.
             */
            createB52G() {
                if (this.customGLBModels.B52) return this.customGLBModels.B52.clone();
                if (this.cache.B52) return this.cache.B52.clone();
                this.initTextures();
                const group = new THREE.Group();

                // PBR Materials
                const upperMat = new THREE.MeshStandardMaterial({
                    map: this.textures.b52Camo,
                    bumpMap: this.textures.b52Camo,
                    bumpScale: 0.025,
                    metalness: 0.42,
                    roughness: 0.52
                });
                const bellyMat = new THREE.MeshStandardMaterial({
                    map: this.textures.b52Belly,
                    bumpMap: this.textures.b52Belly,
                    bumpScale: 0.02,
                    color: 0x14171A,
                    metalness: 0.38,
                    roughness: 0.62
                });
                const titaniumMat = new THREE.MeshStandardMaterial({
                    color: 0xC8CFD8,
                    metalness: 0.88,
                    roughness: 0.22
                });
                const engineIntMat = new THREE.MeshStandardMaterial({
                    color: 0x0A0C0F,
                    roughness: 0.92
                });
                const spinnerMat = new THREE.MeshStandardMaterial({
                    color: 0x94A3B8,
                    metalness: 0.9,
                    roughness: 0.2
                });
                const glassMat = new THREE.MeshStandardMaterial({
                    color: 0x1E293B,
                    emissive: 0x0C1929,
                    emissiveIntensity: 0.3,
                    metalness: 0.92,
                    roughness: 0.08
                });
                const frameMat = new THREE.MeshStandardMaterial({
                    color: 0x1C221A,
                    roughness: 0.65
                });
                const radomeMat = new THREE.MeshStandardMaterial({
                    color: 0x181C20,
                    metalness: 0.2,
                    roughness: 0.75
                });
                const gunMat = new THREE.MeshStandardMaterial({
                    color: 0x18181B,
                    metalness: 0.92,
                    roughness: 0.25
                });
                const nozzleMat = new THREE.MeshStandardMaterial({
                    color: 0x2A2624,
                    metalness: 0.78,
                    roughness: 0.38
                });
                const rubberMat = new THREE.MeshStandardMaterial({
                    color: 0x111315,
                    roughness: 0.85
                });
                const exhaustBeamMat = new THREE.MeshBasicMaterial({
                    color: 0xFFA044,
                    transparent: true,
                    opacity: 0.35,
                    side: THREE.DoubleSide,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });
                const exhaustCoreMat = new THREE.MeshBasicMaterial({
                    color: 0xFFFBEB,
                    transparent: true,
                    opacity: 0.6,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });

                // 1. Fuselage
                const fuselage = this.buildLatheFuselage({
                    length: 20.5,
                    stations: [
                        [0.00, 0.20], [0.03, 0.46], [0.08, 0.72], [0.18, 0.96],
                        [0.32, 1.05], [0.65, 1.06], [0.82, 0.98], [0.92, 0.78],
                        [0.97, 0.48], [1.00, 0.26]
                    ],
                    radialSegments: 36,
                    ovalX: 0.86,
                    ovalY: 1.15,
                    flattenBelly: 0.24,
                    spineFn: (normZ, x) => {
                        const c = Math.max(0, 1 - Math.abs(x) * 1.3);
                        if (normZ > 0.74 && normZ < 0.90) {
                            return Math.sin(((normZ - 0.74) / 0.16) * Math.PI) * 0.38 * c;
                        }
                        return 0;
                    },
                    material: upperMat
                });
                group.add(fuselage);

                // Nose Radome Cap (AN/ASQ-38 Bombing/Navigation Radar)
                const noseRadome = new THREE.Mesh(
                    new THREE.SphereGeometry(0.38, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
                    radomeMat
                );
                noseRadome.rotation.x = Math.PI / 2;
                noseRadome.scale.set(0.85, 0.85, 1.4);
                noseRadome.position.set(0, 0.05, 10.22);
                group.add(noseRadome);

                // EVS Chin Blisters (Electro-optical Viewing System: FLIR & LLTV sensor turrets)
                [-0.32, 0.32].forEach((cx, idx) => {
                    const chinBlister = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), frameMat);
                    chinBlister.scale.set(0.85, 0.85, 1.6);
                    chinBlister.position.set(cx, -0.62, 8.8);
                    group.add(chinBlister);
                    const opticalSensor = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 12), glassMat);
                    opticalSensor.rotation.x = Math.PI / 4;
                    opticalSensor.position.set(cx, -0.72, 9.0);
                    group.add(opticalSensor);
                });

                // Stepped Flight Deck / Greenhouse Cockpit
                const cockpitGroup = new THREE.Group();
                cockpitGroup.position.set(0, 0.94, 6.75);

                const cabinBase = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.44, 2.3), frameMat);
                cabinBase.position.set(0, 0.02, 0);
                cockpitGroup.add(cabinBase);

                // Front faceted windscreens
                [-0.24, 0.24].forEach(fx => {
                    const frontScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.38), glassMat);
                    frontScreen.rotation.set(-0.48, fx < 0 ? 0.22 : -0.22, 0);
                    frontScreen.position.set(fx, 0.26, 0.98);
                    cockpitGroup.add(frontScreen);
                });

                // Side crew windows
                [-0.49, 0.49].forEach(sx => {
                    const sideScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.32), glassMat);
                    sideScreen.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
                    sideScreen.position.set(sx, 0.24, 0.22);
                    cockpitGroup.add(sideScreen);
                });

                // Eyebrow / overhead observation windows
                [-0.22, 0.22].forEach(rx => {
                    const roofScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.46), glassMat);
                    roofScreen.rotation.x = -Math.PI / 2;
                    roofScreen.position.set(rx, 0.47, 0.35);
                    cockpitGroup.add(roofScreen);
                });

                // Anti-glare coaming panel
                const antiGlare = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.06, 0.75), frameMat);
                antiGlare.rotation.x = 0.26;
                antiGlare.position.set(0, 0.08, 1.45);
                cockpitGroup.add(antiGlare);

                group.add(cockpitGroup);

                // Ventral Bomb Bay Doors Plate
                const bombBay = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.08, 7.8), bellyMat);
                bombBay.position.set(0, -1.02, 0.1);
                group.add(bombBay);

                // Phase VI ECM Antenna Blisters along fuselage
                [-0.88, 0.88].forEach(fx => {
                    const ecm1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.95), frameMat);
                    ecm1.position.set(fx, -0.22, 5.2);
                    group.add(ecm1);
                    const ecm2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.75), frameMat);
                    ecm2.position.set(fx, 0.05, -1.8);
                    group.add(ecm2);
                });

                // Tail Gun Turret & Radar (Tháp pháo đuôi 4 nòng 12.7mm & AN/ASG-15)
                const tailTurretGroup = new THREE.Group();
                tailTurretGroup.position.set(0, 0.42, -10.15);

                const fireControlRadome = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), radomeMat);
                fireControlRadome.position.set(0, 0.26, -0.15);
                tailTurretGroup.add(fireControlRadome);

                const gunnerSight = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 10), glassMat);
                gunnerSight.rotation.x = Math.PI / 2;
                gunnerSight.position.set(0, 0.42, -0.05);
                tailTurretGroup.add(gunnerSight);

                const barbette = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.42, 14), frameMat);
                barbette.rotation.x = Math.PI / 2;
                barbette.position.set(0, -0.08, -0.15);
                tailTurretGroup.add(barbette);

                [[-0.09, 0.09], [0.09, 0.09], [-0.09, -0.09], [0.09, -0.09]].forEach(([gx, gy]) => {
                    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.95, 8), gunMat);
                    barrel.rotation.x = Math.PI / 2;
                    barrel.position.set(gx, -0.08 + gy, -0.68);
                    tailTurretGroup.add(barrel);
                    const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.12, 8), gunMat);
                    muzzle.rotation.x = Math.PI / 2;
                    muzzle.position.set(gx, -0.08 + gy, -1.16);
                    tailTurretGroup.add(muzzle);
                });
                group.add(tailTurretGroup);

                // 2. Swept Wings + Engines + Wingtip Tanks & Stabilizers
                [-1, 1].forEach(side => {
                    const wing = this.buildB52SweptWing({
                        side, rootX: 0.65, span: 16.5,
                        rootChord: 3.6, tipChord: 1.08,
                        rootZ_LE: 3.8, sweepLE: 6.6,
                        rootThick: 0.38, tipThick: 0.12,
                        anhedralDroop: 1.25, material: upperMat
                    });
                    wing.position.set(0, 0.55, 0);
                    group.add(wing);

                    // Flap track canoe fairings under wing trailing edge
                    [0.32, 0.54, 0.76].forEach(u => {
                        const chord = 3.6 + (1.08 - 3.6) * u;
                        const zTE = 3.8 - u * 6.6 - chord;
                        const cy = 0.55 - 1.25 * Math.pow(u, 1.75) - 0.14;
                        const canoe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.4, 8), bellyMat);
                        canoe.rotation.x = Math.PI / 2;
                        canoe.position.set(side * (0.65 + u * 16.5), cy, zTE + 0.3);
                        group.add(canoe);
                    });

                    // Wingtip External Fuel Tank + Pylon + Stabilizing Fin
                    const tipX = side * 17.15;
                    const tipY = 0.55 - 1.25;
                    const tipZ = 3.8 - 6.6 - 0.54;

                    const tankGroup = new THREE.Group();
                    tankGroup.position.set(tipX, tipY - 0.35, tipZ);

                    const tankPylon = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 1.2), bellyMat);
                    tankPylon.position.set(0, 0.28, 0.1);
                    tankGroup.add(tankPylon);

                    const tipTank = this.buildLatheFuselage({
                        length: 3.4,
                        stations: [[0, 0.02], [0.15, 0.22], [0.5, 0.25], [0.85, 0.22], [1, 0.02]],
                        radialSegments: 16,
                        material: upperMat
                    });
                    tankGroup.add(tipTank);

                    const tankFin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.52), bellyMat);
                    tankFin.position.set(0, 0, -1.35);
                    tankGroup.add(tankFin);
                    group.add(tankGroup);

                    // High-intensity Navigation Lights
                    const navLight = new THREE.Mesh(
                        new THREE.SphereGeometry(0.24, 12, 12),
                        new THREE.MeshBasicMaterial({ color: side < 0 ? 0x10B981 : 0xFF2A4B })
                    );
                    navLight.position.set(side * 17.38, tipY, tipZ);
                    group.add(navLight);

                    // 4 Twin Pratt & Whitney TF33 Engine Pods (8 Engines total)
                    [0.28, 0.58].forEach(u => {
                        const px = side * (0.65 + u * 16.5);
                        const py = 0.55 - 1.25 * Math.pow(u, 1.75);
                        const pzLE = 3.8 - u * 6.6;

                        const podGroup = new THREE.Group();
                        podGroup.position.set(px, py - 0.72, pzLE + 0.9);

                        // Swept Cantilevered Wing Pylon
                        const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.78, 2.6), bellyMat);
                        pylon.rotation.x = -0.12;
                        pylon.position.set(0, 0.42, -0.45);
                        podGroup.add(pylon);
                        const pylonLeadingEdge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 0.12), titaniumMat);
                        pylonLeadingEdge.rotation.x = -0.12;
                        pylonLeadingEdge.position.set(0, 0.42, 0.82);
                        podGroup.add(pylonLeadingEdge);

                        // Twin nacelle center fairing
                        const centerFairing = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 3.1), bellyMat);
                        centerFairing.position.set(0, 0.05, 0);
                        podGroup.add(centerFairing);

                        [-0.42, 0.42].forEach(ox => {
                            // Engine Nacelle body
                            const nac = this.buildLatheFuselage({
                                length: 3.2,
                                stations: [[0, 0.31], [0.22, 0.36], [0.65, 0.38], [0.92, 0.34], [1, 0.30]],
                                radialSegments: 20,
                                material: bellyMat
                            });
                            nac.position.x = ox;
                            podGroup.add(nac);

                            // Cowl Intake Lip (Metallic titanium sheen)
                            const cowlLip = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.038, 12, 24), titaniumMat);
                            cowlLip.position.set(ox, 0, 1.6);
                            podGroup.add(cowlLip);

                            // Recessed dark compressor face
                            const compressorFace = new THREE.Mesh(new THREE.CircleGeometry(0.29, 16), engineIntMat);
                            compressorFace.position.set(ox, 0, 1.35);
                            podGroup.add(compressorFace);

                            // Spinner bullet cone
                            const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.38, 12), spinnerMat);
                            spinner.rotation.x = Math.PI / 2;
                            spinner.position.set(ox, 0, 1.5);
                            podGroup.add(spinner);

                            // Exhaust Nozzle ring
                            const nozzleRing = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.035, 10, 20), nozzleMat);
                            nozzleRing.position.set(ox, 0, -1.6);
                            podGroup.add(nozzleRing);

                            // Dual-layer Jet Exhaust Plume (Outer flame beam + bright core)
                            const plume = new THREE.Mesh(
                                new THREE.ConeGeometry(0.32, 5.2, 14, 1, true),
                                exhaustBeamMat
                            );
                            plume.rotation.x = -Math.PI / 2;
                            plume.position.set(ox, 0, -4.2);
                            podGroup.add(plume);

                            const plumeCore = new THREE.Mesh(
                                new THREE.ConeGeometry(0.16, 2.2, 10, 1, true),
                                exhaustCoreMat
                            );
                            plumeCore.rotation.x = -Math.PI / 2;
                            plumeCore.position.set(ox, 0, -2.7);
                            podGroup.add(plumeCore);
                        });
                        group.add(podGroup);
                    });

                    // Horizontal Stabilizers
                    const hStab = this.buildB52SweptWing({
                        side, rootX: 0.25, span: 4.8,
                        rootChord: 2.0, tipChord: 0.75,
                        rootZ_LE: -7.0, sweepLE: 2.2,
                        rootThick: 0.16, tipThick: 0.04,
                        anhedralDroop: -0.15, material: upperMat
                    });
                    hStab.position.set(0, 0.45, 0);
                    group.add(hStab);

                    const hStabTrim = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 4.8, 6), titaniumMat);
                    hStabTrim.rotation.z = side * (Math.PI / 2 - 0.15);
                    hStabTrim.rotation.y = -side * 0.42;
                    hStabTrim.position.set(side * 2.3, 0.65, -7.9);
                    group.add(hStabTrim);
                });

                // 3. Vertical Fin & Empennage
                const vTail = this.buildVerticalFin({
                    height: 4.6, rootChord: 3.5, tipChord: 1.25,
                    thickness: 0.11, sweepZ: 2.3, material: upperMat
                });
                vTail.position.set(0, 0.65, -7.4);
                group.add(vTail);

                // Dorsal Fin Fillet
                const dorsalFillet = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.75, 2.8), upperMat);
                dorsalFillet.rotation.x = -0.36;
                dorsalFillet.position.set(0, 1.22, -4.8);
                group.add(dorsalFillet);

                // Phase VI ECM Radome Cap at fin tip
                const finTipRadome = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.4, 12), radomeMat);
                finTipRadome.rotation.x = Math.PI / 2;
                finTipRadome.position.set(0, 5.28, -8.9);
                group.add(finTipRadome);

                // Anti-ice leading edge strip on vertical fin
                const vFinTrim = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 4.6, 6), titaniumMat);
                vFinTrim.rotation.x = -0.48;
                vFinTrim.position.set(0, 2.95, -6.8);
                group.add(vFinTrim);

                // ECM jamming haze (faint red glow toggled during ECCM radar mode)
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
                this.initTextures();
                const root = new THREE.Group();

                // High-fidelity Soviet military PBR materials
                const armorGreen = new THREE.MeshStandardMaterial({
                    color: 0x303E2B,
                    metalness: 0.52,
                    roughness: 0.46
                });
                const stenciledArmor = new THREE.MeshStandardMaterial({
                    color: 0x303E2B,
                    map: this.textures.launcherStencils || null,
                    metalness: 0.50,
                    roughness: 0.45
                });
                const treadMat = new THREE.MeshStandardMaterial({
                    color: 0x2A3526,
                    map: this.textures.treadPlate || null,
                    metalness: 0.65,
                    roughness: 0.38
                });
                const darkSteel = new THREE.MeshStandardMaterial({
                    color: 0x1A1E22,
                    metalness: 0.85,
                    roughness: 0.32
                });
                const chromeMat = new THREE.MeshStandardMaterial({
                    color: 0xF2F5F8,
                    metalness: 0.98,
                    roughness: 0.08
                });
                const brassMat = new THREE.MeshStandardMaterial({
                    color: 0xC8A24E,
                    metalness: 0.85,
                    roughness: 0.25
                });
                const blastMat = new THREE.MeshStandardMaterial({
                    color: 0x222426,
                    map: this.textures.blastSoot || null,
                    metalness: 0.72,
                    roughness: 0.60
                });
                const rubberMat = new THREE.MeshStandardMaterial({
                    color: 0x141517,
                    roughness: 0.92,
                    metalness: 0.05
                });
                const hazardMat = new THREE.MeshStandardMaterial({
                    color: 0xD97706,
                    roughness: 0.5,
                    metalness: 0.2
                });
                const dialMat = new THREE.MeshBasicMaterial({ color: 0xF8FAFC });
                const redLampMat = new THREE.MeshBasicMaterial({ color: 0xEF4444 });
                const grnLampMat = new THREE.MeshBasicMaterial({ color: 0x10B981 });

                // 1. CRUCIFORM GROUND MOUNT & LEVELING SCREW JACKS (Chân đế bệ phóng chữ thập)
                // 1a. Central Pedestal Hub & Traverse Foundation
                const hubBase = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 2.15, 0.42, 16), darkSteel);
                hubBase.position.y = 0.21;
                root.add(hubBase);

                const hubRim = new THREE.Mesh(new THREE.TorusGeometry(1.88, 0.045, 8, 24), darkSteel);
                hubRim.rotation.x = Math.PI / 2;
                hubRim.position.y = 0.42;
                root.add(hubRim);

                // Ground Power/Hydraulic Distribution Box
                const groundJunction = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.42, 0.36), armorGreen);
                groundJunction.position.set(-1.45, 0.22, 1.45);
                groundJunction.rotation.y = Math.PI / 4;
                const gland1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8), brassMat);
                gland1.position.set(-1.45, 0.45, 1.45);
                root.add(groundJunction, gland1);

                // Thick rubber control cable conduit looping to central hub
                const groundCable = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.04, 8, 16, Math.PI), rubberMat);
                groundCable.rotation.x = Math.PI / 2;
                groundCable.rotation.z = -Math.PI / 4;
                groundCable.position.set(-0.85, 0.15, 0.85);
                root.add(groundCable);

                // 1b. 4 Heavy Cruciform Outrigger Arms (Càng chống bệ phóng)
                for (let j = 0; j < 4; j++) {
                    const ang = (j * Math.PI) / 2 + Math.PI / 4;
                    const armGroup = new THREE.Group();
                    armGroup.rotation.y = ang;

                    // Main arm box girder
                    const armBeam = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.38, 3.8), armorGreen);
                    armBeam.position.set(0, 0.22, 2.2);
                    armGroup.add(armBeam);

                    // Top flange reinforcement
                    const armTop = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.05, 3.6), darkSteel);
                    armTop.position.set(0, 0.43, 2.2);
                    armGroup.add(armTop);

                    // Radial root gusset reinforcing the hub joint
                    const rootGusset = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 1.2), darkSteel);
                    rootGusset.position.set(0, 0.42, 0.9);
                    armGroup.add(rootGusset);

                    // Hazard marker band near the arm tip
                    const hazardBand = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.39, 0.5), hazardMat);
                    hazardBand.position.set(0, 0.22, 3.4);
                    armGroup.add(hazardBand);

                    // Leveling screw jack end housing at r = 4.1m
                    const jackHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.52, 14), darkSteel);
                    jackHousing.position.set(0, 0.32, 4.1);
                    armGroup.add(jackHousing);

                    // Threaded vertical screw shaft
                    const screwShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.72, 12), chromeMat);
                    screwShaft.position.set(0, 0.38, 4.1);
                    armGroup.add(screwShaft);

                    // Circular ground stabilizer footpad touching the ground
                    const footPad = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.54, 0.10, 16), darkSteel);
                    footPad.position.set(0, 0.05, 4.1);
                    armGroup.add(footPad);

                    // Manual screw jack adjustment handwheel on top
                    const handwheel = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.035, 6, 16), darkSteel);
                    handwheel.rotation.x = Math.PI / 2;
                    handwheel.position.set(0, 0.74, 4.1);
                    armGroup.add(handwheel);

                    // Ground stake driven beside each pad
                    const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 8), darkSteel);
                    stake.position.set(0.48, 0.18, 4.1);
                    stake.rotation.z = 0.15;
                    armGroup.add(stake);

                    root.add(armGroup);
                }

                // 2. AZIMUTH TRAVERSING TURNTABLE (Mâm quay phương vị)
                const yawTurntable = new THREE.Group();

                // 2a. Fixed bottom traverse ring gear & rotating turntable deck
                const traverseRing = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.76, 0.22, 32), darkSteel);
                traverseRing.position.y = 0.52;
                yawTurntable.add(traverseRing);

                const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.72, 1.72, 0.42, 32), armorGreen);
                drum.position.y = 0.82;
                yawTurntable.add(drum);

                const deckPlate = new THREE.Mesh(new THREE.CylinderGeometry(1.82, 1.82, 0.08, 32), treadMat);
                deckPlate.position.y = 1.05;
                yawTurntable.add(deckPlate);

                // Center swivel cable core
                const centerSwivel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.35, 16), darkSteel);
                centerSwivel.position.y = 1.2;
                yawTurntable.add(centerSwivel);

                // 2b. Twin Trunnion Support Stanchions (A-frame uprights at x = ±1.35)
                [-1.35, 1.35].forEach(cx => {
                    const stanchion = new THREE.Group();
                    stanchion.position.set(cx, 0, 0);

                    // Main upright welded girder plate
                    const upright = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.55, 2.2), armorGreen);
                    upright.position.set(0, 1.82, 0);
                    stanchion.add(upright);

                    // Stenciled outer face plate
                    const facePlate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.4, 2.0), stenciledArmor);
                    facePlate.position.set(cx < 0 ? -0.20 : 0.20, 1.82, 0);
                    stanchion.add(facePlate);

                    // Front & rear diagonal reinforcement gussets
                    [-0.95, 0.95].forEach(gz => {
                        const brace = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.82, 0.72), armorGreen);
                        brace.position.set(0, 1.42, gz);
                        brace.rotation.x = gz < 0 ? 0.42 : -0.42;
                        stanchion.add(brace);
                    });

                    // Large horizontal trunnion bearing housing at pivot (y = 2.45, z = 0)
                    const bearingHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.48, 16), darkSteel);
                    bearingHousing.rotation.z = Math.PI / 2;
                    bearingHousing.position.set(0, 2.45, 0);
                    stanchion.add(bearingHousing);

                    // Retainer endcap flange and center chrome pivot axle pin
                    const axleCap = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.08, 16), darkSteel);
                    axleCap.rotation.z = Math.PI / 2;
                    axleCap.position.set(cx < 0 ? -0.26 : 0.26, 2.45, 0);
                    const axlePin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 12), chromeMat);
                    axlePin.rotation.z = Math.PI / 2;
                    axlePin.position.set(cx < 0 ? -0.32 : 0.32, 2.45, 0);
                    stanchion.add(axleCap, axlePin);

                    yawTurntable.add(stanchion);
                });

                // Tubular torque crossmember connecting the two stanchions
                const torqueTube = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.4, 12), darkSteel);
                torqueTube.rotation.z = Math.PI / 2;
                torqueTube.position.set(0, 1.65, 0.75);
                yawTurntable.add(torqueTube);

                // 2c. Operator Inspection Catwalk & Handrail (Right side, x = +1.85)
                const catwalk = new THREE.Group();
                catwalk.position.set(1.85, 1.08, 0.1);
                const platform = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 1.75), treadMat);
                catwalk.add(platform);

                // Tubular safety railing around catwalk perimeter
                [[-0.4, -0.85], [0.4, -0.85], [0.4, 0.85], [-0.4, 0.85]].forEach(([rx, rz]) => {
                    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.72, 8), darkSteel);
                    post.position.set(rx, 0.38, rz);
                    catwalk.add(post);
                });
                const topRailSide = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 1.75), darkSteel);
                topRailSide.position.set(0.4, 0.72, 0);
                const topRailFront = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.04), darkSteel);
                topRailFront.position.set(0, 0.72, -0.85);
                catwalk.add(topRailSide, topRailFront);

                // Ladder rungs descending to the ground
                for (let lr = 0; lr < 3; lr++) {
                    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 8), darkSteel);
                    rung.position.set(0.42, -0.25 - lr * 0.28, 0.5);
                    catwalk.add(rung);
                }
                yawTurntable.add(catwalk);

                // 2d. Electrical & Hydraulic Control Console (Left side, x = -1.68)
                const consoleGroup = new THREE.Group();
                consoleGroup.position.set(-1.68, 1.52, 0.15);
                const consoleBox = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.72, 0.62), armorGreen);
                consoleGroup.add(consoleBox);

                // Instrument dials (Pressure & Voltage gauges)
                [-0.14, 0.14].forEach(dz => {
                    const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), brassMat);
                    bezel.rotation.z = Math.PI / 2;
                    bezel.position.set(-0.19, 0.15, dz);
                    const dial = new THREE.Mesh(new THREE.CircleGeometry(0.07, 12), dialMat);
                    dial.rotation.y = -Math.PI / 2;
                    dial.position.set(-0.215, 0.15, dz);
                    consoleGroup.add(bezel, dial);
                });

                // Status indicator lamps (Red & Green)
                const redLamp = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), redLampMat);
                redLamp.position.set(-0.19, -0.12, -0.12);
                const grnLamp = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), grnLampMat);
                grnLamp.position.set(-0.19, -0.12, 0.12);
                consoleGroup.add(redLamp, grnLamp);

                // Hydraulic accumulator bottle
                const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.58, 12), darkSteel);
                bottle.position.set(0.12, 0.05, 0.42);
                const bottleCap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.10, 8), brassMat);
                bottleCap.position.set(0.12, 0.38, 0.42);
                consoleGroup.add(bottle, bottleCap);

                // Flexible conduit line linking console to trunnion pivot
                const conduit = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 8, 16, Math.PI / 2), rubberMat);
                conduit.position.set(0.2, 0.35, -0.1);
                consoleGroup.add(conduit);

                yawTurntable.add(consoleGroup);

                // 3. ELEVATION FRAME & LAUNCH RAIL BOOM (Cần phóng ray trượt - pitchBoom)
                // Pivots in elevation around (0, 2.45, 0)
                const pitchBoom = new THREE.Group();
                pitchBoom.position.set(0, 2.45, 0);

                // 3a. Main Longitudinal Box Girder & Stenciled Body
                const girder = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.52, 10.0), armorGreen);
                girder.position.set(0, 0.16, -0.1);
                pitchBoom.add(girder);

                // Bottom flange plate
                const bottomFlange = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.06, 9.6), darkSteel);
                bottomFlange.position.set(0, -0.13, -0.1);
                pitchBoom.add(bottomFlange);

                // Top guide deck
                const topDeck = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.06, 9.8), darkSteel);
                topDeck.position.set(0, 0.45, -0.1);
                pitchBoom.add(topDeck);

                // Side stenciled panels
                [-0.55, 0.55].forEach(sx => {
                    const sidePanel = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.42, 6.2), stenciledArmor);
                    sidePanel.position.set(sx, 0.16, -0.1);
                    pitchBoom.add(sidePanel);
                });

                // Dual guide rail tracks on top surface for missile launch shoes
                [-0.22, 0.22].forEach(rx => {
                    const railTrack = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.08, 9.4), darkSteel);
                    railTrack.position.set(rx, 0.51, -0.2);
                    pitchBoom.add(railTrack);
                });

                // Central launch shoe slider channel
                const centerChannel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 9.4), darkSteel);
                centerChannel.position.set(0, 0.49, -0.2);
                pitchBoom.add(centerChannel);

                // 3b. BLAST DEFLECTOR SHIELD (Máng chắn lửa luồng phụt tên lửa)
                // Positioned under the rear launcher rail (z = +1.9 to +4.5) beneath the solid rocket booster nozzle
                const blastGroup = new THREE.Group();
                blastGroup.position.set(0, -0.25, 3.2);
                blastGroup.rotation.x = -0.18; // Angles flame downward and rearward

                // Curved trough heat bucket (rotated 180° on Z to cup upwards as flame gutter)
                const blastTrough = new THREE.Mesh(this.buildParabolicTrough(1.5, 2.6, 0.42, 0.06), blastMat);
                blastTrough.rotation.z = Math.PI;
                blastGroup.add(blastTrough);

                // Flared side deflection cheeks
                [-0.72, 0.72].forEach(cx => {
                    const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 2.5), blastMat);
                    cheek.position.set(cx, 0.12, 0);
                    cheek.rotation.z = cx < 0 ? -0.35 : 0.35;
                    blastGroup.add(cheek);
                });

                // 4 Longitudinal heat-dissipating cooling fins under trough
                [-0.45, -0.15, 0.15, 0.45].forEach(fx => {
                    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 2.4), darkSteel);
                    rib.position.set(fx, -0.22, 0);
                    blastGroup.add(rib);
                });
                pitchBoom.add(blastGroup);

                // 3c. Heavy Hydraulic Lift Cylinders & Chrome Telescoping Rams
                // ponytail: static hydraulic cylinder linkage; upgrade to dynamic inverse-kinematics constraints if elevation animated continuously
                [-0.68, 0.68].forEach(px => {
                    const cylGroup = new THREE.Group();
                    cylGroup.position.set(px, -0.18, -1.4);
                    cylGroup.rotation.x = Math.PI / 5;

                    // Boom clevis hinge bracket
                    const clevis = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.28), darkSteel);
                    clevis.position.set(0, 0, 0);
                    cylGroup.add(clevis);

                    // Chrome telescoping piston rod
                    const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.4, 14), chromeMat);
                    piston.position.set(0, -0.95, 0);
                    cylGroup.add(piston);

                    // Outer hydraulic cylinder jacket sleeve
                    const jacket = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.6, 14), armorGreen);
                    jacket.position.set(0, -1.55, 0);
                    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.15, 14), darkSteel);
                    collar.position.set(0, -0.78, 0);
                    const fitting = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.12), brassMat);
                    fitting.position.set(0.18, -1.05, 0);
                    cylGroup.add(jacket, collar, fitting);

                    // High-pressure hydraulic fluid line
                    const hose = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 8), rubberMat);
                    hose.position.set(0.22, -1.5, 0);
                    cylGroup.add(hose);

                    pitchBoom.add(cylGroup);
                });

                // 3d. Forward Missile Support Cradle / Yoke (Càng đỡ thân trước tên lửa tại z = -3.2)
                const yokeGroup = new THREE.Group();
                yokeGroup.position.set(0, 0.52, -3.2);
                const yokeBase = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.22), darkSteel);
                yokeGroup.add(yokeBase);
                [-0.35, 0.35].forEach(yx => {
                    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.18), armorGreen);
                    arm.position.set(yx, 0.15, 0);
                    arm.rotation.z = yx < 0 ? -0.32 : 0.32;
                    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.06, 0.20), rubberMat);
                    pad.position.set(yx * 1.05, 0.28, 0);
                    yokeGroup.add(arm, pad);
                });
                pitchBoom.add(yokeGroup);

                // Hold-back launch shoes & locking stops for missile booster lugs
                [1.8, 3.6].forEach(lz => {
                    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.25), darkSteel);
                    shoe.position.set(0, 0.54, lz);
                    pitchBoom.add(shoe);
                });

                // 3e. Quick-Disconnect Umbilical Electrical Swing Arm (Cần cắm cáp điều khiển phóng)
                const umbilical = new THREE.Group();
                umbilical.position.set(-0.68, 0.48, 0.2);
                const uBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 8), darkSteel);
                const uMast = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.65, 8), darkSteel);
                uMast.position.set(0, 0.32, 0);
                uMast.rotation.z = -0.22;
                const uPlug = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.18), brassMat);
                uPlug.position.set(0.12, 0.58, 0);
                const uWire = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 6, 12, Math.PI), rubberMat);
                uWire.position.set(-0.08, 0.25, 0);
                umbilical.add(uBase, uMast, uPlug, uWire);
                pitchBoom.add(umbilical);

                // 3f. Toothed Elevation Gear Quadrant & Counterweight Block
                const gearArc = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.92, 0.92, 0.28, 20, 1, false, 0, Math.PI),
                    darkSteel
                );
                gearArc.rotation.z = Math.PI / 2;
                gearArc.rotation.x = Math.PI;
                gearArc.position.set(0, -0.32, 0);
                pitchBoom.add(gearArc);

                const counterweight = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.42, 1.15), darkSteel);
                counterweight.position.set(0, -0.22, 1.15);
                pitchBoom.add(counterweight);

                // 4. LOADED MISSILE (V-750 / SAM-2)
                const loadedMissile = this.createSAM2Missile();
                loadedMissile.position.set(0, 0.95, -0.4);
                pitchBoom.add(loadedMissile);

                yawTurntable.add(pitchBoom);
                root.add(yawTurntable);

                return { root, yawTurntable, pitchBoom, loadedMissile };
            },

            buildParabolicTrough(width, length, depth, thickness = 0.08) {
                const shape = new THREE.Shape();
                const steps = 16;
                for (let i = 0; i <= steps; i++) {
                    const u = (i / steps) * 2 - 1;
                    const x = u * (width / 2);
                    const y = (1 - u * u) * depth;
                    if (i === 0) shape.moveTo(x, y);
                    else shape.lineTo(x, y);
                }
                for (let i = steps; i >= 0; i--) {
                    const u = (i / steps) * 2 - 1;
                    const x = u * (width / 2);
                    const y = (1 - u * u) * depth - thickness;
                    shape.lineTo(x, y);
                }
                shape.closePath();
                const ExtrudeGeom = THREE.ExtrudeBufferGeometry || THREE.ExtrudeGeometry;
                const geom = new ExtrudeGeom(shape, {
                    depth: length,
                    bevelEnabled: false,
                    steps: 1
                });
                geom.center();
                return geom;
            },

            /**
             * 4. SNR-75 "FAN SONG" FIRE-CONTROL RADAR (СНР-75 ДВИНА)
             */
            createFanSongRadar() {
                this.initTextures();
                if (this.customGLBModels.RADAR) return this.customGLBModels.RADAR.clone();
                const group = new THREE.Group();

                const vanMat = new THREE.MeshStandardMaterial({
                    color: 0x2E3B2C,
                    map: this.textures.radarCabin || null,
                    roughness: 0.55,
                    metalness: 0.35
                });
                const armorMat = new THREE.MeshStandardMaterial({
                    color: 0x334230,
                    roughness: 0.5,
                    metalness: 0.45
                });
                const darkSteel = new THREE.MeshStandardMaterial({
                    color: 0x1B1F23,
                    roughness: 0.35,
                    metalness: 0.85
                });
                const dishMat = new THREE.MeshStandardMaterial({
                    color: 0x75808C,
                    map: this.textures.radarDish || null,
                    roughness: 0.35,
                    metalness: 0.75,
                    side: THREE.DoubleSide
                });
                const rubberMat = new THREE.MeshStandardMaterial({
                    color: 0x16181A,
                    roughness: 0.9,
                    metalness: 0.05
                });
                const rimMat = new THREE.MeshStandardMaterial({
                    color: 0x2A3326,
                    roughness: 0.4,
                    metalness: 0.6
                });
                const chromeMat = new THREE.MeshStandardMaterial({
                    color: 0xEEEEEE,
                    roughness: 0.1,
                    metalness: 0.95
                });
                const brassMat = new THREE.MeshStandardMaterial({
                    color: 0xC4A052,
                    roughness: 0.25,
                    metalness: 0.85
                });
                const opticMat = new THREE.MeshStandardMaterial({
                    color: 0x1E3A8A,
                    roughness: 0.1,
                    metalness: 0.9
                });
                const beaconMat = new THREE.MeshBasicMaterial({ color: 0xFF2222 });

                // 1. Heavy Towed Trailer Chassis & Axles
                [-1.25, 1.25].forEach(x => {
                    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 6.4), darkSteel);
                    beam.position.set(x, 0.78, 0);
                    group.add(beam);
                });
                [-2.4, -0.8, 0.8, 2.4].forEach(z => {
                    const cross = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.24, 0.28), darkSteel);
                    cross.position.set(0, 0.78, z);
                    group.add(cross);
                });

                // A-frame Tow Hitch & Towing Ring
                [-0.55, 0.55].forEach(x => {
                    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 1.45), darkSteel);
                    bar.position.set(x * 0.7, 0.72, 3.8);
                    bar.rotation.y = (x < 0 ? -0.42 : 0.42);
                    bar.rotation.x = 0.09;
                    group.add(bar);
                });
                const hitchRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 8, 16), darkSteel);
                hitchRing.rotation.x = Math.PI / 2;
                hitchRing.position.set(0, 0.65, 4.45);
                group.add(hitchRing);

                // 4 Military All-Terrain Wheels with Mudguards
                [[-1.85, 1.3], [1.85, 1.3], [-1.85, -1.4], [1.85, -1.4]].forEach(([wx, wz]) => {
                    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.44, 20), rubberMat);
                    tire.rotation.z = Math.PI / 2;
                    tire.position.set(wx, 0.72, wz);

                    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.46, 16), rimMat);
                    rim.rotation.z = Math.PI / 2;
                    rim.position.set(wx, 0.72, wz);

                    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 0.50, 12), darkSteel);
                    hub.rotation.z = Math.PI / 2;
                    hub.position.set(wx, 0.72, wz);

                    const fender = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.52, 16, 1, true, 0, Math.PI), armorMat);
                    fender.rotation.z = Math.PI / 2;
                    fender.position.set(wx, 0.82, wz);

                    group.add(tire, rim, hub, fender);
                });

                // 4 Leveling Outrigger Stabilizer Jacks
                // ponytail: static deployed jacks; fold into transit brackets if mobile convoy mode added
                [[-1.3, -2.5], [1.3, -2.5], [-1.3, 2.5], [1.3, 2.5]].forEach(([cx, cz]) => {
                    const targetX = cx * 1.7;
                    const targetZ = cz * 1.15;
                    const midX = (cx + targetX) / 2;
                    const midZ = (cz + targetZ) / 2;
                    const dx = targetX - cx;
                    const dz = targetZ - cz;
                    const len = Math.sqrt(dx * dx + dz * dz);

                    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, len), darkSteel);
                    leg.position.set(midX, 0.62, midZ);
                    leg.rotation.y = Math.atan2(dx, dz);

                    const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.58, 12), darkSteel);
                    jack.position.set(targetX, 0.45, targetZ);

                    const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.40, 12), chromeMat);
                    piston.position.set(targetX, 0.22, targetZ);

                    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 16), darkSteel);
                    pad.position.set(targetX, 0.04, targetZ);

                    group.add(leg, jack, piston, pad);
                });

                // 2. Electronics & Transmitter Van Cabin
                const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.35, 5.2), vanMat);
                cabin.position.set(0, 2.15, -0.05);
                group.add(cabin);

                const roofCap = new THREE.Mesh(new THREE.BoxGeometry(4.55, 0.14, 5.35), armorMat);
                roofCap.position.set(0, 3.39, -0.05);
                group.add(roofCap);

                const walkway = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.06, 3.8), darkSteel);
                walkway.position.set(0, 3.48, -0.1);
                group.add(walkway);

                // Rear double doors with latch & lock bar
                const rearDoors = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.85, 0.08), armorMat);
                rearDoors.position.set(0, 2.0, -2.68);
                const doorSeam = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.85, 0.12), darkSteel);
                doorSeam.position.set(0, 2.0, -2.68);
                const doorHandle = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.14), darkSteel);
                doorHandle.position.set(0.18, 2.0, -2.74);
                group.add(rearDoors, doorSeam, doorHandle);

                // Technician access ladder on rear
                [-0.2, 0.2].forEach(lx => {
                    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.35, 8), darkSteel);
                    rail.position.set(1.4 + lx, 2.18, -2.74);
                    group.add(rail);
                });
                for (let r = 0; r < 6; r++) {
                    const rung = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.035, 0.035), darkSteel);
                    rung.position.set(1.4, 1.15 + r * 0.42, -2.74);
                    group.add(rung);
                }

                // Louvered cooling vent frame & generator cable reel
                const ventFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 1.25), darkSteel);
                ventFrame.position.set(-2.23, 2.35, 0.6);
                const cableReel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.26, 16), darkSteel);
                cableReel.rotation.z = Math.PI / 2;
                cableReel.position.set(2.28, 1.8, -1.2);
                group.add(ventFrame, cableReel);

                // 3. Turntable Pedestal Base & Elevation Yoke
                const turntable = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.85, 0.32, 28), darkSteel);
                turntable.position.set(0, 3.65, 0);
                const gearRing = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.14, 32), armorMat);
                gearRing.position.set(0, 3.58, 0);
                const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.15, 1.3, 20), armorMat);
                mast.position.set(0, 4.45, 0);
                group.add(turntable, gearRing, mast);

                [-0.78, 0.78].forEach(x => {
                    const stanchion = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.5, 0.95), armorMat);
                    stanchion.position.set(x, 5.55, 0);
                    group.add(stanchion);
                });

                const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.1, 16), chromeMat);
                shaft.rotation.z = Math.PI / 2;
                shaft.position.set(0, 6.0, 0);
                group.add(shaft);

                // 4. Rotating Scanner Head Assembly (tracked by gameplay loop)
                const scannerHead = new THREE.Group();
                scannerHead.name = 'scannerHead';
                scannerHead.position.set(0, 6.0, 0);

                const hub = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.25, 1.6), armorMat);
                hub.position.set(0, 0.25, -0.05);
                scannerHead.add(hub);

                const counterWeight = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.85, 0.75), darkSteel);
                counterWeight.position.set(0, 0.15, -1.05);
                scannerHead.add(counterWeight);

                // 4a. Horizontal Trough Antenna (Elevation Scan - Quét góc tà)
                const horizGeo = this.buildParabolicTrough(4.4, 1.2, 0.75, 0.08);
                const horizDish = new THREE.Mesh(horizGeo, dishMat);
                horizDish.rotation.x = Math.PI / 2;
                horizDish.position.set(0, 0.45, 0.85);
                scannerHead.add(horizDish);

                [-1.5, -0.5, 0.5, 1.5].forEach(rx => {
                    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.25, 0.35), darkSteel);
                    rib.position.set(rx, 0.45, 0.65);
                    scannerHead.add(rib);
                });

                const horizFeed = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.12, 0.14), brassMat);
                horizFeed.position.set(0, 0.45, 1.6);
                [-1.6, 1.6].forEach(sx => {
                    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.05), darkSteel);
                    strut.rotation.x = Math.PI / 4;
                    strut.position.set(sx, 0.45, 1.2);
                    scannerHead.add(strut);
                });
                scannerHead.add(horizFeed);

                // 4b. Vertical Trough Antenna (Azimuth Scan - Quét phương vị)
                const vertGeo = this.buildParabolicTrough(4.0, 1.2, 0.75, 0.08);
                const vertDish = new THREE.Mesh(vertGeo, dishMat);
                vertDish.rotation.set(0, Math.PI / 2, Math.PI / 2);
                vertDish.position.set(1.95, 0.35, 0.25);
                scannerHead.add(vertDish);

                [-1.2, -0.4, 0.4, 1.2].forEach(ry => {
                    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 1.25), darkSteel);
                    rib.position.set(1.75, 0.35 + ry, 0.05);
                    scannerHead.add(rib);
                });

                const vertFeed = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.4, 0.12), brassMat);
                vertFeed.position.set(1.95, 0.35, 1.0);
                [-1.4, 1.4].forEach(sy => {
                    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.95), darkSteel);
                    strut.rotation.x = Math.PI / 4;
                    strut.position.set(1.95, 0.35 + sy, 0.65);
                    scannerHead.add(strut);
                });
                const vertArm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.55), darkSteel);
                vertArm.position.set(1.15, 0.35, 0.05);
                scannerHead.add(vertFeed, vertArm);

                // 4c. Forward Missile Command Uplink Parabolic Dish (Ăng-ten rãnh đạn V-750)
                const cmdDishGroup = new THREE.Group();
                cmdDishGroup.position.set(-1.55, -0.15, 1.05);

                const cmdDish = new THREE.Mesh(new THREE.SphereGeometry(0.92, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.36), dishMat);
                cmdDish.rotation.x = -Math.PI / 2;
                cmdDishGroup.add(cmdDish);

                const cmdRim = new THREE.Mesh(new THREE.TorusGeometry(0.83, 0.035, 8, 28), darkSteel);
                cmdRim.position.z = -0.39;
                cmdDishGroup.add(cmdRim);

                const cmdFeed = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.10, 0.45, 12), brassMat);
                cmdFeed.rotation.x = Math.PI / 2;
                cmdFeed.position.z = 0.1;
                cmdDishGroup.add(cmdFeed);

                for (let a = 0; a < 3; a++) {
                    const ang = (a * Math.PI * 2) / 3;
                    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.95, 8), darkSteel);
                    strut.position.set(Math.cos(ang) * 0.42, Math.sin(ang) * 0.42, -0.14);
                    strut.rotation.z = -ang;
                    strut.rotation.x = 0.48;
                    cmdDishGroup.add(strut);
                }

                const cmdBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.8, 12), darkSteel);
                cmdBoom.rotation.x = Math.PI / 2;
                cmdBoom.position.set(0, 0, -1.0);
                cmdDishGroup.add(cmdBoom);
                scannerHead.add(cmdDishGroup);

                // 4d. Secondary Narrow-Beam LORO Anti-Jamming Tracking Dish
                const loroGroup = new THREE.Group();
                loroGroup.position.set(-1.55, 1.15, 0.85);

                const loroDish = new THREE.Mesh(new THREE.SphereGeometry(0.56, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.35), dishMat);
                loroDish.rotation.x = -Math.PI / 2;
                loroGroup.add(loroDish);

                const loroRim = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.025, 8, 24), darkSteel);
                loroRim.position.z = -0.25;
                loroGroup.add(loroRim);

                const loroFeed = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.32, 12), brassMat);
                loroFeed.rotation.x = Math.PI / 2;
                loroFeed.position.z = 0.08;
                loroGroup.add(loroFeed);

                for (let a = 0; a < 3; a++) {
                    const ang = (a * Math.PI * 2) / 3;
                    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.58, 8), darkSteel);
                    strut.position.set(Math.cos(ang) * 0.25, Math.sin(ang) * 0.25, -0.08);
                    strut.rotation.z = -ang;
                    strut.rotation.x = 0.46;
                    loroGroup.add(strut);
                }

                const loroBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.7, 10), darkSteel);
                loroBoom.rotation.x = Math.PI / 2;
                loroBoom.position.set(0, 0, -0.55);
                loroGroup.add(loroBoom);
                scannerHead.add(loroGroup);

                // 4e. Historical "Karat" / PA-00 Optical Tracking Periscope
                const opticGroup = new THREE.Group();
                opticGroup.position.set(0, 1.18, 0.25);
                const opticBody = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.44, 0.88), armorMat);
                opticGroup.add(opticBody);

                [-0.16, 0.16].forEach(ox => {
                    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.25, 16), darkSteel);
                    barrel.rotation.x = Math.PI / 2;
                    barrel.position.set(ox, 0, 0.46);
                    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.1, 16, 1, true), darkSteel);
                    hood.rotation.x = Math.PI / 2;
                    hood.position.set(ox, 0, 0.54);
                    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), opticMat);
                    lens.position.set(ox, 0, 0.55);
                    opticGroup.add(barrel, hood, lens);
                });

                const prismCap = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.35), darkSteel);
                prismCap.position.set(0, 0.28, 0.15);
                opticGroup.add(prismCap);
                scannerHead.add(opticGroup);

                // 4f. "Kremniy-2" IFF Dipole Array
                const iffGroup = new THREE.Group();
                iffGroup.position.set(0, 1.25, 0.85);
                const iffBar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.06), darkSteel);
                iffGroup.add(iffBar);
                for (let d = -2; d <= 2; d++) {
                    const dipole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.46, 8), brassMat);
                    dipole.position.set(d * 0.38, 0.20, 0);
                    iffGroup.add(dipole);
                }
                scannerHead.add(iffGroup);

                // 4g. Red Tactical Obstruction Warning Beacon Light
                const beaconMast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.85, 10), darkSteel);
                beaconMast.position.set(0, 1.65, -0.45);
                const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.18, 12), darkSteel);
                beaconBase.position.set(0, 2.05, -0.45);
                const beaconLight = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), beaconMat);
                beaconLight.position.set(0, 2.18, -0.45);
                scannerHead.add(beaconMast, beaconBase, beaconLight);

                // 4h. Waveguide Microwave Conduits
                [-0.7, 0.7].forEach(wx => {
                    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.2, 8), brassMat);
                    pipe.position.set(wx, 0.2, 0.2);
                    pipe.rotation.z = wx < 0 ? 0.35 : -0.35;
                    scannerHead.add(pipe);
                });

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

                // Large Arc Sandbag Revetment behind launcher #03 (clears camera orbit & pitch slide)
                // ponytail: static circular arc around (2.8, 20.5); add procedural height noise if terrain uneven
                const bagGeo = new THREE.SphereGeometry(0.58, 8, 6);
                const arcR = 21, arcSpan = 2.8, numBags = 38, step = arcSpan / (numBags - 1);
                for (let row = 0; row < 4; row++) {
                    const r = arcR - row * 0.08, y = 0.35 + row * 0.48;
                    for (let i = 0; i < numBags; i++) {
                        const phi = -arcSpan / 2 + (i + (row % 2) * 0.5) * step;
                        const bag = new THREE.Mesh(bagGeo, bagMat);
                        bag.scale.set(1.5, 0.62, 0.95);
                        bag.position.set(2.8 + r * Math.sin(phi), y, 20.5 + r * Math.cos(phi));
                        bag.rotation.y = phi;
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

                // Traditional Hanoi Curved-Roof Houses (Nhà mái ngói cổ Hà Nội)
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

