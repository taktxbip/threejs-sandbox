'use strict';
import * as THREE from 'three';
// import gsap from 'gsap';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import { Vector3 } from 'three';
import * as CANNON from 'cannon-es';

// import imagew from '/src/images/door/color.jpg';
// console.log(imagew);
const scene = new THREE.Scene();

const axes = new THREE.AxesHelper();
scene.add(axes);

const gui = new dat.GUI();
const debugObject = {};


const createCity = () => {
    setInterval(() => {
        const height = Math.random() * 2;
        createBox(
            Math.random() * 0.5 + 0.1,
            height,
            Math.random() * 0.5 + 0.1,
            {
                x: (Math.random() - 0.5) * 20,
                y: height / 2,
                z: (Math.random() - 0.5) * 20
            }
        );
    }, 200);
};

debugObject.createBoxes = () => {
    createCity();
};

debugObject.createSphere = () => {
    // for (let i = 0; i < 3; i++) {
    setInterval(() => {
        createSphere(
            Math.random() * 0.5,
            {
                x: (Math.random() - 0.5) * 3,
                y: 3,
                z: (Math.random() - 0.5) * 3
            }
        );
    }, 1000);

    // }
};

debugObject.reset = () => {
    for (const object of objectsToUpdate) {
        // Remove body
        object.body.removeEventListener('collide', playHitSound);
        world.removeBody(object.body);

        // Remove mesh
        scene.remove(object.mesh);
    }
};

gui.add(debugObject, 'createSphere');
gui.add(debugObject, 'createBoxes');
gui.add(debugObject, 'reset');
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

/*
* Sounds
*/
const hitSound = new Audio('/src/sounds/hit.mp3');

const playHitSound = (collision) => {

    const impactStrength = collision.contact.getImpactVelocityAlongNormal();
    if (impactStrength < 1.5) return;

    hitSound.currentTime = 0;
    hitSound.volume = Math.random();
    // hitSound.play();
};

/* 
* World
*/
const world = new CANNON.World();
// world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

// Materials Physics
const defaultMaterial = new CANNON.Material('default');
const concreteMaterial = new CANNON.Material('concrete');
const plasticMaterial = new CANNON.Material('plastic');

const concretePlasticContactMaterial = new CANNON.ContactMaterial(
    concreteMaterial,
    plasticMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
);

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
);

world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;



const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    Math.PI / 2
);
world.addBody(floorBody);

const textureLoader = new THREE.TextureLoader(loadingManager);
const matcapTexture = textureLoader.load('/src/images/matcaps/2.png');

const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load([
    '/src/images/environmentMaps/2/px.jpg',
    '/src/images/environmentMaps/2/nx.jpg',
    '/src/images/environmentMaps/2/py.jpg',
    '/src/images/environmentMaps/2/ny.jpg',
    '/src/images/environmentMaps/2/pz.jpg',
    '/src/images/environmentMaps/2/nz.jpg'
]);

const pointLight = new THREE.PointLight('#fff', 0.5, 10, 1);
const ambientLight = new THREE.AmbientLight('#fff', 0.7);
pointLight.position.set(-1, 2, -1);
pointLight.castShadow = true;


const planeMesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: '#f5f5f5' })
);
planeMesh.rotation.x = - Math.PI / 2;
planeMesh.receiveShadow = true;


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


// window.addEventListener('dblclick', function () {
//     const fillscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
//     if (!fillscreenElement) {
//         if (canvas.requestFullscreen) {
//             canvas.requestFullscreen();
//         }
//         else if (canvas.webkitRequestFullscreen) {
//             canvas.webkitRequestFullscreen();
//         }
//     }
//     else {
//         if (document.exitFullscreen) {
//             document.exitFullscreen();
//         }
//         else if (document.webkitExitFullscreen) {
//             document.webkitExitFullscreen();
//         }
//     }
// });
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

/*
* Utils
*/
const objectsToUpdate = [];

const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture
});
const sphereGeometry = new THREE.SphereBufferGeometry(1, 32, 32);

const createSphere = (radius, position) => {

    // Three.js Mesh
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    mesh.scale.set(radius, radius, radius);
    mesh.position.copy(position);
    mesh.castShadow = true;
    scene.add(mesh);

    // Cannon.js Body
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape
    });
    body.position.copy(position);
    // sphereBody.applyLocalForce(
    //     new CANNON.Vec3(20, 0, 0),
    //     new CANNON.Vec3(0, 0, 0)
    // );
    body.addEventListener('collide', playHitSound);
    world.addBody(body);


    // Save in odject to update;
    objectsToUpdate.push({ mesh, body });
};

const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1);

const createBox = (width, height, depth, position) => {

    // Three.js Mesh
    const mesh = new THREE.Mesh(boxGeometry, sphereMaterial);
    mesh.scale.set(width, height, depth);
    mesh.position.copy(position);
    mesh.castShadow = true;
    scene.add(mesh);

    // Cannon.js Body
    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5));
    const body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(0, 3, 0),
        shape
    });
    body.position.copy(position);
    // sphereBody.applyLocalForce(
    //     new CANNON.Vec3(20, 0, 0),
    //     new CANNON.Vec3(0, 0, 0)
    // );
    body.addEventListener('collide', playHitSound);
    world.addBody(body);

    // Save in odject to update;
    objectsToUpdate.push({ mesh, body });
};


// Clock
const clock = new THREE.Clock();
let oldElapsedTime = 0;
// Animations
const tick = () => {

    // Clock 
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    // Update physics
    // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position);
    world.step(1 / 60, deltaTime, 3);

    for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
    }

    // sphereMesh.position.copy(sphereBody.position);

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
