import {
  AbstractMesh,
  Axis,
  CreateDecal,
  Mesh,
  Scene,
  SceneLoader,
  UniversalCamera,
  Vector3,
  StandardMaterial,
} from "@babylonjs/core";

class PlayerController extends AbstractMesh {
  private _mesh: Mesh;
  private _camera: UniversalCamera;
  private _movingForward = false;
  private _movingBack = false;
  private _movingLeft = false;
  private _movingRight = false;
  private _isRunning = false;
  private _isZooming = false;
  private _characterHeight = 1.8;

  private _weapon: AbstractMesh;

  private _playerWrapper: AbstractMesh;

  private _walkSpeed = 10;
  private _runSpeed = 25;
  private _splatters: StandardMaterial[];
  _scene: Scene;

  constructor(
    camera: UniversalCamera,
    playerMesh: Mesh,
    splatters: StandardMaterial[],
    scene: Scene
  ) {
    super("Player");

    this._scene = scene;

    this._splatters = splatters;

    this._mesh = playerMesh;
    this._mesh.position = new Vector3(
      this._mesh.position.x,
      this._characterHeight / 2,
      this._mesh.position.z
    );

    this._camera = camera;
    this._camera.parent = this._mesh;
    this._camera.position.y = this._characterHeight;

    this._playerWrapper = this;

    this._mesh.setParent(this._playerWrapper);
    this._mesh.isVisible = false;

    this._listenEvents();
    this._calculateMovement();
    this._calculateShoot();
  }

  async loadWeapon(path: string, filename: string, offset: Vector3) {
    const { meshes } = await SceneLoader.ImportMeshAsync("", path, filename);

    this._weapon = meshes[0];
    this._weapon.parent = this._camera;
    this._weapon.position = offset;
  }

  _calculateMovement() {
    let once = false;

    this._scene.registerBeforeRender(() => {
      const deltaTime = this._scene.getEngine().getDeltaTime() / 1000;

      const cameraDirection = this._camera
        .getDirection(Vector3.Forward())
        .normalizeToNew();

      const currentSpeed = this._isRunning ? this._runSpeed : this._walkSpeed;

      if (this._isRunning && !once) {
        this._weapon.rotate(Axis.Y, -Math.PI / 5);
        once = true;
      } else if (!this._isRunning && once) {
        this._weapon.rotate(Axis.Y, Math.PI / 5);
        once = false;
      }

      if (this._movingForward) {
        this._playerWrapper.moveWithCollisions(
          cameraDirection.scale(currentSpeed * deltaTime)
        );
      }

      if (this._movingBack) {
        this._playerWrapper.moveWithCollisions(
          cameraDirection.scale(-currentSpeed * 0.6 * deltaTime)
        );
      }

      if (this._movingLeft) {
        this._playerWrapper.moveWithCollisions(
          cameraDirection.cross(Axis.Y).scale(currentSpeed * deltaTime)
        );
      }

      if (this._movingRight) {
        this._playerWrapper.moveWithCollisions(
          cameraDirection.cross(Axis.Y).scale(-currentSpeed * deltaTime)
        );
      }

      this._playerWrapper.position.y = this._characterHeight / 2 + 0.2;
    });
  }

  _calculateShoot() {
    this._scene.onPointerDown = (event) => {
      if (this._isRunning) return;

      // left click (can't find enum)
      if (event.button === 0) {
        const origin = this._mesh
          .getAbsolutePosition()
          .subtract(new Vector3(0, -this._characterHeight, 0));

        const ray = this._camera.getForwardRay(undefined, undefined, origin);

        const raycastHit = this._scene.pickWithRay(ray);

        if (raycastHit.hit) {
          setTimeout(() => {
            const decal = CreateDecal("decal", raycastHit.pickedMesh, {
              position: raycastHit.pickedPoint,
              normal: raycastHit.getNormal(true),
              size: new Vector3(1, 1, 1),
            });

            decal.material =
              this._splatters[
                Math.floor(Math.random() * this._splatters.length)
              ];

            decal.setParent(raycastHit.pickedMesh);
          }, 50);
        }
      } else if (event.button === 2) {
        // right click (can't find enum)
        this._isZooming = !this._isZooming;
        this._camera.fov = this._isZooming ? 0.4 : 0.8;
      }
    };
  }

  private _listenEvents() {
    const canvas: HTMLCanvasElement = this._scene
      .getEngine()
      .getRenderingCanvas();

    this._onKeyDown(canvas);
    this._onKeyUp(canvas);
  }

  private _onKeyDown(canvas: HTMLCanvasElement) {
    canvas.addEventListener(
      "keydown",
      (event) => {
        switch (event.code) {
          case "KeyW":
            this._movingForward = true;
            break;
          case "KeyS":
            this._movingBack = true;
            break;
          case "KeyA":
            this._movingLeft = true;
            break;
          case "KeyD":
            this._movingRight = true;
            break;
          case "ShiftLeft":
            this._isRunning = true;
            break;
        }
      },
      false
    );
  }

  private _onKeyUp(canvas: HTMLCanvasElement) {
    canvas.addEventListener(
      "keyup",
      (event) => {
        switch (event.code) {
          case "KeyW":
            this._movingForward = false;
            break;
          case "KeyS":
            this._movingBack = false;
            break;
          case "KeyA":
            this._movingLeft = false;
            break;
          case "KeyD":
            this._movingRight = false;
            break;
          case "ShiftLeft":
            this._isRunning = false;
        }
      },
      false
    );
  }
}

export default PlayerController;
