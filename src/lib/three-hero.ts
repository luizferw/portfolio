import * as THREE from 'three';

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/** Procedural equirect environment from a 2-stop OKLCH-ish gradient. */
function makeEnvTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, '#1b1630');
  g.addColorStop(0.45, '#3a2a6b');
  g.addColorStop(0.7, '#c87f2e'); // solar amber band — drives the highlights
  g.addColorStop(1.0, '#16243f'); // electric-blue floor
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  // a couple of soft light blooms
  for (const [x, y, r, col] of [
    [120, 70, 90, 'rgba(255,196,120,0.65)'],
    [400, 150, 110, 'rgba(120,170,255,0.5)'],
  ] as const) {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, col);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, 512, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Iridescent faceted crystal that reacts to scroll + pointer.
 * Returns a cleanup fn, or null if WebGL/reduced-motion means we should
 * fall back to the static CSS gradient mesh.
 */
export function initHero(canvas: HTMLCanvasElement): (() => void) | null {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  if (!supportsWebGL()) return null;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = makeEnvTexture();
  const envRT = pmrem.fromEquirectangular(envTex);
  scene.environment = envRT.texture;

  // Faceted crystal
  const geo = new THREE.IcosahedronGeometry(1.85, 1);
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0c1228'),
    metalness: 0.35,
    roughness: 0.12,
    iridescence: 1,
    iridescenceIOR: 1.4,
    iridescenceThicknessRange: [120, 520],
    clearcoat: 1,
    clearcoatRoughness: 0.18,
    flatShading: true,
    envMapIntensity: 1.5,
  });
  const crystal = new THREE.Mesh(geo, mat);
  scene.add(crystal);

  // wireframe halo for extra crispness on the facets
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(geo),
    new THREE.LineBasicMaterial({ color: 0xffc46e, transparent: true, opacity: 0.12 }),
  );
  crystal.add(wire);

  // Lights to complement the env reflections
  const key = new THREE.DirectionalLight(0xffd9a0, 1.6);
  key.position.set(4, 5, 6);
  const rim = new THREE.PointLight(0x6aa0ff, 18, 30);
  rim.position.set(-5, -2, -3);
  scene.add(key, rim, new THREE.AmbientLight(0x404a6b, 0.4));

  // Pointer + scroll state
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  function resize() {
    const w = canvas.clientWidth || canvas.offsetWidth;
    const h = canvas.clientHeight || canvas.offsetHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let raf = 0;
  let running = true;
  const clock = new THREE.Clock();

  function loop() {
    if (!running) return;
    const t = clock.getElapsedTime();
    const scroll = window.scrollY || 0;
    const sp = Math.min(scroll / (window.innerHeight || 800), 1.4);

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    crystal.rotation.y = t * 0.18 + pointer.x * 0.6;
    crystal.rotation.x = Math.sin(t * 0.25) * 0.12 + pointer.y * 0.4 + sp * 0.6;
    crystal.position.y = Math.sin(t * 0.6) * 0.12 - sp * 1.2;
    crystal.scale.setScalar(1 - sp * 0.18);
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  loop();

  // pause when off-screen to save battery
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        loop();
      } else if (!entry.isIntersecting) {
        running = false;
        cancelAnimationFrame(raf);
      }
    },
    { threshold: 0 },
  );
  io.observe(canvas);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('resize', resize);
    geo.dispose();
    mat.dispose();
    envTex.dispose();
    envRT.dispose();
    pmrem.dispose();
    renderer.dispose();
  };
}
