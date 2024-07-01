import './style.css';
import * as THREE from 'three';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

const fontLoader = new FontLoader();
let font;
let letters = [];
let model;
let isAnimating = false;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Инициализация сцены
const scene = new THREE.Scene();
// Инициализация камеры
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Позиционирование камеры
camera.position.z = 5;
camera.position.x = 2;
camera.position.y = 1;


// Инициализация рендерера
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Добавить сглаживание углов
renderer.setClearColor(0xececec);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.localClippingEnabled = true;
document.body.appendChild(renderer.domElement);


// Создание направленного света
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 5, 0);
scene.add(directionalLight);


// Добавить на сцену 3 любых примитива и применить к ним материалы(разные цвета)
const geometry1 = new THREE.BoxGeometry();
const material1 = new THREE.MeshBasicMaterial({
  color: 0xff0000
});
const box1 = new THREE.Mesh(geometry1, material1);
box1.position.set(5, 0, 0);
scene.add(box1);

const geometry2 = new THREE.SphereGeometry(1, 32, 32);
const material2 = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
const sphere1 = new THREE.Mesh(geometry2, material2);
sphere1.position.set(7, 0, -1);
scene.add(sphere1);

const geometry3 = new THREE.CylinderGeometry(1, 1, 2, 32);
const material3 = new THREE.MeshBasicMaterial({
  color: 0x0000ff
});
const cylinder1 = new THREE.Mesh(geometry3, material3);
cylinder1.position.set(9, 0, 0);
scene.add(cylinder1);


// Загрузка модели
const gltfLoader = new GLTFLoader();
const localPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.5);

gltfLoader.load(
  '/EgorovAgencyCube.gltf',
  function (gltf) {
    model = gltf.scene;

    model.traverse(function (child) {
      if (child.isMesh) {
        // Разрезать модель пополам, чтобы при просмотре со всех сторон было видно только обрезанную модель
        child.material.clippingPlanes = [localPlane];
        child.material.clipShadows = true;
      }
    });

    scene.add(model);

    // Вывести в консоль все анимации, которая содержит модель
    gltf.animations.forEach((animation) => {
      console.log(animation);
    });

    setupGUI();
  }
);

// Добавить 3D текст своего ника на сцену
fontLoader.load('https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_regular.typeface.json',
  function (response) {
    font = response;

    createText('I', -2, 3, 0);
    createText('L', -1, 3, 0);
    createText('Y', 0, 3, 0);
    createText('A', 1, 3, 0);
  });

// Функция для создания текста
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

  letters.push(textMesh);
}

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// Функция для получения случайного цвета
function getRandomColor() {
  return Math.random() * 0xffffff;
}


// Рендеринг сцены
function animate() {
  requestAnimationFrame(animate);

  // Добавить к модели анимацию вращения модели по оси Y и кнопку, которая остановит это вращение
  if (isAnimating && model) {
    model.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}
animate();


// Добавить debug panel LilGui для управления параметрами сцены для удобного показа своей сцены
function setupGUI() {
  const gui = new GUI();

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

function playModelRotation() {
  isAnimating = true;
}

function stopModelRotation() {
  isAnimating = false;
}


let isClipping = true;
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


let canvas = renderer.domElement;
// Сделать Canvas элемент на весь экран и добавить возможность изменения размера окна (адаптив). (Resize Event)
window.addEventListener('resize', onWindowResize);
canvas.addEventListener('click', onMouseClick, false);
// Добавить возможность вращения модели мышкой(+ touch)
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', onMouseUp);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseleave', onMouseUp);
canvas.addEventListener('touchstart', onTouchStart);
canvas.addEventListener('touchend', onTouchEnd);
canvas.addEventListener('touchmove', onTouchMove);


function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

// По клику на каждую букву изменять её цвет на рандомный
function onMouseClick(event) {
  event.preventDefault();

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Фильтруем пересечения только по буквам
  let intersects = raycaster.intersectObjects(letters);
  
  if (intersects.length > 0) {
    let object = intersects[0].object;

    if (object && object.type === 'Mesh') {
      let newColor = getRandomColor();

      object.material.color.set(newColor);
    }
  }
}

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

    let deltaRotationQuaternion = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(
        toRadians(deltaMove.y * 1),
        toRadians(deltaMove.x * 1),
        0,
        'XYZ'
      ));

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

    let deltaRotationQuaternion = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(
        toRadians(deltaMove.y * 1),
        toRadians(deltaMove.x * 1),
        0,
        'XYZ'
      ));

    model.quaternion.multiplyQuaternions(deltaRotationQuaternion, model.quaternion);

    previousMousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }
}

// Вспомогательная функция для конвертации градусов в радианы
function toRadians(angle) {
  return angle * (Math.PI / 180);
}