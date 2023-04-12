import { AbstractMesh, PhysicsImpostor } from "@babylonjs/core";

class PullController {
  private _objectsPool: AbstractMesh[] = [];
  private _prefab: AbstractMesh;

  constructor(poolObject: AbstractMesh, numberOfObjectsInPull: number) {
    this._prefab = poolObject;

    // poolObject.dispose();

    for (let i = 0; i < numberOfObjectsInPull; i++) {
      this._prefab.isVisible = false;

      this._objectsPool.push(this._prefab);
    }
  }

  get poolLength() {
    return this._objectsPool.length;
  }

  pull() {
    let object: AbstractMesh;

    console.log(this.poolLength);
    if (this.poolLength > 0) {
      object = this._objectsPool.pop();
    } else {
      object = this._prefab.clone(this._prefab.name, null, false);
    }

    object.isVisible = true;

    return object;
  }

  push(object: AbstractMesh) {
    console.log(object);

    // object.isVisible = false;
    this._objectsPool.push(object);
  }
}

export default PullController;
