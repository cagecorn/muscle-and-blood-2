// js/managers/BattleGridManager.js

export class BattleGridManager {
    constructor(measureManager, logicManager) {
        console.log("\uD83D\uDCDC BattleGridManager initialized. Ready to draw the battlefield grid. \uD83D\uDCDC");
        this.measureManager = measureManager;
        this.logicManager = logicManager;
        this.gridRows = 10;
        this.gridCols = 15;
    }

    /**
     * 전투 그리드를 그립니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
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
        const effectiveTileSize = gridContentWidth / this.gridCols; // 또는 gridContentHeight / this.gridRows; (둘은 같을 것임)

        // 전체 그리드 크기 (여기서는 gridContentWidth/Height와 동일)
        const totalGridWidth = gridContentWidth;
        const totalGridHeight = gridContentHeight;

        // ✨ 그리드를 캔버스 중앙에 배치하기 위한 오프셋 계산 (패딩 포함)
        // (캔버스 전체 크기 - 그리드 컨텐츠 크기) / 2 + 패딩
        const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
        const gridOffsetY = (canvasHeight - totalGridHeight) / 2;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;

        // 세로선 그리기
        for (let i = 0; i <= this.gridCols; i++) {
            ctx.beginPath();
            ctx.moveTo(gridOffsetX + i * effectiveTileSize, gridOffsetY);
            ctx.lineTo(gridOffsetX + i * effectiveTileSize, gridOffsetY + totalGridHeight);
            ctx.stroke();
        }

        // 가로선 그리기
        for (let i = 0; i <= this.gridRows; i++) {
            ctx.beginPath();
            ctx.moveTo(gridOffsetX, gridOffsetY + i * effectiveTileSize);
            ctx.lineTo(gridOffsetX + totalGridWidth, gridOffsetY + i * effectiveTileSize);
            ctx.stroke();
        }

        // 그리드 영역 테두리 (확인용)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(gridOffsetX, gridOffsetY, totalGridWidth, totalGridHeight);
    }
}
