import { visibleHeightAtZDepth, visibleWidthAtZDepth, lerp } from "../utils.js";
import { nextSlide, beforeSlide } from "../main.js";

const raycaster = new THREE.Raycaster();
const objLoader = new THREE.OBJLoader();
let arrowBox = null;
let arrowBoxes = [];
let arrowBoxRotation = [0, 0];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 30,
  window.innerWidth / window.innerHeight);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

document.body.append(renderer.domElement);

objLoader.load("models/cube.obj", ({ children }) => {
  const screenBorderRight = visibleWidthAtZDepth(-10, camera) / 2;
  const screenBottom = -visibleHeightAtZDepth(-10, camera) / 2;

  addCube(children[0], nextSlide, screenBorderRight - 1.5, screenBottom + 1, [90, 0, 0]);
  addCube(children[0], beforeSlide, screenBorderRight - 2.5, screenBottom + 1, [90, 180, 0]);

  animate();
});

const addCube = (object, callbackFn, x, y, rotation) => {
  const cubeMesh = object.clone();
  const [rX, rY, rZ] = rotation;
  cubeMesh.scale.setScalar(0.3);
  // cubeMesh.rotation.set(THREE.Math.degToRad(90), 0, 0)
  cubeMesh.rotation.set(
    THREE.Math.degToRad(rX),
    THREE.Math.degToRad(rY),
    THREE.Math.degToRad(rZ)
  );

  const boundingBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.7, 0.7),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
  );

  boundingBox.position.x = x;
  boundingBox.position.y = y;
  boundingBox.position.z = -10;

  boundingBox.add(cubeMesh);

  boundingBox.callbackFn = callbackFn;

  arrowBox = boundingBox;
  arrowBoxes.push(boundingBox);
  scene.add(boundingBox);
};

const animate = () => {
  arrowBoxes.forEach((arrowBox, i) => {
    arrowBoxRotation[i] = lerp(arrowBoxRotation[i], 0, 0.07);
    arrowBox.rotation.set(THREE.Math.degToRad(arrowBoxRotation[i]), 0, 0);
  });
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

export const handleThreeAnimation = (i) => {
  if (i == 0) {
    arrowBoxRotation[i] = 360;
  } else {
    arrowBoxRotation[i] = -360;
  }
};

window.addEventListener("click", () => {
  const mousePosition = new THREE.Vector2();
  mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mousePosition, camera);

  // const interesctedObjects = raycaster.intersectObjects([arrowBox])
  const interesctedObjects = raycaster.intersectObjects(arrowBoxes);
  interesctedObjects.length && interesctedObjects[0].object.callbackFn();
});
