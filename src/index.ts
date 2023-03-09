import { Scene, Engine, Vector3 } from "@babylonjs/core";
import AmmoModule from "ammojs-typed";
import { initScene } from "./scene";

try {
  const ammo = await AmmoModule();
  console.log(ammo);
} catch (err) {
  console.warn(err);
}

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
