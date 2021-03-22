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
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFShadowMap;
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

const doorColorTexture = textureLoader.load('/src/images/door/color.jpg');
const doorAlphaTexture = textureLoader.load('/src/images/door/alpha.jpg');
const doorAmbientTexture = textureLoader.load('/src/images/door/ambientOcclusion.jpg');
const doorHeightTexture = textureLoader.load('/src/images/door/height.jpg');
const doorMetalnessTexture = textureLoader.load('/src/images/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('/src/images/door/roughness.jpg');
const doorNormalTexture = textureLoader.load('/src/images/door/normal.jpg');

const bricksColorTexture = textureLoader.load('/src/images/bricks/color.jpg');
const bricksAmbientOcclusionTexture = textureLoader.load('/src/images/bricks/ambientOcclusion.jpg');
const bricksNormalTexture = textureLoader.load('/src/images/bricks/normal.jpg');
const bricksRoughnessTexture = textureLoader.load('/src/images/bricks/roughness.jpg');

const grassColorTexture = textureLoader.load('/src/images/grass/color.jpg');
const grassAmbientOcclusionTexture = textureLoader.load('/src/images/grass/ambientOcclusion.jpg');
const grassNormalTexture = textureLoader.load('/src/images/grass/normal.jpg');
const grassRoughnessTexture = textureLoader.load('/src/images/grass/roughness.jpg');

grassColorTexture.repeat.set(8, 8);
grassAmbientOcclusionTexture.repeat.set(8, 8);
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.repeat.set(8, 8);

grassColorTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;

grassColorTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

function lessonHautedHouse() {

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

    const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12);
    const directionalLight = new THREE.DirectionalLight('#b9d5ff', 0.12);
    const doorLight = new THREE.PointLight('#ff7d46', 1, 7);
    doorLight.position.set(0, 2.2, 2.7);


    scene.add(directionalLight, ambientLight);

    const material = new THREE.MeshStandardMaterial();
    material.roughness = 0.4;

    gui.add(material, 'metalness', 0, 1, 0.001);


    const plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(50, 50, 1, 1),
        new THREE.MeshStandardMaterial({
            map: grassColorTexture,
            aoMap: grassAmbientOcclusionTexture,
            normalMap: grassNormalTexture,
            roughnessMap: grassRoughnessTexture
        })
    );
    plane.geometry.setAttribute(
        'uv2',
        new THREE.Float32BufferAttribute(plane.geometry.attributes.uv.array, 2)
    );
    const house = new THREE.Group();
    const walls = new THREE.Mesh(
        new THREE.BoxBufferGeometry(4, 2.5, 4, 1, 1),
        new THREE.MeshStandardMaterial({
            map: bricksColorTexture,
            aoMap: bricksAmbientOcclusionTexture,
            normalMap: bricksNormalTexture,
            roughnessMap: bricksRoughnessTexture
        })
    );
    walls.geometry.setAttribute(
        'uv2',
        new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
    );
    const roof = new THREE.Mesh(
        new THREE.ConeBufferGeometry(3.3, 1, 4),
        new THREE.MeshStandardMaterial({ color: '#b35f45' })
    );
    const door = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2, 2, 100, 100),
        new THREE.MeshStandardMaterial({
            map: doorColorTexture,
            alphaMap: doorAlphaTexture,
            transparent: true,
            aoMap: doorAmbientTexture,
            displacementMap: doorHeightTexture,
            displacementScale: 0.1,
            normalMap: doorNormalTexture,
            metalnessMap: doorMetalnessTexture,
            roughnessMap: doorRoughnessTexture
        })
    );
    door.geometry.setAttribute(
        'uv2',
        new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
    );
    walls.position.y = 2.5 / 2;
    roof.position.y = 2.5 + 1 / 2;
    roof.rotation.y = Math.PI / 4;
    door.position.z = 2.01;
    door.position.y = 1;

    // bushes
    const bushGeometry = new THREE.SphereBufferGeometry(1, 16, 16);
    const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' });

    const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush1.scale.set(0.5, 0.5, 0.5);
    bush1.position.set(0.8, 0.2, 2.2);

    const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush2.scale.set(0.25, 0.25, 0.25);
    bush2.position.set(1.4, 0.1, 2.1);

    const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush3.scale.set(0.4, 0.4, 0.4);
    bush3.position.set(-0.8, 0.1, 2.2);

    const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush4.scale.set(0.15, 0.15, 0.15);
    bush4.position.set(-1, 0.05, 2.6);

    house.add(walls, roof, door, bush1, bush2, bush3, bush4, doorLight);
    scene.add(house);

    const graves = new THREE.Group();
    scene.add(graves);

    const graveGeometry = new THREE.BoxBufferGeometry(0.6, 0.8, 0.2);
    const graveMaterial = new THREE.MeshStandardMaterial({ color: '#f5f0f2' });

    const count = 40;
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const x = Math.sin(angle) * 6 + (Math.random() * 2 - 1) * 2;
        const z = Math.cos(angle) * 6;
        const grave = new THREE.Mesh(graveGeometry, graveMaterial);
        grave.position.set(x, 0.4 / 2, z);
        grave.rotation.y = (Math.random() - 0.5) * Math.PI * 0.2;
        grave.rotation.z = (Math.random() - 0.5) * Math.PI * 0.1;

        graves.add(grave);
    }
    scene.add(graves);

    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2));

    scene.add(camera);
    camera.position.z = 8;
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
}

export default lessonHautedHouse;