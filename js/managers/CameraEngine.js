// js/managers/CameraEngine.js

export class CameraEngine {
    // ✨ resolutionEngine을 매개변수로 추가
    constructor(renderer, logicManager, sceneManager, resolutionEngine) {
        console.log("📸 CameraEngine initialized. Ready to control the view. 📸");
        this.renderer = renderer;
        this.logicManager = logicManager;
        this.sceneManager = sceneManager;
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장

        this.x = 0; // 카메라 X 위치 (기준 해상도 단위)
        this.y = 0; // 카메라 Y 위치 (기준 해상도 단위)
        this.zoom = 1; // 카메라 줌 레벨 (추가적인 스케일)
    }

    /**
     * 캔버스 컨텍스트에 카메라 변환을 적용합니다.
     * 이 함수는 ResolutionEngine이 기본 스케일을 적용한 후에 호출되어야 합니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트 (이미 ResolutionEngine에 의해 스케일링됨)
     */
    applyTransform(ctx) {
        // ✨ 카메라 위치(x, y)는 기준 해상도 단위이므로, 캔버스에 적용하기 전에 스케일링합니다.
        ctx.translate(this.resolutionEngine.getScaledCoordinate(this.x), this.resolutionEngine.getScaledCoordinate(this.y));
        // 줌 레벨은 추가적인 스케일이므로 그대로 적용합니다.
        ctx.scale(this.zoom, this.zoom);
    }

    /**
     * 카메라를 이동시킵니다.
     * @param {number} dx - X축 이동량 (기준 해상도 단위)
     * @param {number} dy - Y축 이동량 (기준 해상도 단위)
     */
    pan(dx, dy) {
        this.x += dx;
        this.y += dy;
        // logicManager.applyPanConstraints는 기준 해상도 단위로 처리한다고 가정합니다.
        const clampedPos = this.logicManager.applyPanConstraints(this.x, this.y, this.zoom);
        this.x = clampedPos.x;
        this.y = clampedPos.y;
    }

    /**
     * 특정 지점을 중심으로 카메라를 확대/축소합니다.
     * @param {number} zoomAmount - 줌 변경량
     * @param {number} mouseX - 마우스 X 좌표 (기준 해상도 단위)
     * @param {number} mouseY - 마우스 Y 좌표 (기준 해상도 단위)
     */
    zoomAt(zoomAmount, mouseX, mouseY) {
        const oldZoom = this.zoom;
        let newZoom = this.zoom + zoomAmount;
        const zoomLimits = this.logicManager.getZoomLimits();
        newZoom = Math.max(zoomLimits.minZoom, Math.min(newZoom, zoomLimits.maxZoom));
        if (newZoom === oldZoom) return;

        // mouseX, mouseY는 이미 InputManager 등에서 기준 해상도 단위로 변환되어 전달된다고 가정합니다.
        const worldX = (mouseX - this.x) / oldZoom;
        const worldY = (mouseY - this.y) / oldZoom;

        this.x -= worldX * (newZoom - oldZoom);
        this.y -= worldY * (newZoom - oldZoom);
        this.zoom = newZoom;

        const clampedPos = this.logicManager.applyPanConstraints(this.x, this.y, this.zoom);
        this.x = clampedPos.x;
        this.y = clampedPos.y;
    }

    /**
     * 카메라를 초기 상태로 리셋합니다.
     */
    reset() {
        this.x = 0;
        this.y = 0;
        const { minZoom } = this.logicManager.getZoomLimits();
        this.zoom = minZoom;
        console.log(`[CameraEngine Debug] Resetting camera: initial X=${this.x}, Y=${this.y}, calculated Zoom=${this.zoom.toFixed(2)}`);

        const clampedPos = this.logicManager.applyPanConstraints(this.x, this.y, this.zoom);
        this.x = clampedPos.x;
        this.y = clampedPos.y;
        console.log(`[CameraEngine Debug] After clamping: final X=${this.x.toFixed(2)}, Y=${this.y.toFixed(2)}, Zoom=${this.zoom.toFixed(2)}`);
    }
}
