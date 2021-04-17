'use strict';
import * as THREE from 'three';
// import gsap from 'gsap';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import seaVertexShader from '../shaders/sea/vertex.glsl';
import seaFragmentShader from '../shaders/sea/fragement.glsl';
// import { Vector3 } from 'three';


const debugObject = {
    depthColor: '#00ff83',
    surfaceColor: '#1e1ecd'
};

const scene = new THREE.Scene();

const gui = new dat.GUI();
// gui.hide();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const canvas = document.querySelector('.webgl');

// Fog
const fog = new THREE.Fog('#262837', 1, 30);
scene.fog = fog;

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 200);

const planeGeometry = new THREE.PlaneBufferGeometry(100, 100, 1024, 1024);

const planeMaterial = new THREE.ShaderMaterial({
    vertexShader: seaVertexShader,
    fragmentShader: seaFragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
        uTime: { value: 0 },

        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector2(0.8, 0.6) },
        uBigWavesSpeed: { value: 0.5 },

        uSmallWavesElevation: { value: 0.07 },
        uSmallWavesFrequency: { value: 3.0 },
        uSmallWavesSpeed: { value: 0.6 },
        uSmallIterations: { value: 4 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.6 },
        uColorMultiplier: { value: 1.1 }
    }
});

gui.add(planeMaterial.uniforms.uBigWavesElevation, 'value').min(0.01).max(1.0).step(0.01).name('uBigWavesElevation');
gui.add(planeMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10.0).step(0.01).name('uBigWavesFrequencyX');
gui.add(planeMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10.0).step(0.01).name('uBigWavesFrequencyY');
gui.add(planeMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(5.0).step(0.01).name('uBigWavesSpeed');

gui.add(planeMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(2.0).step(0.01).name('uSmallWavesElevation');
gui.add(planeMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(10.0).step(0.01).name('uSmallWavesFrequency');
gui.add(planeMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(4.0).step(0.01).name('uSmallWavesSpeed');
gui.add(planeMaterial.uniforms.uSmallIterations, 'value').min(0).max(8.0).step(1).name('uSmallIterations');

gui.add(planeMaterial.uniforms.uColorOffset, 'value').min(0).max(5.0).step(0.01).name('uColorOffset');
gui.add(planeMaterial.uniforms.uColorMultiplier, 'value').min(0).max(5.0).step(0.01).name('uColorOffset');

gui.addColor(debugObject, 'depthColor').name('depthColor').onChange(()=> {
    planeMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
});
gui.addColor(debugObject, 'surfaceColor').name('surfaceColor').onChange(()=> {
    planeMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
});


const planeMesh = new THREE.Mesh(
    planeGeometry,
    planeMaterial
);
planeMesh.rotation.x = -Math.PI / 2;

scene.add(planeMesh);

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
camera.position.z = 5;
camera.position.y = 1;
camera.position.x = 1;

// Controls 
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#262837');


// Clock
const clock = new THREE.Clock();
// Animations
const tick = () => {

    // Clock 
    const elapsedTime = clock.getElapsedTime();

    // Update material
    planeMaterial.uniforms.uTime.value = elapsedTime;

    // sphereMesh.position.copy(sphereBody.position);

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();