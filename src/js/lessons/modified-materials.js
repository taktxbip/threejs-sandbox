'use strict';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();

const gui = new dat.GUI();
const debugObject = {
    envMapIntensity: 5
};
// gui.hide();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const canvas = document.querySelector('.webgl');
const cubeTextureLoader = new THREE.CubeTextureLoader();

// Update all materials
const updateAllMaterials = () => {
    scene.traverseVisible(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMapIntensity = debugObject.envMapIntensity;
            child.material.needsUpdate = true;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
};

// Textures
const map = 0;
const environmentMapTexture = cubeTextureLoader.load([
    `/src/images/environmentMaps/${map}/px.jpg`,
    `/src/images/environmentMaps/${map}/nx.jpg`,
    `/src/images/environmentMaps/${map}/py.jpg`,
    `/src/images/environmentMaps/${map}/ny.jpg`,
    `/src/images/environmentMaps/${map}/pz.jpg`,
    `/src/images/environmentMaps/${map}/nz.jpg`
]);
environmentMapTexture.encoding = THREE.sRGBEncoding;

scene.background = environmentMapTexture;
scene.environment = environmentMapTexture;
gui.add(debugObject, 'envMapIntensity', 0, 10, 0.001).onChange(updateAllMaterials);

// Lights 
const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 10;
directionalLight.position.set(0.25, 3, -2.25);
directionalLight.shadow.normalBias = 0.02;
scene.add(directionalLight);


// Models 
// Textures
const mapTexture = textureLoader.load('/src/models/LeePerrySmith/color.jpg');
mapTexture.encoding = THREE.sRGBEncoding;

const normalTexture = textureLoader.load('/src/models/LeePerrySmith/normal.jpg');

// Material
const material = new THREE.MeshStandardMaterial({
    map: mapTexture,
    normalMap: normalTexture
});
const depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking
});

const customUniforms = {
    uTime: { value: 0 }
};

material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = customUniforms.uTime;
    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
            #include <common>
            uniform float uTime;

            mat2 get2dRotateMatrix(float _angle)
            {
                return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
            }
        `
    );
    shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        `
            #include <beginnormal_vertex>

            float angle = (sin(position.y + uTime)) * 0.4;
            mat2 rotateMatrix = get2dRotateMatrix(angle);

            objectNormal.xz = objectNormal.xz * rotateMatrix;
        `
    );
    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
            #include <begin_vertex>

            transformed.xz = rotateMatrix * transformed.xz;
        `
    );
};

depthMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = customUniforms.uTime;
    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
            #include <begin_vertex>
            float angle = (sin(position.y + uTime)) * 0.4;

            mat2 rotateMatrix = get2dRotateMatrix(angle * uTime * 0.1);

            transformed.xz = rotateMatrix * transformed.xz;
        `
    );
    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
            #include <common>
            uniform float uTime;

            mat2 get2dRotateMatrix(float _angle)
            {
                return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
            }
        `
    );
};

const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(15, 15),
    new THREE.MeshStandardMaterial({ color: '#fff' })
);
plane.receiveShadow = true;
plane.rotation.y = Math.PI / 2;
plane.position.x = -5;
scene.add(plane);

const gltfLoader = new GLTFLoader();
gltfLoader.load(
    '/src/models/LeePerrySmith/LeePerrySmith.glb',
    (gltf) => {
        // Model
        const mesh = gltf.scene.children[0];
        mesh.rotation.y = Math.PI * 0.5;
        mesh.material = material;
        mesh.customDepthMaterial = depthMaterial;
        scene.add(mesh);

        // Update materials
        updateAllMaterials()

        gui.add(gltf.scene.rotation, 'y', -Math.PI, Math.PI, 0.01).name('Rotation');

        // updateAllMaterials();
    }
);

directionalLight.position.x = 4.192;
directionalLight.position.y = 0;
directionalLight.position.z = -0.035;
gui.add(directionalLight, 'intensity', 0, 10, 0.001).name('LightIntensity');
gui.add(directionalLight.position, 'x', -5, 5, 0.001).name('LightX');
gui.add(directionalLight.position, 'y', 0, 5, 0.001).name('LightY');
gui.add(directionalLight.position, 'z', -5, 5, 0.001).name('LightZ');

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 200);


window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
});

/* 
Lights 
*/
scene.add(camera);
camera.position.z = 8;
camera.position.y = 3;
camera.position.x = 10;

// Controls 
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#262837');
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 3;
renderer.toneMapping = THREE.ReinhardToneMapping;
// renderer.toneMapping = THREE.CineonToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhart: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    AcesFilmic: THREE.ACESFilmicToneMapping
}).onFinishChange(() => {
    renderer.toneMapping = Number(renderer.toneMapping);
    updateAllMaterials();
});

gui.add(renderer, 'toneMappingExposure', 0, 10, 0.001);
// Clock
const clock = new THREE.Clock();
// Animations
const tick = () => {

    // Clock
    const elapsedTime = clock.getElapsedTime();

    customUniforms.uTime.value = elapsedTime;

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
