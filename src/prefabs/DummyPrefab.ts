import {
  Mesh,
  PhysicsImpostor,
  PhysicsViewer,
  SceneLoader,
} from "@babylonjs/core";

class DummyPrefab {
  constructor() {}

  async init({ position, name }) {
    const { meshes } = await SceneLoader.ImportMeshAsync(
      null,
      "./models/",
      "dummy.glb"
    );

    const dummy = meshes[0];
    dummy.setParent(null);
    dummy.name = name;
    dummy.scaling.scaleInPlace(0.9);

    Mesh.MergeMeshes(
      dummy.getChildMeshes(),
      true,
      false,
      dummy as Mesh,
      false,
      true
    );

    dummy.position = position;

    dummy.physicsImpostor = new PhysicsImpostor(
      dummy,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
      }
    );

    dummy.position.y = -1.55;

    const physicsViewer = new PhysicsViewer();
    physicsViewer.showImpostor(dummy.physicsImpostor);
  }
}

export default DummyPrefab;
