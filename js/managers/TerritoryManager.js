// js/managers/TerritoryManager.js

export class TerritoryManager {
    // ✨ resolutionEngine을 매개변수로 추가
    constructor(resolutionEngine) {
        console.log("🌳 TerritoryManager initialized. Ready to oversee the domain. 🌳");
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장
    }

    /**
     * 영지 씬을 그립니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트 (이미 ResolutionEngine에 의해 스케일링됨)
     */
    draw(ctx) {
        // ctx.canvas.width와 ctx.canvas.height는 ResolutionEngine에 의해
        // devicePixelRatio 및 currentScaleRatio가 적용된 내부 버퍼 크기입니다.
        // 따라서 그리기 명령은 이 크기에 맞춰 실행되므로, 별도의 logicalWidth/Height 계산이 필요하지 않습니다.
        // 다만, 텍스트나 고정된 크기 요소의 경우 getScaledCoordinate를 사용해야 합니다.

        ctx.fillStyle = '#4CAF50'; // 배경색
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); // 캔버스 전체를 채움

        ctx.fillStyle = 'white';
        // ✨ 폰트 크기에도 resolutionEngine의 스케일링을 적용합니다.
        ctx.font = `${this.resolutionEngine.getScaledCoordinate(60)}px Arial`; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // 텍스트 위치도 resolutionEngine의 스케일링을 고려한 기준 해상도 중앙으로 계산
        ctx.fillText('나의 영지', 
            this.resolutionEngine.getScaledCoordinate(this.resolutionEngine.baseWidth / 2), 
            this.resolutionEngine.getScaledCoordinate(this.resolutionEngine.baseHeight / 2 - 50));

        // ✨ 폰트 크기에도 resolutionEngine의 스케일링을 적용합니다.
        ctx.font = `${this.resolutionEngine.getScaledCoordinate(24)}px Arial`;
        ctx.fillText('영지에서 모험을 준비하세요!', 
            this.resolutionEngine.getScaledCoordinate(this.resolutionEngine.baseWidth / 2), 
            this.resolutionEngine.getScaledCoordinate(this.resolutionEngine.baseHeight / 2 + 30));
    }
}
