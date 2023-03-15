import { Scene, Engine } from "@babylonjs/core";
import * as cannon from "cannon";
import { initScene } from "./scene";

window.CANNON = cannon;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

window.addEventListener("resize", function () {
  engine.resize();
});

(async () => {
  const scene = new Scene(engine);

  // pointer lock
  canvas.addEventListener("click", () => {
    if (!engine.isPointerLock) {
      engine.enterPointerlock();
    }
  });

  await initScene(scene);

  engine.runRenderLoop(() => {
    scene.render();
  });
})();
