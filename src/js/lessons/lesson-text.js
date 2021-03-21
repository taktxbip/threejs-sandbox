'use strict';
import * as THREE from 'three';
import gsap from 'gsap';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ACESFilmicToneMapping } from 'three';

// import imagew from '/src/images/door/color.jpg';
// console.log(imagew);
const scene = new THREE.Scene();

// const axesHelper = new THREE.AxesHelper(3);
// scene.add(axesHelper);

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

const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load('/src/images/matcaps/8.png');

const fontLoader = new THREE.FontLoader();
fontLoader.load(
    '/src/fonts/helvetiker_regular.typeface.json',
    (font) => {
        const textGeometry = new THREE.TextBufferGeometry(
            'Evnomad \nis here',
            {
                font: font,
                size: 0.5,
                height: 0.2,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            }
        );
        textGeometry.center();

        const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
        const text = new THREE.Mesh(textGeometry, material);

        scene.add(text);

        console.time('donuts');

        const donutGeometry = new THREE.TorusBufferGeometry(0.3, 0.2, 20, 45);

        for (let i = 0; i < 100; i++) {

            const donut = new THREE.Mesh(donutGeometry, material);
            donut.position.x = (Math.random() - 0.5) * 10;
            donut.position.y = (Math.random() - 0.5) * 10;
            donut.position.z = (Math.random() - 0.5) * 10;
            
            donut.rotation.x = (Math.random() * Math.PI);
            donut.rotation.y = (Math.random() * Math.PI);
            
            const scale = Math.random();
            donut.scale.set(scale, scale, scale);
            
            scene.add(donut);
        }
        console.timeEnd('donuts');
    }
);

loadingManager.onStart = () => console.log('onStart');
loadingManager.onLoaded = () => console.log('onLoaded');
loadingManager.onProgress = () => console.log('onProgress');
loadingManager.onError = () => console.log('onError');



function lessonText() {

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

    gui.addColor(parameters, 'color').onChange(() => material.color.set(parameters.color));

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
        const elapsedTime = clock.getElapsedTime();

        controls.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();
}

export default lessonText;