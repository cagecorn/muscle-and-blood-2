// src/game/GameSystem.js
// 중앙에서 게임 엔진에 접근할 수 있도록 하는 간단한 서비스 로케이터 객체입니다.

export const gameSystem = {
    /** @type {import('./utils/PathfinderEngine.js').pathfinderEngine|null} */
    pathfinderEngine: null,
    /** @type {any} 현재 게임 씬을 참조합니다. */
    scene: null,
};

/**
 * 게임 시스템에 필요한 엔진과 씬을 등록합니다.
 * @param {object} params
 * @param {any} params.pathfinderEngine - 경로 탐색 엔진
 * @param {any} params.scene - 현재 게임 씬
 */
export function initializeGameSystem({ pathfinderEngine, scene }) {
    gameSystem.pathfinderEngine = pathfinderEngine;
    gameSystem.scene = scene;
}
