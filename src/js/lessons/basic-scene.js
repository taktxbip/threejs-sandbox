'use strict';
import * as T from 'three';
import gsap from 'gsap';

console.log(gsap);

const sizes = {
    width: 800,
    height: 600
};

const canvas = document.querySelector('.webgl');

function basicScene() {
    const scene = new T.Scene();

    // Axes helper
    const axesHelper = new T.AxesHelper(3);
    scene.add(axesHelper);

    const group = new T.Group();
    scene.add(group);

    const cube1 = new T.Mesh(
        new T.BoxGeometry(1, 1, 1),
        new T.MeshBasicMaterial({ color: 'red' })
    );
    const cube2 = new T.Mesh(
        new T.BoxGeometry(1, 1, 1),
        new T.MeshBasicMaterial({ color: 'blue' })
    );
    cube2.position.set(2, 0, 0);
    const cube3 = new T.Mesh(
        new T.BoxGeometry(1, 1, 1),
        new T.MeshBasicMaterial({ color: 'navy' })
    );
    cube3.position.set(1, 1, 0);
    group.add(cube1, cube2, cube3);


    //Rotation
    const camera = new T.PerspectiveCamera(75, sizes.width / sizes.height);
    scene.add(camera);
    camera.position.set(1.7, 1.2, 4);

    const renderer = new T.WebGLRenderer({
        canvas: canvas
    });
    renderer.setSize(sizes.width, sizes.height);


    // Time
    // let time = Date.now();

    // Clock
    const clock = new T.Clock();
    camera.lookAt(group.position);
    gsap.to(group.position, { duration: 2, delay: 2, z: 2 });
    // Animations
    const tick = () => {
        // Time
        // const currentTime = Date.now();
        // const deltaTime = currentTime - time;
        // time = currentTime;
        // console.log(deltaTime);  

        // Clock
        const elapsedTime = clock.getElapsedTime();

        // Update objects
        // 1 round per second
        // group.rotation.y = elapsedTime * Math.PI * 2;
        // group.position.x = Math.sin(elapsedTime) * 3;

        camera.position.x = Math.cos(elapsedTime);
        camera.position.y = Math.sin(elapsedTime);
        camera.lookAt(group.position);
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();
}

export default basicScene;