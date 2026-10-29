const assert = require('assert');
const fs = require('fs');

// Verify that 03_scene_environment.js and 05_combat_simulation.js define the upgraded 3D ground model
const sceneCode = fs.readFileSync('src/js/03_scene_environment.js', 'utf8');
const combatCode = fs.readFileSync('src/js/05_combat_simulation.js', 'utf8');

// 1. Terrain resolution & bump mapping
assert(sceneCode.includes('PlaneBufferGeometry(680, 680, 192, 192)'), 'Terrain geometry should use 192x192 resolution');
assert(sceneCode.includes('bumpMap: terrainBump'), 'Terrain material should include procedural bumpMap');
assert(sceneCode.includes('bumpScale: 0.22'), 'Terrain material should configure bumpScale for 3D micro-relief');

// 2. Realistic topography: Red River depression, dikes (Đê Sông Hồng), lakes, flat battery
assert(sceneCode.includes('distToRiverCurve'), 'Topography must compute distance to Red River curve');
assert(sceneCode.includes('dikeF * 2.2'), 'Dike crests should elevate up to ~2.2m along riverbanks');
assert(sceneCode.includes('distFromBattery < 7.5) return 0.0'), 'Battery site must remain level at y=0 for equipment');
assert(sceneCode.includes('Math.min(24, mtnF * mtnF * mtnProfile)'), 'Distant mountains should rise on outer perimeter');

// 3. Specular water mesh for Red River & lakes
assert(sceneCode.includes('waterMesh.position.y = -0.52'), 'Water mesh should sit at -0.52m to fill riverbed and lakes');
assert(sceneCode.includes('roughness: 0.12') && sceneCode.includes('metalness: 0.82'), 'Water material should possess high specular reflectance');

// 4. Natural 3D Trees with woody trunks and tiered organic crowns
assert(sceneCode.includes('CylinderGeometry(0.12, 0.22, 1.2, 5)'), 'Trees should possess dedicated bark cylinder trunks');
assert(sceneCode.includes('DodecahedronGeometry(0.9, 0)'), 'Trees should possess lush tiered foliage crowns');
assert(sceneCode.includes('worldCombatGroup.add(trunks, crowns)'), 'Both trunk and crown instanced meshes must be added to combat group');

// 5. High-detail concrete launch pads & tactical signal cables
assert(sceneCode.includes('padCanvas'), 'Launch pad should use high-detail procedural canvas texture');
assert(sceneCode.includes('blastGrad'), 'Launch pad should feature rocket booster exhaust scorch marks');
assert(sceneCode.includes('addCable'), 'Battlefield should include tactical cables connecting radar to launchers');

// 6. Distant mountain horizon (Tam Đảo & Ba Vì)
assert(combatCode.includes('distantMountains = new THREE.Mesh(mtnGeo, mtnMat)'), 'Outer arena must include distant mountain silhouette ring');

// 7. Verify compiled index.html contains all ground model upgrades
const indexHtml = fs.readFileSync('index.html', 'utf8');
assert(indexHtml.includes('PlaneBufferGeometry(680, 680, 192, 192)'), 'index.html must contain 192x192 terrain');
assert(indexHtml.includes('waterMesh.position.y = -0.52'), 'index.html must contain waterMesh');
assert(indexHtml.includes('distantMountains'), 'index.html must contain distant mountain ring');

console.log('✓ All 3D Ground & Terrain Model assertions PASSED successfully!');
