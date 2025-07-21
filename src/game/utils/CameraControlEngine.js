import { Math as PhaserMath } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';

/**
 * 간단한 카메라 드래그 및 줌 제어 엔진
 */
export class CameraControlEngine {
    /**
     * @param {Phaser.Scene} scene - 제어할 씬
     */
    constructor(scene) {
        /** @type {Phaser.Scene} */
        this.scene = scene;
        /** @type {Phaser.Cameras.Scene2D.Camera} */
        this.camera = scene.cameras.main;
        this.isDragging = false;
        this.prevPointer = { x: 0, y: 0 };
        this.minZoom = 0.5;
        // 기본 최대 줌을 기존의 2에서 6으로 확장하여
        // 보다 깊은 클로즈업이 가능하도록 합니다.
        this.maxZoom = 6;

        scene.input.on('pointerdown', this.onPointerDown, this);
        scene.input.on('pointermove', this.onPointerMove, this);
        scene.input.on('pointerup', this.onPointerUp, this);
        scene.input.on('wheel', this.onWheel, this);
    }

    onPointerDown(pointer) {
        this.isDragging = true;
        this.prevPointer.x = pointer.x;
        this.prevPointer.y = pointer.y;
    }

    onPointerMove(pointer) {
        if (!this.isDragging) return;
        const dx = (pointer.x - this.prevPointer.x) / this.camera.zoom;
        const dy = (pointer.y - this.prevPointer.y) / this.camera.zoom;
        this.camera.scrollX -= dx;
        this.camera.scrollY -= dy;
        this.prevPointer.x = pointer.x;
        this.prevPointer.y = pointer.y;
    }

    onPointerUp() {
        this.isDragging = false;
    }

    onWheel(pointer, gameObjects, deltaX, deltaY) {
        const newZoom = PhaserMath.Clamp(this.camera.zoom - deltaY * 0.001, this.minZoom, this.maxZoom);
        this.camera.setZoom(newZoom);
    }

    /**
     * 이벤트 리스너를 해제합니다.
     */
    destroy() {
        this.scene.input.off('pointerdown', this.onPointerDown, this);
        this.scene.input.off('pointermove', this.onPointerMove, this);
        this.scene.input.off('pointerup', this.onPointerUp, this);
        this.scene.input.off('wheel', this.onWheel, this);
    }
}
