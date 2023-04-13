import {
  CreateDecal,
  CreateSphere,
  Mesh,
  PhysicsImpostor,
  Ray,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import PoolController from "../controllers/PoolController";

class BulletPrefab {
  private _bullet: Mesh;
  private _scene: Scene;
  private _splatters: StandardMaterial[];

  constructor(splatters: StandardMaterial[], scene: Scene, index: number) {
    this._scene = scene;
    this._splatters = splatters;

    this.init(index);
  }

  init(index: number) {
    this._bullet = CreateSphere("bullet-prefab-" + index, { diameter: 0.05 });
    this._bullet.isPickable = false;
  }

  get mesh() {
    return this._bullet;
  }

  addPhysics(
    origin: Vector3,
    cameraDirection: Vector3,
    onAfterShot: Function,
    bulletPool: PoolController<this>
  ) {
    let onCollideWasFired = false;

    this._bullet.position = origin;

    this._bullet.physicsImpostor = new PhysicsImpostor(
      this._bullet,
      PhysicsImpostor.SphereImpostor,
      {
        mass: 0.05,
      },
      this._scene
    );

    this._bullet.physicsImpostor.applyImpulse(
      cameraDirection.scale(2),
      this._bullet.getAbsolutePosition()
    );

    setTimeout(() => {
      if (!onCollideWasFired) {
        this._bullet.physicsImpostor.dispose();
        bulletPool.push(this);
      }
    }, 10000);

    this._bullet.physicsImpostor.onCollideEvent = (collider, collidedWith) => {
      if (onCollideWasFired) return;
      onCollideWasFired = true;

      this._bullet.physicsImpostor.dispose();
      bulletPool.push(this);

      const collidePosition = collider.physicsBody.position;

      const positionForDecale = new Vector3(
        collidePosition.x,
        collidePosition.y,
        collidePosition.z
      );

      const ray = new Ray(
        origin,
        positionForDecale.subtract(origin).normalize()
      );

      const pickingInfo = this._scene.pickWithRay(ray);

      if (!pickingInfo.pickedMesh) return;

      if (
        (collidedWith.object as Mesh).name &&
        pickingInfo.pickedMesh.name !== (collidedWith.object as Mesh).name
      ) {
        return;
      }
      const decal = CreateDecal("decal", pickingInfo.pickedMesh as Mesh, {
        position: pickingInfo.pickedPoint,
        normal: pickingInfo.getNormal(true),
        size: new Vector3(0.5, 0.5, 0.5),
      });

      decal.material =
        this._splatters[Math.floor(Math.random() * this._splatters.length)];

      decal.isPickable = false;

      decal.setParent(collidedWith.object as Mesh);

      onAfterShot(pickingInfo.pickedMesh);
    };

    return this._bullet;
  }
}

export default BulletPrefab;
