// js/managers/BattleGridManager.js

export class BattleGridManager {
    // ✨ measureManager 외에 resolutionEngine을 매개변수로 받도록 수정
    constructor(measureManager, logicManager, resolutionEngine) {
        console.log("🗺️ BattleGridManager initialized. Ready to draw the battlefield grid. 🗺️");
        this.measureManager = measureManager;
        this.logicManager = logicManager;
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장
        this.gridRows = 10;
        this.gridCols = 15;
    }

    /**
     * 전투 그리드를 그립니다.
     * 이 함수 내에서 계산되는 모든 픽셀 좌표는 해상도 엔진을 통해 스케일링됩니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트 (이미 ResolutionEngine에 의해 스케일링됨)
     */
    draw(ctx) {
        // sceneContentDimensions는 LogicManager에서 기준 해상도 단위로 그리드 크기를 반환한다고 가정합니다.
        const sceneContentDimensions = this.logicManager.getCurrentSceneContentDimensions();

        // 캔버스 자체의 기준 너비/높이 (CSS 픽셀이 아니라 게임 콘텐츠 기준 픽셀)
        const baseCanvasWidth = this.resolutionEngine.baseWidth;
        const baseCanvasHeight = this.resolutionEngine.baseHeight;

        // stagePadding도 기준 해상도 단위라고 가정
        // const stagePadding = this.measureManager.get('battleStage.padding'); // 현재 코드에서 사용되지 않음

        // LogicManager에서 계산된 순수 그리드 컨텐츠 크기 (패딩 제외, 기준 해상도 단위)
        const gridContentWidth = sceneContentDimensions.width;
        const gridContentHeight = sceneContentDimensions.height;

        // 이 gridContentWidth/Height를 사용하여 effectiveTileSize를 역으로 계산 (기준 해상도 단위)
        const effectiveTileSize = gridContentWidth / this.gridCols; 

        // 전체 그리드 크기 (기준 해상도 단위)
        const totalGridWidth = gridContentWidth;
        const totalGridHeight = gridContentHeight;

        // ✨ 그리드를 캔버스 중앙에 배치하기 위한 오프셋 계산 (기준 해상도 단위)
        // (기준 캔버스 전체 크기 - 그리드 컨텐츠 크기) / 2
        const gridOffsetX_base = (baseCanvasWidth - totalGridWidth) / 2;
        const gridOffsetY_base = (baseCanvasHeight - totalGridHeight) / 2;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = this.resolutionEngine.getScaledCoordinate(1); // 선 굵기도 스케일링

        // 세로선 그리기
        for (let i = 0; i <= this.gridCols; i++) {
            ctx.beginPath();
            // ✨ 모든 좌표에 getScaledCoordinate() 적용
            const x = this.resolutionEngine.getScaledCoordinate(gridOffsetX_base + i * effectiveTileSize);
            const y1 = this.resolutionEngine.getScaledCoordinate(gridOffsetY_base);
            const y2 = this.resolutionEngine.getScaledCoordinate(gridOffsetY_base + totalGridHeight);
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y2);
            ctx.stroke();
        }

        // 가로선 그리기
        for (let i = 0; i <= this.gridRows; i++) {
            ctx.beginPath();
            // ✨ 모든 좌표에 getScaledCoordinate() 적용
            const x1 = this.resolutionEngine.getScaledCoordinate(gridOffsetX_base);
            const x2 = this.resolutionEngine.getScaledCoordinate(gridOffsetX_base + totalGridWidth);
            const y = this.resolutionEngine.getScaledCoordinate(gridOffsetY_base + i * effectiveTileSize);
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.stroke();
        }

        // 그리드 영역 테두리 (확인용)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = this.resolutionEngine.getScaledCoordinate(2); // 선 굵기도 스케일링
        // ✨ 모든 좌표와 크기에 getScaledCoordinate() 적용
        ctx.strokeRect(
            this.resolutionEngine.getScaledCoordinate(gridOffsetX_base),
            this.resolutionEngine.getScaledCoordinate(gridOffsetY_base),
            this.resolutionEngine.getScaledCoordinate(totalGridWidth),
            this.resolutionEngine.getScaledCoordinate(totalGridHeight)
        );
    }
}
