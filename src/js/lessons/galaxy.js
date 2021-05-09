'use strict';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'stats.js';
import galaxyVertexShader from '../shaders/galaxy/vertex.glsl';
import galaxyFragmentShader from '../shaders/galaxy/fragment.glsl';

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// import imagew from '/src/images/door/color.jpg';
// console.log(imagew);
const scene = new THREE.Scene();

const gui = new dat.GUI();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const canvas = document.querySelector('.webgl');

/* 
* Galaxy
*/
const parameters = {};
parameters.count = 200000;
parameters.size = 0.005;
parameters.radius = 5;
parameters.branches = 6;
parameters.spin = 1;
parameters.randomness = 0.2;
parameters.randomnessPower = 3;
parameters.insideColor = '#ff6030';
parameters.outsideColor = '#1b3984';

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
    const scales = new Float32Array(parameters.count);
    const randomness = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        // position
        const radius = Math.random() * parameters.radius;
        const spinAngle = 0;
        //  radius * parameters.spin;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

        randomness[i3] = randomX;
        randomness[i3 + 1] = randomY;
        randomness[i3 + 2] = randomZ;

        positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius;

        // color 
        const colorMixed = colorInside.clone();
        colorMixed.lerp(colorOutside, radius / parameters.radius);

        colors[i3] = colorMixed.r;
        colors[i3 + 1] = colorMixed.g;
        colors[i3 + 2] = colorMixed.b;

        scales[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    // Material
    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        uniforms: {
            uTime: { value: 0.0 },
            uSize: { value: 20.0 * renderer.getPixelRatio() }
        },
        vertexShader: galaxyVertexShader,
        fragmentShader: galaxyFragmentShader
    });

    // Points 
    points = new THREE.Points(geometry, material);
    scene.add(points);
};

gui.add(parameters, 'count', 1000, 50000, 20).onFinishChange(generateGalaxy);
gui.add(parameters, 'radius', 0.01, 20, 0.01).onFinishChange(generateGalaxy);
gui.add(parameters, 'branches', 2, 16, 1).onFinishChange(generateGalaxy);
gui.add(parameters, 'spin', -5, 5, 0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomness', 0, 2, 0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomnessPower', 1, 10, 0.001).onFinishChange(generateGalaxy);
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);


window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);

camera.position.z = 3;
camera.position.y = 3;
camera.position.x = 3;
scene.add(camera);

// Controls 
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

generateGalaxy();

// Clock
const clock = new THREE.Clock();
// Animations
const tick = () => {

    stats.begin();
    // Clock
    const elapsedTime = clock.getElapsedTime();
    // Update material
    material.uniforms.uTime.value = elapsedTime * 0.1;

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
    stats.end();
};

tick();