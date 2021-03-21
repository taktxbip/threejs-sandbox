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

const colorTexture = textureLoader.load('/src/images/door/color.jpg');
const matcapTexture = textureLoader.load('/src/images/matcaps/2.png');
const gradientTexture = textureLoader.load('/src/images/gradients/5.jpg');
const bakedShadow = textureLoader.load('/src/images/bakedShadow.jpg');
const simpleShadow = textureLoader.load('/src/images/simpleShadow.jpg');
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;


colorTexture.minFilter = THREE.NearestFilter;

function lessonLights() {

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.y = 2;
    directionalLight.position.x = -3;

    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.top = 2;
    directionalLight.shadow.camera.right = 2;
    directionalLight.shadow.camera.bottom = -2;
    directionalLight.shadow.camera.left = -2;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 6;
    directionalLight.shadow.radius = 10;

    console.log(directionalLight.shadow.camera);
    scene.add(directionalLight, ambientLight);

    const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    directionalLightCameraHelper.visible = false;
    scene.add(directionalLightCameraHelper);

    // Helpers
    // const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.5);
    // scene.add(hemisphereLightHelper);

    const spotLight = new THREE.SpotLight(0xffffff, 0.4, 10, Math.PI * 0.3);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.fov = 30;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 6;


    spotLight.position.set(0, 2, 2);
    scene.add(spotLight, spotLight.target);

    const spotlLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
    spotlLightCameraHelper.visible = false;

    const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.5);
    scene.add(directionalLightHelper, spotlLightCameraHelper);

    const pointLight = new THREE.PointLight(0xfffffff, 0.3);
    pointLight.castShadow = true;
    pointLight.position.set(-1, 1.5, 0);
    pointLight.shadow.width = 1024;
    pointLight.shadow.height = 1024;
    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 4;
    scene.add(pointLight);

    const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
    pointLightCameraHelper.visible = false;
    scene.add(pointLightCameraHelper);

    const material = new THREE.MeshStandardMaterial();
    material.roughness = 0.4;

    gui.add(material, 'metalness', 0, 1, 0.001);

    material.matcap = matcapTexture;

    const plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(10, 10, 1, 1),
        material
    );
    const sphereShadow = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1),
        new THREE.MeshBasicMaterial({
            color: 0x00000,
            alphaMap: simpleShadow,
            transparent: true
        })
    );
    sphereShadow.rotation.x = - Math.PI / 2;
    sphereShadow.position.y = plane.position.y + 0.01;
    plane.receiveShadow = true;
    const sphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.5, 32, 32),
        material
    );
    sphere.castShadow = true;
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane, sphere, sphereShadow);
    sphere.position.x = -1.5;

    sphere.position.y = 0.5;

    plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2));
    sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2));

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
        sphere.position.x = Math.sin(elapsedTime) * 1.5;
        sphere.position.z = Math.cos(elapsedTime) * 1.5;
        sphere.position.y = Math.abs((Math.cos(elapsedTime * 3) * 1.5)) + 0.5;

        // Update the shadow
        sphereShadow.position.x = sphere.position.x;
        sphereShadow.position.z = sphere.position.z;

        sphereShadow.material.opacity = (1.4 - sphere.position.y) * 0.8;
        // sphereShadow.material.opacity = Math.abs((Math.cos(elapsedTime * 3) * 1.5)) + 0.5;

        controls.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();
}

export default lessonLights;