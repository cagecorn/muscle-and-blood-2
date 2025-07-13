// js/managers/AnimationManager.js

export class AnimationManager {
    constructor(measureManager, battleSimulationManager = null) {
        console.log("\uD83C\uDFC3 AnimationManager initialized. Ready to animate movements. \uD83C\uDFC3");
        this.measureManager = measureManager;
        this.battleSimulationManager = battleSimulationManager;
        this.activeAnimations = new Map(); // { unitId: { startPixelX, startPixelY, endPixelX, endPixelY, startTime, duration, resolve, currentPixelX, currentPixelY } }
        this.animationSpeed = 0.005; // Tiles per millisecond
    }

    /**
     * Add a move animation to the queue.
     * @param {string} unitId
     * @param {number} startGridX
     * @param {number} startGridY
     * @param {number} endGridX
     * @param {number} endGridY
     * @returns {Promise<void>} Resolves when the animation completes
     */
    queueMoveAnimation(unitId, startGridX, startGridY, endGridX, endGridY) {
        return new Promise(resolve => {
            const sceneContentDimensions = this.battleSimulationManager.logicManager.getCurrentSceneContentDimensions();
            const canvasWidth = this.measureManager.get('gameResolution.width') || sceneContentDimensions.width;
            const canvasHeight = this.measureManager.get('gameResolution.height') || sceneContentDimensions.height;
            const stagePadding = this.measureManager.get('battleStage.padding');

            const gridContentWidth = sceneContentDimensions.width;
            const gridContentHeight = sceneContentDimensions.height;

            const effectiveTileSize = gridContentWidth / this.battleSimulationManager.gridCols;
            const totalGridWidth = gridContentWidth;
            const totalGridHeight = gridContentHeight;
            const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
            const gridOffsetY = (canvasHeight - totalGridHeight) / 2;
            const startPixelX = gridOffsetX + startGridX * effectiveTileSize;
            const startPixelY = gridOffsetY + startGridY * effectiveTileSize;
            const endPixelX = gridOffsetX + endGridX * effectiveTileSize;
            const endPixelY = gridOffsetY + endGridY * effectiveTileSize;

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
                currentPixelX: startPixelX,
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
     * @param {string} unitId
     * @param {number} currentGridX
     * @param {number} currentGridY
     * @param {number} effectiveTileSize
     * @param {number} gridOffsetX
     * @param {number} gridOffsetY
     * @returns {{drawX:number, drawY:number}}
     */
    getRenderPosition(unitId, currentGridX, currentGridY, effectiveTileSize, gridOffsetX, gridOffsetY) {
        const animation = this.activeAnimations.get(unitId);
        if (animation) {
            return {
                drawX: animation.currentPixelX,
                drawY: animation.currentPixelY
            };
        }
        return {
            drawX: gridOffsetX + currentGridX * effectiveTileSize,
            drawY: gridOffsetY + currentGridY * effectiveTileSize
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
