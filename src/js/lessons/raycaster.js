'use strict';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const scene = new THREE.Scene();

const axes = new THREE.AxesHelper();
scene.add(axes);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const canvas = document.querySelector('.webgl');

// Models 

const sphere = new THREE.SphereBufferGeometry(0.5, 16, 16);

const mesh1 = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({ color: '#ccc' }));
const mesh2 = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({ color: '#ccc' }));
const mesh3 = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({ color: '#ccc' }));
mesh1.position.x = -1.5;
mesh3.position.x = 1.5;
scene.add(mesh1, mesh2, mesh3);

const raycaster = new THREE.Raycaster();
// const rayOrigin = new THREE.Vector3(-3, 0, 0);
// const rayDirection = new THREE.Vector3(10, 0, 0);

// rayDirection.normalize();
// raycaster.set(rayOrigin, rayDirection);

// const intersect = raycaster.intersectObject(mesh1);
// const intersects = raycaster.intersectObjects([mesh1, mesh2, mesh3]);
// console.log(intersect);
// console.log(intersects);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

scene.add(ambientLight);

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 200);

function lRaycaster() {

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

    // Mouse 
    const mouse = new THREE.Vector2();
    window.addEventListener('click', () => {
        if (currentIntersect) {
            if (currentIntersect.object === mesh1) {
                console.log('click on mesh1');
            }
            else {
                console.log('click on a sphere');
            }
        }
    });
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX / sizes.width * 2 - 1;
        mouse.y = - event.clientY / sizes.height * 2 + 1;
    });

    // Clock
    let currentIntersect = false;
    const clock = new THREE.Clock();
    // Animations
    const tick = () => {

        // Clock
        const elapsedTime = clock.getElapsedTime();

        mesh1.position.y = Math.sin(elapsedTime * 1 + mesh1.position.x / 2) * 2;
        mesh2.position.y = Math.sin(elapsedTime * 1.5 + mesh2.position.x / 2) * 2;
        mesh3.position.y = Math.sin(elapsedTime * 0.8 + mesh3.position.x / 2 * 2);

        // Cast
        // const rayOrigin = new THREE.Vector3(-3, 0, 0);
        // const rayDirection = new THREE.Vector3(10, 0, 0);
        // rayDirection.normalize();

        // raycaster.set(rayOrigin, rayDirection);

        // const objectsToTest = [mesh1, mesh2, mesh3];
        // const intersects = raycaster.intersectObjects(objectsToTest);
        // // console.log(intersects.length);

        // for (const object of objectsToTest) {
        //     object.material.color.set('#ccc');
        // }

        // for (const intersect of intersects) {
        //     intersect.object.material.color.set('#990000');
        // }

        // Mouse intersection
        raycaster.setFromCamera(mouse, camera);
        const objectsToTest = [mesh1, mesh2, mesh3];
        const intersects = raycaster.intersectObjects(objectsToTest);

        for (const object of objectsToTest) {
            object.material.color.set('#ccc');
        }

        for (const intersect of intersects) {
            intersect.object.material.color.set('#990000');
        }
        if (intersects.length) {
            if (currentIntersect === null) {
                console.log('mouse enter' );
            }   
            currentIntersect = intersects[0];
        }
        else {
            if (currentIntersect) {
                console.log('mouse leave' );
            }   
            currentIntersect = null;
        }

        controls.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();
}

export default lRaycaster;