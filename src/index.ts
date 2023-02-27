import {
  Scene,
  Engine,
  ActionManager,
  ExecuteCodeAction,
} from "@babylonjs/core";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

let sceneMod, initScene: Function;
if (process.env.RESULT) {
  sceneMod = await import("./scene_r");
  initScene = sceneMod.initScene;
} else {
  sceneMod = await import("./scene");
  initScene = sceneMod.initScene;
}

window.addEventListener("resize", function () {
  engine.resize();
});

(async () => {
  const scene = new Scene(engine);

  // pointer lock
  scene.actionManager = new ActionManager(scene);
  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyDownTrigger,
        parameter: function (actionEvent) {
          return actionEvent.sourceEvent.code === "KeyL";
        },
      },
      function () {
        engine.enterPointerlock();
      }
    )
  );

  await initScene(scene);

  engine.enterPointerlock();

  engine.runRenderLoop(() => {
    scene.render();
  });
})();