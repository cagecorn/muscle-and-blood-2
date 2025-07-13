// js/managers/CanvasBridgeManager.js

export class CanvasBridgeManager {
    // ✨ resolutionEngine을 매개변수로 추가
    constructor(gameCanvas, mercenaryPanelCanvas, combatLogCanvas, eventManager, measureManager, resolutionEngine) {
        console.log("🌉 CanvasBridgeManager initialized. Ready to bridge canvas interactions. 🌉");
        this.gameCanvas = gameCanvas;
        this.mercenaryPanelCanvas = mercenaryPanelCanvas;
        this.combatLogCanvas = combatLogCanvas;
        this.eventManager = eventManager;
        this.measureManager = measureManager;
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장 (직접 사용은 안 하지만 일관성을 위해)

        this.isDragging = false;
        this.draggedElement = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.offsetX = 0;
        this.offsetY = 0;

        this._setupEventListeners();
    }

    _setupEventListeners() {
        [this.gameCanvas, this.mercenaryPanelCanvas, this.combatLogCanvas].forEach(canvas => {
            if (canvas) {
                canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
                canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
                canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
                canvas.addEventListener('mouseleave', this._onMouseUp.bind(this));
            }
        });
        console.log("[CanvasBridgeManager] Listening for mouse events on all canvases.");
    }

    _onMouseDown(event) {
        if (event.target === this.mercenaryPanelCanvas) {
            this.isDragging = true;
            this.dragStartX = event.clientX;
            this.dragStartY = event.clientY;
            console.log("[CanvasBridgeManager] Dragging started from Mercenary Panel.");
            // event.clientX, event.clientY는 브라우저 픽셀 (CSS 픽셀) 좌표입니다.
            this.eventManager.emit('dragStart', { clientX: event.clientX, clientY: event.clientY, sourceCanvas: event.target.id });
        }
    }

    _onMouseMove(event) {
        if (!this.isDragging) return;
        this.eventManager.emit('dragMove', { clientX: event.clientX, clientY: event.clientY, currentCanvas: event.target.id });
    }

    _onMouseUp(event) {
        if (!this.isDragging) return;
        this.isDragging = false;
        if (event.target === this.gameCanvas) {
            console.log("[CanvasBridgeManager] Dragging ended, dropped on Game Canvas.");
            this.eventManager.emit('drop', { clientX: event.clientX, clientY: event.clientY, targetCanvas: event.target.id, droppedElement: this.draggedElement });
        } else {
            console.log("[CanvasBridgeManager] Dragging ended, no valid drop target.");
            this.eventManager.emit('dragCancel', {});
        }
        this.draggedElement = null;
    }
}
