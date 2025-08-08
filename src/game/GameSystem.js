// src/game/GameSystem.js

// 이 파일은 프로젝트의 주요 엔진/매니저들을 한 곳에 모아놓고,
// 어디서든 쉽게 접근할 수 있도록 해주는 중앙 허브 역할을 합니다.

// --- 1. 필요한 모든 엔진과 매니저를 import 합니다. ---
import { pathfinderEngine } from './utils/PathfinderEngine.js';
import { formationEngine } from './utils/FormationEngine.js';
// ... (AIManager, SkillEngine 등 필요한 다른 모든 엔진들) ...

export const gameSystem = {
    // --- 2. 초기화 메서드 ---
    initialize(scene) {
        this.scene = scene;
        this.pathfinderEngine = pathfinderEngine;
        this.formationEngine = formationEngine;
        // ... (다른 엔진들도 여기에 할당) ...

        console.log("GameSystem이 초기화되었습니다.");
    },

    // --- 3. 각 엔진들을 속성으로 등록 ---
    scene: null,
    pathfinderEngine: null,
    formationEngine: null,
    // ... (다른 엔진들도 null로 초기화) ...
};
