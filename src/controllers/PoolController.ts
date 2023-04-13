import { Mesh, Vector3 } from "@babylonjs/core";

type ConstructorFn<T> = (index: number) => T;

class PullController<T extends { mesh: Mesh }> {
  private _objectsPool: T[] = [];
  private _constructorFn: Function;

  constructor(constructorFn: ConstructorFn<T>, numberOfObjectsInPull: number) {
    this._constructorFn = constructorFn;

    for (let i = 0; i < numberOfObjectsInPull; i++) {
      const constructedPrefab = constructorFn(i);
      constructedPrefab.mesh.isVisible = false;

      this._objectsPool.push(constructedPrefab);
    }
  }

  private get _poolLength() {
    return this._objectsPool.length;
  }

  pull() {
    let object: T;

    console.log(this._poolLength);
    if (this._poolLength > 0) {
      object = this._objectsPool.pop();
    } else {
      object = this._constructorFn();
    }

    object.mesh.isVisible = true;

    return object;
  }

  push(object: T) {
    object.mesh.position = Vector3.Zero();
    object.mesh.isVisible = false;

    this._objectsPool.push(object);
  }
}

export default PullController;
