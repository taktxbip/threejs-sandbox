'use strict';
import * as THREE from 'three';
import gsap from 'gsap';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const gui = new dat.GUI();

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


function lessonGeometries() {

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

    // Axes helper
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);

    const geometry = new THREE.BufferGeometry();

    const count = 1000;
    const vertices = new Float32Array(count * 3 * 3);

    for (let i = 0; i < count * 3 * 3; i++) {
        vertices[i] = (Math.random() - 0.5) * 4;
    }

    const positionsAttribute = new THREE.BufferAttribute(vertices, 3);

    geometry.setAttribute('position', positionsAttribute);



    const material = new THREE.MeshBasicMaterial({ color: parameters.color, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);

    parameters.spin = () => {
        gsap.to(mesh.rotation, { y: 10, duration : 1, delay: 1 });
    };
    scene.add(mesh);


    gui.add(mesh.position, 'y', -3, 3, 0.01).name('Axis Y');
    gui.add(mesh.position, 'x', -3, 3, 0.01);
    gui.add(mesh.position, 'z', -3, 3, 0.01);
    gui.add(mesh, 'visible');
    gui.add(material, 'wireframe');
    gui.addColor(parameters, 'color').onChange(() => material.color.set(parameters.color));
    gui.add(parameters, 'spin');

    scene.add(camera);
    camera.position.z = 2;

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
        // const elapsedTime = clock.getElapsedTime();

        controls.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();
}

export default lessonGeometries;