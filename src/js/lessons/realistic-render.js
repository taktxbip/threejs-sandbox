'use strict';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();

const gui = new dat.GUI();
const debugObject = {
    envMapIntensity: 5
};
// gui.hide();

const axes = new THREE.AxesHelper();
scene.add(axes);

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
            // child.material.envMap = environmentMapTexture;
            child.material.envMapIntensity = debugObject.envMapIntensity;
            child.material.needsUpdate = true;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
};

// Textures
const map = 1;
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

// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(directionalLightCameraHelper);

// Models 
const gltfLoader = new GLTFLoader();
gltfLoader.load(
    // '/src/models/FlightHelmet/glTF/FlightHelmet.gltf',
    '/src/models/hamburger.glb',
    (gltf) => {
        gltf.scene.scale.set(0.3, 0.3, 0.3);
        gltf.scene.position.set(0, -2, 0);
        gltf.scene.rotation.y = - 0.3;
        scene.add(gltf.scene);

        gui.add(gltf.scene.rotation, 'y', -Math.PI, Math.PI, 0.01).name('Rotation');

        updateAllMaterials();
    }
);

gui.add(directionalLight, 'intensity', 0, 10, 0.001).name('LightIntensity');
gui.add(directionalLight.position, 'x', -5, 5, 0.001).name('LightX');
gui.add(directionalLight.position, 'y', 0, 5, 0.001).name('LightY');
gui.add(directionalLight.position, 'z', -5, 5, 0.001).name('LightZ');

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 200);

function realisticRender() {

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
    camera.position.z = 7;
    camera.position.y = 1;
    camera.position.x = 1;

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
    }).onFinishChange(()=>{
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

        controls.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();
}

export default realisticRender;