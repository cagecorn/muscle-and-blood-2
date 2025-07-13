// js/managers/BattleStageManager.js

export class BattleStageManager {
    constructor() { // measureManager를 생성자에서 받지 않도록 수정
        console.log("🏟️ BattleStageManager initialized. Preparing the arena. 🏟️");
        // 이제 measureManager를 직접 참조하지 않습니다.
    }

    /**
     * \uc804\ud22c \uc2a4\ud14c\uc774\uc9c0\ub97c \uadf8\ub9bd\ub2c8\ub2e4.
     * @param {CanvasRenderingContext2D} ctx - \uce90\ub098\uc2a4 2D \ub80c\ub354\ub9c1 \ucee8\ud14d\uc2a4\ud2b8
     */
    draw(ctx) {
        // 논리 2 적용: 배틀 스테이지는 맵 화면 박스(캔버스)와 똑같게 한다.
        ctx.fillStyle = '#6A5ACD'; // 전투 스테이지 배경색 (보라색)
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); // 캔버스 전체를 채움

        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // 텍스트를 캔버스 중앙에 배치
        ctx.fillText('전투가 시작됩니다!', ctx.canvas.width / 2, ctx.canvas.height / 2);
    }
}
