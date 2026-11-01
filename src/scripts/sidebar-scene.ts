import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import meshUrl from '../assets/meshes/SM_Allen_WelcomePose.glb?url';
import diffuseUrl from '../assets/textures/chibi_diffuse.png?url';

// ── Shaders ──────────────────────────────────────────────────────────────────
// Toon shading: a hard light/shadow step, a small specular glint and a front-facing lift.
// The light and view directions are constant per draw, so they're transformed once in the
// vertex shader rather than passing the matrices to the fragment shader.

const vertexShader = /* glsl */ `
uniform float time;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vLightDir;
varying vec3 vViewDir;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position.x += sin(time + position.z * 2.0) * 0.015; // gentle sway

    mat4 mvp = projectionMatrix * modelViewMatrix;
    vLightDir = (mvp * vec4(normalize(vec3(-1.0, 0.8, -1.5)), 0.0)).xyz;
    vViewDir = (mvp * vec4(0.0, 0.0, 1.0, 0.0)).xyz;
    vNormal = normal;
    vUv = uv;
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D diffuseTex;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vLightDir;
varying vec3 vViewDir;

void main() {
    vec3 n = normalize(vNormal);

    float ndl = dot(vLightDir, n) * 0.5 + 0.5;
    ndl = clamp(smoothstep(0.5, 0.55, ndl) + 0.5, 0.0, 1.0);

    float glint = step(0.8, dot(normalize(vViewDir + vLightDir * 2.0), n)) * 0.1 * ndl;
    float front = clamp(smoothstep(0.1, 0.11, dot(vViewDir, vNormal)), 0.0, 1.0) * 2.0;

    gl_FragColor = texture2D(diffuseTex, vUv) * vec4(vec3(ndl + glint + front), 1.0);
}
`;

// ── Scene ────────────────────────────────────────────────────────────────────

const DAMPING = 0.98;
const MAX_TILT = Math.PI / 3;
const RESOLUTION = 128;

/** Renders the character into `container`. Returns false if WebGL is unavailable. */
export async function createScene(container: HTMLElement): Promise<boolean> {
	let renderer: THREE.WebGLRenderer;
	try {
		renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
	} catch (e) {
		console.warn('[sidebar-scene] WebGL unavailable, skipping scene.', e);
		return false;
	}

	const [texture, gltf] = await Promise.all([
		new THREE.TextureLoader().loadAsync(diffuseUrl),
		new GLTFLoader().loadAsync(meshUrl),
	]);
	texture.magFilter = THREE.NearestFilter;
	texture.flipY = false; // glTF UV convention

	// Fixed render size matching the 128px portrait; CSS scales the canvas up with crisp pixels.
	renderer.setPixelRatio(1);
	renderer.setSize(RESOLUTION, RESOLUTION, false);
	renderer.setClearColor(0x000000, 0);
	const canvas = renderer.domElement;
	container.appendChild(canvas);

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
	camera.position.set(0, 1.1, 3.8);
	camera.lookAt(0, 1.1, 0);

	const material = new THREE.ShaderMaterial({
		uniforms: { time: { value: 0 }, diffuseTex: { value: texture } },
		vertexShader,
		fragmentShader,
		side: THREE.DoubleSide,
	});

	const model = gltf.scene;
	model.traverse((child) => {
		if ((child as THREE.Mesh).isMesh) (child as THREE.Mesh).material = material;
	});
	model.position.y = 0.2;
	scene.add(model);

	// ── Drag to rotate (pointer events cover mouse, touch and pen) ───────────

	let dragging = false;
	let lastX = 0;
	let lastY = 0;
	let rotY = 0;
	let rotX = 0;
	let velY = 0;

	canvas.addEventListener('pointerdown', (e) => {
		dragging = true;
		lastX = e.clientX;
		lastY = e.clientY;
		velY = 0;
		canvas.setPointerCapture(e.pointerId);
		container.classList.add('dragged');
	});
	canvas.addEventListener('pointermove', (e) => {
		if (!dragging) return;
		velY = (e.clientX - lastX) * 0.01;
		rotY += velY;
		rotX = THREE.MathUtils.clamp(rotX + (e.clientY - lastY) * 0.01, -MAX_TILT, MAX_TILT);
		lastX = e.clientX;
		lastY = e.clientY;
	});
	const endDrag = () => (dragging = false);
	canvas.addEventListener('pointerup', endDrag);
	canvas.addEventListener('pointercancel', endDrag);

	// ── Render loop, paused while off screen ─────────────────────────────────

	const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
	let t = 0;
	let last = performance.now();
	let frame = 0;

	const update = (now: number) => {
		frame = requestAnimationFrame(update);
		const dt = Math.min((now - last) / 1000, 0.1);
		last = now;
		if (!reduceMotion) t += dt;

		if (!dragging) {
			velY *= DAMPING;
			rotY += velY;
			rotX += (0 - rotX) * 0.02;
		}

		material.uniforms.time.value = t;
		model.rotation.set(rotX, rotY + Math.sin(t * 0.4) * 0.18 + t * 0.1, Math.cos(t * 0.8) * 0.04);
		renderer.render(scene, camera);
	};

	// Compile shaders and draw one frame before fading in, so the first visible frame isn't a hitch.
	renderer.compile(scene, camera);
	update(performance.now());

	new IntersectionObserver(([entry]) => {
		cancelAnimationFrame(frame);
		if (entry.isIntersecting) {
			last = performance.now();
			frame = requestAnimationFrame(update);
		}
	}).observe(container);

	container.classList.add('loaded');
	return true;
}
