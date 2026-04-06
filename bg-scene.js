import * as THREE from 'three';

// ── Renderer ──────────────────────────────────────────────────────────────────

const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
document.body.prepend(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight, false);

// ── Scene (fullscreen quad, orthographic) ─────────────────────────────────────

const scene  = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// ── Texture ───────────────────────────────────────────────────────────────────

const tex = await new THREE.TextureLoader().loadAsync('/images/icon-transparent.png');
tex.magFilter = THREE.NearestFilter;
tex.minFilter = THREE.NearestFilter;

// ── Trail config ──────────────────────────────────────────────────────────────

const TRAIL_LEN      = 24;   // number of trail points
const TRAIL_DURATION = 800;  // ms for a point to fade out

const trailPositions = Array.from({ length: TRAIL_LEN }, () => new THREE.Vector2(-99999, -99999));
const trailWeights   = new Array(TRAIL_LEN).fill(0);
// Raw history: [{x, y, t}]
const history = [];

// ── Shader ────────────────────────────────────────────────────────────────────

const uniforms = {
    u_tex:          { value: tex },
    u_resolution:   { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    u_trail:        { value: trailPositions },
    u_trailWeights: { value: trailWeights },
    u_tileSize:     { value: 64.0 },
};

const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: /* glsl */`
        uniform sampler2D u_tex;
        uniform vec2      u_resolution;
        uniform vec2      u_trail[${TRAIL_LEN}];
        uniform float     u_trailWeights[${TRAIL_LEN}];
        uniform float     u_tileSize;
        varying vec2 vUv;

        void main() {
            // Tile UV size so each tile is exactly u_tileSize CSS pixels square
            float tw = u_tileSize / u_resolution.x * 0.25;
            float th = u_tileSize / u_resolution.y * 0.25;

            // Tile index of this fragment
            float tx = floor(vUv.x / tw);
            float ty = floor(vUv.y / th);

            // Accumulate hover weight from all trail points
            float hover = 0.0;
            for (int i = 0; i < ${TRAIL_LEN}; i++) {
                vec2 mUv = vec2(u_trail[i].x / u_resolution.x,
                                1.0 - u_trail[i].y / u_resolution.y);
                float mx = floor(mUv.x / tw);
                float my = floor(mUv.y / th);
                float dist = max(abs(tx - mx), abs(ty - my));
                float reach = 1.0 - smoothstep(0.9, 1.1, dist);
                hover = max(hover, reach * u_trailWeights[i]);
            }

            // UV within the tile for sampling
            vec2 sampleUV = vec2(fract(vUv.x / tw), fract(vUv.y / th));
            vec4 texel = texture2D(u_tex, sampleUV);

            // Gradient only in bottom 20% of screen, flat 0.05 above that
            float baseOpacity = mix(0.025, 0.01, min(vUv.y / 0.20, 1.0));

            float opacity = mix(baseOpacity, 0.10, hover);

            gl_FragColor = vec4(texel.rgb, texel.a * opacity);
        }
    `,
    transparent: true,
    depthWrite:  false,
});

scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

// ── Mouse ─────────────────────────────────────────────────────────────────────

document.addEventListener('mousemove', e => {
    history.push({ x: e.clientX, y: e.clientY, t: performance.now() });
});
document.addEventListener('mouseleave', () => {
    history.length = 0;
});

// ── Resize ────────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.u_resolution.value.set(w, h);
});

// ── Render loop ───────────────────────────────────────────────────────────────

function updateTrail() {
    const now = performance.now();

    // Cull old entries
    while (history.length && now - history[0].t > TRAIL_DURATION) history.shift();

    // Sample up to TRAIL_LEN evenly-spaced points from history (newest first)
    const src = history.slice().reverse();
    for (let i = 0; i < TRAIL_LEN; i++) {
        const idx = Math.round(i * (src.length - 1) / Math.max(src.length - 1, 1));
        const pt  = src[Math.min(idx, src.length - 1)];
        if (pt) {
            // Weight 1 for newest (i=0), fading toward older
            const age    = now - pt.t;
            const weight = Math.max(0, 1 - age / TRAIL_DURATION);
            // Also scale by position in trail so head is brightest
            const posFactor = 1 - i / TRAIL_LEN;
            trailPositions[i].set(pt.x, pt.y);
            trailWeights[i] = weight * posFactor;
        } else {
            trailPositions[i].set(-99999, -99999);
            trailWeights[i] = 0;
        }
    }

    uniforms.u_trail.value        = trailPositions;
    uniforms.u_trailWeights.value = trailWeights;
}

function animate() {
    requestAnimationFrame(animate);
    updateTrail();
    renderer.render(scene, camera);
}
animate();
