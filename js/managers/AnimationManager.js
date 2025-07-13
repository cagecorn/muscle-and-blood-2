// js/managers/AnimationManager.js

export class AnimationManager {
    // ✨ measureManager 외에 resolutionEngine을 매개변수로 받도록 수정
    constructor(measureManager, battleSimulationManager = null, resolutionEngine) {
        console.log("🏃‍♂️ AnimationManager initialized. Ready to animate movements. 🏃‍♂️");
        this.measureManager = measureManager;
        this.battleSimulationManager = battleSimulationManager;
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장
        this.activeAnimations = new Map(); // { unitId: { startPixelX, startPixelY, endPixelX, endPixelY, startTime, duration, resolve, currentPixelX, currentPixelY } }
        this.animationSpeed = 0.005; // Tiles per millisecond
    }

    /**
     * Add a move animation to the queue.
     * 이 함수 내에서 계산되는 모든 픽셀 좌표는 해상도 엔진을 통해 스케일링됩니다.
     * @param {string} unitId
     * @param {number} startGridX
     * @param {number} startGridY
     * @param {number} endGridX
     * @param {number} endGridY
     * @returns {Promise<void>} Resolves when the animation completes
     */
    queueMoveAnimation(unitId, startGridX, startGridY, endGridX, endGridY) {
        return new Promise(resolve => {
            // 이 부분의 sceneContentDimensions 등은 MeasureManager나 BattleSimulationManager에서
            // 기준 해상도에 맞춰 값을 제공한다고 가정합니다.
            const sceneContentDimensions = this.battleSimulationManager.logicManager.getCurrentSceneContentDimensions();
            // ✨ canvasWidth, canvasHeight는 이제 resolutionEngine에서 직접 가져옵니다.
            const canvasWidth = this.resolutionEngine.displayWidth; 
            const canvasHeight = this.resolutionEngine.displayHeight;
            const stagePadding = this.measureManager.get('battleStage.padding'); // 이 값도 기준 해상도 기반이어야 함.

            const gridContentWidth = sceneContentDimensions.width;
            const gridContentHeight = sceneContentDimensions.height;

            const effectiveTileSize = gridContentWidth / this.battleSimulationManager.gridCols; // 기준 타일 크기
            const totalGridWidth = gridContentWidth;
            const totalGridHeight = gridContentHeight;
            const gridOffsetX = (canvasWidth - totalGridWidth) / 2; // CSS 픽셀 기준
            const gridOffsetY = (canvasHeight - totalGridHeight) / 2; // CSS 픽셀 기준
            
            // ✨ 시작 및 끝 픽셀 좌표를 계산한 후, resolutionEngine을 통해 스케일링된 값을 저장합니다.
            // 이렇게 저장된 값들은 이미 스케일링되어 있으므로, 렌더링 시 별도의 스케일링이 필요 없습니다.
            const startPixelX = this.resolutionEngine.getScaledCoordinate(gridOffsetX + startGridX * effectiveTileSize);
            const startPixelY = this.resolutionEngine.getScaledCoordinate(gridOffsetY + startGridY * effectiveTileSize);
            const endPixelX = this.resolutionEngine.getScaledCoordinate(gridOffsetX + endGridX * effectiveTileSize);
            const endPixelY = this.resolutionEngine.getScaledCoordinate(gridOffsetY + endGridY * effectiveTileSize); // ✨ 오타 수정: endGridY에도 effectiveTileSize 곱하기

            const dist = Math.sqrt(
                Math.pow(endGridX - startGridX, 2) +
                Math.pow(endGridY - startGridY, 2)
            );
            const duration = dist / this.animationSpeed;

            this.activeAnimations.set(unitId, {
                startPixelX,
                startPixelY,
                endPixelX,
                endPixelY,
                startTime: performance.now(),
                duration,
                resolve,
                currentPixelX: startPixelX, // 초기 위치도 스케일링된 값으로 설정
                currentPixelY: startPixelY
            });
            console.log(`[AnimationManager] Queued move animation for unit ${unitId} from (${startGridX},${startGridY}) to (${endGridX},${endGridY}) with duration ${duration.toFixed(0)}ms.`);
        });
    }

    /**
     * Update animation states each frame.
     * @param {number} deltaTime
     */
    update(deltaTime) {
        const currentTime = performance.now();
        for (const [unitId, animation] of this.activeAnimations.entries()) {
            const elapsed = currentTime - animation.startTime;
            const progress = Math.min(1, elapsed / animation.duration);

            if (progress >= 1) {
                animation.currentPixelX = animation.endPixelX;
                animation.currentPixelY = animation.endPixelY;
                console.log(`[AnimationManager] Animation for unit ${unitId} completed.`);
                this.activeAnimations.delete(unitId);
                if (animation.resolve) {
                    animation.resolve();
                }
            } else {
                animation.currentPixelX = animation.startPixelX + (animation.endPixelX - animation.startPixelX) * progress;
                animation.currentPixelY = animation.startPixelY + (animation.endPixelY - animation.startPixelY) * progress;
            }
        }
    }

    /**
     * Get the current render position for a unit.
     * 애니메이션이 없는 경우에도 스케일링된 렌더링 위치를 반환합니다.
     * @param {string} unitId
     * @param {number} currentGridX
     * @param {number} currentGridY
     * @param {number} effectiveTileSize - 기준 해상도 단위의 타일 크기
     * @param {number} gridOffsetX - 기준 해상도 단위의 그리드 X 오프셋
     * @param {number} gridOffsetY - 기준 해상도 단위의 그리드 Y 오프셋
     * @returns {{drawX:number, drawY:number}} 스케일링된 그리기 좌표
     */
    getRenderPosition(unitId, currentGridX, currentGridY, effectiveTileSize, gridOffsetX, gridOffsetY) {
        const animation = this.activeAnimations.get(unitId);
        if (animation) {
            return {
                drawX: animation.currentPixelX, // 이미 스케일링된 값
                drawY: animation.currentPixelY
            };
        }
        // ✨ 애니메이션이 없을 경우, 기준 좌표를 스케일링하여 반환합니다.
        return {
            drawX: this.resolutionEngine.getScaledCoordinate(gridOffsetX + currentGridX * effectiveTileSize),
            drawY: this.resolutionEngine.getScaledCoordinate(gridOffsetY + currentGridY * effectiveTileSize)
        };
    }

    /**
     * Check if any animations are active.
     * @returns {boolean}
     */
    hasActiveAnimations() {
        return this.activeAnimations.size > 0;
    }
}
