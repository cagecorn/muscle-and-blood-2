// js/main.js
import { GameEngine } from './GameEngine.js';
import { ResolutionEngine } from './ResolutionEngine.js'; // ✨ ResolutionEngine 임포트 추가

document.addEventListener('DOMContentLoaded', () => {
    try {
        // ✨ 게임의 기준 해상도를 정의합니다. 이 값은 게임 콘텐츠가 설계된 해상도입니다.
        // 사용자 요청에 따라 "아주 아주 고해상도"를 반영합니다.
        const BASE_GAME_WIDTH = 1920; 
        const BASE_GAME_HEIGHT = 1080;

        // ✨ ResolutionEngine 인스턴스를 먼저 생성합니다.
        // 'gameCanvas'는 메인 게임이 그려질 캔버스입니다.
        const resolutionEngine = new ResolutionEngine('gameCanvas', BASE_GAME_WIDTH, BASE_GAME_HEIGHT);

        // ✨ 생성된 resolutionEngine 인스턴스를 GameEngine에 전달합니다.
        const gameEngine = new GameEngine(resolutionEngine);
        
        gameEngine.eventManager.setGameRunningState(true);
        gameEngine.start();
    } catch (error) {
        console.error("Fatal Error: Game Engine failed to start.", error);
        alert("게임 시작 중 치명적인 오류가 발생했습니다. 콘솔을 확인해주세요.");
    }
});
