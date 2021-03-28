'use strict';
import * as THREE from 'three';
import gsap from 'gsap';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';


// import imagew from '/src/images/door/color.jpg';
// console.log(imagew);
const scene = new THREE.Scene();

const axes = new THREE.AxesHelper();
scene.add(axes);

const gui = new dat.GUI();
gui.hide();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const canvas = document.querySelector('.webgl');

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/src/js/draco/');

// Models 
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let mixer = null;

gltfLoader.load(
    // '/src/models/FlightHelmet/glTF/FlightHelmet.gltf',
    // '/src/models/Duck/glTF-Draco/Duck.gltf',
    '/src/models/Fox/glTF/Fox.gltf',
    (gltf) => {
        mixer = new THREE.AnimationMixer(gltf.scene);
        const action = mixer.clipAction(gltf.animations[2]);
        action.play();
        // scene.add(gltf.scene.children[0]);
        // while(gltf.scene.children.length) {
        //     scene.add(gltf.scene.children[0]);
        // }
        // const children = [...gltf.scene.children];
        // for (const child of children) {
        //     scene.add(child);
        // }
        console.log(gltf);
        gltf.scene.scale.set(0.025, 0.025, 0.025);
        scene.add(gltf.scene);
    }
);


const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);

scene.add(ambientLight, directionalLight);

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 200);

/*
* Textures
*/
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => console.log('onStart');
loadingManager.onLoaded = () => console.log('onLoaded');
loadingManager.onProgress = () => console.log('onProgress');
loadingManager.onError = () => console.log('onError');

const textureLoader = new THREE.TextureLoader(loadingManager);

/* 
* Galaxy
*/
const parameters = {
    count: 1000,
    size: 0.02
};

function importModels() {

    window.addEventListener('resize', () => {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;

        // Update camera
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();

        // Update renderer
        renderer.setSize(sizes.width, sizes.height);
    });
    window.addEventListener('dblclick', function () {
        const fillscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
        if (!fillscreenElement) {
            if (canvas.requestFullscreen) {
                canvas.requestFullscreen();
            }
            else if (canvas.webkitRequestFullscreen) {
                canvas.webkitRequestFullscreen();
            }
        }
        else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    });
    /* 
    Lights 
    */
    scene.add(camera);
    camera.position.z = 2;
    camera.position.y = 1;
    camera.position.x = 1;

    // Controls 
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor('#262837');

    // Time
    // let time = Date.now();

    // Clock
    const clock = new THREE.Clock();
    let previousTime = 0;
    // Animations
    const tick = () => {

        // Clock
        const elapsedTime = clock.getElapsedTime();
        const deltaTime = elapsedTime - previousTime;
        previousTime = elapsedTime;

        if (mixer !== null)
            mixer.update(deltaTime);

        controls.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();
}

export default importModels;