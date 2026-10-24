/**
 * CHRONOVÉ — Movement Engine (Three.js r149, global THREE from the loader).
 *
 * The only place on the site that uses WebGL / canvas. A five-layer watch:
 *   0 Case (bevelled lathe-turned body, gold bezel, lugs, crown)
 *   1 Movement (plate, gear train, balance wheel with hairspring, ruby jewels)
 *   2 Bridge (perlage-textured plate with screws)
 *   3 Dial (sunburst texture, printed minute track, applied gold hour markers)
 *   4 Crystal and hands (domed sapphire with transmission, three hands on your device clock)
 *
 * Realism comes from physically based materials and image-based lighting: a procedural studio
 * "softbox" environment is baked with PMREM and used for reflections on every metal; a generated
 * brushed texture drives roughness; the crystal is a transmissive MeshPhysicalMaterial; a
 * directional light casts soft (PCF) shadows onto a shadow-catching floor.
 *
 * Returns null when WebGL or THREE is unavailable, so the page can show a text fallback.
 */

export function createEngine(canvas, { onPick = () => {}, onCaption = () => {}, reduced = false } = {}) {
  const T = window.THREE;
  if (!T) return null;
  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  if (!renderer.getContext()) return null;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, 1, 0.1, 80);

  /* ------------------------------------------------------------------ *
   * Environment: a procedural studio, baked once into a PMREM cube map
   * ------------------------------------------------------------------ */
  (function buildEnvironment() {
    const env = new T.Scene();
    env.add(new T.Mesh(new T.SphereGeometry(30, 48, 24), new T.MeshBasicMaterial({ color: 0x0c1018, side: T.BackSide })));
    const panel = (w, h, pos, intensity, color = 0xffffff) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(color).multiplyScalar(intensity), side: T.DoubleSide }));
      m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
    };
    panel(14, 8, [0, 16, 2], 9);                       // large overhead softbox: soft top highlight
    panel(3, 16, [-14, 4, 4], 7, 0xdfe8ff);            // cool left strip: long vertical streak on flanks
    panel(3, 16, [14, 3, -4], 6, 0xffe6c0);            // warm right strip
    panel(18, 2, [0, -4, -15], 4);                     // rim from behind
    panel(6, 6, [0, 5, 14], 2.2, 0xfff2dd);            // fill from the front
    const pmrem = new T.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(env, 0.035).texture;
    pmrem.dispose();
    env.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
  })();

  /* Lights for shadows and warmth (the environment does the reflections) */
  const key = new T.DirectionalLight(0xfff1dc, 1.4);
  key.position.set(5, 11, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.radius = 5;
  scene.add(key, new T.HemisphereLight(0xaec4ff, 0x1a1208, 0.35));

  const floor = new T.Mesh(new T.PlaneGeometry(40, 40), new T.ShadowMaterial({ opacity: 0.38 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.6; floor.receiveShadow = true;
  scene.add(floor);

  /* ------------------------------------------------------------------ *
   * Procedural textures (2D canvas → texture; only used on this page)
   * ------------------------------------------------------------------ */
  const canvasTex = (size, draw, { srgb = false, repeat = null } = {}) => {
    const c = document.createElement('canvas'); c.width = c.height = size;
    draw(c.getContext('2d'), size);
    const t = new T.CanvasTexture(c);
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    if (srgb) t.encoding = T.sRGBEncoding;
    if (repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(...repeat); }
    return t;
  };
  /** Fine, mostly-horizontal streaks, used as roughness and bump on brushed surfaces. */
  const brushed = canvasTex(512, (x, s) => {
    x.fillStyle = '#808080'; x.fillRect(0, 0, s, s);
    for (let i = 0; i < 2600; i++) {
      const v = 90 + Math.random() * 90;
      x.strokeStyle = `rgba(${v},${v},${v},${0.18 + Math.random() * 0.3})`;
      x.lineWidth = Math.random() * 1.2 + 0.2;
      const y = Math.random() * s, len = 40 + Math.random() * 260, px = Math.random() * s;
      x.beginPath(); x.moveTo(px, y); x.lineTo(px + len, y + (Math.random() - 0.5) * 2); x.stroke();
    }
  }, { repeat: [3, 1] });
  /** Overlapping circles: perlage. */
  const perlage = canvasTex(512, (x, s) => {
    x.fillStyle = '#707070'; x.fillRect(0, 0, s, s);
    const step = 20;
    for (let r = 0; r < s / step + 1; r++) for (let c = 0; c < s / step + 1; c++) {
      const cx = c * step + (r % 2 ? step / 2 : 0), cy = r * step * 0.86;
      const g = x.createRadialGradient(cx, cy, 1, cx, cy, step * 0.8);
      g.addColorStop(0, '#d0d0d0'); g.addColorStop(0.6, '#8a8a8a'); g.addColorStop(1, '#505050');
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, step * 0.8, 0, 6.2832); x.fill();
    }
  }, { repeat: [2, 2] });
  /** Navy sunburst dial with printed minute track and brand. 12 o'clock is up in the texture. */
  const dialTex = canvasTex(1024, (x, s) => {
    const c = s / 2;
    const base = x.createRadialGradient(c, c, 20, c, c, c);
    base.addColorStop(0, '#2d4259'); base.addColorStop(0.7, '#1d2a3a'); base.addColorStop(1, '#121a26');
    x.fillStyle = base; x.fillRect(0, 0, s, s);
    for (let i = 0; i < 720; i++) { const a = i / 720 * 6.2832; x.strokeStyle = `rgba(255,255,255,${i % 2 ? 0.035 : 0.012})`; x.lineWidth = 1.4; x.beginPath(); x.moveTo(c, c); x.lineTo(c + Math.cos(a) * c, c + Math.sin(a) * c); x.stroke(); }
    x.strokeStyle = 'rgba(244,241,233,.9)';
    for (let i = 0; i < 60; i++) { const a = i / 60 * 6.2832 - Math.PI / 2, five = i % 5 === 0, r1 = c * 0.93, r2 = c * (five ? 0.86 : 0.895); x.lineWidth = five ? 4 : 1.8; x.beginPath(); x.moveTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1); x.lineTo(c + Math.cos(a) * r2, c + Math.sin(a) * r2); x.stroke(); }
    x.fillStyle = '#F4F1E9'; x.textAlign = 'center';
    x.font = `500 ${s * 0.05}px "Cormorant Garamond", Georgia, serif`; x.fillText('C H R O N O V É', c, c - s * 0.2);
    x.font = `400 ${s * 0.022}px Inter, Arial, sans-serif`; x.fillStyle = '#B9BEC5'; x.fillText('AUTOMATIC · 28,800 VPH', c, c + s * 0.26);
  }, { srgb: true });

  /* ------------------------------------------------------------------ *
   * Materials
   * ------------------------------------------------------------------ */
  const steel = new T.MeshPhysicalMaterial({ color: 0xcfd4da, metalness: 1, roughness: 0.38, roughnessMap: brushed, envMapIntensity: 1.15 });
  const polished = new T.MeshPhysicalMaterial({ color: 0xe4e7ea, metalness: 1, roughness: 0.07, clearcoat: 0.3, clearcoatRoughness: 0.05, envMapIntensity: 1.4 });
  const gold = new T.MeshPhysicalMaterial({ color: 0xC5A46D, metalness: 1, roughness: 0.2, envMapIntensity: 1.5 });
  const goldBrushed = new T.MeshPhysicalMaterial({ color: 0xC5A46D, metalness: 1, roughness: 0.4, roughnessMap: brushed, envMapIntensity: 1.3 });
  const plateMat = new T.MeshPhysicalMaterial({ color: 0x9aa1aa, metalness: 1, roughness: 0.5, roughnessMap: perlage, bumpMap: perlage, bumpScale: 0.35, envMapIntensity: 1 });
  const darkMetal = new T.MeshPhysicalMaterial({ color: 0x2a2e35, metalness: 0.9, roughness: 0.45, envMapIntensity: 0.9 });
  const ruby = new T.MeshPhysicalMaterial({ color: 0xb0101c, metalness: 0, roughness: 0.05, clearcoat: 1, transmission: 0.2, ior: 1.76, envMapIntensity: 1.5 });
  const dialMat = new T.MeshPhysicalMaterial({ map: dialTex, metalness: 0.15, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.4 });
  const glass = new T.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 1, thickness: 0.18, ior: 1.77, envMapIntensity: 2.2, specularIntensity: 1, clearcoat: 1, clearcoatRoughness: 0.02, attenuationColor: new T.Color(0xeaf4ff), attenuationDistance: 4 });

  /* ------------------------------------------------------------------ *
   * Layers (groups that move apart when exploded)
   * ------------------------------------------------------------------ */
  const root = new T.Group();
  scene.add(root);
  const layers = [0, 1, 2, 3, 4].map(() => { const g = new T.Group(); root.add(g); return g; });
  const mesh = (geo, mat, parent, { cast = true, receive = true } = {}) => { const m = new T.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = receive; parent.add(m); return m; };
  const TAU = Math.PI * 2;

  /* --- 0 · Case --- */
  {
    // Profile (radius, height) revolved around Y: flat caseback, chamfered outer wall, stepped bezel seat.
    const prof = [[0.0, -0.3], [1.5, -0.3], [1.72, -0.3], [1.9, -0.26], [1.99, -0.17], [2.0, -0.1], [2.0, 0.1], [1.99, 0.17], [1.94, 0.215], [1.84, 0.23], [1.78, 0.215], [1.74, 0.17], [1.74, 0.05], [1.6, 0.05], [1.6, -0.18], [0.0, -0.18]]
      .map(([r, y]) => new T.Vector2(r, y));
    const body = mesh(new T.LatheGeometry(prof, 160), steel, layers[0]);
    // Polished chamfer ring on the case edge for a bright bevel line
    const bevel = mesh(new T.TorusGeometry(1.965, 0.028, 16, 160), polished, layers[0]); bevel.rotation.x = Math.PI / 2; bevel.position.y = 0.155;
    // Gold bezel
    const bez = mesh(new T.LatheGeometry([[1.74, 0.05], [1.74, 0.3], [1.8, 0.36], [1.9, 0.36], [1.97, 0.3], [1.97, 0.12], [1.9, 0.05]].map(([r, y]) => new T.Vector2(r, y)), 160), gold, layers[0]);
    const fine = mesh(new T.TorusGeometry(1.775, 0.018, 12, 160), polished, layers[0]); fine.rotation.x = Math.PI / 2; fine.position.y = 0.335;
    // Lugs: bevelled extrusions, four of them
    const shape = new T.Shape();
    shape.moveTo(-0.26, 0); shape.lineTo(0.26, 0); shape.lineTo(0.3, 0.9); shape.quadraticCurveTo(0.3, 1.08, 0.12, 1.1); shape.lineTo(-0.12, 1.1); shape.quadraticCurveTo(-0.3, 1.08, -0.3, 0.9); shape.closePath();
    const lugGeo = new T.ExtrudeGeometry(shape, { depth: 0.26, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 4, curveSegments: 16 });
    // Shape is flat in XY (length along +Y) and extruded along +Z. Rotating -90° about X lays it flat with its
    // length along -Z and its thickness up; scale.y = -sz sends the lug outward on the sz side.
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const l = mesh(lugGeo, steel, layers[0]);
      l.rotation.x = -Math.PI / 2; l.scale.set(0.95, -sz, 1);
      l.position.set(sx * 0.8, -0.14, sz * 1.55);
    });
    // Spring bars
    [-1, 1].forEach((sz) => { const b = mesh(new T.CylinderGeometry(0.045, 0.045, 1.9, 16), darkMetal, layers[0]); b.rotation.z = Math.PI / 2; b.position.set(0, -0.02, sz * 2.3); });
    // Crown at 3 o'clock (+X): fluted cylinder + guard
    const crown = mesh(new T.CylinderGeometry(0.2, 0.2, 0.34, 40, 1), goldBrushed, layers[0]); crown.rotation.z = Math.PI / 2; crown.position.set(2.14, 0.02, 0);
    const crownCap = mesh(new T.CylinderGeometry(0.17, 0.2, 0.06, 40), polished, layers[0]); crownCap.rotation.z = Math.PI / 2; crownCap.position.set(2.34, 0.02, 0);
    const stem = mesh(new T.CylinderGeometry(0.07, 0.07, 0.3, 16), steel, layers[0]); stem.rotation.z = Math.PI / 2; stem.position.set(1.98, 0.02, 0);
    // Caseback inset ring
    const back = mesh(new T.TorusGeometry(1.45, 0.03, 12, 120), polished, layers[0]); back.rotation.x = Math.PI / 2; back.position.y = -0.3;
  }

  /* --- 1 · Movement --- */
  const gears = [];
  const gearShape = (r, teeth, holes) => {
    const s = new T.Shape(), n = teeth * 4;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU, k = i % 4;
      const rr = k === 1 || k === 2 ? r : r * 0.88;
      const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
      i ? s.lineTo(x, y) : s.moveTo(x, y);
    }
    s.closePath();
    const axle = new T.Path(); axle.absarc(0, 0, r * 0.13, 0, TAU, true); s.holes.push(axle);
    for (let h = 0; h < holes; h++) { const a = h / holes * TAU, p = new T.Path(); p.absarc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.17, 0, TAU, true); s.holes.push(p); }
    return s;
  };
  const makeGear = (r, teeth, holes, mat, x, z, y, speed) => {
    const g = new T.Mesh(new T.ExtrudeGeometry(gearShape(r, teeth, holes), { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 20 }), mat);
    g.castShadow = g.receiveShadow = true;
    g.rotation.x = -Math.PI / 2; g.position.set(x, y, z); g.userData.speed = speed;
    layers[1].add(g); gears.push(g);
    const j = mesh(new T.CylinderGeometry(r * 0.13 + 0.03, r * 0.13 + 0.03, 0.12, 20), ruby, layers[1]); j.position.set(x, y + 0.02, z);
    return g;
  };
  {
    const plate = mesh(new T.CylinderGeometry(1.62, 1.62, 0.07, 96), darkMetal, layers[1]); plate.position.y = -0.14;
    makeGear(0.78, 20, 5, steel, -0.62, 0.22, -0.1, 0.35);
    makeGear(0.52, 14, 4, gold, 0.58, -0.45, -0.1, -0.55);
    makeGear(0.34, 10, 3, steel, 0.12, 0.95, -0.1, 0.95);
    makeGear(0.42, 12, 4, goldBrushed, -0.55, -0.85, -0.1, -0.8);
    // Barrel with spring ring
    const barrel = mesh(new T.CylinderGeometry(0.5, 0.5, 0.12, 64), goldBrushed, layers[1]); barrel.position.set(0.7, -0.05, 0.45);
    const bring = mesh(new T.TorusGeometry(0.34, 0.012, 8, 64), polished, layers[1]); bring.rotation.x = Math.PI / 2; bring.position.set(0.7, 0.02, 0.45);
  }
  // Balance wheel + hairspring (a group that oscillates)
  const balance = new T.Group(); balance.position.set(0.95, 0.0, -0.9); layers[1].add(balance);
  {
    const rim = mesh(new T.TorusGeometry(0.44, 0.035, 16, 72), gold, balance); rim.rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) { const sp = mesh(new T.BoxGeometry(0.88, 0.03, 0.05), gold, balance); sp.rotation.y = i * Math.PI / 3; }
    const pts = []; for (let i = 0; i <= 120; i++) { const t = i / 120 * TAU * 4.5, r = 0.05 + t * 0.02; pts.push(new T.Vector3(Math.cos(t) * r, 0.02, Math.sin(t) * r)); }
    mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 240, 0.006, 6), steel, balance);
    const hub = mesh(new T.CylinderGeometry(0.06, 0.06, 0.14, 20), ruby, balance); hub.position.y = 0.0;
  }

  /* --- 2 · Bridge --- */
  {
    const s = new T.Shape(); s.absarc(0, 0, 1.55, 0, TAU, false);
    [[-0.4, 0.1, 1.0], [0.9, -0.55, 0.52], [-0.0, -1.0, 0.45]].forEach(([x, y, r]) => { const p = new T.Path(); p.absarc(x, y, r, 0, TAU, true); s.holes.push(p); });
    const br = mesh(new T.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.025, bevelSegments: 3, curveSegments: 64 }), plateMat, layers[2]);
    br.rotation.x = -Math.PI / 2; br.position.y = 0.02;
    // Polished bevel line on the bridge edge
    const edge = mesh(new T.TorusGeometry(1.55, 0.012, 8, 120), polished, layers[2]); edge.rotation.x = Math.PI / 2; edge.position.y = 0.1;
    [[1.15, 0.95], [-1.25, -0.8], [0.3, 1.35], [-1.0, 0.95]].forEach(([x, z]) => {
      const sc = mesh(new T.CylinderGeometry(0.075, 0.075, 0.04, 24), gold, layers[2]); sc.position.set(x, 0.12, z);
      const slot = mesh(new T.BoxGeometry(0.1, 0.012, 0.014), darkMetal, layers[2], { cast: false }); slot.position.set(x, 0.145, z); slot.rotation.y = x;
    });
  }

  /* --- 3 · Dial --- */
  {
    const disc = mesh(new T.CylinderGeometry(1.72, 1.72, 0.05, 128), dialMat, layers[3]);
    // texture is mapped to the top cap; rotate it so 12 o'clock faces -Z
    disc.rotation.y = 0; disc.position.y = 0.11;
    dialMat.map.center.set(0.5, 0.5); dialMat.map.rotation = Math.PI; // canvas "up" → -Z
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU, big = i % 3 === 0;
      const m = mesh(new T.BoxGeometry(big ? 0.085 : 0.06, 0.035, big ? 0.3 : 0.22), gold, layers[3]);
      m.position.set(Math.sin(a) * 1.38, 0.155, -Math.cos(a) * 1.38); m.rotation.y = a;
    }
    const ring = mesh(new T.TorusGeometry(1.72, 0.03, 12, 160), goldBrushed, layers[3]); ring.rotation.x = Math.PI / 2; ring.position.y = 0.13;
  }

  /* --- 4 · Crystal + hands --- */
  const hands = {};
  {
    // Domed sapphire: a shallow spherical cap
    const R = 4.2, theta = Math.asin(1.76 / R);
    const dome = new T.Mesh(new T.SphereGeometry(R, 96, 24, 0, TAU, 0, theta), glass);
    dome.position.y = 0.3 - R * Math.cos(theta); dome.userData.glass = true;
    layers[4].add(dome);
    const rimRing = mesh(new T.TorusGeometry(1.76, 0.02, 12, 120), polished, layers[4]); rimRing.rotation.x = Math.PI / 2; rimRing.position.y = 0.3;

    const hand = (len, w, tail, mat, y) => {
      const s = new T.Shape(); s.moveTo(-w, tail); s.lineTo(-w * 0.8, -len * 0.55); s.lineTo(0, -len); s.lineTo(w * 0.8, -len * 0.55); s.lineTo(w, tail); s.closePath();
      const hole = new T.Path(); hole.absellipse(0, -len * 0.5, w * 0.35, len * 0.2, 0, TAU, true); if (w > 0.06) s.holes.push(hole);
      const m = new T.Mesh(new T.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1 }), mat);
      m.rotation.x = Math.PI / 2; m.position.y = y; m.castShadow = true;
      const g = new T.Group(); g.add(m); layers[4].add(g); return g;
    };
    hands.h = hand(0.95, 0.085, 0.22, polished, 0.2);
    hands.m = hand(1.45, 0.06, 0.25, polished, 0.225);
    hands.s = hand(1.6, 0.012, 0.35, gold, 0.25);
    const pin = mesh(new T.CylinderGeometry(0.075, 0.075, 0.09, 32), gold, layers[4]); pin.position.y = 0.25;
    const cap = mesh(new T.CylinderGeometry(0.035, 0.035, 0.05, 20), darkMetal, layers[4]); cap.position.y = 0.3;
  }

  /* Materials that glow when their layer is selected */
  const glowMats = layers.map((g) => { const set = new Set(); g.traverse((o) => { if (o.isMesh && !o.userData.glass && o.material.emissive) set.add(o.material); }); return [...set]; });

  /* ------------------------------------------------------------------ *
   * Interaction: drag to orbit, arrow keys, click to pick a layer
   * ------------------------------------------------------------------ */
  const NAMES = ['Case', 'Movement', 'Bridge', 'Dial', 'Crystal and hands'];
  const base = [0, 0, 0, 0, 0];   // layers are modelled at their assembled heights
  let explode = 0, explodeShown = 0, selected = -1, yaw = -0.5, pitch = 0.62, needs = true, last = '';
  const ray = new T.Raycaster(), drag = { x: 0, y: 0, moved: 0, active: false };
  let idleSince = performance.now();

  canvas.addEventListener('pointerdown', (e) => { drag.active = true; drag.x = e.clientX; drag.y = e.clientY; drag.moved = 0; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; idleSince = Infinity; });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag.active) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY;
    yaw += dx * 0.008; pitch = Math.max(0.12, Math.min(1.35, pitch + dy * 0.006)); needs = true;
  });
  canvas.addEventListener('pointerup', (e) => {
    drag.active = false; canvas.style.cursor = 'grab'; idleSince = performance.now();
    if (drag.moved > 6) return;
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera({ x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -(((e.clientY - r.top) / r.height) * 2 - 1) }, camera);
    const hit = ray.intersectObjects(root.children, true).find((h) => !h.object.userData.glass);
    if (!hit) return;
    let o = hit.object; while (o && !layers.includes(o)) o = o.parent;
    const i = layers.indexOf(o); if (i >= 0) onPick(i);
  });
  canvas.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'ArrowLeft') yaw -= 0.12; else if (k === 'ArrowRight') yaw += 0.12;
    else if (k === 'ArrowUp') pitch = Math.max(0.12, pitch - 0.08); else if (k === 'ArrowDown') pitch = Math.min(1.35, pitch + 0.08); else return;
    e.preventDefault(); needs = true; idleSince = performance.now();
  });
  canvas.style.cursor = 'grab';

  /* ------------------------------------------------------------------ *
   * Render loop (paused off-screen, in background tabs; on-demand for reduced motion)
   * ------------------------------------------------------------------ */
  let raf = 0, visible = true;
  // Adaptive quality: if frames are slow, step down pixel ratio, then drop transmission and shadows.
  let ratio = dpr, lastT = 0, slow = 0, tier = 0;
  const degrade = () => {
    if (ratio > 0.75) { ratio = Math.max(0.75, ratio * 0.8); renderer.setPixelRatio(ratio); resize(); }
    else if (tier === 0) { tier = 1; glass.transmission = 0; glass.transparent = true; glass.opacity = 0.22; glass.needsUpdate = true; }
    else if (tier === 1) { tier = 2; renderer.shadowMap.enabled = false; key.castShadow = false; floor.visible = false; scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; }); }
  };
  const stage = canvas.parentElement;
  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); needs = true;
  };
  const ro = new ResizeObserver(resize); ro.observe(stage); resize();
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); });
  io.observe(stage);

  const dist = new T.Vector3();
  function frame(t) {
    raf = 0;
    if (!visible || document.hidden) { lastT = 0; return; }
    if (lastT && !reduced) { const dt = t - lastT; slow = dt > 45 ? slow + 1 : Math.max(0, slow - 1); if (slow > 8) { slow = 0; degrade(); } }
    lastT = t;
    // ease exploded view
    const d = explode - explodeShown;
    if (Math.abs(d) > 0.0005) { explodeShown += reduced ? d : d * 0.1; needs = true; }
    // gentle auto-rotate while idle
    if (!reduced && !drag.active && performance.now() - idleSince > 2500) { yaw += 0.0025; needs = true; }
    // live clock + mechanism motion
    const now = new Date(), ms = reduced ? 0 : now.getMilliseconds(), S = now.getSeconds() + ms / 1000, M = now.getMinutes() + S / 60, H = (now.getHours() % 12) + M / 60;
    hands.h.rotation.y = -H * TAU / 12; hands.m.rotation.y = -M * TAU / 60; hands.s.rotation.y = -S * TAU / 60;
    if (!reduced) { gears.forEach((g) => { g.rotation.z = (t / 1000) * g.userData.speed; }); balance.rotation.y = Math.sin(t / 1000 * 5.2) * 1.1; needs = true; }
    layers.forEach((g, i) => { g.position.y = base[i] * (1 - explodeShown) * 0.6 + i * 1.15 * explodeShown; });
    root.rotation.y = yaw;
    const cy = explodeShown * 2.2, cd = 10.5 + explodeShown * 5.4;
    camera.position.set(0, cy + Math.sin(pitch) * cd, Math.cos(pitch) * cd); camera.lookAt(0, cy * 0.9, 0);
    floor.position.y = -1.6 - 0.0 * explodeShown;
    glowMats.forEach((arr, i) => arr.forEach((m) => m.emissive.setHex(selected === i ? 0x3d2c08 : 0x000000)));
    if (needs) { renderer.render(scene, camera); needs = reduced ? false : true; }
    const cap = selected >= 0 ? `${NAMES[selected]} selected` : 'Drag to rotate · click a layer';
    if (cap !== last) { last = cap; onCaption(cap); }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(frame); });
  canvas.setAttribute('aria-describedby', 'engine-cap');

  const api = {
    setExplode(v) { explode = Math.max(0, Math.min(1, v)); needs = true; if (!raf) raf = requestAnimationFrame(frame); },
    setSelected(i) { selected = i; needs = true; if (!raf) raf = requestAnimationFrame(frame); },
    /** Renders one frame and counts bright pixels straight from the framebuffer (a canvas cannot be read back later). */
    sampleLit() {
      renderer.render(scene, camera);
      const gl = renderer.getContext(), w = gl.drawingBufferWidth, h = gl.drawingBufferHeight, px = new Uint8Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
      let lit = 0; for (let i = 0; i < px.length; i += 64) if (px[i] + px[i + 1] + px[i + 2] > 150 && px[i + 3] > 0) lit++;
      return lit;
    },
    /** For tests: reports that the scene has actually been drawn. */
    get stats() { return { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, textures: renderer.info.memory.textures, geometries: renderer.info.memory.geometries }; },
    dispose() {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      scene.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => m.dispose()); });
      [brushed, perlage, dialTex].forEach((t) => t.dispose()); renderer.dispose();
    },
  };
  window.__engine = api;
  addEventListener('pagehide', () => api.dispose());
  return api;
}
