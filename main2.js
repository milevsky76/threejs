import './style.css';
import * as THREE from 'three';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

const MODAL_GLTF = '/EgorovAgencyCube.gltf';
const fontLoader = new FontLoader();
const gltfLoader = new GLTFLoader();
const gui = new GUI();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Добавить сглаживание углов
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let model = null;
let font = null;
let letters = [];
let isAnimating = false;
let isDragging = false;
let isClipping = false;
let previousMousePosition = { x: 0, y: 0 };
let localPlane = [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)];



setupRenderer();
setupCamera();
setupLight();
setupListeners();

gltfLoader.load(
  MODAL_GLTF,
  function (gltf) {
    model = gltf.scene;
    model.position.set(0, 0, 0);

    model.traverse(function (child) {
      if (child.isMesh) {
        child.material.clippingPlanes = localPlane;
        child.material.clipIntersection = true;
      }
    });

    scene.add(model);

    // Вывести в консоль все анимации, которая содержит модель.
    gltf.animations.forEach((animation) => {
      console.log(animation);
    });
  }
);

console.log(model);

loadFont();
setupGUI();
createPrimitive();
render();


// Renderer
// Сделать Canvas элемент на весь экран и добавить возможность изменения размера окна (адаптив). (Resize Event)
function setupRenderer() {
  renderer.setClearColor(0xececec);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

// Camera
function setupCamera() {
  camera.position.set(2, 1, 5);
}

// Light
function setupLight() {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 5, 0);
  scene.add(directionalLight);
}

function loadModel() {}

function loadFont() {
  fontLoader.load('https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_regular.typeface.json', (response) => {
    font = response;

    createText('I', -2, 3, 0);
    createText('L', -1, 3, 0);
    createText('Y', 0, 3, 0);
    createText('A', 1, 3, 0);
  });
}

function createText(text, x, y, z) {
  let textGeometry = new TextGeometry(text, {
    font: font,
    size: 1,
    depth: 0.1,
    curveSegments: 12,
    bevelEnabled: false
  });

  let textMaterial = new THREE.MeshBasicMaterial({
    color: 0x0f0f0f
  });

  let textMesh = new THREE.Mesh(textGeometry, textMaterial);

  textMesh.position.set(x, y, z);

  scene.add(textMesh);

  textMesh.cursor = 'pointer';

  letters.push(textMesh);
}

function setupGUI() {
  let actionModel = {
    playModelRotation: playModelRotation,
    stopModelRotation: stopModelRotation,
    clippingPlanes: clippingPlanes
  };

  const modelFolder = gui.addFolder('Model');
  modelFolder.add(model.position, 'x').name('position X');
  modelFolder.add(model.position, 'y').name('position Y');
  modelFolder.add(model.position, 'z').name('position Z');
  // Добавить к модели анимацию вращения модели по оси Y и кнопку, которая остановит это вращение
  modelFolder.add(actionModel, 'playModelRotation').name('Play rotation');
  modelFolder.add(actionModel, 'stopModelRotation').name('Stop rotation');
  modelFolder.add(actionModel, 'clippingPlanes').name('Clipping');

  document.body.appendChild(gui.domElement);
}

// Добавить на сцену 3 любых примитива и применить к ним материалы(разные цвета)
function createPrimitive() {
  const geometry1 = new THREE.BoxGeometry();
  const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const box1 = new THREE.Mesh(geometry1, material1);
  box1.position.set(5, 0, 0);
  scene.add(box1);

  const geometry2 = new THREE.SphereGeometry(1, 32, 32);
  const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const sphere1 = new THREE.Mesh(geometry2, material2);
  sphere1.position.set(7, 0, -1);
  scene.add(sphere1);

  const geometry3 = new THREE.CylinderGeometry(1, 1, 2, 32);
  const material3 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const cylinder1 = new THREE.Mesh(geometry3, material3);
  cylinder1.position.set(9, 0, 0);
  scene.add(cylinder1);
}

function render() {
  requestAnimationFrame(render);

  // Добавить к модели анимацию вращения модели по оси Y и кнопку, которая остановит это вращение
  if (isAnimating && model) {
    model.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}

function playModelRotation() {
  isAnimating = true;
}

function stopModelRotation() {
  isAnimating = false;
}

function clippingPlanes() {
  isClipping = !isClipping;

  model.traverse((child) => {
    if (child.isMesh) {
      if (isClipping) {
        child.material.clippingPlanes = [localPlane];
        child.material.clipShadows = true;
      } else {
        child.material.clippingPlanes = [];
        child.material.clipShadows = false;
      }
    }
  });
}


// События
function setupListeners() {
  // Сделать Canvas элемент на весь экран и добавить возможность изменения размера окна (адаптив). (Resize Event)
  window.addEventListener('resize', onWindowResize);


  window.addEventListener('click', onMouseClick);

  // Добавить возможность вращения модели мышкой(+ touch)
  renderer.domElement.addEventListener('mousedown', onMouseDown);
  renderer.domElement.addEventListener('mouseup', onMouseUp);
  renderer.domElement.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('mouseleave', onMouseUp);
  renderer.domElement.addEventListener('touchstart', onTouchStart);
  renderer.domElement.addEventListener('touchend', onTouchEnd);
  renderer.domElement.addEventListener('touchmove', onTouchMove);
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function onMouseClick(event) {
  event.preventDefault();

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(letters);

  if (intersects.length > 0) {
    let object = intersects[0].object;

    if (object && object.type === 'Mesh') {
      object.material.color.set(getRandomColor());
    }
  }
}

function getRandomColor() {
  return Math.random() * 0xffffff;
}

// Добавить возможность вращения модели мышкой(+ touch)
function onMouseDown(event) {
  isDragging = true;

  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  };
}

function onMouseUp(event) {
  isDragging = false;
}

function onMouseMove(event) {
  if (isDragging) {
    let deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y
    };

    let deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        toRadians(deltaMove.y * 1),
        toRadians(deltaMove.x * 1),
        0,
        'XYZ'
      )
    );

    model.quaternion.multiplyQuaternions(deltaRotationQuaternion, model.quaternion);

    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  }
}

function onTouchStart(event) {
  if (event.touches.length === 1) {
    event.preventDefault();

    previousMousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }
}

function onTouchEnd(event) {
  if (event.touches.length === 0) {
    event.preventDefault();

    isDragging = false;
  }
}

function onTouchMove(event) {
  if (event.touches.length === 1) {
    event.preventDefault();

    let deltaMove = {
      x: event.touches[0].clientX - previousMousePosition.x,
      y: event.touches[0].clientY - previousMousePosition.y
    };

    let deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        toRadians(deltaMove.y * 1),
        toRadians(deltaMove.x * 1),
        0,
        'XYZ'
      )
    );

    model.quaternion.multiplyQuaternions(deltaRotationQuaternion, model.quaternion);

    previousMousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }
}

function toRadians(angle) {
  return angle * (Math.PI / 180);
}