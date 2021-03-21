'use strict';
import * as THREE from 'three';
import gsap from 'gsap';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// import imagew from '/src/images/door/color.jpg';
// console.log(imagew);
const gui = new dat.GUI();
gui.hide();

const parameters = {
    color: 0x9cb1
};

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const canvas = document.querySelector('.webgl');
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
const colorTexture = textureLoader.load('/src/images/door/color.jpg');
const alphaTexture = textureLoader.load('/src/images/door/alpha.jpg');
const ambientOcclusionTexture = textureLoader.load('/src/images/door/ambientOcclusion.jpg');
const heightTexture = textureLoader.load('/src/images/door/height.jpg');
const metalnessTexture = textureLoader.load('/src/images/door/metalness.jpg');
const roughnessTexture = textureLoader.load('/src/images/door/roughness.jpg');
const normalTexture = textureLoader.load('/src/images/door/normal.jpg');

// colorTexture.repeat.x = 2;
// colorTexture.repeat.y = 3;
// colorTexture.wrapS = THREE.RepeatWrapping;
// colorTexture.wrapT = THREE.MirroredRepeatWrapping;
// colorTexture.offset.x = 0.5;
colorTexture.rotation = Math.PI * 0.25;
colorTexture.center.x = 0.5;
colorTexture.center.y = 0.5;
colorTexture.minFilter = THREE.NearestFilter;

function lessonTextures() {

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

    const scene = new THREE.Scene();

    // Axes helper
    // const axesHelper = new THREE.AxesHelper(3);
    // scene.add(axesHelper);

    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ map: colorTexture });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.5;

    const floor = new THREE.Mesh(
        new THREE.BoxBufferGeometry(100, 0.1, 100),
        new THREE.MeshBasicMaterial({ color: '#f5f5f5' })
    );
    scene.add(floor);

    parameters.spin = () => {
        gsap.to(mesh.rotation, { y: 10, duration: 1, delay: 1 });
    };
    scene.add(mesh);


    gui.add(mesh.position, 'y', -3, 3, 0.01).name('Axis Y');
    gui.add(mesh.position, 'x', -3, 3, 0.01);
    gui.add(mesh.position, 'z', -3, 3, 0.01);
    gui.add(mesh, 'visible');
    gui.add(material, 'wireframe');
    gui.addColor(parameters, 'color').onChange(() => material.color.set(parameters.color));
    gui.add(parameters, 'spin');

    scene.add(camera);
    camera.position.z = 3;
    camera.position.y = 1;
    camera.position.x = 1;

    // Controls 
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Time
    // let time = Date.now();

    // Clock
    const clock = new THREE.Clock();
    // Animations
    const tick = () => {

        // Clock
        // const elapsedTime = clock.getElapsedTime();

        controls.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();
}

export default lessonTextures;