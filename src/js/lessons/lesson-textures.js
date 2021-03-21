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
const cubeTextureLoader = new THREE.CubeTextureLoader();

const colorTexture = textureLoader.load('/src/images/door/color.jpg');
const alphaTexture = textureLoader.load('/src/images/door/alpha.jpg');
const ambientOcclusionTexture = textureLoader.load('/src/images/door/ambientOcclusion.jpg');
const heightTexture = textureLoader.load('/src/images/door/height.jpg');
const metalnessTexture = textureLoader.load('/src/images/door/metalness.jpg');
const roughnessTexture = textureLoader.load('/src/images/door/roughness.jpg');
const normalTexture = textureLoader.load('/src/images/door/normal.jpg');
const matcapTexture = textureLoader.load('/src/images/matcaps/2.png');
const gradientTexture = textureLoader.load('/src/images/gradients/5.jpg');
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;

const environmentMapTexture = cubeTextureLoader.load([
    '/src/images/environmentMaps/0/px.jpg',
    '/src/images/environmentMaps/0/nx.jpg',
    '/src/images/environmentMaps/0/py.jpg',
    '/src/images/environmentMaps/0/ny.jpg',
    '/src/images/environmentMaps/0/pz.jpg',
    '/src/images/environmentMaps/0/nz.jpg'
]);

// colorTexture.rotation = Math.PI * 0.25;
// colorTexture.center.x = 0.5;
// colorTexture.center.y = 0.5;
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.x = 2;
    pointLight.position.y = 3;
    pointLight.position.z = 4;
    scene.add(pointLight);

    // Axes helper
    // const axesHelper = new THREE.AxesHelper(3);
    // scene.add(axesHelper);

    // material.transparent = true;
    // material.side = THREE.DoubleSide;

    // const material = new THREE.MeshNormalMaterial();
    // const material = new THREE.MeshDepthMaterial();
    // material.shininess = 100;
    // material.specular = new THREE.Color(0xff0000);
    // const material = new THREE.MeshToonMaterial();
    // material.gradientMap = gradientTexture;
    const material = new THREE.MeshStandardMaterial();
    material.metalness = 0.7;
    material.roughness = 0.2;
    material.envMap = environmentMapTexture;
    // material.map = colorTexture;
    // material.aoMap = ambientOcclusionTexture;
    // material.aoMapIntensity = 1;
    // material.displacementMap = heightTexture;
    // material.displacementScale = 0.05;
    // material.metalnessMap = metalnessTexture;
    // material.roughnessMap = roughnessTexture;
    // material.normalMap = normalTexture;
    // material.normalScale.set(0.1, 0.1);
    // material.alphaMap = alphaTexture;
    // material.transparent = true;


    gui.add(material, 'metalness', 0, 1, 0.001);
    gui.add(material, 'roughness', 0, 1, 0.001);
    gui.add(material, 'aoMapIntensity', 0, 1, 0.001);
    gui.add(material, 'displacementScale', 0, 1, 0.001);

    material.matcap = matcapTexture;
    // material.flatShading = true;

    const plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1, 50, 50),
        material
    );
    const sphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.5, 128, 128),
        material
    );
    const torus = new THREE.Mesh(
        new THREE.TorusBufferGeometry(0.3, 0.2, 64, 128),
        material
    );
    scene.add(plane, sphere, torus);
    plane.position.x = 1.5;
    sphere.position.x = -1.5;

    plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2));
    torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2));
    sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2));

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
        sphere.rotation.y = 0.1 * elapsedTime;
        torus.rotation.y = 0.1 * elapsedTime;
        plane.rotation.y = 0.1 * elapsedTime;

        sphere.rotation.x = 0.15 * elapsedTime;
        torus.rotation.x = 0.15 * elapsedTime;
        plane.rotation.x = 0.15 * elapsedTime;

        controls.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();
}

export default lessonTextures;