'use strict';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader';
import { TextureLoader } from 'three';
// import { GeometryUtils, LinearFilter } from 'three';

const scene = new THREE.Scene();

// EffectComposer();
const gui = new dat.GUI();
// gui.hide();
const debugObject = {
    envMapIntensity: 5
};

const axes = new THREE.AxesHelper();
scene.add(axes);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const canvas = document.querySelector('.webgl');
const textureLoader = new TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

// Update all materials
const updateAllMaterials = () => {
    scene.traverseVisible(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            // child.material.envMap = environmentMapTexture;
            child.material.envMapIntensity = debugObject.envMapIntensity;
            child.material.needsUpdate = true;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
};

// Textures
const map = 0;
const environmentMapTexture = cubeTextureLoader.load([
    `/src/images/environmentMaps/${map}/px.jpg`,
    `/src/images/environmentMaps/${map}/nx.jpg`,
    `/src/images/environmentMaps/${map}/py.jpg`,
    `/src/images/environmentMaps/${map}/ny.jpg`,
    `/src/images/environmentMaps/${map}/pz.jpg`,
    `/src/images/environmentMaps/${map}/nz.jpg`
]);
environmentMapTexture.encoding = THREE.sRGBEncoding;

scene.background = environmentMapTexture;
scene.environment = environmentMapTexture;
gui.add(debugObject, 'envMapIntensity', 0, 10, 0.001).onChange(updateAllMaterials);

// Lights 
const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 10;
directionalLight.position.set(0.25, 3, -2.25);
directionalLight.shadow.normalBias = 0.02;
scene.add(directionalLight);

// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(directionalLightCameraHelper);

// Models 
const helmet = new THREE.Group();
const gltfLoader = new GLTFLoader();
gltfLoader.load(
    // '/src/models/FlightHelmet/glTF/FlightHelmet.gltf',
    '/src/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.set(1, 1, 1);
        gltf.scene.position.set(0, 0, 0);
        gltf.scene.rotation.y = - 0.3;
        helmet.add(gltf.scene);
        scene.add(helmet);

        gui.add(gltf.scene.rotation, 'y', -Math.PI, Math.PI, 0.01).name('Rotation');

        updateAllMaterials();
    }
);

gui.add(directionalLight, 'intensity', 0, 10, 0.001).name('LightIntensity');
gui.add(directionalLight.position, 'x', -5, 5, 0.001).name('LightX');
gui.add(directionalLight.position, 'y', 0, 5, 0.001).name('LightY');
gui.add(directionalLight.position, 'z', -5, 5, 0.001).name('LightZ');

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 200);

function lPostprocessing() {

    window.addEventListener('resize', () => {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;

        // Update camera
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();

        // Update renderer
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        effectComposer.setSize(sizes.width, sizes.height);
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
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // renderer.toneMapping = THREE.CineonToneMapping;
    renderer.toneMappingExposure = 3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    let RenderTargetClass = null;

    if (renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2) {
        RenderTargetClass = THREE.WebGLMultisampleRenderTarget;
    }
    else {
        RenderTargetClass = THREE.WebGLRenderTarget;
    }
    const renderTarget = new RenderTargetClass(
        800, 600, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding
    }
    );

    // Composer
    const effectComposer = new EffectComposer(renderer, renderTarget);
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    effectComposer.setSize(sizes.width, sizes.height);

    const renderPass = new RenderPass(scene, camera);
    effectComposer.addPass(renderPass);

    const dotScreenPass = new DotScreenPass();
    dotScreenPass.enabled = false;
    effectComposer.addPass(dotScreenPass);

    const glitchPass = new GlitchPass();
    glitchPass.enabled = false;
    effectComposer.addPass(glitchPass);

    const rgbShiftPass = new ShaderPass(RGBShiftShader);
    rgbShiftPass.enabled = false;
    effectComposer.addPass(rgbShiftPass);

    const unrealBloomPass = new UnrealBloomPass();
    unrealBloomPass.enabled = true;
    unrealBloomPass.radius = 1;
    unrealBloomPass.strength = 0.3;
    unrealBloomPass.threshold = 0.6;
    effectComposer.addPass(unrealBloomPass);

    gui.add(unrealBloomPass, 'enabled');
    gui.add(unrealBloomPass, 'strength', 0, 2, 0.001);
    gui.add(unrealBloomPass, 'radius', 0, 2, 0.001);
    gui.add(unrealBloomPass, 'threshold', 0, 1, 0.001);


    // Tint pass
    const TintShader = {
        uniforms: {
            tDiffuse: { value: null },
            uTint: { value: null }
        },
        vertexShader: `
        varying vec2 vUv;
        void main()
        {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUv = uv;
        }
        `,
        fragmentShader: `
        uniform sampler2D tDiffuse;

        uniform vec3 uTint;
        varying vec2 vUv;

        void main()
        {
            vec4 color = texture2D(tDiffuse, vUv);
            color.rgb += uTint;

            gl_FragColor = color;
        }
        `
    };
    const tintPass = new ShaderPass(TintShader);
    tintPass.enabled = false;
    tintPass.material.uniforms.uTint.value = new THREE.Vector3(0.2, 0, 0);
    effectComposer.addPass(tintPass);


    // Displacement pass
    const DisplacementShader = {
        uniforms: {
            tDiffuse: { value: null },
            uNormalMap: { value: null }
        },
        vertexShader: `
            varying vec2 vUv;
            void main()
            {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                vUv = uv;
            }
            `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform sampler2D uNormalMap;
    
            varying vec2 vUv;
    
            void main()
            {
                vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;

                vec2 newUv = vUv + normalColor.xy * 0.1;
                vec4 color = texture2D(tDiffuse, newUv);
    
                vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
                float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
                color.rgb += lightness * 2.0;

                gl_FragColor = color;
            }
            `
    };
    const displacementPass = new ShaderPass(DisplacementShader);
    displacementPass.material.uniforms.uNormalMap.value = textureLoader.load('/src/images/interfaceNormalMap.png');
    // displacementPass.material.uniforms.uTime.value = 0;
    effectComposer.addPass(displacementPass);


    gui.add(tintPass.material.uniforms.uTint.value, 'x', -1, 1, 0.001).name('RedTint');
    gui.add(tintPass.material.uniforms.uTint.value, 'y', -1, 1, 0.001).name('GreenTint');
    gui.add(tintPass.material.uniforms.uTint.value, 'z', -1, 1, 0.001).name('BlueTint');

    if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
        const smaaPass = new SMAAPass();
        effectComposer.addPass(smaaPass);
    }

    gui.add(renderer, 'toneMapping', {
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhart: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        AcesFilmic: THREE.ACESFilmicToneMapping
    }).onFinishChange(() => {
        renderer.toneMapping = Number(renderer.toneMapping);
        updateAllMaterials();
    });

    gui.add(renderer, 'toneMappingExposure', 0, 10, 0.001);
    // Clock
    const clock = new THREE.Clock();
    // Animations
    const tick = () => {

        // Clock
        const elapsedTime = clock.getElapsedTime();

        // Update passes
        // displacementPass.material.uniforms.uTime.value = elapsedTime;

        helmet.rotation.y = elapsedTime * 0.4;
        controls.update();
        effectComposer.render();
        // renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();
}

export default lPostprocessing;