'use strict';
import * as THREE from 'three';
import gsap from 'gsap';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { Vector3 } from 'three';

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

// Fog
const fog = new THREE.Fog('#262837', 1, 15);
scene.fog = fog;

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
const particleTexture = textureLoader.load('/src/images/particles/2.png');
/* Prticles
*/
const particlesGeometry = new THREE.BufferGeometry();
const particlesMaterial = new THREE.PointsMaterial(
    {
        size: 0.1,
        sizeAttenuation: true,
        color: '#d19dc6',
        map: particleTexture,
        alphaMap: particleTexture,
        transparent: true,
        // alphaTest: 0.001
        // depthTest: false
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    }
);
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);



const count = 20000;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
    colors[i] = Math.random();
}

particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
);
particlesGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
);

function lessonParticles() {

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
    // Animations
    const tick = () => {




        // Clock
        const elapsedTime = clock.getElapsedTime();


        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const x = particlesGeometry.attributes.position.array[i3 + 0];
            particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x) ;
        }
        particlesGeometry.attributes.position.needsUpdate = true;

        // Update particles
        // particles.rotation.x = elapsedTime  * 0.02;

        controls.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();
}

export default lessonParticles;