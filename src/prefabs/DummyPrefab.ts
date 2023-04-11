import {
  AbstractMesh,
  Axis,
  Mesh,
  MeshBuilder,
  PhysicsImpostor,
  PhysicsViewer,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, Rectangle } from "@babylonjs/gui";

interface IDummy {
  name: string;
  position: Vector3;
}

class Dummy {
  private _model: AbstractMesh;
  private _health = 100;
  private _hpBar: Rectangle;
  private _scene: Scene;

  constructor(scene: Scene) {
    this._scene = scene;
  }

  async init({ name = "default-dummy", position }: IDummy) {
    const { meshes } = await SceneLoader.ImportMeshAsync(
      null,
      "./models/",
      "dummy.glb"
    );

    this._model = meshes[0];

    this._model.setParent(null);
    this._model.name = name;
    this._model.scaling.scaleInPlace(0.9);

    Mesh.MergeMeshes(
      meshes[0].getChildMeshes(),
      true,
      false,
      this._model as Mesh,
      false,
      true
    );

    this.setPosition(position);

    this._model.physicsImpostor = new PhysicsImpostor(
      this._model,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
      }
    );

    this._model.position.y = -1.55;

    // const physicsViewer = new PhysicsViewer();
    // physicsViewer.showImpostor(this._model.physicsImpostor);

    this._createGUI();
  }

  setPosition(position: Vector3) {
    this._model.position = position;
  }

  setRotation(amount) {
    this._model.rotateAround(
      this._model.getAbsolutePivotPoint(),
      Axis.Y,
      amount
    );
  }

  _createGUI() {
    const plane = MeshBuilder.CreatePlane("plane", {}, this._scene);
    plane.parent = this._model;
    plane.position.y = -4;

    plane.billboardMode = Mesh.BILLBOARDMODE_ALL;

    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(
      plane,
      1024,
      1024,
      false
    );

    const hpBar = new Rectangle("hp-bar");
    hpBar.width = 0.5;
    hpBar.height = 0.05;
    hpBar.background = "green";
    hpBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    hpBar.left = "25%";
    advancedTexture.addControl(hpBar);

    this._hpBar = hpBar;
  }

  subtractHealth() {
    this._health -= 25;

    if (this._health <= 0) {
      this._health = 100;
      this._hpBar.background = "green";
    }

    if (this._health <= 50) {
      this._hpBar.background = "yellow";
    }

    if (this._health <= 25) {
      this._hpBar.background = "red";
    }

    this._hpBar.width = this._health / 200;
  }
}

export default Dummy;
