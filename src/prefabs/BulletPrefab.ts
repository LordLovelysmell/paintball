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

class BulletPrefab {
  private _bullet: Mesh;
  private _scene: Scene;
  private _splatters: StandardMaterial[];

  constructor(
    origin: Vector3,
    cameraDirection: Vector3,
    splatters: StandardMaterial[],
    onAfterShot: Function,
    scene: Scene
  ) {
    this._scene = scene;
    this._splatters = splatters;

    this._bullet = CreateSphere("ball", { diameter: 0.05 });
    this._bullet.position = origin;
    this._bullet.isPickable = false;

    this._bullet.physicsImpostor = new PhysicsImpostor(
      this._bullet,
      PhysicsImpostor.SphereImpostor,
      {
        mass: 0.05,
      }
    );

    this._bullet.physicsImpostor.applyImpulse(
      cameraDirection.scale(2),
      this._bullet.getAbsolutePosition()
    );

    this._bullet.physicsImpostor.onCollideEvent = (collider, collidedWith) => {
      this._bullet.dispose();

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
  }

  get mesh() {
    return this._bullet;
  }
}

export default BulletPrefab;
