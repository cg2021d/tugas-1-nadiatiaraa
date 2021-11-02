import "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js";
import { GUI } from "https://threejsfundamentals.org/threejs/../3rdparty/dat.gui.module.js";
import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { getRandomInt } from "./utils.js";

let scene, camera, renderer;
let controls;
let canvasDOM;
let geometries = [];

const LIGHT_COLOR = 'pink';

// Create Geometry Function
const createCube = (side, x, y, z) => {
  const loader = new THREE.TextureLoader();
  const geometry = new THREE.BoxGeometry(side, side, side);
  const texture = loader.load(
    "https://threejsfundamentals.org/threejs/resources/images/flower-1.jpg"
  );

  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, y, z);
  return cube;
};

const main = () => {
  canvasDOM = document.getElementById("myCanvas");
  // Event Listener Function On Windows Resize
  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  // 1. Create the scene
  scene = new THREE.Scene();
  const loader = new THREE.TextureLoader();
  const texture = loader.load(
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/2294472375_24a3b8ef46_o.jpg",
    () => {
      const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
      rt.fromEquirectangularTexture(renderer, texture);
      scene.background = rt.texture;
    }
  );

  // 2. Create an locate the camera
  camera = new THREE.PerspectiveCamera(
    80,window.innerWidth / window.innerHeight,0.1,1000
  );

  // Add the light
  const pLight = new THREE.HemisphereLight(LIGHT_COLOR, LIGHT_COLOR, 1);
  pLight.position.set(20, 20, 30);
  scene.add(pLight);

  // Add Fog
  const fogColor = 0x000000;
  const fogNear = 10;
  const fogFar = 100;
  scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);

  camera.position.set(20, 5, 5);

  //object plane
  const loader4 = new THREE.TextureLoader();
  const sand = loader4.load("https://threejsfundamentals.org/threejs/resources/images/wall.jpg");
  sand.wrapS = THREE.RepeatWrapping;
  sand.wrapT = THREE.RepeatWrapping;
  const repeats = 1;
  sand.repeat.set(repeats, repeats);

  let sandPlane = new THREE.TorusGeometry(15, 4, 9);
  let sandMaterial = new THREE.MeshLambertMaterial({
    map:sand
  });

  let plane = new THREE.Mesh(sandPlane,sandMaterial);
  plane.rotation.x = Math.PI / 2;
  plane.position.y = -8.5;
  plane.receiveShadow = true;
  scene.add(plane);

  // Realistic Reflective
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  });

  // 4. Create the renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvasDOM, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.listenToKeyEvents(window);
  controls.autoRotate = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;

  // Controls
  const gui = new GUI();
  gui.add(controls, "dampingFactor", 0, 0.1).name("controls.dampingFactor");

  //lights
  const ambientLight = new THREE.AmbientLight(0x000000);
  scene.add(ambientLight);

  let intensity = 60;
  const solarLight = new THREE.DirectionalLight();
  solarLight.position.set(500, 500, -500);
  solarLight.castShadow = true;
  solarLight.intensity = 2;
  solarLight.shadow.mapSize.width = 1024;
  solarLight.shadow.mapSize.height = 1024;
  solarLight.shadow.camera.near = 250;
  solarLight.shadow.camera.far = 1000;
  solarLight.shadow.camera.left = -intensity;
  solarLight.shadow.camera.right = intensity;
  solarLight.shadow.camera.top = intensity;
  solarLight.shadow.camera.bottom  = -intensity;
  scene.add(solarLight);

  // Set the Event Listener
  window.addEventListener("resize", onWindowResize);

  // directional light
  const directionalLightFolder = gui.addFolder('Directional Light');
  directionalLightFolder.add(solarLight, 'visible');
  directionalLightFolder.add(solarLight.position, 'x').min(-500).max(500).step(10);
  directionalLightFolder.add(solarLight.position, 'y').min(-500).max(500).step(10);
  directionalLightFolder.add(solarLight.position, 'z').min(-500).max(500).step(10);
  directionalLightFolder.add(solarLight, 'intensity').min(0).max(10).step(0.1);
};

document.addEventListener("DOMContentLoaded", () => {
  main();
  mainLoop();
});

const mainLoop = () => {
  renderer.render(scene, camera);
  controls.update();
  requestAnimationFrame(mainLoop);
};
