// js/managers/BattleStageManager.js

export class BattleStageManager {
    // ✨ resolutionEngine을 매개변수로 추가
    constructor(resolutionEngine) { 
        console.log("🏟️ BattleStageManager initialized. Preparing the arena. 🏟️");
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장
    }

    /**
     * 전투 스테이지를 그립니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트 (이미 ResolutionEngine에 의해 스케일링됨)
     */
    draw(ctx) {
        // 논리 2 적용: 배틀 스테이지는 맵 화면 박스(캔버스)와 똑같게 한다.
        ctx.fillStyle = '#6A5ACD'; // 전투 스테이지 배경색 (보라색)
        // ctx.canvas.width/height는 ResolutionEngine에 의해 이미 스케일링된 캔버스 내부 버퍼 크기입니다.
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); 

        ctx.fillStyle = 'white';
        // ✨ 폰트 크기에도 resolutionEngine의 스케일링을 적용합니다.
        ctx.font = `${this.resolutionEngine.getScaledCoordinate(40)}px Arial`; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 텍스트를 캔버스 중앙에 배치
        // ctx.canvas.width/height는 이미 스케일링된 크기이므로, 나누기 2는 스케일링된 중앙 좌표를 제공합니다.
        ctx.fillText('전투가 시작됩니다!', ctx.canvas.width / 2, ctx.canvas.height / 2);
    }
}
