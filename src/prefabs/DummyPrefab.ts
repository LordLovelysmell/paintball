import {
  AbstractMesh,
  Axis,
  Mesh,
  MeshBuilder,
  PhysicsImpostor,
  PhysicsViewer,
  SceneLoader,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, Rectangle } from "@babylonjs/gui";
import AchievementController from "../controllers/AchievementsController";

class DummyPrefab {
  private _hpBar: Rectangle;
  private _health = 100;
  private _dummy: AbstractMesh;
  private _achievement: AchievementController;

  constructor(achievement: AchievementController) {
    this._achievement = achievement;
  }

  async init({ position, name }) {
    const { meshes } = await SceneLoader.ImportMeshAsync(
      null,
      "./models/",
      "dummy.glb"
    );

    this._dummy = meshes[0];
    this._dummy.setParent(null);
    this._dummy.name = name;
    this._dummy.scaling.scaleInPlace(0.9);

    Mesh.MergeMeshes(
      this._dummy.getChildMeshes(),
      true,
      false,
      this._dummy as Mesh,
      false,
      true
    );

    this._dummy.position = position;

    this._dummy.physicsImpostor = new PhysicsImpostor(
      this._dummy,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
      }
    );

    this._dummy.position.y = -1.55;

    // const physicsViewer = new PhysicsViewer();
    // physicsViewer.showImpostor(this._dummy.physicsImpostor);

    this._createHPBar();
  }

  private _createHPBar() {
    const plane = MeshBuilder.CreatePlane("hp-plane");
    plane.parent = this._dummy;
    plane.position.y = -4;

    plane.billboardMode = Mesh.BILLBOARDMODE_ALL;

    const ui = AdvancedDynamicTexture.CreateForMesh(plane);

    const hpBar = new Rectangle("hp-bar");
    hpBar.width = 0.5;
    hpBar.height = 0.05;
    hpBar.background = "green";
    hpBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    hpBar.left = "25%";
    ui.addControl(hpBar);

    this._hpBar = hpBar;
  }

  subtractHealth() {
    this._health -= 25;

    if (this._health <= 0) {
      this._health = 100;
      this._hpBar.background = "green";
      this._achievement.add("dummyLost", 1, "Манекенов повержено:");
    }

    if (this._health <= 50) {
      this._hpBar.background = "yellow";
    }

    if (this._health <= 25) {
      this._hpBar.background = "red";
    }

    this._hpBar.width = this._health / 200;
  }

  setRotation(amount: number) {
    this._dummy.rotateAround(
      this._dummy.getAbsolutePivotPoint(),
      Axis.Y,
      amount
    );
  }
}

export default DummyPrefab;
