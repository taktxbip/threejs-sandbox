'use strict';
import * as THREE from 'three';
// import gsap from 'gsap';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import testVertexShader from '../shaders/test-pattern/vertex.glsl';
import testFragmentShader from '../shaders/test-pattern/fragement.glsl';
// import { Vector3 } from 'three';

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
const fog = new THREE.Fog('#262837', 1, 30);
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

const pointLight = new THREE.PointLight('#fff', 0.5, 10, 1);
const ambientLight = new THREE.AmbientLight('#fff', 0.7);
pointLight.position.set(-1, 2, -1);
pointLight.castShadow = true;

const planeGeometry = new THREE.PlaneBufferGeometry(3, 3, 100, 100);

const planeMaterial = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    side: THREE.DoubleSide
});

const planeMesh = new THREE.Mesh(
    planeGeometry,
    planeMaterial
);
planeMesh.receiveShadow = true;


const count = planeGeometry.attributes.position.count;
const randoms = new Float32Array(count);

for (let i = 0; i < count; i++) {
    randoms[i] = Math.random();
}
planeGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

scene.add(planeMesh, pointLight, ambientLight);

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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Time
// let time = Date.now();


// Clock
const clock = new THREE.Clock();
// Animations
const tick = () => {

    // Clock 
    const elapsedTime = clock.getElapsedTime();

    // Update physics
    // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position);


    // sphereMesh.position.copy(sphereBody.position);

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();