// js/managers/BattleSimulationManager.js

export class BattleSimulationManager {
    constructor(measureManager, assetLoaderManager, idManager, logicManager, animationManager, valorEngine) {
        console.log("\u2694\ufe0f BattleSimulationManager initialized. Preparing units for battle. \u2694\ufe0f");
        this.measureManager = measureManager;
        this.assetLoaderManager = assetLoaderManager;
        this.idManager = idManager; // Keep for other potential uses, though not directly in draw
        this.logicManager = logicManager;
        this.animationManager = animationManager;
        this.valorEngine = valorEngine;
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
        // ✨ 유닛의 용맹 스탯에 기반하여 초기 배리어를 계산합니다.
        const initialBarrier = this.valorEngine.calculateInitialBarrier(fullUnitData.baseStats.valor || 0);

        const unitInstance = {
            id: fullUnitData.id,
            name: fullUnitData.name,
            spriteId: fullUnitData.spriteId,
            image: unitImage, // ✨ 로드된 이미지 객체를 직접 저장합니다.
            classId: fullUnitData.classId,
            gridX,
            gridY,
            // 필요한 경우 다른 데이터도 여기에 추가할 수 있습니다.
            baseStats: fullUnitData.baseStats,
            type: fullUnitData.type,
            fullUnitData: fullUnitData,
            currentHp: fullUnitData.currentHp !== undefined ? fullUnitData.currentHp : fullUnitData.baseStats.hp,
            currentBarrier: initialBarrier, // ✨ 현재 배리어 설정
            maxBarrier: initialBarrier // ✨ 최대 배리어는 초기 배리어와 동일
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
        const sceneContentDimensions = this.logicManager.getCurrentSceneContentDimensions(); // 이제 순수 그리드 크기를 반환
        const canvasWidth = this.measureManager.get('gameResolution.width'); // 캔버스 실제 CSS 너비
        const canvasHeight = this.measureManager.get('gameResolution.height'); // 캔버스 실제 CSS 높이

        const stagePadding = this.measureManager.get('battleStage.padding');

        // LogicManager에서 계산된 순수 그리드 컨텐츠 크기 (패딩 제외)
        const gridContentWidth = sceneContentDimensions.width;
        const gridContentHeight = sceneContentDimensions.height;

        // 이 gridContentWidth/Height를 사용하여 effectiveTileSize를 역으로 계산
        const effectiveTileSize = gridContentWidth / this.gridCols;

        // 전체 그리드 크기 (여기서는 gridContentWidth/Height와 동일)
        const totalGridWidth = gridContentWidth;
        const totalGridHeight = gridContentHeight;

        // ✨ 그리드를 캔버스 중앙에 배치하기 위한 오프셋 계산 (패딩 포함)
        // (캔버스 전체 크기 - 그리드 컨텐츠 크기) / 2 + 패딩
        const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
        const gridOffsetY = (canvasHeight - totalGridHeight) / 2;

        for (const unit of this.unitsOnGrid) {
            const image = unit.image;
            if (!image) {
                console.warn(`[BattleSimulationManager] Image not available for unit '${unit.id}'. Skipping draw.`);
                continue;
            }

            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );

            const imageSize = effectiveTileSize;
            const imgOffsetX = (effectiveTileSize - imageSize) / 2;
            const imgOffsetY = (effectiveTileSize - imageSize) / 2;

            ctx.drawImage(image, drawX + imgOffsetX, drawY + imgOffsetY, imageSize, imageSize);
        }
    }
}
