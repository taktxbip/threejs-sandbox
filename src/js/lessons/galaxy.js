'use strict';
import * as THREE from 'three';
import gsap from 'gsap';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Vector3 } from 'three';

// import imagew from '/src/images/door/color.jpg';
// console.log(imagew);
const scene = new THREE.Scene();

const axes = new THREE.AxesHelper();
scene.add(axes);

const gui = new dat.GUI();
// gui.hide();

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

/* 
* Galaxy
*/
const parameters = {
    count: 250000,
    size: 0.01,
    radius: 10,
    branches: 3,
    spin: 0.4,
    randomness: 0.1,
    randomnessPower: 3,
    insideColor: '#ff3300',
    outsideColor: '#ccee22'
};

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {

    if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        // position
        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

        positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        // color 
        const colorMixed = colorInside.clone();
        colorMixed.lerp(colorOutside, radius / parameters.radius);

        colors[i3] = colorMixed.r;
        colors[i3 + 1] = colorMixed.g;
        colors[i3 + 2] = colorMixed.b;
    }

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    );

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
    );

    // Material
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.Addititive,
        vertexColors: true
    });

    // Points 
    points = new THREE.Points(geometry, material);
    scene.add(points);
};

generateGalaxy();

gui.add(parameters, 'count', 1000, 50000, 20).onFinishChange(generateGalaxy);
gui.add(parameters, 'size', 0.001, 0.1, 0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'radius', 0.01, 20, 0.01).onFinishChange(generateGalaxy);
gui.add(parameters, 'branches', 2, 16, 1).onFinishChange(generateGalaxy);
gui.add(parameters, 'spin', -5, 5, 0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomness', 0, 2, 0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomnessPower', 1, 10, 0.001).onFinishChange(generateGalaxy);
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);


const count = 20000;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
    colors[i] = Math.random();
}



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


    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();