import {
  UniversalCamera,
  Color3,
  Vector3,
  HemisphericLight,
  SceneLoader,
  CreateSphere,
  Texture,
  CreateDecal,
  StandardMaterial,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Rectangle } from "@babylonjs/gui";
import * as GUI from "@babylonjs/gui";
import "@babylonjs/inspector";
import "@babylonjs/loaders";

const GRAVITY = -9.81;
const FPS = 60;

export async function initScene(scene) {
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
  const camera = new UniversalCamera("camera", new Vector3(0, 8, 0), scene);

  setUpCamera(camera);
  const ui = setUpUI();
  await createEnviroment(scene);

  scene.clearColor = new Color3(0.75, 0.75, 0.9);
  scene.gravity = new Vector3(0, GRAVITY / FPS, 0);
  scene.collisionsEnabled = true;

  const sphere = CreateSphere("sphere", { diameter: 5 }, scene);
  sphere.checkCollisions = true;
  sphere.position = new Vector3(0, 2.5, 5);
  
  // Your code goes below ;)
  const splatters = createTexture(scene);

  createPickingRay(scene, camera, splatters);

  scene.onBeforeRenderObservable.add(() => {
    const cameraDirection = camera
      .getDirection(Vector3.Forward())
      .normalizeToNew();
    const sphereVec = sphere.position
      .subtract(camera.position)
      .normalizeToNew();

    const dot = Vector3.Dot(cameraDirection, sphereVec);

    ui[0].color = dot > 0.9 ? "green" : dot > 0.5 ? "yellow" : "red";
    ui[1].color = dot > 0.9 ? "green" : dot > 0.5 ? "yellow" : "red";
    ui[2].width = `${Math.floor((dot + 1) * 100)}px`;
  });
}

function createPickingRay(scene, camera, splatters) {
  scene.onPointerDown = () => {
    const ray = camera.getForwardRay();

    const raycastHit = scene.pickWithRay(ray);

    if (raycastHit.hit) {
      const decal = CreateDecal("decal", raycastHit.pickedMesh, {
        position: raycastHit.pickedPoint,
        normal: raycastHit.getNormal(true),
        size: new Vector3(1, 1, 1),
      });

      decal.material = splatters[Math.floor(Math.random() * splatters.length)];

      decal.setParent(raycastHit.pickedMesh);
    }
  };
}

function createTexture(scene) {
  const blue = new StandardMaterial("blue", scene);
  const orange = new StandardMaterial("orange", scene);
  const green = new StandardMaterial("green", scene);

  blue.diffuseTexture = new Texture("./textures/blue.png");
  orange.diffuseTexture = new Texture("./textures/orange.png");
  green.diffuseTexture = new Texture("./textures/green.png");

  blue.diffuseTexture.hasAlpha = true;
  orange.diffuseTexture.hasAlpha = true;
  green.diffuseTexture.hasAlpha = true;

  blue.zOffset = -1;
  orange.zOffset = -1;
  green.zOffset = -1;

  blue.roughness = 1;
  orange.roughness = 1;
  green.roughness = 1;

  return [blue, orange, green];
}

function setUpUI() {
  const tex = AdvancedDynamicTexture.CreateFullscreenUI("UI");

  const xRect = new Rectangle("xRect");
  xRect.width = "20px";
  xRect.height = "2px";
  xRect.color = "White";
  xRect.background = "White";
  tex.addControl(xRect);

  const yRect = new Rectangle("yRect");
  yRect.width = "2px";
  yRect.height = "20px";
  yRect.color = "White";
  yRect.background = "White";
  tex.addControl(yRect);

  const dotBar = new Rectangle("dotBar");
  dotBar.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  dotBar.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  dotBar.top = "-20px";
  dotBar.width = "200px";
  dotBar.height = "40px";
  dotBar.background = "grey";
  tex.addControl(dotBar);

  const dotBarInner = new Rectangle("dotBarInner");
  dotBarInner.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  dotBarInner.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  dotBarInner.width = "100px";
  dotBarInner.height = "40px";
  dotBarInner.background = "green";
  dotBar.addControl(dotBarInner);

  return [xRect, yRect, dotBarInner];
}

function setUpCamera(camera) {
  camera.attachControl();
  camera.position = new Vector3(0, 4, -15);
  camera.applyGravity = true;
  camera.checkCollisions = true;
  camera._needMoveForGravity = true;
  camera.ellipsoid = new Vector3(0.9, 1.8, 0.9);
  camera.minZ = 0.05;
  camera.speed = 0.45;
  camera.angularSensibility = 4000;
  camera.keysUp.push(87);
  camera.keysLeft.push(65);
  camera.keysDown.push(83);
  camera.keysRight.push(68);

  return camera;
}

async function createEnviroment(scene) {
  const { meshes } = await SceneLoader.ImportMeshAsync(
    "",
    "./models/",
    "Prototype_Level.glb",
    scene
  );

  meshes.forEach((mesh) => {
    if (mesh.name === "Ramp") {
      mesh.dispose();
    }
    mesh.checkCollisions = true;
  });
}
