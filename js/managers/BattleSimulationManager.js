// js/managers/BattleSimulationManager.js

export class BattleSimulationManager {
    // ✨ resolutionEngine을 매개변수로 추가
    constructor(measureManager, assetLoaderManager, idManager, logicManager, animationManager, valorEngine, resolutionEngine) {
        console.log("⚔️ BattleSimulationManager initialized. Preparing units for battle. ⚔️");
        this.measureManager = measureManager;
        this.assetLoaderManager = assetLoaderManager;
        this.idManager = idManager;
        this.logicManager = logicManager;
        this.animationManager = animationManager;
        this.valorEngine = valorEngine;
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장
        this.unitsOnGrid = [];
        this.gridRows = 10; // BattleGridManager와 동일한 그리드 차원
        this.gridCols = 15;
    }

    /**
     * 유닛을 특정 그리드 타일에 배치합니다.
     * @param {object} fullUnitData - IdManager로부터 완전히 로드된 유닛 데이터
     * @param {HTMLImageElement} unitImage - 로드된 유닛의 스프라이트 이미지
     * @param {number} gridX
     * @param {number} gridY
     */
    addUnit(fullUnitData, unitImage, gridX, gridY) {
        const initialBarrier = this.valorEngine.calculateInitialBarrier(fullUnitData.baseStats.valor || 0);

        const unitInstance = {
            id: fullUnitData.id,
            name: fullUnitData.name,
            spriteId: fullUnitData.spriteId,
            image: unitImage,
            classId: fullUnitData.classId,
            gridX,
            gridY,
            baseStats: fullUnitData.baseStats,
            type: fullUnitData.type,
            fullUnitData: fullUnitData,
            currentHp: fullUnitData.currentHp !== undefined ? fullUnitData.currentHp : fullUnitData.baseStats.hp,
            currentBarrier: initialBarrier,
            maxBarrier: initialBarrier
        };
        this.unitsOnGrid.push(unitInstance);
        console.log(`[BattleSimulationManager] Added unit '${unitInstance.id}' at (${gridX}, ${gridY}) with initial barrier ${initialBarrier}.`);
    }

    /**
     * 유닛의 그리드 위치를 업데이트합니다.
     * @param {string} unitId - 이동할 유닛의 ID
     * @param {number} newGridX - 새로운 그리드 X 좌표
     * @param {number} newGridY - 새로운 그리드 Y 좌표
     * @returns {boolean} 이동 성공 여부
     */
    moveUnit(unitId, newGridX, newGridY) {
        const unit = this.unitsOnGrid.find(u => u.id === unitId);
        if (unit) {
            const oldX = unit.gridX;
            const oldY = unit.gridY;

            if (newGridX >= 0 && newGridX < this.gridCols &&
                newGridY >= 0 && newGridY < this.gridRows) {
                if (this.isTileOccupied(newGridX, newGridY, unitId)) {
                    console.warn(`[BattleSimulationManager] Destination tile (${newGridX}, ${newGridY}) is occupied. Move cancelled.`);
                    return false;
                }
                unit.gridX = newGridX;
                unit.gridY = newGridY;
                console.log(`[BattleSimulationManager] Unit '${unitId}' moved from (${oldX}, ${oldY}) to (${newGridX}, ${newGridY}).`);
                return true;
            } else {
                console.warn(`[BattleSimulationManager] Unit '${unitId}' attempted to move out of bounds to (${newGridX}, ${newGridY}).`);
                return false;
            }
        } else {
            console.warn(`[BattleSimulationManager] Cannot move unit '${unitId}'. Unit not found.`);
            return false;
        }
    }

    /**
     * 특정 타일이 다른 유닛에 의해 점유되어 있는지 확인합니다.
     * @param {number} gridX
     * @param {number} gridY
     * @param {string} [ignoreUnitId] - 점유 여부 확인에서 제외할 유닛 ID
     * @returns {boolean} 타일 점유 여부
     */
    isTileOccupied(gridX, gridY, ignoreUnitId = null) {
        return this.unitsOnGrid.some(u =>
            u.gridX === gridX &&
            u.gridY === gridY &&
            u.id !== ignoreUnitId &&
            u.currentHp > 0
        );
    }

    /**
     * 배틀 그리드에 배치된 모든 유닛을 그립니다.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        // sceneContentDimensions는 LogicManager에서 기준 해상도 단위로 그리드 크기를 반환한다고 가정합니다.
        const sceneContentDimensions = this.logicManager.getCurrentSceneContentDimensions(); 
        
        // ✨ canvasWidth, canvasHeight를 resolutionEngine의 기준 해상도에서 가져옵니다.
        const baseCanvasWidth = this.resolutionEngine.baseWidth; 
        const baseCanvasHeight = this.resolutionEngine.baseHeight; 

        // stagePadding도 기준 해상도 단위라고 가정 (현재 코드에서 사용되지 않음)
        // const stagePadding = this.measureManager.get('battleStage.padding');

        // LogicManager에서 계산된 순수 그리드 컨텐츠 크기 (패딩 제외, 기준 해상도 단위)
        const gridContentWidth = sceneContentDimensions.width;
        const gridContentHeight = sceneContentDimensions.height;

        // 이 gridContentWidth/Height를 사용하여 effectiveTileSize를 역으로 계산 (기준 해상도 단위)
        const effectiveTileSize = gridContentWidth / this.gridCols;

        // 전체 그리드 크기 (여기서는 gridContentWidth/Height와 동일)
        const totalGridWidth = gridContentWidth;
        const totalGridHeight = gridContentHeight;

        // ✨ 그리드를 캔버스 중앙에 배치하기 위한 오프셋 계산 (기준 해상도 단위)
        // (기준 캔버스 전체 크기 - 그리드 컨텐츠 크기) / 2
        const gridOffsetX_base = (baseCanvasWidth - totalGridWidth) / 2;
        const gridOffsetY_base = (baseCanvasHeight - totalGridHeight) / 2;

        for (const unit of this.unitsOnGrid) {
            const image = unit.image;
            if (!image) {
                console.warn(`[BattleSimulationManager] Image not available for unit '${unit.id}'. Skipping draw.`);
                continue;
            }

            // AnimationManager.getRenderPosition은 이미 스케일링된 픽셀 위치를 반환합니다.
            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize, // 이 값은 기준 단위입니다. getRenderPosition 내부에서 스케일링됩니다.
                gridOffsetX_base,  // 이 값은 기준 단위입니다. getRenderPosition 내부에서 스케일링됩니다.
                gridOffsetY_base   // 이 값은 기준 단위입니다. getRenderPosition 내부에서 스케일링됩니다.
            );

            // ✨ 이미지 크기와 오프셋도 기준 단위로 계산한 후, 스케일링합니다.
            const baseImageSize = effectiveTileSize;
            const baseImgOffsetX = (effectiveTileSize - baseImageSize) / 2; // 보통 0이 됨
            const baseImgOffsetY = (effectiveTileSize - baseImageSize) / 2; // 보통 0이 됨

            const scaledImageSize = this.resolutionEngine.getScaledCoordinate(baseImageSize);
            const scaledImgOffsetX = this.resolutionEngine.getScaledCoordinate(baseImgOffsetX);
            const scaledImgOffsetY = this.resolutionEngine.getScaledCoordinate(baseImgOffsetY);
            
            // ✨ drawX, drawY는 이미 스케일링되어 있으므로 그대로 사용합니다.
            // ✨ 이미지 오프셋과 크기는 스케일링된 값을 사용합니다.
            ctx.drawImage(image, drawX + scaledImgOffsetX, drawY + scaledImgOffsetY, scaledImageSize, scaledImageSize);
        }
    }
}
