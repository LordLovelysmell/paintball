import {
  UniversalCamera,
  Color4,
  Vector3,
  HemisphericLight,
  SceneLoader,
  CreateSphere,
  Texture,
  StandardMaterial,
  Mesh,
  CreateBox,
  ArcRotateCamera,
  Scene,
  CannonJSPlugin,
  Axis,
  Ray,
  RayHelper,
  Color3,
  AbstractMesh,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Rectangle } from "@babylonjs/gui";
import * as GUI from "@babylonjs/gui";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import PlayerController from "./controllers/PlayerController";
import { PhysicsImpostor } from "@babylonjs/core/Physics/v1/physicsImpostor";

interface Crosshair {
  xRect: Rectangle;
  yRect: Rectangle;
}

export async function initScene(scene: Scene) {
  scene.getEngine().displayLoadingUI();

  scene.enablePhysics(new Vector3(0, -20, 0), new CannonJSPlugin());

  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
  const camera = new UniversalCamera("camera", new Vector3(0, 0, 0), scene);
  camera.attachControl();
  camera.minZ = 0.05;

  const debugCamera = new ArcRotateCamera(
    "camera",
    Math.PI,
    Math.PI / 4,
    20,
    Vector3.Zero()
  );

  const ui = setUpUI();
  await createEnviroment(scene);

  const splatters = createTexture();
  const playerMesh = CreateBox("player-mesh");
  const player = new PlayerController(camera, playerMesh, splatters, scene);
  await player.loadWeapon(
    "./models/",
    "paintball_gun.glb",
    new Vector3(0.3, -0.45, 0.5)
  );

  scene.clearColor = new Color4(0.75, 0.75, 0.9, 1.0);

  const sphere1 = CreateSphere("sphere1", { diameter: 0.5 });
  sphere1.position = new Vector3(0, 1, 4.75);

  const sphere2 = CreateSphere("sphere2", { diameter: 0.5 });
  sphere2.position = new Vector3(0, 3, 14.55);

  const redMaterial = new StandardMaterial("red-material");
  redMaterial.diffuseColor = new Color3(1, 0, 0);

  sphere1.isPickable = false;

  const ray = new Ray(
    sphere1.getAbsolutePosition(),
    sphere2.position.subtract(sphere1.position).normalize(),
    10
  );

  let trapIsReady = true;

  scene.onBeforeRenderObservable.add(() => {
    const pickingInfo = scene.pickWithRay(ray);

    if (pickingInfo && pickingInfo.pickedMesh.id !== "sphere2" && trapIsReady) {
      trapIsReady = false;
      sphere1.material = sphere2.material = redMaterial;

      const timer = setTimeout(() => {
        trapIsReady = true;
        sphere1.material = sphere2.material = null;
        clearTimeout(timer);
      }, 1500);

      if (pickingInfo.pickedMesh.id === "player-wrapper") {
        player.subtractHealth(5);
      }
    }
  });

  window.addEventListener("keydown", (event) => {
    //Ctrl+I
    if (event.ctrlKey && event.keyCode === 73) {
      if (scene.debugLayer.isVisible()) {
        scene.debugLayer.hide();
      } else {
        scene.debugLayer.show();
      }
    }
  });

  scene.getEngine().hideLoadingUI();
}

function createTexture() {
  const blue = new StandardMaterial("blue");
  const orange = new StandardMaterial("orange");
  const green = new StandardMaterial("green");

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

function findDotProductBetween(camera: UniversalCamera, mesh: Mesh) {
  const cameraDirection = camera
    .getDirection(Vector3.Forward())
    .normalizeToNew();
  const sphereVec = mesh.position.subtract(camera.position).normalizeToNew();

  return Vector3.Dot(cameraDirection, sphereVec);
}

function changeColorForCrosshair(crosshair: Crosshair, dot: number) {
  let color = "white";

  if (dot > 0.9) {
    color = "green";
  } else if (dot > 0.5) {
    color = "yellow";
  } else {
    color = "red";
  }

  crosshair.xRect.color = crosshair.yRect.color = color;
}

function setUpUI() {
  const tex = AdvancedDynamicTexture.CreateFullscreenUI("UI");

  const crosshairColor = "white";

  const xRect = new Rectangle("xRect");
  xRect.width = "20px";
  xRect.height = "2px";
  xRect.color = crosshairColor;
  tex.addControl(xRect);

  const yRect = new Rectangle("yRect");
  yRect.width = "2px";
  yRect.height = "20px";
  yRect.color = crosshairColor;
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

  return {
    crosshair: {
      xRect,
      yRect,
    },
    vectorComparator: {
      dotBarInner,
    },
  };
}

async function createEnviroment(scene: Scene) {
  const { meshes } = await SceneLoader.ImportMeshAsync(
    "",
    "./models/",
    "paintball-level-final.glb",
    scene
  );

  const fracturedCube = await SceneLoader.ImportMeshAsync(
    "",
    "./models/",
    "fractured-cube.glb",
    scene
  );

  const floor = scene.getMeshByName("Floor");

  const destructableBox = CreateBox("destructable-box", { size: 2 });
  destructableBox.material = meshes[5].material;

  destructableBox.position = new Vector3(0, 3, -15);

  destructableBox.physicsImpostor = new PhysicsImpostor(
    destructableBox,
    PhysicsImpostor.BoxImpostor,
    {
      mass: 30,
    }
  );

  let counter = 0;
  destructableBox.physicsImpostor.onCollideEvent = (collider, collidedWith) => {
    if ((collidedWith.object as Mesh).id === "ball") {
      counter++;
    }

    if (counter >= 3) {
      fracturedCube.meshes[0].position.copyFrom(destructableBox.position);

      fracturedCube.meshes.forEach((mesh) => {
        mesh.setParent(null);
        mesh.physicsImpostor = new PhysicsImpostor(
          mesh,
          PhysicsImpostor.BoxImpostor,
          {
            mass: 0.5,
          }
        );
        mesh.material = meshes[5].material;

        mesh.physicsImpostor.registerOnPhysicsCollide(
          floor.physicsImpostor,
          () => {
            setTimeout(() => {
              mesh.physicsImpostor.dispose();
            }, 5000);
          }
        );

        // const physicsViewer = new PhysicsViewer();
        // physicsViewer.showImpostor(mesh.physicsImpostor);
      });

      destructableBox.dispose();
    }
  };

  meshes.forEach((mesh) => {
    if (
      mesh.name === "Floor" ||
      mesh.name.includes("Walls") ||
      mesh.name.includes("Element")
    ) {
      mesh.setParent(null);
      mesh.physicsImpostor = new PhysicsImpostor(
        mesh,
        PhysicsImpostor.BoxImpostor,
        {
          mass: 0,
        }
      );
    }

    if (mesh.name.includes("Box")) {
      mesh.setParent(null);
      mesh.physicsImpostor = new PhysicsImpostor(
        mesh,
        PhysicsImpostor.BoxImpostor,
        {
          mass: 10,
        }
      );

      mesh.position.y += 0.5;

      mesh.metadata = {
        counter: 0,
      };

      mesh.physicsImpostor.onCollideEvent = async (collider, collidedWith) => {
        if ((collidedWith.object as Mesh).id === "ball") {
          mesh.metadata.counter++;
        }

        if (mesh.metadata.counter >= 3) {
          const localCube = await SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "fractured-cube.glb",
            scene
          );
          localCube.meshes[0].position.copyFrom(mesh.position);

          localCube.meshes.forEach((_mesh) => {
            _mesh.setParent(null);
            _mesh.physicsImpostor = new PhysicsImpostor(
              _mesh,
              PhysicsImpostor.BoxImpostor,
              {
                mass: 0.5,
              }
            );
            _mesh.material = mesh.material;

            _mesh.physicsImpostor.registerOnPhysicsCollide(
              floor.physicsImpostor,
              () => {
                setTimeout(() => {
                  _mesh.physicsImpostor.dispose();
                }, 5000);
              }
            );
          });

          mesh.dispose();
        }
      };
    }

    if (mesh.name === "Ramp") {
      const rampBox1 = CreateBox("ramp-box1", {
        width: 6.71,
        height: 4.14,
        depth: 4,
      });
      rampBox1.position = new Vector3(1.35, 2.17, 2.69);
      const rampBox2 = CreateBox("ramp-box2", {
        width: 6.71,
        height: 4.14,
        depth: 8,
      });
      rampBox2.position = new Vector3(1.35, 0.33, -1.55);
      rampBox2.rotate(Axis.X, -Math.PI / 5.5);
      rampBox1.physicsImpostor = new PhysicsImpostor(
        rampBox1,
        PhysicsImpostor.BoxImpostor
      );
      rampBox2.physicsImpostor = new PhysicsImpostor(
        rampBox2,
        PhysicsImpostor.BoxImpostor
      );
      rampBox1.isVisible = rampBox2.isVisible = false;
    }
  });

  // #2
  // const raySphere = CreateSphere("ray-sphere", {
  //   diameter: 2,
  // });

  // raySphere.position = new Vector3(-10, 4, 0);

  // const ray = new Ray(
  //   raySphere.position.subtract(new Vector3(0, 1, 0)),
  //   Vector3.Down(),
  //   2
  // );
  // const rayHelper = new RayHelper(ray);
  // rayHelper.show(scene);
  // const test = scene.pickWithRay(ray);

  // #3
  // const sphere1 = CreateSphere("sphere1", { diameter: 0.5 });
  // sphere1.position = new Vector3(0, 1, 4.75);

  // const sphere2 = CreateSphere("sphere2", { diameter: 0.5 });
  // sphere2.position = new Vector3(0, 3, 14.55);

  // sphere1.isPickable = false;

  // const ray = new Ray(
  //   sphere1.getAbsolutePosition(),
  //   sphere2.position.subtract(sphere1.position).normalize(),
  //   10
  // );

  // const rayHelper = new RayHelper(ray);
  // rayHelper.show(scene);
  // const pickingInfo = scene.pickWithRay(ray);

  // console.log(pickingInfo);
}
