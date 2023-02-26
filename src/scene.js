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
}

function setUpCamera(camera) {
  camera.attachControl();
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
