import { Scene } from "@babylonjs/core";
import {
  AdvancedDynamicTexture,
  Container,
  Control,
  Rectangle,
  TextBlock,
} from "@babylonjs/gui";

interface Achievement {
  key: string;
  value: number;
  message?: string;
}

class AchievementController {
  private _scene: Scene;

  private _list: Array<Achievement> = [];

  private _ui: AdvancedDynamicTexture;
  private _board: Rectangle;

  private _achievementKeyIsPressed = false;

  constructor() {}

  add(key: string, value: number, message?: string) {}

  private _createGUI() {
    const ui = AdvancedDynamicTexture.CreateFullscreenUI("achievements-ui");

    const rectangle = new Rectangle("wrapper");
    rectangle.width = "50%";
    rectangle.height = "50%";
    rectangle.background = "grey";
    rectangle.alpha = 0.75;

    ui.addControl(rectangle);

    const contentRect = new Container("content");

    if (!this._list.length) {
      const textBlock = new TextBlock(
        "no-achievements",
        "Достижений не существует."
      );

      contentRect.addControl(textBlock);
    }

    this._list.forEach((element, index) => {
      const textBlock = new TextBlock(
        `${element.key}`,
        element.message + element.value
      );

      textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      textBlock.height = "30px";
      textBlock.top = `${index * 30}px`;

      contentRect.addControl(textBlock);
    });

    contentRect.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    contentRect.height = `${this._list.length * 30}px`;

    if (!this._list.length) {
      contentRect.height = "30px";
    }

    rectangle.addControl(contentRect);

    rectangle.isVisible = true;

    this._ui = ui;
    this._board = rectangle;
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
          case "KeyZ":
            this._achievementKeyIsPressed = true;
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
          case "KeyZ":
            this._achievementKeyIsPressed = false;
            break;
        }
      },
      false
    );
  }
}

export default AchievementController;
