'use strict';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

let sceneReady = false;

const bar = document.querySelector('.loading-bar');
// Global things
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        gsap.delayedCall(0.5, () => {
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 });
            bar.classList.add('ended');
            bar.style.transform = ``;
            sceneReady = true;
        });
    },
    // Progress
    (itemUrl, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal;
        bar.style.transform = `scaleX(${progressRatio})`;
    }
);
const scene = new THREE.Scene();
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);

const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
        uAlpha: { value: 1 }
    },
    vertexShader: `
    void main() {
        gl_Position = vec4(position, 1.0);
    }
    `,
    fragmentShader: `
    uniform float uAlpha;

    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
    }
    `
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

const gui = new dat.GUI();
const debugObject = {
    envMapIntensity: 5
};
gui.hide();

const axes = new THREE.AxesHelper();
scene.add(axes);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const canvas = document.querySelector('.webgl');


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

// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(directionalLightCameraHelper);

// Models 
gltfLoader.load(
    '/src/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.set(2.5, 2.5, 2.5)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene);

        gui.add(gltf.scene.rotation, 'y', -Math.PI, Math.PI, 0.01).name('Rotation');

        updateAllMaterials();
    }
);

// Points 
const points = [
    {
        position: new THREE.Vector3(1.55, 1, -0.6),
        element: document.querySelector('.point-0')
    }
];
const raycaster = new THREE.Raycaster();

gui.add(directionalLight, 'intensity', 0, 10, 0.001).name('LightIntensity');
gui.add(directionalLight.position, 'x', -5, 5, 0.001).name('LightX');
gui.add(directionalLight.position, 'y', 0, 5, 0.001).name('LightY');
gui.add(directionalLight.position, 'z', -5, 5, 0.001).name('LightZ');

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 200);

function lLoader() {

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

        controls.update();

        if (sceneReady) {
            for (const point of points) {
                const screenPosition = point.position.clone();
                screenPosition.project(camera);

                raycaster.setFromCamera(screenPosition, camera);
                const intersects = raycaster.intersectObjects(scene.children, true);

                if (intersects.length === 0) {
                    point.element.classList.add('visible');
                }
                else {
                    const distance = intersects[0].distance;
                    const pointDistance = point.position.distanceTo(camera.position);
                    if (distance < pointDistance) {
                        point.element.classList.remove('visible');
                    }
                    else {
                        point.element.classList.add('visible');
                    }
                }

                const translateX = screenPosition.x * sizes.width * 0.5;
                const translateY = - screenPosition.y * sizes.height * 0.5;
                point.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
            }
        }

        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();
}

export default lLoader;