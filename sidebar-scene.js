import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ── Shaders ──────────────────────────────────────────────────────────────────

const Base_VS = `
varying vec3 v_Normal;
varying vec3 v_Position;
varying vec2 v_UV;
varying mat4 v_ModelViewMatrix;
varying mat4 v_ProjectionMatrix;
uniform float time;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position.x += sin(time + position.z * 2.0) * 0.015;
    v_Normal = normal;
    v_Position = position;
    v_UV = vec2(uv.x, 1.0 - uv.y);
    v_ModelViewMatrix = modelViewMatrix;
    v_ProjectionMatrix = projectionMatrix;
}
`;

const Char_PS = `
uniform float time;
varying vec3 v_Normal;
varying vec3 v_Position;
varying vec2 v_UV;
varying mat4 v_ModelViewMatrix;
varying mat4 v_ProjectionMatrix;
uniform sampler2D diffuseTex;

void main() {
    vec3 lightDir = normalize(vec3(-1.0, 0.8, -1.5));
    lightDir = (v_ProjectionMatrix * v_ModelViewMatrix * vec4(lightDir, 0.0)).xyz;

    float ndl = dot(lightDir, normalize(v_Normal)) * 0.5 + 0.5;
    ndl = clamp(smoothstep(0.5, 0.55, ndl) + 0.5, 0.0, 1.0);

    vec3 viewDir = (v_ProjectionMatrix * v_ModelViewMatrix * vec4(normalize(vec3(0.0, 0.0, 1.0)), 0.0)).xyz;
    float ndvl = clamp(smoothstep(0.8, 0.8, dot(normalize(viewDir + lightDir * 2.0), normalize(v_Normal))), 0.0, 1.0) * 0.1 * ndl;
    float ndv  = clamp(smoothstep(0.1, 0.11, dot(viewDir, v_Normal)), 0.0, 1.0) * 2.0;

    gl_FragColor = texture(diffuseTex, v_UV) * vec4(vec3(ndl) + vec3(ndvl) + vec3(ndv), 1.0);
}
`;

// ── Shared assets (loaded once) ───────────────────────────────────────────────

const textureLoader = new THREE.TextureLoader();
const loader = new GLTFLoader();

const texture = await textureLoader.loadAsync('textures/chibi_diffuse.png');
texture.magFilter = THREE.NearestFilter;

const gltf = await loader.loadAsync('meshes/SM_Allen_WelcomePose.glb');

// ── createScene ───────────────────────────────────────────────────────────────

export function createScene(container) {
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
        console.warn('[sidebar-scene] WebGL unavailable, skipping scene.', e);
        return;
    }
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 1.1, 3.8);
    camera.lookAt(0, 0.6, 0);

    function resize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const charMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time:       { value: 0 },
            diffuseTex: { type: 't', value: texture }
        },
        vertexShader:   Base_VS,
        fragmentShader: Char_PS,
        side: THREE.DoubleSide
    });

    const model = gltf.scene.clone();
    model.traverse(child => {
        if (child.isMesh) child.material = charMaterial;
    });

    // Blender Z-up → Three.js Y-up
    // model.rotation.x = -Math.PI * 0.5;
    model.position.y = 0;
    scene.add(model);

    // ── Drag to spin ──────────────────────────────────────────────────────────

    let isDragging = false;
    let lastX = 0;
    let manualRotY = 0;
    let velocity = 0;
    const damping = 0.92;

    const canvas = renderer.domElement;
    canvas.style.cursor = 'grab';

    function onDragStart(x) { isDragging = true; lastX = x; velocity = 0; canvas.style.cursor = 'grabbing'; }
    function onDragMove(x)  { if (!isDragging) return; const d = (x - lastX) * 0.01; manualRotY += d; velocity = d; lastX = x; }
    function onDragEnd()    { isDragging = false; canvas.style.cursor = 'grab'; }

    canvas.addEventListener('mousedown',  e => onDragStart(e.clientX));
    window.addEventListener('mousemove',  e => onDragMove(e.clientX));
    window.addEventListener('mouseup',    () => onDragEnd());
    canvas.addEventListener('touchstart', e => { e.preventDefault(); onDragStart(e.touches[0].clientX); }, { passive: false });
    canvas.addEventListener('touchmove',  e => { e.preventDefault(); onDragMove(e.touches[0].clientX); },  { passive: false });
    canvas.addEventListener('touchend',   () => onDragEnd());

    // ── Animation loop ────────────────────────────────────────────────────────

    const clock = new THREE.Clock();
    let t = 0;

    container.classList.add('loaded');

    function update() {
        requestAnimationFrame(update);
        const dt = Math.min(clock.getDelta(), 0.1);
        t += dt;

        if (!isDragging) { velocity *= damping; manualRotY += velocity; }

        charMaterial.uniforms.time.value = t;
        model.rotation.z = Math.cos(t * 0.8) * 0.04;
        model.rotation.y = manualRotY + (isDragging ? 0 : Math.sin(t * 0.4) * 0.18);
        model.rotation.y += t * 0.1;
        renderer.render(scene, camera);
    }

    update();
}

// ── Init sidebar ──────────────────────────────────────────────────────────────

const sidebarContainer = document.getElementById('sidebar-scene');
if (sidebarContainer) {
    try { createScene(sidebarContainer); } catch (e) { console.warn('[sidebar-scene] init failed:', e); }
}
