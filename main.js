import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';

function lerp(a, b, t, tolerance = 0.001) { // Slightly modified lerp to snap within tolerance
    if (Math.abs(b - a) < tolerance){
        return b;
    } else {
        return (1 - t) * a + t * b;
    }
}

const Base_VS = `

varying vec3 v_Normal;
varying vec3 v_Position;
varying vec2 v_UV;
varying mat4 v_ModelViewMatrix;
varying mat4 v_ProjectionMatrix;

uniform float time;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position.x += sin(time + position.z*2.0) * .015;
    v_Normal = normal;
    v_Position = position;
    v_UV = vec2(uv.x, 1.0-uv.y);
    v_ModelViewMatrix = modelViewMatrix;
    v_ProjectionMatrix = projectionMatrix;
}

`;
const Text_PS = `

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


varying vec3 v_Normal;
varying vec3 v_Position;
varying vec2 v_UV;
varying mat4 v_ModelViewMatrix;
varying mat4 v_ProjectionMatrix;
uniform float time;

void main() {
    vec3 lightDir = normalize(vec3(-1.0, .8, -1.5));
    lightDir = (v_ProjectionMatrix * v_ModelViewMatrix * vec4(lightDir, 0.0)).xyz;

    float ndl = dot(lightDir, normalize(v_Normal)) * 0.5 + 0.5;

    gl_FragColor = vec4(hsv2rgb(vec3(fract((v_Position.x * .5) + time * 0.1), 0.8, .5)) * ndl, 1.0);
    // gl_FragColor = vec4(vec3(ndl), 1.0);
}
`;

const Table_PS = `

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


varying vec3 v_Normal;
varying vec3 v_Position;
varying vec2 v_UV;
varying mat4 v_ModelViewMatrix;
varying mat4 v_ProjectionMatrix;
uniform float time;

void main() {
    vec3 lightDir = normalize(vec3(-1.0, .8, -1.5));
    lightDir = (v_ProjectionMatrix * v_ModelViewMatrix * vec4(lightDir, 0.0)).xyz;

    float ndl = dot(lightDir, normalize(v_Normal)) * 0.5 + 0.5;

    // gl_FragColor = vec4(hsv2rgb(vec3(fract((v_Position.x * .5) + time * 0.1), 0.8, .5)) * ndl, 1.0);
    gl_FragColor = vec4(vec3(ndl) * 0.1, 1.0);
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

void main()
{
    vec3 lightDir = normalize(vec3(-1.0, .8, -1.5));
    lightDir = (v_ProjectionMatrix * v_ModelViewMatrix * vec4(lightDir, 0.0)).xyz;

    float ndl = dot(lightDir, normalize(v_Normal)) * 0.5 + 0.5;
    ndl = clamp(smoothstep(0.5, 0.55, ndl) + 0.5, 0.0, 1.0);


    vec3 viewDir = (v_ProjectionMatrix * v_ModelViewMatrix * vec4(normalize(vec3(0.0, 0.0, 1.0)), 0.0)).xyz; 
    float ndvl = dot(normalize(viewDir + lightDir*2.0), normalize(v_Normal));
    ndvl = clamp(smoothstep(0.8, 0.8, ndvl), 0.0, 1.0) * .1 * ndl;
    float ndv = clamp(smoothstep(0.1, 0.11, dot(viewDir, v_Normal)), 0.0, 1.0) * 2.0;
    vec4 diffuse = texture(diffuseTex, v_UV) * vec4(vec3(ndl) + vec3(ndvl) + vec3(ndv), 1.0);
    gl_FragColor = diffuse;
    // gl_FragColor = vec4(vec3(ndv), 1.0);
    // gl_FragColor = vec4(viewDir, 1.0);
}
`



const width = window.innerWidth;
const height = window.innerHeight;
const scene = new THREE.Scene();
const clock = new THREE.Clock();
scene.background = new THREE.Color(0x222222);


// +++++++++++++ CAMERA +++++++++++++++
// const aspect = window.innerWidth / window.innerHeight;
// const frustumSize = 10;
// const camera = new THREE.OrthographicCamera(
//     frustumSize * aspect / -2,  // left
//     frustumSize * aspect / 2,   // right
//     frustumSize / 2,            // top
//     frustumSize / -2,           // bottom
//     0.1,                        // near
//     100                        // far
// );

const aspect = window.innerWidth / window.innerHeight;
const FoV = 45;
const camera = new THREE.PerspectiveCamera(FoV, aspect, 0.1, 100);
camera.position.set(0.0, 10.0, 0.0);  // Position above looking down
camera.lookAt(0, 0, 0);  

// ++++++++++ RENDERER ++++++++++++++++
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const baseMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: {value: 0.0}
    },
    vertexShader: Base_VS,
    fragmentShader: Text_PS
});


// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
// scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
// directionalLight.position.set(5, 5, 5);
// scene.add(directionalLight);

// ++++++++++++++ LOADERS +++++++++++++

const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
loader.setDRACOLoader( dracoLoader );



// 5. OBJECTS - Create and add 3D objects
/*const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ 
    color: 0x00ff00,
    metalness: 0.5,
    roughness: 0.5
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);*/

async function loadModel(path) {
    try {
        const gltf = await loader.loadAsync(path);
        const model = gltf.scene;

        model.traverse((child) => {
           if (child.isMesh) {
            child.material = baseMaterial;
            
            // console.log("Applying Material to", child.name);
           } 
        });

        scene.add(model);
        return model
    } catch (error) {
        console.error(error);
    }
}

async function loadMaterialModel(path, material) {
    try {
        const gltf = await loader.loadAsync(path);
        const model = gltf.scene;

        model.traverse((child) => {
           if (child.isMesh) {
            child.material = material;
            
            // console.log("Applying Material to", child.name);
           } 
        });

        scene.add(model);
        return model
    } catch (error) {
        console.error(error);
    }
}



var text = await loadModel('meshes/SM_WIPText.glb');
text.position.z = -2.0;


const texture = await textureLoader.loadAsync( 'textures/chibi_diffuse.png' );
texture.magFilter = THREE.NearestFilter;
console.log(texture);
const charMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: {value: 0.0},
        diffuseTex: {type:"t", value: texture}
    },
    vertexShader: Base_VS,
    fragmentShader: Char_PS,
    side: THREE.DoubleSide
});
var allen = await loadMaterialModel('meshes/SM_Allen_WelcomePose.glb', charMaterial);
allen.rotation.x = (-3.14 * 0.5);
allen.position.x = -4.0;
allen.position.y = 1.0;
allen.position.z = 1.0;



const tableMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: {value: 0.0},
        diffuseTex: {type:"t", value: texture}
    },
    vertexShader: Base_VS,
    fragmentShader: Table_PS,
    side: THREE.DoubleSide
});
var table = await loadMaterialModel('meshes/SM_TestBoard.glb', tableMaterial);
table.position.z = 1.0;
table.position.y = -1.0;



// ++++++++ CAMERA CONTROLS +++++++++++
let isDragging = false;
let previousMousePosition = { x: 0, y: 0};
let zoom = 2;

const maxRange = 10.0 / aspect;

// Disable right click context menu
document.addEventListener('contextmenu', event => event.preventDefault());


renderer.domElement.addEventListener('mousedown', (e) => {
    if (e.button == 2) isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});


let camTargetPos = {x: 0.0, z: 0.0};
const cameraSpeed = 15.0;
renderer.domElement.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        const panSpeed = 0.0085 / zoom;
        camTargetPos.x -= deltaX * panSpeed;
        camTargetPos.z -= deltaY * panSpeed;

        camTargetPos.x = Math.max(-maxRange, Math.min(maxRange, camTargetPos.x));
        camTargetPos.z = Math.max(-maxRange, Math.min(maxRange * 0.1, camTargetPos.z));

        previousMousePosition = {x: e.clientX, y: e.clientY};
    }
});

renderer.domElement.addEventListener('mouseup', () => {
    isDragging = false;
});

renderer.domElement.addEventListener('mouseleave', () => {
    isDragging = false;
});

renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    zoom = Math.max(0.8, Math.min(2, zoom + delta));
});


// +++++++++++ WINDOW RESIZE ++++++++++

window.addEventListener('resize', () => {
    UpdateCameraFrustum(0.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
});


let smoothZoom = 0.01;
const zoomSpeed = 2.0;

function UpdateCameraFrustum(dt) {

    const aspect = window.innerWidth / window.innerHeight;
    smoothZoom = lerp(smoothZoom, zoom, dt * zoomSpeed);
    
    camera.fov = FoV;
    camera.position.y = 10 / smoothZoom;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
}

let returnDelay = 5.0;
let returnTime = 0.0;
const buffer = 2.0;
const returnSpeed = .01;

function returnCameraToBounds(deltaTime) {

    // ---- Bounds check ----
    const Px = camera.position.x >  maxRange - buffer;
    const Nx = camera.position.x < -maxRange + buffer;
    const Pz = camera.position.z >  maxRange - buffer;
    const Nz = camera.position.z < -maxRange + buffer;

    const isOutOfBounds = (Px || Nx || Pz || Nz) && !isDragging;

    // ---- Timer logic ----
    if (isOutOfBounds) {
        returnTime += deltaTime;
    } else {
        returnTime = 0.0;
    }

    // ---- Return behavior ----
    if (isOutOfBounds && returnTime > returnDelay) {
        camTargetPos.x = lerp(camTargetPos.x, 0.0, deltaTime * returnTime);
        camTargetPos.z = lerp(camTargetPos.z, 0.0, deltaTime * returnTime);
    }
}


// +++++++++++ FRAME UPDATE +++++++++++
let t = 0.0;

function update() {
    requestAnimationFrame(update);
    const dt = Math.min(clock.getDelta(), 0.1);
    t += dt;

    
    baseMaterial.uniforms.time.value = t;

    text.rotation.x = Math.cos(t) * 0.015;
    text.rotation.y = Math.sin(t) * 0.025;
    
    allen.rotation.z = Math.cos(t) * 0.05;
    allen.rotation.y = Math.sin(t) * 0.5;

    returnCameraToBounds(dt);
    UpdateCameraFrustum(dt);

    camera.position.x = lerp(camera.position.x, camTargetPos.x, dt * cameraSpeed);
    camera.position.z = lerp(camera.position.z, camTargetPos.z, dt * cameraSpeed);
    
    renderer.render(scene, camera);
}

update();


