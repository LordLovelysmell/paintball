import { Scene, Engine, AmmoJSPlugin } from "@babylonjs/core";
import { ammoModule, ammoReadyPromise } from "./ammo";
import { initScene } from "./scene";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

window.addEventListener("resize", function () {
  engine.resize();
});

(async () => {
  const scene = new Scene(engine);

  await Promise.all([ammoReadyPromise]);
  scene.enablePhysics(null, new AmmoJSPlugin(true, ammoModule));

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
