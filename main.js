import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.getElementById('model-container');
const statusText = document.getElementById('status');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071426);

const camera = new THREE.PerspectiveCamera(
  42,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);
camera.position.set(4.2, 3.0, 6.2);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: 'low-power'
});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xb8e8ff, 0x071426, 2.0));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(4, 5, 5);
scene.add(keyLight);

const blueLight = new THREE.PointLight(0x00bfff, 18, 12);
blueLight.position.set(-3, 1, 2);
scene.add(blueLight);

const loader = new GLTFLoader();
let mixer = null;

loader.load(
  './loop.glb',
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Centre and size the model so it fits different screens.
    const bounds = new THREE.Box3().setFromObject(model);
    const centre = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    model.position.sub(centre);

    const maxDimension = Math.max(size.x, size.y, size.z);
    if (maxDimension > 0) {
      model.scale.setScalar(3.2 / maxDimension);
    }

    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(gltf.animations[0]);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
      statusText.textContent = 'Spark Core animation ready';
      console.log('GLB animation duration:', gltf.animations[0].duration, 'seconds');
    } else {
      statusText.textContent = 'Model loaded, but no animation was found.';
    }
  },
  (progress) => {
    if (progress.total > 0) {
      const percent = Math.round((progress.loaded / progress.total) * 100);
      statusText.textContent = `Loading Spark Core: ${percent}%`;
    }
  },
  (error) => {
    console.error('Could not load loop.glb:', error);
    statusText.textContent = 'Could not load the model. Check that loop.glb is beside index.html.';
  }
);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  if (mixer) mixer.update(delta);
  renderer.render(scene, camera);
}
animate();

function resizeScene() {
  const width = Math.max(container.clientWidth, 1);
  const height = Math.max(container.clientHeight, 1);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
window.addEventListener('resize', resizeScene);
